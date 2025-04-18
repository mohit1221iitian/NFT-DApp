import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./contractABI.json";
import MintNFT from "./components/MintNFT";
import ViewNFTs from "./components/ViewNFTs";
import BurnNFT from "./components/BurnNFT";

const CONTRACT_ADDRESS = "0xB166570eEE1335cCd1e0EC75ca8D853A75A8a6a6";

function App() {
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
        const userAddress = await signer.getAddress();

        setContract(contractInstance);
        setAddress(userAddress);
      }
    };
    init();
  }, []);

  if (!contract) return <div>Loading...</div>;

  return (
    <div>
      <h1>Gunani NFT Minting dApp</h1>
      <MintNFT contract={contract} />
      <ViewNFTs contract={contract} address={address} />
      <BurnNFT contract={contract} />
    </div>
  );
}

export default App;
