import { useState } from "react";

const BurnNFT = ({ contract }) => {
  const [tokenId, setTokenId] = useState("");

  const burn = async () => {
    try {
      const tx = await contract.burn(tokenId);
      await tx.wait();
      alert("Burned successfully");
    } catch (err) {
      console.error(err);
      alert("Burn failed");
    }
  };

  return (
    <div>
      <h2>Burn NFT</h2>
      <input value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="Token ID" />
      <button onClick={burn}>Burn</button>
    </div>
  );
};

export default BurnNFT;
