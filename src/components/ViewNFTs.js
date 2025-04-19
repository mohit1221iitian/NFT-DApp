import { useEffect, useState } from "react";

const fallbackGateways = [
  "https://nftstorage.link/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/"
];

const convertIPFSToHttp = (url, fallbackIndex = 0) => {
  if (!url || !url.startsWith("ipfs://")) return url;
  const cidPath = url.split("ipfs://")[1];
  return `${fallbackGateways[fallbackIndex]}${cidPath}`;
};


const ViewNFTs = ({ contract, address }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNFTs = async () => {
      setLoading(true);
      const results = [];

      try {
        const balance = await contract.balanceOf(address);

        for (let i = 0; i < balance; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(address, i);
          const tokenURI = await contract.tokenURI(tokenId);
          const fixedTokenURI = convertIPFSToHttp(tokenURI);

          const response = await fetch(fixedTokenURI);
          const metadata = await response.json();
          const imageUrl = convertIPFSToHttp(metadata.image);

          results.push({
            tokenId: tokenId.toString(),
            image: imageUrl,
            name: metadata.name,
            description: metadata.description,
          });
        }
      } catch (error) {
        console.error("Error loading NFTs:", error);
      }

      setNfts(results);
      setLoading(false);
    };

    if (contract && address) {
      loadNFTs();
    }
  }, [contract, address]);

  return (
    <div style={{ padding: "16px" }}>
      <h2 style={{ fontSize: "22px", marginBottom: "16px", fontWeight: "600" }}>
        Your NFTs
      </h2>
      {loading ? (
        <p style={{ fontSize: "14px" }}>Loading NFTs...</p>
      ) : nfts.length === 0 ? (
        <p style={{ fontSize: "14px" }}>You don't own any NFTs yet.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "flex-start",
          }}
        >
          {nfts.map((nft) => (
            <div
              key={nft.tokenId}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                width: "220px",
                textAlign: "left",
                borderRadius: "12px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <img
                src={nft.image}
                alt={nft.name || `NFT ${nft.tokenId}`}
                style={{
                  width: "100%",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              />
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: "#222",
                }}
              >
                {nft.name || `Token #${nft.tokenId}`}
              </h4>
              <p
                style={{
                  fontSize: "12px",
                  marginBottom: "6px",
                  color: "#555",
                }}
              >
                <strong>ID:</strong> {nft.tokenId}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#444",
                  whiteSpace: "pre-wrap",
                }}
              >
                {nft.description || "No description available."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewNFTs;
