// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/DataRegistry.sol";
import "../src/DataNFT.sol";
import "../src/DummyVerifier.sol";
import "../src/AccessManager.sol";
import "../src/DataCoin.sol";

contract DeployFilecoin is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying to Anvil Filecoin chain with account:", deployer);
        console.log("Account balance:", deployer.balance);
        console.log("Chain ID:", block.chainid);

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
            "Filecoin Test Dataset", 
            "QmFilecoinTestHash123456789"
        );
        console.log("Test dataset registered with ID: 1");

        // Verify the dataset
        dataRegistry.verifyDataset(1);
        console.log("Test dataset verified");

        vm.stopBroadcast();

        // Save deployment addresses to file
        string memory deploymentInfo = string(abi.encodePacked(
            "=== Filecoin Chain Deployment ===\n",
            "Chain ID: ", vm.toString(block.chainid), "\n",
            "Deployer: ", vm.toString(deployer), "\n",
            "DataCoin: ", vm.toString(address(dataCoin)), "\n",
            "DataNFT: ", vm.toString(address(dataNFT)), "\n",
            "DummyVerifier: ", vm.toString(address(verifier)), "\n",
            "AccessManager: ", vm.toString(address(accessManager)), "\n",
            "DataRegistry: ", vm.toString(address(dataRegistry)), "\n",
            "Deployment Time: ", vm.toString(block.timestamp), "\n"
        ));

        vm.writeFile("./filecoin-deployment-addresses.txt", deploymentInfo);
        console.log("Deployment addresses saved to filecoin-deployment-addresses.txt");

        // Display final state
        console.log("\n=== Filecoin Deployment Summary ===");
        console.log("DataCoin: ", address(dataCoin));
        console.log("DataNFT: ", address(dataNFT));
        console.log("DummyVerifier: ", address(verifier));
        console.log("AccessManager: ", address(accessManager));
        console.log("DataRegistry: ", address(dataRegistry));
        console.log("\nDataset count:", dataRegistry.datasetCount());
        console.log("Deployer DataCoin balance:", dataCoin.balanceOf(deployer));
        console.log("Deployment completed successfully on Filecoin chain!");
    }
}
