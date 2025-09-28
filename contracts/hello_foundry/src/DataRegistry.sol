// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DataNFT.sol";
import "./DummyVerifier.sol";
import "./AccessManager.sol";
import "./DataCoin.sol";

contract DataRegistry {
    struct Dataset {
        uint256 id;
        string name;
        string fileHash; // Filecoin CID or IPFS hash
        address owner;
        bool verified;
        address nftAddress;
    }

    uint256 public datasetCount;
    mapping(uint256 => Dataset) public datasets;

    DataNFT public dataNFT;
    DummyVerifier public verifier;
    AccessManager public accessManager;
    DataCoin public dataCoin; // Added DataCoin

    event DatasetRegistered(uint256 indexed id, address indexed owner, string name);
    event DatasetVerified(uint256 indexed id, bool verified);
    event DatasetRewarded(uint256 indexed id, address indexed owner, uint256 amount);

    constructor(
        address _nft,
        address _verifier,
        address _access,
        address _dataCoin
    ) {
        dataNFT = DataNFT(_nft);
        verifier = DummyVerifier(_verifier);
        accessManager = AccessManager(_access);
        dataCoin = DataCoin(_dataCoin); // Initialize DataCoin
    }

    function registerDataset(string memory _name, string memory _fileHash) external {
        datasetCount++;
        datasets[datasetCount] = Dataset(
            datasetCount,
            _name,
            _fileHash,
            msg.sender,
            false,
            address(dataNFT)
        );

        // Mint NFT to the data owner
        dataNFT.mint(msg.sender, datasetCount);
        emit DatasetRegistered(datasetCount, msg.sender, _name);
    }

    function verifyDataset(uint256 _id) external {
        require(_id <= datasetCount, "Invalid dataset");
        bool isValid = verifier.verifyData(datasets[_id].fileHash);
        datasets[_id].verified = isValid;
        emit DatasetVerified(_id, isValid);

        // Reward owner in DataCoin if verified
        if (isValid) {
            uint256 rewardAmount = 100 * 10 ** dataCoin.decimals(); // Example: 100 DATA
            dataCoin.rewardContributor(datasets[_id].owner, rewardAmount);
            emit DatasetRewarded(_id, datasets[_id].owner, rewardAmount);
        }
    }

    function grantAccess(uint256 _id, address _user) external {
        require(msg.sender == datasets[_id].owner, "Not dataset owner");
        accessManager.grantAccess(_id, _user);
    }
}
