//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Wallet {
    
    address[] public approvers;
    uint public quorum;
    
    struct Transfer {
        uint id;
        uint amount;
        address payable to;//envoie ether sur cette adresse
        uint approvals;
        bool sent;
    }
    //container contenant les transferts
    //mapping (uint => Transfer) public transfers;
    //uint public nextId;
    //simplification en utilisant un array a la place
    
    Transfer[] public transfers;
    
    mapping(address => mapping(uint => bool)) public approvals;
    
    constructor(address[] memory _approvers, uint _quorum) public {
        approvers = _approvers;
        quorum = _quorum;
    }
    
    //fonction retournant la liste des approvers
    function getApprovers() external view returns(address[] memory){//read only
        
            return approvers;
        }
    //fonction appelle par l'une ou plusieurs addresses des approverdes
    
    function getTransfers() external view returns(Transfer[] memory) {
        return transfers;
    }

    function createTransfer(uint amount, address payable to) external onlyApprover(){
        //transfers[nextId] = Transfer(//ne surcharge/reecris le dernier transfert
        transfers.push(Transfer(
            transfers.length,
            //nextId,
            amount,
            to,
            0,
            false
            ));
            //nextId++;
    }

function approveTransfer(uint id) external onlyApprover(){
    require(transfers[id].sent == false, 'Le transfert a deja ete effectue');//acceder au champ sent
    require(approvals[msg.sender][id] == false, 'Ne peut pas envoyer le contrat en double'); //nous renferençons l'envoyeur du message
    
    approvals[msg.sender][id] = true;
    transfers[id].approvals++;//incrementation du nombre de approvals
    
    if(transfers[id].approvals >= quorum){//si le nombre d'approvals est superieur au quorum (minimum nmber of approval)
        transfers[id].sent = true;//approve the sent status
        address payable to = transfers[id].to;
        uint amount = transfers[id].amount;
        to.transfer(amount);//methode attachee a toute addresse de smart contract
        
        }
    }

   receive() external payable {}

   modifier onlyApprover(){
       bool allowed = false;
       for(uint i = 0; i < approvers.length; i++){
           if(approvers[i] == msg.sender){
               allowed = true;
           }
       }
       require(allowed == true, "seulement pour autorises");
       _;
   }
}
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    