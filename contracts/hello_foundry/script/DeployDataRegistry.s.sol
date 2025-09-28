// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/DataRegistry.sol";
import "../src/DataNFT.sol";
import "../src/DummyVerifier.sol";
import "../src/AccessManager.sol";
import "../src/DataCoin.sol";

contract DeployDataRegistry is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with the account:", deployer);
        console.log("Account balance:", deployer.balance);

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

        // Save deployment addresses to file
        string memory deploymentInfo = string(abi.encodePacked(
            "DataCoin: ", vm.toString(address(dataCoin)), "\n",
            "DataNFT: ", vm.toString(address(dataNFT)), "\n",
            "DummyVerifier: ", vm.toString(address(verifier)), "\n",
            "AccessManager: ", vm.toString(address(accessManager)), "\n",
            "DataRegistry: ", vm.toString(address(dataRegistry)), "\n"
        ));

        vm.writeFile("./deployment-addresses.txt", deploymentInfo);
        console.log("Deployment addresses saved to deployment-addresses.txt");

        // Verify initial state
        console.log("\n=== Deployment Verification ===");
        console.log("DataRegistry dataset count:", dataRegistry.datasetCount());
        console.log("DataNFT token counter:", dataNFT.tokenCounter());
        console.log("DataCoin total supply:", dataCoin.totalSupply());
        console.log("DataCoin deployer balance:", dataCoin.balanceOf(deployer));
    }
}
