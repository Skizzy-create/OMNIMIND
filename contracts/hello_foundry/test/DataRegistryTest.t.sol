// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DataRegistry.sol";
import "../src/DataNFT.sol";
import "../src/DummyVerifier.sol";
import "../src/AccessManager.sol";
import "../src/DataCoin.sol";

contract DataRegistryTest is Test {
    DataRegistry public dataRegistry;
    DataNFT public dataNFT;
    DummyVerifier public verifier;
    AccessManager public accessManager;
    DataCoin public dataCoin;

    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);

    function setUp() public {
        // Deploy contracts
        dataCoin = new DataCoin();
        dataNFT = new DataNFT();
        verifier = new DummyVerifier();
        accessManager = new AccessManager();

        // Deploy DataRegistry with contract addresses
        dataRegistry = new DataRegistry(
            address(dataNFT),
            address(verifier),
            address(accessManager),
            address(dataCoin)
        );

        // Transfer ownership of DataNFT to DataRegistry (owner is msg.sender in constructor)
        dataNFT.transferOwnership(address(dataRegistry));

        // Transfer ownership of DataCoin to DataRegistry (owner is msg.sender in constructor)
        dataCoin.transferOwnership(address(dataRegistry));
    }

    function testInitialState() public {
        assertEq(dataRegistry.datasetCount(), 0);
        assertEq(address(dataRegistry.dataNFT()), address(dataNFT));
        assertEq(address(dataRegistry.verifier()), address(verifier));
        assertEq(address(dataRegistry.accessManager()), address(accessManager));
        assertEq(address(dataRegistry.dataCoin()), address(dataCoin));
    }

    function testRegisterDataset() public {
        vm.prank(user1);
        dataRegistry.registerDataset("Test Dataset", "QmTestHash123");

        assertEq(dataRegistry.datasetCount(), 1);
        
        (uint256 id, string memory name, string memory fileHash, address owner_addr, bool verified, address nftAddress) = dataRegistry.datasets(1);
        
        assertEq(id, 1);
        assertEq(name, "Test Dataset");
        assertEq(fileHash, "QmTestHash123");
        assertEq(owner_addr, user1);
        assertEq(verified, false);
        assertEq(nftAddress, address(dataNFT));

        // Check if NFT was minted
        assertEq(dataNFT.ownerOf(1), user1);
        assertEq(dataNFT.balanceOf(user1), 1);
    }

    function testVerifyDataset() public {
        // First register a dataset
        vm.prank(user1);
        dataRegistry.registerDataset("Test Dataset", "QmTestHash123");

        uint256 initialBalance = dataCoin.balanceOf(user1);

        // Verify the dataset
        vm.prank(owner);
        dataRegistry.verifyDataset(1);

        // Check if dataset is verified
        (, , , , bool verified, ) = dataRegistry.datasets(1);
        assertEq(verified, true);

        // Check if user received reward
        uint256 finalBalance = dataCoin.balanceOf(user1);
        uint256 expectedReward = 100 * 10 ** dataCoin.decimals();
        assertEq(finalBalance - initialBalance, expectedReward);
    }

    function testVerifyDatasetInvalidId() public {
        vm.prank(owner);
        vm.expectRevert("Invalid dataset");
        dataRegistry.verifyDataset(1); // Dataset doesn't exist
    }

    function testGrantAccess() public {
        // Register a dataset
        vm.prank(user1);
        dataRegistry.registerDataset("Test Dataset", "QmTestHash123");

        // Grant access to user2
        vm.prank(user1);
        dataRegistry.grantAccess(1, user2);

        // Check if access was granted
        assertTrue(accessManager.hasAccess(1, user2));
    }

    function testGrantAccessNotOwner() public {
        // Register a dataset
        vm.prank(user1);
        dataRegistry.registerDataset("Test Dataset", "QmTestHash123");

        // Try to grant access as non-owner
        vm.prank(user2);
        vm.expectRevert("Not dataset owner");
        dataRegistry.grantAccess(1, user2);
    }

    function testMultipleDatasets() public {
        // Register multiple datasets
        vm.prank(user1);
        dataRegistry.registerDataset("Dataset 1", "QmHash1");

        vm.prank(user2);
        dataRegistry.registerDataset("Dataset 2", "QmHash2");

        vm.prank(user1);
        dataRegistry.registerDataset("Dataset 3", "QmHash3");

        assertEq(dataRegistry.datasetCount(), 3);

        // Verify all datasets
        vm.prank(owner);
        dataRegistry.verifyDataset(1);

        vm.prank(owner);
        dataRegistry.verifyDataset(2);

        vm.prank(owner);
        dataRegistry.verifyDataset(3);

        // Check all are verified
        (, , , , bool verified1, ) = dataRegistry.datasets(1);
        (, , , , bool verified2, ) = dataRegistry.datasets(2);
        (, , , , bool verified3, ) = dataRegistry.datasets(3);

        assertTrue(verified1);
        assertTrue(verified2);
        assertTrue(verified3);
    }

    function testEvents() public {
        // Test DatasetRegistered event
        vm.expectEmit(true, true, false, true);
        emit DataRegistry.DatasetRegistered(1, user1, "Test Dataset");
        
        vm.prank(user1);
        dataRegistry.registerDataset("Test Dataset", "QmTestHash123");

        // Test DatasetVerified event
        vm.expectEmit(true, false, false, true);
        emit DataRegistry.DatasetVerified(1, true);
        
        dataRegistry.verifyDataset(1);
    }

    function testDummyVerifierLogic() public {
        // Test that DummyVerifier accepts non-empty hashes
        assertTrue(verifier.verifyData("QmValidHash"));
        assertTrue(verifier.verifyData("ipfs://QmValidHash"));
        
        // Test with empty hash
        assertFalse(verifier.verifyData(""));
    }

    function testDataCoinRewardSystem() public {
        uint256 rewardAmount = 100 * 10 ** dataCoin.decimals();
        
        // Test initial balance
        assertEq(dataCoin.balanceOf(user1), 0);
        
        // Register and verify dataset
        vm.prank(user1);
        dataRegistry.registerDataset("Test Dataset", "QmTestHash123");
        
        vm.prank(owner);
        dataRegistry.verifyDataset(1);
        
        // Check reward was given
        assertEq(dataCoin.balanceOf(user1), rewardAmount);
    }

    function testAccessManagerFunctionality() public {
        // Test granting access
        accessManager.grantAccess(1, user1);
        assertTrue(accessManager.hasAccess(1, user1));
        assertFalse(accessManager.hasAccess(1, user2));
        
        // Test multiple users
        accessManager.grantAccess(1, user2);
        assertTrue(accessManager.hasAccess(1, user2));
        
        // Test different datasets
        accessManager.grantAccess(2, user1);
        assertTrue(accessManager.hasAccess(2, user1));
        assertFalse(accessManager.hasAccess(2, user2));
    }

    function testDataNFTMinting() public {
        // Test that only DataRegistry can mint NFTs
        vm.prank(owner);
        vm.expectRevert();
        dataNFT.mint(user1, 1); // Should fail because owner is now DataRegistry
        
        // Test minting through DataRegistry
        vm.prank(user1);
        dataRegistry.registerDataset("Test Dataset", "QmTestHash123");
        
        assertEq(dataNFT.ownerOf(1), user1);
        assertEq(dataNFT.balanceOf(user1), 1);
        assertEq(dataNFT.tokenCounter(), 1);
    }
}
