"use client"
import { ConnectWallet , useStorageUpload,MediaRenderer} from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
// import Image from "next/image";
import { NextPage } from "next";
import { useCallback } from "react";
import {useDropzone} from "react-dropzone";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from 'react';
import { global } from "styled-jsx/css";
import Script from "next/script";
import Head from "next/head";

import axios from 'axios';


const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [connect, setConnect] = useState(false);
  const [balance, setBalance] = useState('');
  const user='Builder'
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generatedImageFile, setGeneratedImageFile] = useState<File | null>(null);
  const [ipfsLink, setIpfsLink] = useState<string | null>(null);
  const[gen,setgen]=useState(false)
  const[ipfsup,setipfsup]=useState(false)

  const[SubmitNav,setSubmitNav]=useState(false);
  const[Home,setHome]=useState(true);

  const failMessage = "Please install MetaMask & connect your MetaMask";
  const successMessage = "Your account has been connected";


  

  const WalletConnect = async () => {
    if (!window.ethereum) return;

    try {
      const Provider = new ethers.providers.Web3Provider(window.ethereum)
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      
      
      

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        setConnect(true);
        const balance = await Provider.getBalance(currentAccount);
        if(balance){
        setBalance( ethers.utils.formatEther(balance));
      } 
      } else {
        resetState();  
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      resetState();
    }
  };
 const SubmittedReq=()=>{
  setHome(false);
  setSubmitNav(true);
 }
 const Homepage=()=>{
  setHome(true);
  setSubmitNav(false);
 }

  const connectWallet = async () => {
    if (!window.ethereum) {
      console.log(failMessage);
      return;
    }
    useEffect

    try {
      const Provider = new ethers.providers.Web3Provider(window.ethereum)
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      setConnect(true);
      // const balance = await Provider.getBalance(currentAccount);
      //   if(balance){
      //   setBalance( ethers.utils.formatEther(balance));
      // }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      resetState();
    }
  };

  const resetState = () => {
    setCurrentAccount('');
    setConnect(false);
    setBalance('');
  };

  useEffect(() => {
    WalletConnect();
   
    // fetchData();
  }, []);

  useEffect(()=>{
    async function accountChanged() {
        window.ethereum.on('accountsChanged',async function(){
            const accounts=await window.ethereum.request({
                method:"eth_accounts",
            });
            if (accounts.length){
                setCurrentAccount(accounts[0])
            }else{
                window.location.reload();
            }
        });
    }accountChanged();
  },[]);

  // const [projectName,setProjectName]=useState('');
  // const [stageNumber,setStageNumber]=useState('');
  // const [amountRequested,setAmountRequested]=useState('');
  // const [proofOfCompletion, setProofOfCompletion] = useState<string[]>([]);
  // const [verified,setVerified]=useState(Boolean);
  
      // console.log(contract)


  const [formData, setFormData] = useState({
    address:'',
    projectName: '',
    stageNumber: '',
    amountRequested: '',
    proofOfCompletion:[] as string[],
    NFT:'',
    verified:false

  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // console.log(formData);
    if (name === 'proofOfCompletion') {
      // Handle changes for the IPFS link separately
      
    } else {
      // For other fields, update form data directly
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
  useEffect(() => {
    setFormData(prevFormData => ({
      ...prevFormData,
      address: currentAccount // Update address field with currentAccount
    }));
  }, [currentAccount]);
  
  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
   
    const metadata = {
      "name": `${formData.projectName}`,
      "description": "Builder Project",
      "image": `${formData.NFT}`,
      "attributes": [
        {
          "trait_type": "Stage number",
          "value": `${formData.stageNumber}`
        },
        {
          "trait_type": "Amount Requested",
          "value": `${formData.amountRequested}`
        },
        {
          "trait_type":"Builder Address",
          "value":`${formData.address}`
        }
        
      ]
    };
    
    
    
    
    console.log(metadata);
    try {
      // Upload metadata to IPFS
      const metadataUri = await uploadMetadata(metadata);
      console.log("Metadata IPFS link:", metadataUri);
      if (metadataUri){
        console.log("generating NFT with metadata:", metadataUri,"and sending to wallet addr :", currentAccount);

        const etherscanURL=await mintToken(currentAccount, metadataUri);
        if (etherscanURL) {
          console.log("Transaction confirmed. View it on Etherscan:", etherscanURL);
          try {
            // Make POST request to your Next.js API route
            const response = await axios.post('/api/builder/route',formData);
            console.log(response.data); // Log response from the API route
            fetchData();
          } catch (error) {
            console.error('Error submitting form data please try again:', error);
          }
          // Proceed with other operations, if needed
      } else {
          console.error("Failed to mint token.");
      }
        

      }
  
      // Now, you can proceed with other operations, such as storing the metadata URI or minting an NFT
      // ...
    } catch (error) {
      console.error('Error submitting form data:', error);
    }
  
    // // Reset form data
    // setFormData({
    //   address: currentAccount,
    //   projectName: '',
    //   stageNumber: '',
    //   amountRequested: '',
    //   proofOfCompletion: [],
    //   verified: false
    // });
    // setUris([]);

    // console.log(formData);

    
    setFormData({
      address:currentAccount,
      projectName: '',
      stageNumber: '',
      amountRequested: '',
      proofOfCompletion: [],
      NFT:'',
      verified: false
    });
    setUris([])
    setgen(false)
    setipfsup(false)
  };

  const mintToken = async (to: string, uri: string) => {
    try {
      const contractABI = 
      [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "approve",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "initialOwner",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "ERC721IncorrectOwner",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "operator",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "ERC721InsufficientApproval",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "approver",
              "type": "address"
            }
          ],
          "name": "ERC721InvalidApprover",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "operator",
              "type": "address"
            }
          ],
          "name": "ERC721InvalidOperator",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "ERC721InvalidOwner",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "receiver",
              "type": "address"
            }
          ],
          "name": "ERC721InvalidReceiver",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            }
          ],
          "name": "ERC721InvalidSender",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "ERC721NonexistentToken",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "uri",
              "type": "string"
            }
          ],
          "name": "mint",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "OwnableInvalidOwner",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "OwnableUnauthorizedAccount",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "approved",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "Approval",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "operator",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "approved",
              "type": "bool"
            }
          ],
          "name": "ApprovalForAll",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_fromTokenId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_toTokenId",
              "type": "uint256"
            }
          ],
          "name": "BatchMetadataUpdate",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_tokenId",
              "type": "uint256"
            }
          ],
          "name": "MetadataUpdate",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            }
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "operator",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "approved",
              "type": "bool"
            }
          ],
          "name": "setApprovalForAll",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "minter",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "status",
              "type": "bool"
            }
          ],
          "name": "setMinter",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "transferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "getApproved",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "operator",
              "type": "address"
            }
          ],
          "name": "isApprovedForAll",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "name",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "ownerOf",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes4",
              "name": "interfaceId",
              "type": "bytes4"
            }
          ],
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "tokenURI",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
      // Address of your deployed contract
      const contractAddress = '0x90986cA1DBc86ACF77EB9703c2E383140b9a9034';
      const provider=new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      // let tokenId=10;
        // Get the signer
        
        const signer = provider.getSigner(currentAccount);
        console.log(signer)
        // if(tokenId==7){
        //   tokenId +=1
        // }
        // Call the mint function on the contract
        const tx = await contract.connect(signer).mint(to, uri);

        // Wait for the transaction to be mined
        

       
        const receipt = await tx.wait();
     
        console.log('Token minted successfully! Transaction hash:', receipt.transactionHash);
        // tokenId +=1;

        // Construct the Etherscan URL using the transaction hash
        const etherscanUrl = `https://sepolia.etherscan.io/tx/${receipt.transactionHash}`;

        return etherscanUrl;
    } catch (error) {
        console.error('Error minting token:', error);
    }
};

  
  const uploadMetadata = async (metadata: any): Promise<string> => {
    try {
      // Convert metadata object to JSON string
      const metadataString = JSON.stringify(metadata);
  
      // Upload metadata to IPFS
      const metadataUri = await upload({ data: [metadataString] });
      return metadataUri[0]; // Return the IPFS URI of the metadata
    } catch (error) {
      throw new Error('Error uploading metadata to IPFS: '+error);
    }
  };




  interface ProjectData {
    projectName: string;
    stageNumber: string;
    amountRequested: string;
    proofOfCompletion:[];
    NFT:string,
    verified:boolean;
  }
  const [data, setData] = useState<ProjectData[]>([]);

  useEffect(() => {
    fetchData();
  }, [currentAccount]);

  const fetchData = async () => {
    try {
      if (currentAccount) { // Check if currentAccount is not empty
        // console.log('addr', currentAccount);
        const response = await axios.get('/api/builder/route', {
          params: { addr: currentAccount }
        });
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const [uris,setUris]=useState<string[]>([]);
  const {mutateAsync:upload}=useStorageUpload();


  const onDrop=useCallback(
    async(acceptedFiles:File[])=>{
      const _uris=await upload({data:acceptedFiles});
      // console.log(_uris);
      setUris(_uris);
      setFormData((prevFormData) => ({
        ...prevFormData,
        proofOfCompletion: [ ..._uris], // Concatenate the new URIs
      }));
      // console.log(formData);
    },
    [upload]
  );

  const {getRootProps,getInputProps}=useDropzone({onDrop});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const imagePromises: Promise<HTMLImageElement>[] = [];

    // Load each selected file as an image
    files.forEach((file) => {
      const reader = new FileReader();
      const promise = new Promise<HTMLImageElement>((resolve, reject) => {
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            const img = new Image();
            
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = event.target.result;
          }
        };
        reader.readAsDataURL(file);
      });
      imagePromises.push(promise);
    });
  

    // Once all images are loaded, set them in the state
    Promise.all(imagePromises)
      .then((loadedImages) => {
        setImages(loadedImages);
      })
      .catch((error) => {
        console.error('Error loading images:', error);
      });
  };

  const generateImage = async () => {
    setgen(true);
    if (!canvasRef.current || images.length === 0) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let totalimgH = 0;
    let totalimgW = 0;
    let BeforeH = 0;
    let breaking = Math.ceil(images.length / 2);

    canvas.height, canvas.width = 0, 0;
    images.forEach((image, index) => {
      if (index < breaking) {
        canvas.width += image.width;
        canvas.height = Math.max(canvas.height, image.height);
        BeforeH = canvas.height;
      } else {
        totalimgH = 0;
        totalimgH = BeforeH + images[index].height;
        totalimgW += image.width;
        canvas.height = Math.max(totalimgH, canvas.height);
        canvas.width = Math.max(canvas.width, totalimgW);
      }
    });

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each image onto the canvas
    let offsetX = 0;
    let offsetY = 0;
    let rowsetX = 0;

    images.forEach((image, index) => {
      if (index < breaking) {
        ctx.drawImage(image, offsetX, 0, image.width, image.height);
        offsetX += image.width;
        offsetY = Math.max(offsetY, image.height);
      } else {
        ctx.drawImage(image, rowsetX, offsetY, image.width, image.height);
        rowsetX += image.width;
      }
    });
    // Convert canvas content to a Blob
    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'generated_image.png', { type: 'image/png' });
          resolve(file);
        } else {
          resolve(null);
        }
      });
    });
  };

  const handleDownload = async () => {
    if (generatedImageFile) {
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(generatedImageFile);
      downloadLink.download = 'generated_image.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleUploadToIPFS = async () => {
    if (generatedImageFile) {
      try {
        const ipfsUri = await upload({ data: [generatedImageFile] });
        if(ipfsUri){
        setIpfsLink(ipfsUri[0]);
        setFormData((prevFormData) => ({
          ...prevFormData,
          NFT: ipfsUri[0], // Concatenate the new URIs
        }));
        console.log('Uploaded NFT image to IPFS:', ipfsUri[0]);
        setipfsup(true)}
      } catch (error) {
        console.error('Error uploading to IPFS:', error);
      }
    }
  };
  const handleGenerateImage = async () => {
    const imageFile = await generateImage();
    if (imageFile) {
      setGeneratedImageFile(imageFile);
    }
  };
  return (
    <div>
      <div>
      
      {!currentAccount && !connect ? (
        <div>
          <h1>WElcome Builder, Please Connect your wallet to view details</h1>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={connectWallet}>Connect Wallet</button>
        </div>
      ) : (
        
        <div>
          <nav>
            <ul className="ul">
              <li>
                <button type="button" onClick={Homepage}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" fill="currentColor" className="bi bi-house" viewBox="0 0 16 16">
  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
</svg><span> Home</span></button>
              </li>
              <li>
                <button type="button" onClick={SubmittedReq}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" fill="currentColor" className="bi bi-send-check" viewBox="0 0 16 16">
  <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855a.75.75 0 0 0-.124 1.329l4.995 3.178 1.531 2.406a.5.5 0 0 0 .844-.536L6.637 10.07l7.494-7.494-1.895 4.738a.5.5 0 1 0 .928.372zm-2.54 1.183L5.93 9.363 1.591 6.602z"/>
  <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686"/>
</svg><span>Req Submitted</span></button>
              </li>
            </ul>
          </nav>
          <h2>Hello Builder {currentAccount.slice(0,5)} </h2>
          <p>Account Address: {currentAccount}</p>
          <p>Account Balance: {balance} ETH</p>
          <div>
            {Home && 
          <div className="w-full max-w-xs">
          <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="projectName">
          Project Name:
        </label><span> </span>
        <input style={{ border: '1px solid white',borderRadius:'5px' , outline: 'none' ,backgroundColor:"black" }}
        required
          id="projectName"
          type="text"
          name="projectName"
          placeholder=" Enter project name"
          value={formData.projectName}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="stageNumber">
          Stage No. :
        </label>
        <span> </span>
        <input style={{ border: '1px solid white',borderRadius:'5px' ,outline: 'none' ,backgroundColor:"black" }}
        required
          id="stageNumber"
          type="text"
          pattern="[0-9]*"
          name="stageNumber"
          placeholder="Enter stage number"
          value={formData.stageNumber}
          onChange={handleChange}
        />
        <p>Please enter stage number</p>
      </div>
      <br />
      <div>
        <label htmlFor="amountRequested">
          Amount Requested:
        </label>
        <input style={{ border: '1px solid white',borderRadius:'5px' ,outline: 'none' ,backgroundColor:"black" }}
        required
          id="amountRequested"
          type="text"
          pattern="[0-9]*"
          name="amountRequested"
          placeholder="Enter amount requested"
          value={formData.amountRequested}
          onChange={handleChange}
        />
        <p>Please enter required amount</p>
      </div>
      <br />
      <div  >
        <label htmlFor="proofOfCompletion">
          Proof of Completion:
        </label>
        <div  {...getRootProps()} style={{width:'100px',height:'100px',display:'flex',alignItems:'center'}}>
        <input {...getInputProps()} 
        required
          id="proofOfCompletion"
          type="file"
          accept="image/png, image/jpeg, .pdf"
          name="proofOfCompletion"
        />
        <p style={{textAlign:'center'}}>DRAG & DROP A FILE</p></div>
        <div >
      {formData.proofOfCompletion.map((link, i) => (
        <MediaRenderer style={{ margin: '20px' }} key={i} alt="Not Supported" src={link} width="200px" height="200px"  />
      ))}
    </div>
    <p>Please upload required documents. </p>
    <p>REMEMBER ONCE YOU DROP A FILE, IT WILL BE UPLOADED TO IPFS AUTOMATICALLY.</p>
    <div>
      <input type="file" multiple onChange={handleFileChange} required/>
      <br/><br/>
      <canvas ref={canvasRef}></canvas>
      <br></br>
      <br/>
      {!gen?
      <>
       <button type="button" style={{borderRadius:'5px'}}onClick={handleGenerateImage}> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-card-image" viewBox="1 0 16 16">
  <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
  <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z"/>
</svg></button> <span>Generate Image </span>
       </>:
       <><span> </span><button  type="button" onClick={handleDownload}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
       <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
       <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
     </svg></button><span> Download Image</span>
     <br />
     <br/>
       <button type="button" onClick={handleUploadToIPFS}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-upload" viewBox="0 0 16 16">
  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
  <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
</svg></button><span> Upload To IPFS</span>

{ipfsLink?<p>IPFS Link: {ipfsLink}</p>: ''}
       {/* <p>IPFS Link: {ipfsLink}</p> */}
       </>}
    </div>
      </div>
      <div>
        {ipfsup ?
        <>
        <button type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
  <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
</svg><span>Submit</span>
        </button>
        
        </>:<p>Perform ALL actions to submit</p>}
      </div>
    </form>
    <div>
      <br />
      <br />
<h2>Submitted Requests</h2>
<ul>
{data.map((item, index) => (
  <li key={index}>
   
    <p>Project Name: {item.projectName}</p>
    {/* <p>Stage Number: {item.stageNumber}</p>
    <p>Amount Requested: {item.amountRequested}</p> */}
    {item.verified?<p>Verified: {item.verified ? 'Yes' : 'No'}</p>:<button onClick={SubmittedReq}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
</svg><span>Review</span></button>}
    {/* <p>Verified: {item.verified ? 'Yes' : 'No'}</p>
     <button onClick={SubmittedReq}>Review</button> */}
  </li>
))}
    </ul>
          </div>
</div>}
</div>
{SubmitNav &&
<div>
<h3>Submitted Requests</h3>
<ul>
{data.map((item, index) => (
  <li key={index}>
    <p>Project Name: {item.projectName}</p>
    <p>Stage Number: {item.stageNumber}</p>
    <p>Amount Requested: {item.amountRequested}</p>
    <p>IPFS links:</p>
    <ul>
      {item.proofOfCompletion.map((link, i) => (
        <li key={i}>
          <a href={link} target="_blank" rel="noopener noreferrer">
            {link}
          </a>
        </li>
      ))}
    </ul>
    <div >
      {item.proofOfCompletion.map((link, i) => (
        <MediaRenderer style={{ margin: '20px' }} key={i} alt="Image" src={link} width="200px" height="200px"  />
      ))}
    </div>
    <div>
      <p>NFT Image:</p>
      <MediaRenderer alt="NFT IMG" src={item.NFT} />
    </div>
    <p>Verified: {item.verified ? 'Yes' : 'No'}</p>
  </li>
))}
      </ul>
          </div>}
        </div>
      )}
    </div>  
    </div>
  );
};
export default Home;