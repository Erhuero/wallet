//const { isMainThread } = require("node:worker_threads");
const { expectRevert } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
//const { assert } = require("node:console");

const Wallet = artifacts.require('Wallet');

contract('Wallet', (accounts) => { //block contract with test inside, acces a array des addresses avec accounts
    let wallet;
    beforeEach(async () => {
        wallet = await Wallet.new([accounts[0], accounts[1], accounts[2]], 2); //2 addresses minimum pour etre approve
        await web3.eth.sendTransaction({from: accounts[0], to:wallet.address, value: 1000}); //web3 object, 1000 wei
        //await because this is an async operation
    });

    //tests
    it('On doit avoir un nombre correct de autorisations et un quorum', async () => {
        const approvers = await wallet.getApprovers();
        const quorum = await wallet.quorum();
        assert(approvers.length ===3); //condition de test
        assert(approvers[0] === accounts[0]);
        assert(approvers[1] === accounts[1]);
        assert(approvers[2] === accounts[2]);
        assert(quorum.toNumber() === 2);//methode de conversion d'un grand chiffre en chiffre JavaScript, pour le petits nombres
        //sinon on utilise toString() pour comparer les string
    });

    //happy path test create transfert
    it('doit creer des transferts', async () => {
      await wallet.createTransfer(100, accounts[5],{from: accounts[0]});
      const transfers = await wallet.getTransfers();
      assert(transfers.length ===1);
      assert(transfers[0].id === '0');//matche the parameter we use in our transfer
      assert(transfers[0].amount === '100');
      assert(transfers[0].to === accounts[5]);//recipient
      assert(transfers[0].approvals === '0');//number of approvals
      assert(transfers[0].sent === false);//send status

    });

    //unhappy past : transfert from an another which is not an approver
    it('ne doit pas creer des transferts si le emetteur n est pas approuve', async () => {
        await expectRevert( //pareil que le try catch de openzeppelin
            wallet.createTransfer(100, accounts[5], {from: accounts[4]}),
            "seulement pour autorises"
        );
    });

    //test approveTranfsert happy path
    it('doit incrementer les accords', async() => {
        await wallet.createTransfer(100, accounts[5],{from: accounts[0]});
        await wallet.approveTransfer(0, {from: accounts[0]});
        const transfers = await wallet.getTransfers();
        const balance = await web3.eth.getBalance(wallet.address);
        assert(transfers[0].approvals === '1');//matche the parameter we use in our transfer
        assert(transfers[0].sent === false);//statut non envoye et reste dans le wallet
        assert(balance === '1000');
    });

    //Test approveTransfer happy path
    it("envoi un transfert si le quorum est atteint", async () => {
        const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[6])); //conversion vers un tres grand nombre
        await wallet.createTransfer(100, accounts[6], {from: accounts[0]});
        await wallet.approveTransfer(0, {from: accounts[0]});
        await wallet.approveTransfer(0, {from: accounts[1]});
        const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[6]));
        assert(balanceAfter.sub(balanceBefore).toNumber() === 100);//10 ^ 18100);//affiche le nombre le plus grand possible
    });

    it("envoi pas de transfert si le transfert n'est pas approuve", async () => {
        await wallet.createTransfer(100, accounts[5], {from: accounts[0]});
        await expectRevert( //pareil que le try catch de openzeppelin
            wallet.approveTransfer(0, {from: accounts[4]}),
            "seulement pour autorises"
        );
    });

    it("ne doit pas approuver le transfert si le transfert est deja envoye", async () => {
        await wallet.createTransfer(100, accounts[6], {from: accounts[0]});
        await wallet.approveTransfer(0, {from: accounts[0]});
        await wallet.approveTransfer(0, {from: accounts[1]});
        await expectRevert(
            wallet.approveTransfer(0, {from: accounts[2]}),
            'Le transfert a deja ete effectue' //bien penser a faire les memes phrases que dans les scripts sol
        );
    });

    it("ne doit pas autoriser le meme transfert deux fois", async () => {
        await wallet.createTransfer(100, accounts[6], {from: accounts[0]});
        await wallet.approveTransfer(0, {from: accounts[0]});
        await expectRevert(
        wallet.approveTransfer(0, {from: accounts[0]}),
        'Ne peut pas envoyer le contrat en double'
        );
    }); 
});
