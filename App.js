// src/EscrowSwapUI.js
import React, { useState, useEffect } from "react";
import {
  BrowserProvider,
  Contract,
  parseEther
} from "ethers"; // Ethers v6 imports
import EscrowSwapABI from "./EscrowSwapABI.json";

const ESCROW_CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138"; // Replace with your actual contract address

const EscrowSwapUI = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  // Set up provider on load
  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new BrowserProvider(window.ethereum);
      setProvider(newProvider);
    } else {
      alert("MetaMask is required");
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) return;

    await provider.send("eth_requestAccounts", []);
    const newSigner = await provider.getSigner();
    setSigner(newSigner);
    const address = await newSigner.getAddress();
    setAccount(address);

    const escrowContract = new Contract(
      ESCROW_CONTRACT_ADDRESS,
      EscrowSwapABI,
      newSigner
    );
    setContract(escrowContract);
  };

  const sellerDeposit = async () => {
    if (!contract || !signer) return;

    const tx = await contract.sellerDeposit({
      value: parseEther(depositAmount),
    });
    await tx.wait();
    alert("Deposit successful");
  };

  const triggerTimeoutRefund = async () => {
    if (!contract) return;
    const tx = await contract.timeoutRefund();
    await tx.wait();
    alert("Timeout refund triggered");
  };

  return (
    <div>
      <h1>Escrow Swap</h1>
      {account ? (
        <p>Connected as: {account}</p>
      ) : (
        <button onClick={connectWallet}>Connect MetaMask</button>
      )}

      <div>
        <label>Seller Deposit (ETH):</label>
        <input
          type="text"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
        <button onClick={sellerDeposit}>Deposit as Seller</button>
      </div>

      <div>
        <button onClick={triggerTimeoutRefund}>Trigger Timeout Refund</button>
      </div>
    </div>
  );
};

export default EscrowSwapUI;
