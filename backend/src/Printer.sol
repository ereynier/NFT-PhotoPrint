// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;
/* ========== Imports ========== */

import {Image} from "./Image.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/* ========== Interfaces, libraries, contracts ========== */

contract Printer is Ownable {
    /* ========== Errors ========== */

    error Printer__NotTokenOwner(address imageAddress, uint256 imageId);
    error Printer__NotApproved(address imageAddress, uint256 imageId);
    error Printer__NFTAlreadyLocked(address user);

    /* ========== Types ========== */

    /* ========== State variables ========== */

    struct NFT {
        address imageAddress;
        uint256 imageId;
        uint256 printId;
        bytes32 hashedOrderId;
        address owner;
    }

    mapping(address user => NFT nft) nftByUser;
    mapping(bytes hashedOrderId => address user) userByOrderId;

    /* ========== Events ========== */
    /* ========== Modifiers ========== */

    /* ========== FUNCTIONS ========== */
    /* ========== constructor ========== */
    constructor() {}

    /* ========== Receive ========== */
    /* ========== Fallback ========== */
    /* ========== External functions ========== */

    function lock(address imageAddress, uint256 imageId, uint256 printId, address owner) external onlyOwner {
        if (nftByUser[owner].imageAddress != address(0)) {
            revert Printer__NFTAlreadyLocked(owner);
        }
        Image image = Image(imageAddress);
        if (image.getApproved(imageId) != address(this)) {
            revert Printer__NotApproved(imageAddress, imageId);
        }
        image.transferFrom(owner, address(this), imageId);
        NFT memory nft = NFT({
            imageAddress: imageAddress,
            imageId: imageId,
            printId: printId,
            hashedOrderId: "0x0",
            owner: owner
        });
        nftByUser[owner] = nft;
    }

    function unlock(address user) external onlyOwner {
        if (nftByUser[user].hashedOrderId == bytes32("0x0")) {
            withdraw(user);
        }
    }

    /* ========== Public functions ========== */
    /* ========== Internal functions ========== */
    function withdraw(address user) internal {
        NFT memory nft = nftByUser[user];
        Image image = Image(nft.imageAddress);
        image.transferFrom(address(this), user, nft.imageId);
        delete nftByUser[user];
    }
    
    /* ========== Private functions ========== */
    /* ========== Internal & private view / pure functions ========== */
    /* ========== External & public view / pure functions ========== */

    function getImageLockedByUser(address user)
        public
        view
        returns (address imageAddress, uint256 imageId, uint256 printId, address owner)
    {
        return (
            nftByUser[user].imageAddress,
            nftByUser[user].imageId,
            nftByUser[user].printId,
            nftByUser[user].owner
        );
    }
}
