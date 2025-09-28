// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DataRegistry.sol";
import "../src/DataNFT.sol";
import "../src/DummyVerifier.sol";
import "../src/AccessManager.sol";
import "../src/DataCoin.sol";

contract DeployLocal is Script {
    function run() external {
        // Use the first account from the default Anvil accounts
        address deployer = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

        console.log("Deploying contracts locally with account:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy DataCoin first
        DataCoin dataCoin = new DataCoin();
        console.log("DataCoin deployed at:", address(dataCoin));

        // Deploy DataNFT
        DataNFT dataNFT = new DataNFT();
        console.log("DataNFT deployed at:", address(dataNFT));

        // Deploy DummyVerifier
        DummyVerifier verifier = new DummyVerifier();
        console.log("DummyVerifier deployed at:", address(verifier));

        // Deploy AccessManager
        AccessManager accessManager = new AccessManager();
        console.log("AccessManager deployed at:", address(accessManager));

        // Deploy DataRegistry
        DataRegistry dataRegistry = new DataRegistry(
            address(dataNFT),
            address(verifier),
            address(accessManager),
            address(dataCoin)
        );
        console.log("DataRegistry deployed at:", address(dataRegistry));

        // Transfer ownership of DataNFT to DataRegistry
        dataNFT.transferOwnership(address(dataRegistry));
        console.log("DataNFT ownership transferred to DataRegistry");

        // Transfer ownership of DataCoin to DataRegistry
        dataCoin.transferOwnership(address(dataRegistry));
        console.log("DataCoin ownership transferred to DataRegistry");

        vm.stopBroadcast();

        // Test the deployment with a sample dataset
        vm.startBroadcast(deployerPrivateKey);
        
        // Register a test dataset
        dataRegistry.registerDataset(
            "Sample Dataset", 
            "QmSampleHash123456789"
        );
        console.log("Sample dataset registered with ID: 1");

        // Verify the dataset
        dataRegistry.verifyDataset(1);
        console.log("Sample dataset verified");

        vm.stopBroadcast();

        // Display final state
        console.log("\n=== Deployment Summary ===");
        console.log("DataCoin: ", address(dataCoin));
        console.log("DataNFT: ", address(dataNFT));
        console.log("DummyVerifier: ", address(verifier));
        console.log("AccessManager: ", address(accessManager));
        console.log("DataRegistry: ", address(dataRegistry));
        console.log("\nDataset count:", dataRegistry.datasetCount());
        console.log("Deployer DataCoin balance:", dataCoin.balanceOf(deployer));
    }
}
