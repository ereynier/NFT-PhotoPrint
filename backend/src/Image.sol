// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/* ========== Imports ========== */
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/* ========== Interfaces, libraries, contracts ========== */

contract Image is ERC721, ERC721Burnable, Ownable {
    /* ========== Errors ========== */
    error Image__MaxSupplyReached();

    /* ========== Types ========== */

    /* ========== State variables ========== */
    uint256 private _nextTokenId;
    uint256 private maxSupply;
    string private baseURI;
    uint256 private priceInUsd;

    /* ========== Events ========== */
    /* ========== Modifiers ========== */
    /* ========== FUNCTIONS ========== */
    /* ========== constructor ========== */

    constructor(
        address initialOwner,
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        string memory baseURIString,
        uint256 _priceInUsd
    ) ERC721(name, symbol) Ownable() {
        transferOwnership(initialOwner);
        maxSupply = _maxSupply;
        baseURI = baseURIString;
        priceInUsd = _priceInUsd;
    }

    /* ========== Receive ========== */
    /* ========== Fallback ========== */
    /* ========== External functions ========== */
    /* ========== Public functions ========== */

    function safeMint(address to) public onlyOwner {
        if (_nextTokenId >= maxSupply) {
            revert Image__MaxSupplyReached();
        }
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    /* ========== Internal functions ========== */
    /* ========== Private functions ========== */
    /* ========== Internal & private view / pure functions ========== */
    /* ========== External & public view / pure functions ========== */
    function getMaxSupply() external view returns (uint256) {
        return maxSupply;
    }

    function getNextId() external view returns (uint256) {
        return _nextTokenId;
    }

    function getPriceInUsd() external view returns (uint256) {
        return priceInUsd;
    }
}
