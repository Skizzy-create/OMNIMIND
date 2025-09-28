// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/DataCoin.sol";

contract DeployDataCoin is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying DataCoin to Filecoin Calibration Testnet with account:", deployer);
        console.log("Account balance:", deployer.balance);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying DataCoin...");
        DataCoin dataCoin = new DataCoin();
        console.log("DataCoin deployed at:", address(dataCoin));

        vm.stopBroadcast();

        console.log("\n=== DataCoin Deployment Summary ===");
        console.log("DataCoin: ", address(dataCoin));
        console.log("Deployment completed successfully!");
    }
}
