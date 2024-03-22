"use client"
import { ConnectWallet , useStorageUpload,MediaRenderer} from "@thirdweb-dev/react";
import { useEffect, useState,useRef } from 'react';
import { NextPage } from "next";
import { useCallback } from "react";
import {useDropzone} from "react-dropzone";
import axios from 'axios';
import { ethers } from 'ethers';
// import '../../styles/Home.module.css';


const Home = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [connect, setConnect] = useState(false);
  const [balance, setBalance] = useState('');
  const user = 'Supervisor';
  const [verify,setVerify]=useState(false);
  

  // const toggleVerify=()=>{
  //   setVerify(!verify)
  // }
  useEffect(() => {
    if (verify) {
      // document.body.getElementsByClassName('modal').remove('active-modal')
      document.body.classList.add('active-modal');
    } else {
      document.body.classList.remove('active-modal');
    }
  }, [verify]);

   const [itemToVerify, setItemToVerify] = useState<ProjectData | null>(null);

  const toggleVerify = (item: ProjectData) => {
    setItemToVerify(item);
    setVerify(!verify);
    
    console.log(itemToVerify)
  };
  useEffect(() => {
    if (itemToVerify) {
        setFormData({
            address: itemToVerify.address,
            projectName: itemToVerify.projectName,
            stageNumber: itemToVerify.stageNumber,
            amountRequested: itemToVerify.amountRequested,
            proofOfCompletion: itemToVerify.proofOfCompletion,
            NFT: itemToVerify.NFT,
            prroofOfVerification: [], // Add prroofOfVerification property here
            description: '',
            SupervisorNFT: '',
            verified: false, // Add verified property here
        });
        console.log(formData)
    }
}, [itemToVerify]);


  const failMessage = "Please install MetaMask & connect your MetaMask";
  const successMessage = "Your account has been connected";

  const Provider = new ethers.providers.JsonRpcProvider(
    'https://sepolia.infura.io/v3/668405c01b4e44338647562e8b4fc608'
  );

  const WalletConnect = async () => {
    if (!window.ethereum) return;

    try {
      
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      const provider=new ethers.providers.Web3Provider(window.ethereum)
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        setConnect(true);
        const balance = await provider.getBalance(currentAccount);
        setBalance( ethers.utils.formatEther(balance));
      } else {
        resetState();  
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      resetState();
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      console.log(failMessage);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      setConnect(true);
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

  interface ProjectData {
    _id: string;
    address:string,
    projectName: string;
    stageNumber: string;
    amountRequested: string;
    proofOfCompletion: [];
    NFT:'',
    verified: boolean;
  }

  const [data, setData] = useState<ProjectData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/supervisor/route');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const {mutateAsync:upload}=useStorageUpload();
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


  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generateImage = () => {
    if (!canvasRef.current) return;
  
    const canvas = canvasRef.current;
//     const ipfsLinkLength = formData.prroofOfVerification[0].length;

// // Calculate the canvas width based on the IPFS link length
// const canvasWidth = Math.max(550, ipfsLinkLength * 10);
canvas.width = 500;
    canvas.height = 400;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    const maxWidth = 480;
    const lineHeight = 25;
    const margin = 10;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.font = '15px Arial';
  
    // Draw existing lines
    ctx.fillText(`Builder addr:`, 10, 30);
    const StartHeight = 30; // Adjust as needed
    const Words = itemToVerify?.address.split(' ');
    let Line = '';
    let Yy = StartHeight + lineHeight;
  
    Words?.forEach((word, index) => {
      const TestLine = Line + (index === 0 ? '' : ' ') + word;
      const metrics = ctx.measureText(TestLine);
  
      if (metrics.width > maxWidth && index > 0) {
        ctx.fillText(Line, margin, y);
        Line = word;
        Yy += lineHeight;
      } else {
        Line = TestLine;
      }
    });
    ctx.fillText(Line, margin, Yy);
    ctx.fillText(`Project Name: ${itemToVerify?.projectName}`, 10, 80);
    ctx.fillText(`Stage Number: ${itemToVerify?.stageNumber}`, 10, 105);
    ctx.fillText(`Amount Requested: ${itemToVerify?.amountRequested}`, 10,130 );
  
    // Add a label before the description
    ctx.fillText(`Description:`, 10, 155);
    ctx.font = '15px Arial';
    // Start drawing the description text
    const startHeight = 155; // Adjust as needed
    const words = formData.description.split(' ');
    let line = '';
    let y = startHeight + lineHeight;
  
    words.forEach((word, index) => {
      const testLine = line + (index === 0 ? '' : ' ') + word;
      const metrics = ctx.measureText(testLine);
  
      if (metrics.width > maxWidth && index > 0) {
        ctx.fillText(line, margin, y);
        line = word;
        y += lineHeight;
      } else {
        line = testLine;
      }
    });
  
    ctx.fillText(line, margin, y);
    // Start drawing the title html proof of verification links
const title = 'Proof OF Verification links:';
ctx.fillText(title, 10, y+25);

// Start drawing the description text
const startHeight1 = y+30 + lineHeight; // Adjust as needed
let y1 = startHeight1;

// Iterate over each proof of verification link
formData.prroofOfVerification.forEach((link) => {
    // Split the link into words for line wrapping
    const words = link.split('');

    let line = '';
    words.forEach((word) => {
        const testLine = line + (line ? '' : '') + word;
        const metrics = ctx.measureText(testLine);

        // Check if the line exceeds the canvas width
        if (metrics.width > maxWidth && line) {
            ctx.fillText(line, margin, y1);
            line = word;
            y1 += lineHeight;
        } else {
            line = testLine;
        }
    });

    // Draw the remaining line
    ctx.fillText(line, margin, y1);
    y1 += lineHeight;
});
    

    const pngImage = canvas.toDataURL('image/png');
    console.log('PNG Image:', pngImage);
    setGeneratedImage(pngImage);
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
  // const {mutateAsync:upload}=useStorageUpload();
  const [generatedImageFile, setGeneratedImageFile] = useState<File | null>(null);
  const [ipfsLink, setIpfsLink] = useState<string | null>(null);

  const handleUploadToIPFS = async () => {
    if (generatedImageFile) {
      try {
        const ipfsUri = await upload({ data: [generatedImageFile] });
        // setIpfsLink(ipfsUri[0]);
        if(ipfsUri){
        setIpfsLink(ipfsUri[0]);
        console.log('Uploaded NFT image to IPFS:', ipfsUri[0]);
      
        setFormData(prevState => ({
          ...prevState,
          SupervisorNFT: ipfsUri[0]
        }));
        console.log("form  DAta",formData)}
        // setipfsup(true)
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
  const [formData, setFormData] = useState({
    address: '',
    projectName:'',
    stageNumber: '',
    amountRequested: '',
    proofOfCompletion:[] as string[],
    NFT:'',
    prroofOfVerification:[] as string[],
    description:'',
    SupervisorNFT:'',
    verified:false,

  });
  

  // const [description, setDescription] = useState<string>('');
  // const [proofOfVerification,setProofOfVerification]=useState([]) as string[]

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      description: event.target.value, // Concatenate the new URIs
    }));
  };
  const onDrop=useCallback(
    async(acceptedFiles:File[])=>{
      const _uris=await upload({data:acceptedFiles});
      // console.log(_uris);
      setFormData((prevFormData) => ({
        ...prevFormData,
        prroofOfVerification: [ ..._uris], // Concatenate the new URIs
      }));
     
      console.log("fomrData",formData);
      console.log("ItemToVerify",itemToVerify);
    },
    [upload]
  );
  const[ShowData,setshowData]=useState(false);
  const {getRootProps,getInputProps}=useDropzone({onDrop});
  const showData=()=>{
    console.log("FormDATA final ",formData)
    setshowData(true);
  }
  interface FormData {
    address: string;
    projectName: string;
    stageNumber: string;
    amountRequested: string;
    proofOfCompletion: string[];
    NFT: string;
    prroofOfVerification: string[];
    description: string;
    SupervisorNFT: string;
    verified: boolean;
  }
  
  const verifyRequest = async (id:string,formData:FormData) => {
    // address: '',
    // projectName:'',
    // stageNumber: '',
    // amountRequested: '',
    // proofOfCompletion:[] as string[],
    // NFT:'',
    // prroofOfVerification:[] as string[],
    // description:'',
    // SupervisorNFT:'',
    // verified:false,
    console.log('seding to server',formData)

    const metadata = {
      "name": `Builder Project-${formData.projectName}`,
      "description":` ${formData.description}`,
      "image": `${formData.SupervisorNFT}`,
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
    console.log(id)
    try {
      // Upload metadata to IPFS
      const metadataUri = await uploadMetadata(metadata);
      console.log("Metadata IPFS link:", metadataUri);
      if (metadataUri){
        console.log("generating NFT with metadata:", metadataUri,"and sending to wallet addr :", currentAccount);
        let amount=formData.amountRequested;

        const etherscanURL=await mintAndSend(formData.address,currentAccount,amount, metadataUri);
        if (etherscanURL) {
          console.log("Transaction confirmed. View it on Etherscan:", etherscanURL);
         
          try {
     
            const response = await axios.post('/api/supervisor/route',{id:id.toString(),formData});
            console.log(response.data);
            fetchData();
            // Optionally, update UI or show success message
          } catch (error) {
            console.error('Error verifying request:', error);
            // Optionally, show error message
          }
          // Proceed with other operations, if needed
      } else {
          console.error("Failed to mint token.");
      }
        

      }
    } catch (error) {
      console.error('Error submitting form data:', error);
    }
  
  };
  const mintAndSend=async(to:string,mintTo:string,amount:string,uri:string)=>{
    try{
  const contractABI=[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "initialOwner",
          "type": "address"
        }
      ],
      "stateMutability": "payable",
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
      "inputs": [
        {
          "internalType": "address payable",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mintTo",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "uri",
          "type": "string"
        }
      ],
      "name": "mintAndSend",
      "outputs": [],
      "stateMutability": "payable",
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
    }
  ]

  const contractAddress="0x147dc1BB708131164c2682aA7B58400c082c7E81";
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
        const overrides = {
          value: ethers.utils.parseEther('0.01') // Convert Ether to Wei
      };
        const tx = await contract.connect(signer).mintAndSend(to,mintTo,uri,overrides);

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

  return (
    <div>
      {!currentAccount && !connect ? (
        <div className="container">
        <h1>Welcome Builder, Please Connect your wallet to view details</h1>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline connect-button" type="button" onClick={connectWallet}>Connect Wallet</button>
      </div>
      ) : (
        <div>
          <div className="header">
    <h2 className="header-title">Hello Supervisor <span className="header-account">{currentAccount.slice(0,5)}</span></h2>
    <p className="header-info">Account Address: <span className="header-account">{currentAccount}</span></p>
    <p className="header-info">Account Balance: <span className="header-balance">{balance}</span> ETH</p>
</div>

<div className="submitted-requests">
<h3>Submitted Requests</h3>
    <ul>
        {data.map((item, index) => (
          <div key={index} className="submitted-requestLI">
            <li >
                <p className="request-detail">Builder Addr: {item.address}</p>
                <p className="request-detail">Project Name: {item.projectName}</p>
                <p className="request-detail">Stage Number: {item.stageNumber}</p>
                <p className="request-detail">Amount Requested: {item.amountRequested}</p>
                <p className={`verification-status ${item.verified ? 'verification-yes' : 'verification-no'}`}>
                    Verified: {item.verified ? 'Yes' : 'No'}
                </p>
                <br/>
                {!item.verified && (
                    <button className="review-button" onClick={() => toggleVerify(item)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-right-square-fill" viewBox="0 0 16 16">
                            <path d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1"/>
                        </svg>
                   
                        <span> Review</span>
                    </button>
                )}
            </li></div>
        ))}
    </ul>
</div>

        </div>
      )}
      {verify && itemToVerify && (
        <div className="modal" onClick={(e)=>{setVerify(!verify),setshowData(!showData)}}>
            <div className="model-content" onClick={(e) => e.stopPropagation()}>
            <div className="details-section">
    <h2>Details for Verification</h2>
    <p className="request-detail">Builder Addr: {itemToVerify.address}</p>
    <p className="request-detail">Project Name: {itemToVerify.projectName}</p>
    <p className="request-detail">Stage Number: {itemToVerify.stageNumber}</p>
    <p className="request-detail">Amount Requested: {itemToVerify.amountRequested}</p>
    <p className="request-detail">IPFS links:</p>
    <ul>
        {itemToVerify.proofOfCompletion.map((link:string, i) => (
            <li key={i}>
                <a href={link} target="_blank" rel="noopener noreferrer">
                    {link.substring(0,20)}
                </a>
            </li>
        ))}
    </ul>
    <div className="image-container">
        {itemToVerify.proofOfCompletion.map((link, i) => (
            <MediaRenderer key={i} alt="Image" src={link} width="200px" height="200px" />
        ))}
    </div>
    <div  className="NFT-container">
        <p className="request-detail">NFT link: <a href={itemToVerify.NFT} target="_blank" rel="noopener noreferrer">
            {itemToVerify.NFT.substring(0,20)}
        </a></p>
        <MediaRenderer alt="Image" src={itemToVerify.NFT} width="200px" height="200px" />
    </div>
    <p className={`verification-status ${itemToVerify.verified ? 'verification-yes' : 'verification-no'}`}>
                    Verified: {itemToVerify.verified ? 'Yes' : 'No'}
                </p>
    <button className="close-modal" onClick={(e)=>{setVerify(!verify)}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="white" className="bi bi-x-circle" viewBox="0 0 25 25">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
        </svg>
    </button>
</div>

              <div className="submitform">
              <form>
    <br />
    <label htmlFor="description">Description:</label><br />
    <textarea id="description" name="description" rows={4} cols={50} value={formData.description} onChange={handleDescriptionChange} required></textarea><br />
    <label htmlFor="proofOfCompletion">Proof of Completion:</label>
    <div {...getRootProps()} className="upload-area">
        <input {...getInputProps()} required id="proofOfCompletion" type="file" accept="image/png, image/jpeg, .pdf" name="proofOfCompletion" />
        <p>DRAG & DROP A FILE</p>
    </div>
    <div>
        {formData.prroofOfVerification?.map((link, i) => (
            <MediaRenderer style={{ margin: '20px' }} key={i} alt="Not Supported" src={link} width="200px" height="200px" />
        ))}
    </div>
    <p>Please upload required documents.</p>
    <p>REMEMBER ONCE YOU DROP A FILE, IT WILL BE UPLOADED TO IPFS AUTOMATICALLY.</p>
    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    <br />
    <button type="button" onClick={handleGenerateImage}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-card-image" viewBox="0 0 16 16">
            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
            <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z"/>
        </svg>
        Generate Image
    </button>
    <br />
    {generatedImage && <img className="genimg" style={{ backgroundColor: 'azure' }} src={generatedImage} alt="Generated Image" />}
    <br />
    <button type="button" onClick={handleUploadToIPFS}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-upload" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
        </svg>
        Upload To IPFS
    </button>
    {ipfsLink && (
        <p>NFT IPFS Link: <a href={ipfsLink} target="_blank" rel="noopener noreferrer">{ipfsLink.substring(0, 10)}</a></p>
    )}
    <br />
    <button type="button" onClick={showData}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-view-stacked" viewBox="0 0 16 16">
            <path d="M3 0h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm0 8h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
        </svg>
        Show Data
    </button>
    <br />
    {ShowData ? (
        <div style={{ position: 'absolute', zIndex: '2', backgroundColor: 'black', left: '50%', borderRadius: '20px' }}>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
            <button onClick={() => setshowData(false)} style={{ border: 'none', backgroundColor: 'transparent', top: '10px', right: '10px', position: 'absolute' }} type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" className="bi bi-x-square" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1
   0 0 1 1 0v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
   <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708z"/>
</svg>
</button>
</div>
) : null}
<br />
{!itemToVerify.verified && (
<button className="verify" type="submit"onClick={() => { verifyRequest(itemToVerify._id, formData), setVerify(!verify) }}>Verify</button>
)}
</form>

              </div>
            </div>
          </div>
      )}
     
      
    </div>
  );
};

export default Home;
