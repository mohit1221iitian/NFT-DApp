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

const MintNFT = ({ contract }) => {
  const [ipfsURL, setIpfsURL] = useState("");
  const [preview, setPreview] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [tokenExists, setTokenExists] = useState(null);

  useEffect(() => {
    const fetchImageFromMetadata = async () => {
      if (!ipfsURL) return;
      const metadataURL = resolveIPFS(ipfsURL);

      try {
        const res = await fetch(metadataURL);
        const data = await res.json();
        const imageURL = resolveIPFS(data.image || "");
        setPreview(imageURL);
      } catch (err) {
        console.error("Failed to load image from metadata:", err);
        setPreview("");
      }
    };
    fetchImageFromMetadata();
  }, [ipfsURL]);

  useEffect(() => {
    const checkToken = async () => {
      if (!tokenId || !contract) return;
      try {
        await contract.ownerOf(tokenId);
        setTokenExists(true);
      } catch (err) {
        if (
          err.message.includes("invalid token ID") ||
          err.message.includes("nonexistent")
        ) {
          setTokenExists(false);
        } else {
          setTokenExists(null);
        }
      }
    };
    checkToken();
  }, [tokenId, contract]);

  const mintNFT = async () => {
    if (!ipfsURL || !tokenId) {
      alert("Enter Token ID and Metadata URI");
      return;
    }
    if (tokenExists) {
      alert("❌ Token ID already exists. Choose a different one.");
      return;
    }

    const resolvedURI = resolveIPFS(ipfsURL);

    try {
      const tx = await contract.safeMint(tokenId, resolvedURI);
      await tx.wait();
      alert("✅ NFT Minted!");
    } catch (mintErr) {
      console.error(mintErr);
      alert("❌ Minting failed.");
    }
  };

  return (
    <div
      style={{
        marginTop: "40px",
        padding: "20px",
        border: "2px solid #4a90e2",
        borderRadius: "12px",
        backgroundColor: "#f0f8ff",
        width: "100%",
        maxWidth: "450px",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "0 2px 10px rgba(74, 144, 226, 0.2)",
      }}
    >
      <h2 style={{ color: "#0056b3", marginBottom: "6px" }}>Mint NFT</h2>

      <input
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        placeholder="Token ID"
        style={{
          width: "100%",
          marginBottom: "4px",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
      {tokenId && (
        <p
          style={{
            fontSize: "12px",
            color: tokenExists ? "red" : "green",
            marginBottom: "10px",
          }}
        >
          {tokenExists ? "❌ Token ID already exists" : "✅ Token ID is available"}
        </p>
      )}

      <input
        value={ipfsURL}
        onChange={(e) => setIpfsURL(e.target.value)}
        placeholder="Metadata IPFS URL (e.g. ipfs://...)"
        style={{
          width: "100%",
          marginBottom: "4px",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
      <p style={{ fontSize: "12px", color: "#555", marginBottom: "10px" }}>
        Example: <code>ipfs://Qm.../1.json</code>
      </p>

      {preview && (
        <>
          <h4
            style={{ textAlign: "center", color: "#333", marginBottom: "6px" }}
          >
            Preview NFT
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
        onClick={mintNFT}
        style={{
          padding: "10px",
          width: "100%",
          backgroundColor: "#4a90e2",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Mint NFT
      </button>
    </div>
  );
};

export default MintNFT;
