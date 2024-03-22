// "use client"
// import { ConnectWallet , useStorageUpload,MediaRenderer} from "@thirdweb-dev/react";
// import { useEffect, useState,useRef } from 'react';
// import { NextPage } from "next";
// import { useCallback } from "react";
// import {useDropzone} from "react-dropzone";
// import axios from 'axios';
// import { ethers } from 'ethers';
// // import { CONTRACT_ADDRESSES,CONTRACT_ABI } from 'contract.txt';

// const Home: React.FC = () => {
//     const [currentAccount, setCurrentAccount] = useState<string>('');
//     const [connect, setConnect] = useState<boolean>(false);
//     const [balance, setBalance] = useState<string>('');
//     const [projectName, setProjectName] = useState<string>('');
//     const [maxAllocation, setMaxAllocation] = useState<string>('');
//     const [builderAddress, setBuilderAddress] = useState<string>('');
//     const [numStages, setNumStages] = useState<number>(0);
//     const [stageToVerify, setStageToVerify] = useState<number>(0);
//     const [amountToAllocate, setAmountToAllocate] = useState<string>('');
    
//   const failMessage = "Please install MetaMask & connect your MetaMask";
//   const successMessage = "Your account has been connected";


//     const WalletConnect = async () => {
//         if (!window.ethereum) return;
    
//         try {
          
//           const accounts = await window.ethereum.request({ method: "eth_accounts" });
//           const provider=new ethers.providers.Web3Provider(window.ethereum)
//           if (accounts.length) {
//             setCurrentAccount(accounts[0]);
//             setConnect(true);
//             const balance = await provider.getBalance(currentAccount);
//             setBalance( ethers.utils.formatEther(balance));
//           } else {
//             resetState();  
//           }
//         } catch (error) {
//           console.error("Error connecting wallet:", error);
//           resetState();
//         }
//       };
    
//       const connectWallet = async () => {
//         if (!window.ethereum) {
//           console.log(failMessage);
//           return;
//         }
    
//         try {
//           const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//           setCurrentAccount(accounts[0]);
//           setConnect(true);
//         } catch (error) {
//           console.error("Error connecting wallet:", error);
//           resetState();
//         }
//       };
    
//       const resetState = () => {
//         setCurrentAccount('');
//         setConnect(false);
//         setBalance('');
//       };
    
//       useEffect(() => {
//         WalletConnect();
//       }, []);
    
//       useEffect(()=>{
//         async function accountChanged() {
//             window.ethereum.on('accountsChanged',async function(){
//                 const accounts=await window.ethereum.request({
//                     method:"eth_accounts",
//                 });
//                 if (accounts.length){
//                     setCurrentAccount(accounts[0])
//                 }else{
//                     window.location.reload();
//                 }
//             });
//         }accountChanged();
//       },[]);

 
//     const CONTRACT_ADDRESS="0x4F257FAdf2402668Bfe2555Af64b196C6aa4f8c4";
//     const CONTRACT_ABI=[
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "initialOwner",
//                     "type": "address"
//                 }
//             ],
//             "stateMutability": "nonpayable",
//             "type": "constructor"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "sender",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "owner",
//                     "type": "address"
//                 }
//             ],
//             "name": "ERC721IncorrectOwner",
//             "type": "error"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "operator",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "ERC721InsufficientApproval",
//             "type": "error"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "approver",
//                     "type": "address"
//                 }
//             ],
//             "name": "ERC721InvalidApprover",
//             "type": "error"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "operator",
//                     "type": "address"
//                 }
//             ],
//             "name": "ERC721InvalidOperator",
//             "type": "error"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "owner",
//                     "type": "address"
//                 }
//             ],
//             "name": "ERC721InvalidOwner",
//             "type": "error"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "receiver",
//                     "type": "address"
//                 }
//             ],
//             "name": "ERC721InvalidReceiver",
//             "type": "error"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "sender",
//                     "type": "address"
//                 }
//             ],
//             "name": "ERC721InvalidSender",
//             "type": "error"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "ERC721NonexistentToken",
//             "type": "error"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "owner",
//                     "type": "address"
//                 }
//             ],
//             "name": "OwnableInvalidOwner",
//             "type": "error"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "account",
//                     "type": "address"
//                 }
//             ],
//             "name": "OwnableUnauthorizedAccount",
//             "type": "error"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "owner",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "approved",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "Approval",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "owner",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "operator",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "bool",
//                     "name": "approved",
//                     "type": "bool"
//                 }
//             ],
//             "name": "ApprovalForAll",
//             "type": "event"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "to",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "approve",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "builder",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "projectName",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "maxAllocation",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "assignProject",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "builder",
//                     "type": "address"
//                 }
//             ],
//             "name": "DetailsSubmitted",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "previousOwner",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "newOwner",
//                     "type": "address"
//                 }
//             ],
//             "name": "OwnershipTransferred",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "supervisor",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "builder",
//                     "type": "address"
//                 }
//             ],
//             "name": "ProjectAssigned",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "builder",
//                     "type": "address"
//                 }
//             ],
//             "name": "ProjectDeleted",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "builder",
//                     "type": "address"
//                 }
//             ],
//             "name": "ProjectStarted",
//             "type": "event"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "Builder",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "stage",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "rejectStage",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [],
//             "name": "renounceOwnership",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "from",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "to",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "safeTransferFrom",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "from",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "to",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "bytes",
//                     "name": "data",
//                     "type": "bytes"
//                 }
//             ],
//             "name": "safeTransferFrom",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "operator",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "approved",
//                     "type": "bool"
//                 }
//             ],
//             "name": "setApprovalForAll",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "stage",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "amount",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "stageFunds",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "builder",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "uint256",
//                     "name": "stage",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "StageRejected",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "builder",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "uint256",
//                     "name": "stage",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "StageSubmitted",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "builder",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "uint256",
//                     "name": "stage",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "StageVerified",
//             "type": "event"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "builder",
//                     "type": "address"
//                 }
//             ],
//             "name": "startProject",
//             "outputs": [],
//             "stateMutability": "payable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "numStages",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "submitProjectDetails",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "stage",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "description",
//                     "type": "string"
//                 }
//             ],
//             "name": "submitStage",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "from",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "to",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "Transfer",
//             "type": "event"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "from",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "to",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "transferFrom",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "newOwner",
//                     "type": "address"
//                 }
//             ],
//             "name": "transferOwnership",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address payable",
//                     "name": "builder",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "stage",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "verifyStage",
//             "outputs": [],
//             "stateMutability": "payable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "builder",
//                     "type": "address"
//                 }
//             ],
//             "name": "assigned",
//             "outputs": [
//                 {
//                     "internalType": "bool",
//                     "name": "",
//                     "type": "bool"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "assignedBuilders",
//             "outputs": [
//                 {
//                     "internalType": "address",
//                     "name": "",
//                     "type": "address"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "owner",
//                     "type": "address"
//                 }
//             ],
//             "name": "balanceOf",
//             "outputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "getApproved",
//             "outputs": [
//                 {
//                     "internalType": "address",
//                     "name": "",
//                     "type": "address"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [],
//             "name": "getAssignedBuilders",
//             "outputs": [
//                 {
//                     "internalType": "address[]",
//                     "name": "",
//                     "type": "address[]"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "Builder",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "stage",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "getStageDetails",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "description",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "amount",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "submitted",
//                     "type": "bool"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "verified",
//                     "type": "bool"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "owner",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "operator",
//                     "type": "address"
//                 }
//             ],
//             "name": "isApprovedForAll",
//             "outputs": [
//                 {
//                     "internalType": "bool",
//                     "name": "",
//                     "type": "bool"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [],
//             "name": "name",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [],
//             "name": "owner",
//             "outputs": [
//                 {
//                     "internalType": "address",
//                     "name": "",
//                     "type": "address"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "ownerOf",
//             "outputs": [
//                 {
//                     "internalType": "address",
//                     "name": "",
//                     "type": "address"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "",
//                     "type": "address"
//                 }
//             ],
//             "name": "projects",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "projectName",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "maxAllocation",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "builder",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "assigned",
//                     "type": "bool"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "startproject",
//                     "type": "bool"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "stageFundsSubmitted",
//                     "type": "bool"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "detailsSubmitted",
//                     "type": "bool"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "numStages",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "totalAllocatedFunds",
//                     "type": "uint256"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "bytes4",
//                     "name": "interfaceId",
//                     "type": "bytes4"
//                 }
//             ],
//             "name": "supportsInterface",
//             "outputs": [
//                 {
//                     "internalType": "bool",
//                     "name": "",
//                     "type": "bool"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [],
//             "name": "symbol",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "tokenURI",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         }
//     ]

//     const assignProject = async (event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault();
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         const signer = provider.getSigner();
//         const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
//         try {
//             const EtherScanURL=await contract.assignProject(builderAddress, projectName, ethers.utils.parseEther(maxAllocation));
//             if(EtherScanURL){
//                 console.log('Project assigned successfully',EtherScanURL);
//             }
//         } catch (error) {
//             console.error('Error assigning project:', error);
//         }
//     };

//     const verifyStage = async(event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault();
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         const signer = provider.getSigner();
//         const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
//         try {
//             await contract.verifyStage(builderAddress, stageToVerify);
//             console.log('Stage verified successfully');
//         } catch (error) {
//             console.error('Error verifying stage:', error);
//         }
//     };
//     interface Project {
//         projectName: string;
//         maxAllocation: string; // Assuming BigNumber is represented as a string
//         builder: string;
//         assigned: boolean;
//         startProject: boolean; // Renamed to startProject (camelCase convention)
//         stageFundsSubmitted: boolean; // Renamed to stageFundsSubmitted (camelCase convention)
//         detailsSubmitted: boolean;
//         numStages: string; // Assuming BigNumber is represented as a string
//         totalAllocatedFunds: string; // Assuming BigNumber is represented as a string
//     }
    
//     const [assignedBuilders, setAssignedBuilders] = useState<string[]>([]);
//     const [selectedBuilder, setSelectedBuilder] = useState<string>('');
//     const [builderProjects, setBuilderProjects] = useState<any>(null);


//     const fetchAssignedBuilders = async () => {
//         try {
//             const provider = new ethers.providers.Web3Provider(window.ethereum);
//             const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
//             const builders = await contract.getAssignedBuilders();
//             setAssignedBuilders(builders);
//         } catch (error) {
//             console.error('Error fetching assigned builders:', error);
//         }
//     };

//     useEffect(() => {
//         fetchAssignedBuilders();
//     }, []);

//     const ShowProjects = async () => {
//         try {
//             const provider = new ethers.providers.Web3Provider(window.ethereum);
//             const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
//             // Call the assigned function in the smart contract to check if the builder is assigned with a project
//             const isAssigned = await contract.assigned(selectedBuilder);
//             if (isAssigned) {
//                 // If builder is assigned, retrieve project details
//                 const project = await contract.projects(selectedBuilder);
//                 setBuilderProjects(project);
//                 console.log('Project details:', project);
//                 // Display project details in the frontend as desired
//             } else {
//                 console.log('Builder is not assigned with any project');
//                 // Handle case where builder is not assigned with any project
//             }
//         } catch (error) {
//             console.error('Error fetching projects:', error);
//             // Handle error appropriately
//         }
//     };
    

    
//     return (
//         <div>
//             {!currentAccount && !connect ? (
//                 <div>
//                     <h1>Welcome Supervisor, Please Connect your wallet to view details</h1>
//                     <button onClick={connectWallet}>Connect Wallet</button>
//                 </div>
//             ) : (
//                 <div>
//                     <h2>Hello Supervisor {currentAccount.slice(0, 5)} </h2>
//                     <p>Account Address: {currentAccount}</p>
//                     <p>Account Balance: {balance} ETH</p>
//                     <h3>Assign Project</h3>
//                     <form onSubmit={assignProject}>
//                         <label>Project Name: </label>
//                         <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
//                         <br />
//                         <label>Max Allocation (ETH): </label>
//                         <input type="text" value={maxAllocation} onChange={(e) => setMaxAllocation(e.target.value)} />
//                         <br />
//                         <label>Builder Address: </label>
//                         <input type="text" value={builderAddress} onChange={(e) => setBuilderAddress(e.target.value)} />
//                         <br />
//                         <button type="submit">Assign Project</button>
//                         <div>
//                             <h3>Show Projects</h3>
//                             <label>Select a Builder:</label>
//                             <select value={selectedBuilder} onChange={(e) => setSelectedBuilder(e.target.value)}>
//                                 <option value="">Select a Builder</option>
//                                 {assignedBuilders.map((builder, index) => (
//                                 <option key={index} value={builder}>{builder}</option>
//                                 ))}
//                             </select>
//                             <button onClick={ShowProjects}>Show Projects</button>
//                             {builderProjects ? (
//             <div>
//                 <h4>Projects Assigned to {builderProjects.builder}</h4>
//                 <div>
//                     <p>Project Name: {builderProjects.projectName}</p>
//                     <p>Max Allocation (ETH): {ethers.utils.formatEther(builderProjects.maxAllocation)}</p>
//                     <p>Total Allocated Funds by builder: {ethers.utils.formatEther(builderProjects.totalAllocatedFunds)}</p>
//                     <p>Number of Stages :{builderProjects.numStages.toString()}</p>
//                     <p>Project blueprint Submission :{builderProjects.stageFundsSubmitted.toString()}</p>
//                     <p>Project Started:{builderProjects.startproject.toString()}</p>
//                     {/* <p>Project details Submission Status:{builderProjects.detailsSubmitted.toString()}</p> */}
//                     {/* <p>{builderProjects}</p> */}
//                     {/* Add more fields as needed */}
//                 </div>
//             </div>
//         ) : (
//             <p>No projects assigned to {selectedBuilder}</p>
//         )}

//                         </div>
//                     </form>
//                     <h3>Verify Stage</h3>
//                     <form onSubmit={verifyStage}>
//                         <label>Builder Address: </label>
//                         <input type="text" value={builderAddress} onChange={(e) => setBuilderAddress(e.target.value)} />
//                         <br />
//                         <label>Stage to Verify: </label>
//                         <input type="number" value={stageToVerify} onChange={(e) => setStageToVerify(parseInt(e.target.value))} />
//                         <br />
//                         <button type="submit">Verify Stage</button>
//                     </form>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Home;
