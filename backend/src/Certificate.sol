// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/* ========== Imports ========== */
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/* ========== Interfaces, libraries, contracts ========== */

contract Certificate is ERC721, ERC721Burnable, Ownable {
    /* ========== Errors ========== */
    error Certificate__MaxSupplyReached();
    error Certificate__TokenAlreadyMinted(uint256 tokenId);

    /* ========== Types ========== */

    /* ========== State variables ========== */
    mapping(uint256 mintedTokens => bool minted) private _mintedTokens;
    uint256 private maxSupply;
    string private baseURI;

    /* ========== Events ========== */
    /* ========== Modifiers ========== */
    /* ========== FUNCTIONS ========== */
    /* ========== constructor ========== */

    constructor(
        address initialOwner,
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        string memory baseURIString
    ) ERC721(name, symbol) Ownable() {
        transferOwnership(initialOwner);
        maxSupply = _maxSupply;
        baseURI = baseURIString;
    }

    /* ========== Receive ========== */
    /* ========== Fallback ========== */
    /* ========== External functions ========== */
    /* ========== Public functions ========== */

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        if (tokenId >= maxSupply) {
            revert Certificate__MaxSupplyReached();
        }
        if (_mintedTokens[tokenId]) {
            revert Certificate__TokenAlreadyMinted(tokenId);
        }
        _safeMint(to, tokenId);
        _mintedTokens[tokenId] = true;
    }

    /* ========== Internal functions ========== */
    /* ========== Private functions ========== */
    /* ========== Internal & private view / pure functions ========== */
    /* ========== External & public view / pure functions ========== */
    function getMaxSupply() external view returns (uint256) {
        return maxSupply;
    }
}
