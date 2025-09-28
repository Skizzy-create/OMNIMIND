// web3-functions/data-registry/index.ts
import { Web3Function } from "@gelatonetwork/web3-functions-sdk";
import { Contract } from "ethers";
var DATA_REGISTRY_ABI = [
  "function datasetCount() external view returns(uint256)",
  "function datasets(uint256) external view returns(uint256 id, string memory name, string memory fileHash, address owner, bool verified, address nftAddress)",
  "function verifyDataset(uint256 _id) external",
  "function registerDataset(string memory _name, string memory _fileHash) external",
  "function grantAccess(uint256 _id, address _user) external"
];
var DUMMY_VERIFIER_ABI = [
  "function verifyData(string memory hash) external returns (bool)"
];
var DATA_COIN_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];
var ACCESS_MANAGER_ABI = [
  "function hasAccess(uint256 _id, address _user) external view returns (bool)",
  "function grantAccess(uint256 _id, address _user) external"
];
Web3Function.onRun(async (context) => {
  const { userArgs, storage, multiChainProvider, gelatoArgs } = context;
  const provider = multiChainProvider.default();
  const dataRegistryAddress = userArgs.dataRegistry;
  const verifierAddress = userArgs.verifier;
  const dataCoinAddress = userArgs.dataCoin;
  const accessManagerAddress = userArgs.accessManager;
  if (!dataRegistryAddress || !verifierAddress || !dataCoinAddress || !accessManagerAddress) {
    return {
      canExec: false,
      message: "Missing required contract addresses in userArgs"
    };
  }
  try {
    const dataRegistry = new Contract(dataRegistryAddress, DATA_REGISTRY_ABI, provider);
    const verifier = new Contract(verifierAddress, DUMMY_VERIFIER_ABI, provider);
    const dataCoin = new Contract(dataCoinAddress, DATA_COIN_ABI, provider);
    const accessManager = new Contract(accessManagerAddress, ACCESS_MANAGER_ABI, provider);
    const datasetCount = await dataRegistry.datasetCount();
    console.log(`Total datasets: ${datasetCount}`);
    const lastProcessedStr = await storage.get("lastProcessedDataset") ?? "0";
    const lastProcessed = parseInt(lastProcessedStr);
    console.log(`Last processed dataset: ${lastProcessed}`);
    if (datasetCount <= lastProcessed) {
      return {
        canExec: false,
        message: `No new datasets to process. Total: ${datasetCount}, Last processed: ${lastProcessed}`
      };
    }
    const newDatasets = [];
    for (let i = lastProcessed + 1; i <= datasetCount; i++) {
      try {
        const dataset = await dataRegistry.datasets(i);
        newDatasets.push({
          id: dataset.id.toString(),
          name: dataset.name,
          fileHash: dataset.fileHash,
          owner: dataset.owner,
          verified: dataset.verified
        });
      } catch (error) {
        console.log(`Error fetching dataset ${i}:`, error);
      }
    }
    console.log(`Found ${newDatasets.length} new datasets to process`);
    const callData = [];
    let processedCount = 0;
    for (const dataset of newDatasets) {
      try {
        if (dataset.verified) {
          console.log(`Dataset ${dataset.id} already verified`);
          processedCount++;
          continue;
        }
        const isVerified = await verifier.verifyData(dataset.fileHash);
        console.log(`Dataset ${dataset.id} verification result: ${isVerified}`);
        if (isVerified) {
          const verifyCalldata = dataRegistry.interface.encodeFunctionData("verifyDataset", [dataset.id]);
          callData.push({
            to: dataRegistryAddress,
            data: verifyCalldata
          });
          processedCount++;
        }
      } catch (error) {
        console.log(`Error processing dataset ${dataset.id}:`, error);
      }
    }
    await storage.set("lastProcessedDataset", datasetCount.toString());
    if (callData.length === 0) {
      return {
        canExec: false,
        message: `No datasets ready for verification. Processed ${processedCount} datasets.`
      };
    }
    return {
      canExec: true,
      callData,
      message: `Processing ${callData.length} dataset verifications. Total processed: ${processedCount}`
    };
  } catch (error) {
    console.error("Web3 Function error:", error);
    return {
      canExec: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
});
