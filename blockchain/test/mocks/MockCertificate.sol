// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockCertificate is ERC721, ERC721Burnable, Ownable {
    constructor(address initialOwner) ERC721("CertificateMockup", "CMKP") {
        transferOwnership(initialOwner);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://example.com/";
    }

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
