import { useState, useEffect } from "react";

// Fallback IPFS gateways
export const fallbackGateways = [
  "https://nftstorage.link/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/"
];

export const resolveIPFS = (ipfsUrl, fallbackIndex = 0) => {
  if (!ipfsUrl?.startsWith("ipfs://")) return ipfsUrl;
  const cidPath = ipfsUrl.split("ipfs://")[1];
  return `${fallbackGateways[fallbackIndex]}${cidPath}`;
};

const BurnNFT = ({ contract, userAddress }) => {
  const [tokenId, setTokenId] = useState("");
  const [preview, setPreview] = useState("");
  const [ownershipMessage, setOwnershipMessage] = useState("");

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenId || !contract) return;
      try {
        const tokenURI = await contract.tokenURI(tokenId);
        const metadataURL = resolveIPFS(tokenURI);
        const res = await fetch(metadataURL);
        const data = await res.json();
        if (data.image) {
          const imageURL = resolveIPFS(data.image);
          setPreview(imageURL);
        } else {
          setPreview("");
        }
      } catch (err) {
        console.error("Failed to fetch metadata:", err);
        setPreview("");
      }
    };

    fetchMetadata();
  }, [tokenId, contract]);

  const checkOwnership = async () => {
    if (!tokenId || !contract || !userAddress) return;

    try {
      const owner = await contract.ownerOf(tokenId);
      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        setOwnershipMessage("✅ You are the owner of this NFT.");
      } else {
        setOwnershipMessage("❌ You are not the owner of this NFT.");
      }
    } catch (err) {
      setOwnershipMessage("❌ Invalid Token ID or NFT does not exist.");
    }
  };

  const burn = async () => {
    if (!tokenId || !contract || !userAddress) return;

    try {
      const owner = await contract.ownerOf(tokenId);
      if (owner.toLowerCase() !== userAddress.toLowerCase()) {
        alert("❌ You are not the owner of this NFT!");
        return;
      }

      const tx = await contract.burn(tokenId);
      await tx.wait();
      alert("🔥 NFT burned successfully!");
      setTokenId("");
      setPreview("");
      setOwnershipMessage("");
    } catch (err) {
      console.error(err);
      alert("❌ Burn failed. See console for details.");
    }
  };

  return (
    <div
      style={{
        marginTop: "40px",
        padding: "20px",
        border: "2px solid #ff4d4f",
        borderRadius: "12px",
        backgroundColor: "#fff8f8",
        width: "100%",
        maxWidth: "450px",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "0 2px 10px rgba(255, 77, 79, 0.2)",
      }}
    >
      <h2 style={{ color: "#cc0000", marginBottom: "4px" }}>Burn NFT</h2>
      <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
        Enter the Token ID of the NFT you want to burn. You must be its owner.
      </p>

      <input
        value={tokenId}
        onChange={(e) => {
          setTokenId(e.target.value);
          setOwnershipMessage(""); // Reset message on token ID change
        }}
        placeholder="Token ID"
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      {ownershipMessage && (
        <p style={{ fontSize: "14px", color: ownershipMessage.startsWith("✅") ? "#2ecc71" : "#e74c3c" }}>
          {ownershipMessage}
        </p>
      )}

      {preview && (
        <>
          <h4 style={{ textAlign: "center", color: "#cc0000", marginBottom: "6px" }}>
            Preview NFT to Burn
          </h4>
          <img
            src={preview}
            alt="NFT Preview"
            width={200}
            style={{
              marginBottom: "10px",
              borderRadius: "10px",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        </>
      )}

      <button
        onClick={() => {
          checkOwnership();
          burn();
        }}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#ff4d4f",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Burn
      </button>
    </div>
  );
};

export default BurnNFT;
