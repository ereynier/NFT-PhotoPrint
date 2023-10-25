// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;
/* ========== Imports ========== */

import {Image} from "./Image.sol";
import {Certificate} from "./Certificate.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/* ========== Interfaces, libraries, contracts ========== */

contract Printer is Ownable, ReentrancyGuard {
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
    error Printer__ZeroAddress();

    /* ========== Types ========== */

    /* ========== State variables ========== */

    struct NFT {
        address imageAddress;
        uint256 imageId;
        bool printed;
        uint256 timestampLock;
        bytes32 cryptedOrderId;
        address owner;
    }

    mapping(address user => NFT nft) _nftByUser;

    address private _admin;

    uint256 private constant LOCKING_TIME = 7 days;

    /* ========== Events ========== */

    event ConfirmOrder(address indexed user, bytes32 cryptedOrderId);
    event ImageLocked(address indexed user, address imageAddress, uint256 imageId);
    event ImageUnlocked(address indexed user, address imageAddress, uint256 imageId);
    event CertificateMinted(address indexed user, address certificateAddress, uint256 imageId);
    event AdminChanged(address indexed admin);

    /* ========== Modifiers ========== */

    modifier onlyAdmin() {
        if (msg.sender != _admin) {
            revert Printer__NotAdmin(msg.sender);
        }
        _;
    }

    modifier tokenLocked(address user) {
        if (_nftByUser[user].imageAddress == address(0)) {
            revert Printer__NoTokenLocked(user);
        }
        _;
    }

    /* ========== FUNCTIONS ========== */
    /* ========== constructor ========== */
    constructor(address initialOwner) {
        transferOwnership(initialOwner);
    }

    /* ========== Receive ========== */
    /* ========== Fallback ========== */
    /* ========== External functions ========== */

    function lock(address imageAddress, uint256 imageId, address owner) external onlyOwner nonReentrant {
        if (_nftByUser[owner].imageAddress != address(0)) {
            revert Printer__NFTAlreadyLocked(owner);
        }
        Image image = Image(imageAddress);
        if (image.getApproved(imageId) != address(this)) {
            revert Printer__NotApproved(imageAddress, imageId);
        }
        NFT memory nft = NFT({
            imageAddress: imageAddress,
            imageId: imageId,
            printed: false,
            timestampLock: 0,
            cryptedOrderId: "",
            owner: owner
        });
        _nftByUser[owner] = nft;
        image.transferFrom(owner, address(this), imageId);
        emit ImageLocked(owner, imageAddress, imageId);
    }

    function unlock(address user) external onlyOwner tokenLocked(user) nonReentrant {
        if (
            _nftByUser[user].printed || _nftByUser[user].timestampLock != 0
                || _nftByUser[user].cryptedOrderId != ""
        ) {
            revert Printer__NFTCantBeUnlocked(user);
        }
        _withdraw(user);
        emit ImageUnlocked(user, _nftByUser[user].imageAddress, _nftByUser[user].imageId);
    }

    function confirmOrder(address user, bytes32 cryptedOrderId) external onlyOwner tokenLocked(user) nonReentrant {
        if (_nftByUser[user].printed) {
            revert Printer__CommandIsPrinted(user);
        }
        if (_nftByUser[user].timestampLock != 0) {
            revert Printer__CommandAlreadyConfirmed(user);
        }

        _nftByUser[user].timestampLock = block.timestamp;
        _nftByUser[user].cryptedOrderId = cryptedOrderId;
        emit ConfirmOrder(user, cryptedOrderId);
    }

    function clearOrderId(address user) external onlyOwner tokenLocked(user) nonReentrant {
        if (_nftByUser[user].printed) {
            revert Printer__CommandIsPrinted(user);
        }
        if (_nftByUser[user].timestampLock == 0) {
            revert Printer__CommandIsNotSet(user);
        }
        if (block.timestamp - _nftByUser[user].timestampLock < LOCKING_TIME) {
            revert Printer__NFTIsLocked(user);
        }
        _nftByUser[user].timestampLock = 0;
        _nftByUser[user].cryptedOrderId = "";
    }

    function mintCertificate(address user, address certificate) external onlyOwner tokenLocked(user) nonReentrant {
        if (!_nftByUser[user].printed) {
            revert Printer__NFTNotPrinted(user);
        }
        _mintCertificate(user, certificate);
        emit CertificateMinted(user, certificate, _nftByUser[user].imageId);
    }

    function setPrinted(address user) external onlyAdmin tokenLocked(user) nonReentrant {
        if (_nftByUser[user].printed) {
            revert Printer__NFTAlreadyPrinted(user);
        }
        if (_nftByUser[user].timestampLock == 0) {
            revert Printer__CommandIsNotSet(user);
        }
        _nftByUser[user].printed = true;
    }

    function setAdmin(address admin) external onlyOwner {
        if (admin == address(0)) {
            revert Printer__ZeroAddress();
        }
        _admin = admin;
        emit AdminChanged(admin);
    }

    /* ========== Public functions ========== */
    /* ========== Internal functions ========== */
    function _withdraw(address user) internal {
        NFT memory nft = _nftByUser[user];
        Image image = Image(nft.imageAddress);
        delete _nftByUser[user];
        image.transferFrom(address(this), user, nft.imageId);
    }

    function _mintCertificate(address user, address certificate) internal {
        // delete nftByUser[user]
        delete _nftByUser[user];
        // mint certificate with nftByUser[user] specs to user
        Certificate(certificate).safeMint(user, _nftByUser[user].imageId);
        // burn nftByUser[user]
        Image(_nftByUser[user].imageAddress).burn(_nftByUser[user].imageId);
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
            bool printed,
            uint256 timestampLock,
            bytes32 cryptedOrderId,
            address owner
        )
    {
        NFT memory nft = _nftByUser[user];
        return
            (nft.imageAddress, nft.imageId, nft.printed, nft.timestampLock, nft.cryptedOrderId, nft.owner);
    }

    function getLockingTime() external pure returns (uint256) {
        return LOCKING_TIME;
    }

    function getAdminAddress() external view returns (address) {
        return _admin;
    }
}
