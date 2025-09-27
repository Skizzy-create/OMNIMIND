const { ethers } = require("hardhat");

async function main() {
  // Deploy the oracle contract first
  const CryptoOracle = await ethers.getContractFactory("CryptoOracle");
  const gelatoAutomatorAddress = "0x527a819db1eb0e34426297b03bae11F2f8B3A19E"; // Gelato Automate address
  
  const oracle = await CryptoOracle.deploy(gelatoAutomatorAddress);
  await oracle.deployed();
  
  console.log("CryptoOracle deployed to:", oracle.address);
  
  // Deploy Web3 Function
  console.log("\nDeploying Web3 Function...");
  console.log("Run: npx w3f deploy web3-functions/crypto-oracle/index.ts");
  console.log("Then create task with oracle address:", oracle.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
