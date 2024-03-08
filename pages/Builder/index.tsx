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

  const failMessage = "Please install MetaMask & connect your MetaMask";
  const successMessage = "Your account has been connected";

  const provider = new ethers.providers.JsonRpcProvider(
    'https://mainnet.infura.io/v3/668405c01b4e44338647562e8b4fc608'
  );

  const WalletConnect = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });

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
        
      ]
    };
    
    
    
    
    console.log(metadata);
    try {
      // Upload metadata to IPFS
      const metadataUri = await uploadMetadata(metadata);
      console.log("Metadata IPFS link:", metadataUri);
  
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

    try {
      // Make POST request to your Next.js API route
      const response = await axios.post('/api/builder/route',formData);
      console.log(response.data); // Log response from the API route
      fetchData();
    } catch (error) {
      console.error('Error submitting form data:', error);
    }
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
        setIpfsLink(ipfsUri[0]);
        setFormData((prevFormData) => ({
          ...prevFormData,
          NFT: ipfsUri[0], // Concatenate the new URIs
        }));
        console.log('Uploaded NFT image to IPFS:', ipfsUri[0]);
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
          <h2>Hello Builder {currentAccount.slice(0,5)} </h2>
          <p>Account Address: {currentAccount}</p>
          <p>Account Balance: {balance} ETH</p>
          <div>
          <div className="w-full max-w-xs">
          <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="projectName">
          Project Name:
        </label>
        <input
        required
          id="projectName"
          type="text"
          name="projectName"
          placeholder="Enter project name"
          value={formData.projectName}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="stageNumber">
          Stage No.:
        </label>
        <input
        required
          id="stageNumber"
          type="text"
          pattern="[0-9]*"
          name="stageNumber"
          placeholder="Enter stage number"
          value={formData.stageNumber}
          onChange={handleChange}
        />
        <p>Please enter stage number.</p>
      </div>
      <div>
        <label htmlFor="amountRequested">
          Amount Requested:
        </label>
        <input
        required
          id="amountRequested"
          type="text"
          pattern="[0-9]*"
          name="amountRequested"
          placeholder="Enter amount requested"
          value={formData.amountRequested}
          onChange={handleChange}
        />
        <p>Please enter required amount.</p>
      </div>
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
      <canvas ref={canvasRef}></canvas>
      {!gen?
      <>
       <button type="button" onClick={handleGenerateImage}>Generate Image</button>
       </>:
       <><button  type="button" onClick={handleDownload}>Download Image</button>
       <button type="button" onClick={handleUploadToIPFS}>Upload to IPFS</button>
       <p>IPFS Link: {ipfsLink}</p>
       </>
}
      
    </div>
     
      </div>
      <div>
        <button type="submit">
          Submit
        </button>
      </div>
    </form>
</div>
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

          </div>
        </div>
      )}
    </div>  
    {/* <div>
                    {uris.map((uri)=>{
                      return(<MediaRenderer key={uri} alt="Image"
                      src={uri} width="400px" ></MediaRenderer>
                      )})}
                  </div> */}
    </div>
  );
};

export default Home;
