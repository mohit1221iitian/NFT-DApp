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

  // Automatically fetch image from metadata JSON
  useEffect(() => {
    const fetchImageFromMetadata = async () => {
      if (!ipfsURL) return;

      const metadataURL = resolveIPFS(ipfsURL); // Use reliable gateway

      try {
        const res = await fetch(metadataURL);
        const data = await res.json();

        if (data.image) {
          const imageURL = resolveIPFS(data.image); // Convert image ipfs:// to https
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

  // Mint NFT function
  const mintNFT = async () => {
    if (!ipfsURL || !tokenId) {
      alert("Enter Token ID and Metadata URI");
      return;
    }

    const resolvedURI = resolveIPFS(ipfsURL); // Always resolve before minting

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
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h2>Mint NFT</h2>
      <input
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        placeholder="Token ID"
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <input
        value={ipfsURL}
        onChange={(e) => setIpfsURL(e.target.value)}
        placeholder="Metadata IPFS URL (e.g. ipfs://...)"
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      {preview && (
        <img
          src={preview}
          alt="NFT Preview"
          width={200}
          style={{ marginBottom: "10px", borderRadius: "10px" }}
        />
      )}
      <button onClick={mintNFT} style={{ padding: "10px", width: "100%" }}>
        Mint NFT
      </button>
    </div>
  );
};

export default MintNFT;
