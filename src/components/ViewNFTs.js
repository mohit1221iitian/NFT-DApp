import { useEffect, useState } from "react";

const ViewNFTs = ({ contract, address }) => {
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    const loadNFTs = async () => {
      const balance = await contract.balanceOf(address);
      const results = [];
      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i);
        const tokenURI = await contract.tokenURI(tokenId);
        results.push({ tokenId: tokenId.toString(), uri: tokenURI });
      }
      setNfts(results);
    };
    loadNFTs();
  }, [contract, address]);

  return (
    <div>
      <h2>Your NFTs</h2>
      {nfts.map((nft) => (
        <div key={nft.tokenId}>
          <p>Token ID: {nft.tokenId}</p>
          <img src={nft.uri} width="150" alt={`NFT ${nft.tokenId}`} />
        </div>
      ))}
    </div>
  );
};

export default ViewNFTs;
