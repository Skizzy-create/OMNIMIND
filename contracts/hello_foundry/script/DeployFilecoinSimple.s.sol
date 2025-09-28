// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/DataRegistry.sol";
import "../src/DataNFT.sol";
import "../src/DummyVerifier.sol";
import "../src/AccessManager.sol";
import "../src/DataCoin.sol";

contract DeployFilecoinSimple is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying to Filecoin Testnet with account:", deployer);
        console.log("Account balance:", deployer.balance);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy contracts one by one with explicit gas settings
        console.log("Deploying DataCoin...");
        DataCoin dataCoin = new DataCoin();
        console.log("DataCoin deployed at:", address(dataCoin));

        console.log("Deploying DataNFT...");
        DataNFT dataNFT = new DataNFT();
        console.log("DataNFT deployed at:", address(dataNFT));

        console.log("Deploying DummyVerifier...");
        DummyVerifier verifier = new DummyVerifier();
        console.log("DummyVerifier deployed at:", address(verifier));

        console.log("Deploying AccessManager...");
        AccessManager accessManager = new AccessManager();
        console.log("AccessManager deployed at:", address(accessManager));

        console.log("Deploying DataRegistry...");
        DataRegistry dataRegistry = new DataRegistry(
            address(dataNFT),
            address(verifier),
            address(accessManager),
            address(dataCoin)
        );
        console.log("DataRegistry deployed at:", address(dataRegistry));

        vm.stopBroadcast();

        // Display final state
        console.log("\n=== Filecoin Testnet Deployment Summary ===");
        console.log("DataCoin: ", address(dataCoin));
        console.log("DataNFT: ", address(dataNFT));
        console.log("DummyVerifier: ", address(verifier));
        console.log("AccessManager: ", address(accessManager));
        console.log("DataRegistry: ", address(dataRegistry));
        console.log("Deployment completed successfully on Filecoin Testnet!");
    }
}