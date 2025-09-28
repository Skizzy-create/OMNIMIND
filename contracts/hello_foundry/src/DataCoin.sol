// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DataCoin is ERC20, Ownable {
    constructor() ERC20("DataCoin", "DATA") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals()); // initial supply
    }

    /// @notice Mint rewards to verified data contributors
    function rewardContributor(address contributor, uint256 amount) external onlyOwner {
        _mint(contributor, amount);
    }
}
