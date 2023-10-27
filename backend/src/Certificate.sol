// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/* ========== Imports ========== */
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/* ========== Interfaces, libraries, contracts ========== */

contract Certificate is ERC721, Ownable {
    /* ========== Errors ========== */
    error Certificate__MaxSupplyReached();
    error Certificate__TokenAlreadyMinted(uint256 tokenId);

    /* ========== Types ========== */

    /* ========== State variables ========== */
    mapping(uint256 mintedTokens => bool minted) private _mintedTokens;
    uint256 private immutable _maxSupply;
    string public baseURI;
    uint256 private _totalMinted;

    /* ========== Events ========== */
    /* ========== Modifiers ========== */
    /* ========== FUNCTIONS ========== */
    /* ========== constructor ========== */

    constructor(
        address initialOwner,
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        string memory baseURIString
    ) ERC721(name, symbol) Ownable() {
        transferOwnership(initialOwner);
        _maxSupply = maxSupply;
        baseURI = baseURIString;
    }

    /* ========== Receive ========== */
    /* ========== Fallback ========== */
    /* ========== External functions ========== */
    /* ========== Public functions ========== */

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        if (tokenId >= _maxSupply) {
            revert Certificate__MaxSupplyReached();
        }
        if (_mintedTokens[tokenId]) {
            revert Certificate__TokenAlreadyMinted(tokenId);
        }
        _mintedTokens[tokenId] = true;
        _totalMinted++;
        _safeMint(to, tokenId);
    }

    /* ========== Internal functions ========== */
    /* ========== Private functions ========== */
    /* ========== Internal & private view / pure functions ========== */
    /* ========== External & public view / pure functions ========== */
    function getMaxSupply() external view returns (uint256) {
        return _maxSupply;
    }

    function getTotalMinted() external view returns (uint256) {
        return _totalMinted;
    }
}
