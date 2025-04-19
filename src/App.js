import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./contractABI.json";
import MintNFT from "./components/MintNFT";
import ViewNFTs from "./components/ViewNFTs";
import BurnNFT from "./components/BurnNFT";

const CONTRACT_ADDRESS = "0x1eb8F1a1d776B5DEE476e921325e217e0a11A62A";

function App() {
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState("");
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Connecting to wallet...");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
          const userAddress = await signer.getAddress();

          setContract(contractInstance);
          setAddress(userAddress);
          setConnectionStatus("Connected");
        } catch (error) {
          setConnectionStatus("Connection Failed. Please try again.");
          console.error("Error connecting to wallet:", error);
        }
      } else {
        setConnectionStatus(
          "MetaMask is not installed. Please install MetaMask to continue."
        );
      }
      setLoading(false);
    };
    init();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";

  const background = isDark
    ? "linear-gradient(to right, #0f2027, #203a43, #2c5364)"
    : "linear-gradient(to right, #ece9e6, #ffffff)";

  const textColor = isDark ? "#fff" : "#222";

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
          background,
          height: "100vh",
          color: textColor,
        }}
      >
        <p>{connectionStatus}</p>
        {connectionStatus.includes("MetaMask is not installed") && (
          <div>
            <p>
              <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
                Download MetaMask
              </a>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px 16px 30px",
        background,
        color: textColor,
        fontFamily: "Arial, sans-serif",
        transition: "all 0.3s ease",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "8px",
          fontSize: "2rem",
          textShadow: isDark ? "1px 1px 8px rgba(0,0,0,0.4)" : "none",
        }}
      >
        NFT Minting dApp
      </h1>

      <p style={{ textAlign: "center", fontSize: "0.85rem", marginBottom: "12px" }}>
        Connected Wallet: <code>{address.slice(0, 6)}...{address.slice(-4)}</code>
      </p>

      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <button
          onClick={toggleTheme}
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: isDark ? "#f0f0f0" : "#333",
            color: isDark ? "#333" : "#fff",
            cursor: "pointer",
          }}
        >
          Switch to {isDark ? "Light" : "Dark"} Mode
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "24px",
          marginBottom: "30px",
        }}
      >
        <MintNFT contract={contract} />
        <BurnNFT contract={contract} />
      </div>

      <ViewNFTs contract={contract} address={address} />
    </div>
  );
}

export default App;
