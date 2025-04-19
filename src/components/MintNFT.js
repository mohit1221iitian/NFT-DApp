import { useState, useEffect } from "react";

// Fallback IPFS gateways
const fallbackGateways = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://nftstorage.link/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/"
];

// Resolve ipfs://... to https://gateway/...
const resolveIPFS = (ipfsUrl, fallbackIndex = 0) => {
  if (!ipfsUrl.startsWith("ipfs://")) return ipfsUrl;
  const cidPath = ipfsUrl.split("ipfs://")[1];
  return `${fallbackGateways[fallbackIndex]}${cidPath}`;
};

const MintNFT = ({ contract }) => {
  const [ipfsURL, setIpfsURL] = useState("");
  const [preview, setPreview] = useState("");
  const [tokenId, setTokenId] = useState("");

  useEffect(() => {
    const fetchImageFromMetadata = async () => {
      if (!ipfsURL) return;
      const metadataURL = resolveIPFS(ipfsURL);
      try {
        const res = await fetch(metadataURL);
        const data = await res.json();
        if (data.image) {
          const imageURL = resolveIPFS(data.image);
          setPreview(imageURL);
        } else {
          setPreview("");
        }
      } catch (err) {
        console.error("Failed to load image from metadata:", err);
        setPreview("");
      }
    };
    fetchImageFromMetadata();
  }, [ipfsURL]);

  const mintNFT = async () => {
    if (!ipfsURL || !tokenId) {
      alert("Enter Token ID and Metadata URI");
      return;
    }

    const resolvedURI = resolveIPFS(ipfsURL);
    try {
      const tx = await contract.safeMint(tokenId, resolvedURI);
      await tx.wait();
      alert("✅ NFT Minted!");
    } catch (err) {
      alert("❌ Minting failed. Check console.");
      console.error(err);
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
      <p style={{ fontSize: "12px", color: "#555", marginBottom: "10px" }}>
                Token ID should be unique.(eg. 1,2,..)
      </p>

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
          <h4 style={{ textAlign: "center", color: "#333", marginBottom: "6px" }}>
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
