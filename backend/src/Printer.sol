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
    error Printer__NFTAlreadyHaveAnOrderId(address user);
    error Printer__OrderIdNotExisting(bytes32 cryptedOrderId);
    error Printer__NoTokenLocked(address user);
    error Printer__NotAdmin(address user);

    /* ========== Types ========== */

    /* ========== State variables ========== */

    struct NFT {
        address imageAddress;
        uint256 imageId;
        uint256 printId;
        bytes32 cryptedOrderId;
        address owner;
    }

    mapping(address user => NFT nft) nftByUser;
    mapping(bytes32 cryptedOrderId => address user) userByOrderId;

    address private admin;

    /* ========== Events ========== */
    /* ========== Modifiers ========== */

    modifier onlyAdmin() {
        if (msg.sender != admin) {
            revert Printer__NotAdmin(msg.sender);
        }
        _;
    }

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
        NFT memory nft =
            NFT({imageAddress: imageAddress, imageId: imageId, printId: printId, cryptedOrderId: "0x0", owner: owner});
        nftByUser[owner] = nft;
    }

    function unlock(address user) external onlyOwner {
        if (nftByUser[user].imageAddress == address(0)) {
            revert Printer__NoTokenLocked(user);
        }
        if (nftByUser[user].cryptedOrderId == bytes32("0x0")) {
            withdraw(user);
        }
    }

    function getCertificate(address user) external onlyOwner {
        if (nftByUser[user].cryptedOrderId == bytes32("0x0")) {
            revert Printer__NoTokenLocked(user);
        }
        // get order state

        // Command canceled -> clearOrderId -> stop
        // Command delivered -> continue
        // Command other state -> stop

        // mintCertificate
    }

    function setOrderId(bytes32 cryptedOrderId, address user) external onlyAdmin {
        if (nftByUser[user].cryptedOrderId != bytes32("0x0")) {
            revert Printer__NFTAlreadyHaveAnOrderId(user);
        }
        nftByUser[user].cryptedOrderId = cryptedOrderId;
        userByOrderId[cryptedOrderId] = user;
    }

    function setAdmin(address _admin) external onlyOwner {
        admin = _admin;
    }

    /* ========== Public functions ========== */
    /* ========== Internal functions ========== */
    function withdraw(address user) internal {
        NFT memory nft = nftByUser[user];
        Image image = Image(nft.imageAddress);
        image.transferFrom(address(this), user, nft.imageId);
        delete nftByUser[user];
    }

    function clearOrderId(address user) internal {
        nftByUser[user].cryptedOrderId = bytes32("0x0");
    }

    function mintCertificate() internal {
        // mint certificate with nftByUser[user] specs to user
        // burn nftByUser[user]
        // delete nftByUser[user]
    }

    /* ========== Private functions ========== */
    /* ========== Internal & private view / pure functions ========== */
    /* ========== External & public view / pure functions ========== */

    function getUserByOrderId(bytes32 cryptedOrderId) external view returns (address user) {
        if (userByOrderId[cryptedOrderId] == address(0)) {
            revert Printer__OrderIdNotExisting(cryptedOrderId);
        }
        if (nftByUser[userByOrderId[cryptedOrderId]].cryptedOrderId != cryptedOrderId) {
            revert Printer__OrderIdNotExisting(cryptedOrderId);
        }
        return userByOrderId[cryptedOrderId];
    }

    function getNFTByUser(address user)
        external
        view
        returns (address imageAddress, uint256 imageId, uint256 printId, bytes32 cryptedOrderId, address owner)
    {
        return (
            nftByUser[user].imageAddress,
            nftByUser[user].imageId,
            nftByUser[user].printId,
            nftByUser[user].cryptedOrderId,
            nftByUser[user].owner
        );
    }

    function getImageLockedByUser(address user)
        public
        view
        returns (address imageAddress, uint256 imageId, uint256 printId, address owner)
    {
        return (nftByUser[user].imageAddress, nftByUser[user].imageId, nftByUser[user].printId, nftByUser[user].owner);
    }
}
