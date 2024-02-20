"use client"
import { ConnectWallet , useStorageUpload,MediaRenderer} from "@thirdweb-dev/react";
import { useEffect, useState } from 'react';
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

  


  const verifyRequest = async (id:string) => {
    console.log(id)
    try {
     
      const response = await axios.post('/api/supervisor/route',{id:id.toString()});
      console.log(response.data);
      fetchData();
      // Optionally, update UI or show success message
    } catch (error) {
      console.error('Error verifying request:', error);
      // Optionally, show error message
    }
  };

  return (
    <div>
      {!currentAccount && !connect ? (
        <div>
          <h1>WElcome Supervisor, Please Connect your wallet to view details</h1>
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>
      ) : (
        <div>
          <h2>Hello Supervisor {currentAccount.slice(0,5)} </h2>
          <p>Account Address: {currentAccount}</p>
          <p>Account Balance: {balance} ETH</p>
          <h3>Submitted Requests</h3>
          <div>
            <ul>
              {data.map((item, index) => (
                <li key={index}>
                  <p>Builder Addr:{item.address}</p>
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
                  {/* <p>Proof of Completion: {item.proofOfCompletion}</p> */}
                  <p>Verified: {item.verified ? 'Yes' : 'No'}</p>
                  {!item.verified && (
                    <button  onClick={() => toggleVerify(item)}>Review</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {verify && itemToVerify && (
        <div className="modal">
          <div className="overlay" onClick={(e)=>{setVerify(!verify)}}>
            <div className="model-content" onClick={(e) => e.stopPropagation()}>
              <h2>Details for Verification</h2>
              <p>Project Name: {itemToVerify.projectName}</p>
              <p>Stage Number: {itemToVerify.stageNumber}</p>
              <p>Amount Requested: {itemToVerify.amountRequested}</p>
              <p>IPFS links:</p>
              <ul>
                {itemToVerify.proofOfCompletion.map((link, i) => (
                  <li key={i}>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
              <div >
      {itemToVerify.proofOfCompletion.map((link, i) => (
        <MediaRenderer style={{ margin: '20px' }} key={i} alt="Image" src={link} width="200px" height="200px"  />
      ))}
    </div>
    <p>Verified: {itemToVerify.verified ? 'Yes' : 'No'}</p>
                  {!itemToVerify.verified && (
                    <button  onClick={() => {verifyRequest(itemToVerify._id),setVerify(!verify)}}>Verify</button>
                  )}
              <button className="close-modal" onClick={(e)=>{setVerify(!verify)}}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Home;
