// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;
/* ========== Imports ========== */

import {Image} from "./Image.sol";
import {Certificate} from "./Certificate.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/* ========== Interfaces, libraries, contracts ========== */

contract Printer is Ownable {
    /* ========== Errors ========== */

    error Printer__NotTokenOwner(address imageAddress, uint256 imageId);
    error Printer__NotApproved(address imageAddress, uint256 imageId);
    error Printer__NFTAlreadyLocked(address user);
    error Printer__NFTAlreadyPrinted(address user);
    error Printer__NFTNotPrinted(address user);
    error Printer__NoTokenLocked(address user);
    error Printer__NotAdmin(address user);
    error Printer__CommandAlreadyConfirmed(address user);
    error Printer__NFTCantBeUnlocked(address user);
    error Printer__NFTIsLocked(address user);
    error Printer__CommandIsNotSet(address user);
    error Printer__CommandIsPrinted(address user);

    /* ========== Types ========== */

    /* ========== State variables ========== */

    struct NFT {
        address imageAddress;
        uint256 imageId;
        uint256 printId;
        bool printed;
        uint256 timestampLock;
        bytes32 cryptedOrderId;
        address owner;
    }

    mapping(address user => NFT nft) nftByUser;

    address private admin;

    uint256 private constant LOCKING_TIME = 7 days;

    /* ========== Events ========== */

    event ConfirmOrder(address user, bytes32 cryptedOrderId);

    /* ========== Modifiers ========== */

    modifier onlyAdmin() {
        if (msg.sender != admin) {
            revert Printer__NotAdmin(msg.sender);
        }
        _;
    }

    modifier tokenLocked(address user) {
        if (nftByUser[user].imageAddress == address(0)) {
            revert Printer__NoTokenLocked(user);
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
        NFT memory nft = NFT({
            imageAddress: imageAddress,
            imageId: imageId,
            printId: printId,
            printed: false,
            timestampLock: 0,
            cryptedOrderId: "",
            owner: owner
        });
        nftByUser[owner] = nft;
    }

    function unlock(address user) external onlyOwner tokenLocked(user) {
        if (
            nftByUser[user].printed == true || nftByUser[user].timestampLock != 0
                || nftByUser[user].cryptedOrderId != ""
        ) {
            revert Printer__NFTCantBeUnlocked(user);
        }
        _withdraw(user);
    }

    function confirmOrder(address user, bytes32 cryptedOrderId) external onlyOwner tokenLocked(user) {
        if (nftByUser[user].timestampLock != 0) {
            revert Printer__CommandAlreadyConfirmed(user);
        }
        if (nftByUser[user].printed == true) {
            revert Printer__CommandIsPrinted(user);
        }

        nftByUser[user].timestampLock = block.timestamp;
        nftByUser[user].cryptedOrderId = cryptedOrderId;
        emit ConfirmOrder(user, cryptedOrderId);
    }

    function clearOrderId(address user) external onlyOwner tokenLocked(user) {
        if (block.timestamp - nftByUser[user].timestampLock < LOCKING_TIME) {
            revert Printer__NFTIsLocked(user);
        }
        if (nftByUser[user].timestampLock == 0) {
            revert Printer__CommandIsNotSet(user);
        }
        if (nftByUser[user].printed == true) {
            revert Printer__CommandIsPrinted(user);
        }
        nftByUser[user].timestampLock = 0;
        nftByUser[user].cryptedOrderId = "";
    }

    function mintCertificate(address user, address certificate) external onlyOwner tokenLocked(user) {
        if (nftByUser[user].printed == false) {
            revert Printer__NFTNotPrinted(user);
        }
        _mintCertificate(user, certificate);
    }

    function setPrinted(address user) external onlyAdmin tokenLocked(user) {
        if (nftByUser[user].printed == true) {
            revert Printer__NFTAlreadyPrinted(user);
        }
        nftByUser[user].printed = true;
    }

    function setAdmin(address _admin) external onlyOwner {
        admin = _admin;
    }

    /* ========== Public functions ========== */
    /* ========== Internal functions ========== */
    function _withdraw(address user) internal {
        NFT memory nft = nftByUser[user];
        Image image = Image(nft.imageAddress);
        image.transferFrom(address(this), user, nft.imageId);
        delete nftByUser[user];
    }

    function _mintCertificate(address user, address certificate) internal {
        // mint certificate with nftByUser[user] specs to user
        Certificate(certificate).safeMint(user, nftByUser[user].imageId);
        // burn nftByUser[user]
        Image(nftByUser[user].imageAddress).burn(nftByUser[user].imageId);
        // delete nftByUser[user]
        delete nftByUser[user];
    }

    /* ========== Private functions ========== */
    /* ========== Internal & private view / pure functions ========== */
    /* ========== External & public view / pure functions ========== */

    function getImageLockedByUser(address user)
        public
        view
        returns (
            address imageAddress,
            uint256 imageId,
            uint256 printId,
            bool printed,
            uint256 timestampLock,
            bytes32 cryptedOrderId,
            address owner
        )
    {
        NFT memory nft = nftByUser[user];
        return (
            nft.imageAddress,
            nft.imageId,
            nft.printId,
            nft.printed,
            nft.timestampLock,
            nft.cryptedOrderId,
            nft.owner
        );
    }

    function getLockingTime() external pure returns (uint256) {
        return LOCKING_TIME;
    }
}
