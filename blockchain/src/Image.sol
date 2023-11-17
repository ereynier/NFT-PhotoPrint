// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/* ========== Imports ========== */
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/* ========== Interfaces, libraries, contracts ========== */

contract Image is ERC721, ERC721Burnable, Ownable {
    /* ========== Errors ========== */
    error Image__MaxSupplyReached();

    /* ========== Types ========== */

    /* ========== State variables ========== */
    uint256 private _nextTokenId;
    uint256 private immutable _maxSupply;
    string private _URI;

    /* ========== Events ========== */

    event Minted(address indexed to, uint256 indexed tokenId);

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
        _URI = baseURIString;
    }

    /* ========== Receive ========== */
    /* ========== Fallback ========== */
    /* ========== External functions ========== */
    /* ========== Public functions ========== */

    function safeMint(address to) public onlyOwner {
        if (_nextTokenId >= _maxSupply) {
            revert Image__MaxSupplyReached();
        }
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        emit Minted(to, tokenId);
    }

    /* ========== Internal functions ========== */
    /* ========== Private functions ========== */
    /* ========== Internal & private view / pure functions ========== */
    /* ========== External & public view / pure functions ========== */
    function getMaxSupply() external view returns (uint256) {
        return _maxSupply;
    }

    function getNextId() external view returns (uint256) {
        return _nextTokenId;
    }
    
    function getUri() external view returns (string memory) {
        return _URI;
    }
}
