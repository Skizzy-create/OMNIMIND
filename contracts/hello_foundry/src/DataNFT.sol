// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DataNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    // Fix: Pass msg.sender to Ownable's constructor
    constructor() ERC721("DataNFT", "DAT") Ownable(msg.sender) {}

    function mint(address to, uint256 datasetId) external onlyOwner {
        tokenCounter++;
        _safeMint(to, datasetId);
        _setTokenURI(datasetId, string(abi.encodePacked("ipfs://", datasetId)));
    }
}
