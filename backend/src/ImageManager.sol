// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;
/* ========== Imports ========== */

import {Image} from "./Image.sol";
import {Certificate} from "./Certificate.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Printer} from "./Printer.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {OracleLib} from "./libraries/OracleLib.sol";

/* ========== Interfaces, libraries, contracts ========== */

contract ImageManager is Ownable, ReentrancyGuard {
    /* ========== Errors ========== */

    error ImageManager__ImageNotRegistered(address imageAddress);
    error ImageManager__MaxSupplyReached(address imageAddress);
    error ImageManager__NotTokenOwner(address imageAddress, uint256 tokenId);
    error ImageManager__TokenNotAllowed(address tokenAddress);
    error ImageManager__TransferFailed(address tokenAddress, address to);
    error ImageManager__NoTokenLocked(address user);

    /* ========== Types ========== */

    using OracleLib for AggregatorV3Interface;

    /* ========== State variables ========== */

    address[] private _images;
    mapping(address image => bool) _isImage;

    address[] private _certificates;
    mapping(address image => address certificate) _imageToCertificate;
    mapping(address certificate => address image) _certificateToImage;

    Printer immutable _printer;

    mapping(address token => address priceFeed) _priceFeeds;
    address[] private _allowedTokens;

    mapping(address image => uint256 priceInUsd) _imagePrices;
    mapping(address image => uint256 printId) _printIds;

    uint256 private constant ADDITIONAL_FEED_PRECISION = 1e10;
    uint256 private constant PRECISION = 1e18;

    /* ========== Events ========== */

    event imageCreated(address imageAddress);

    /* ========== Modifiers ========== */

    modifier onlyRegisteredImage(address imageAddress) {
        if (!_isImage[imageAddress]) {
            revert ImageManager__ImageNotRegistered(imageAddress);
        }
        _;
    }

    modifier onlyAllowedToken(address tokenAddress) {
        if (_priceFeeds[tokenAddress] == address(0)) {
            revert ImageManager__TokenNotAllowed(tokenAddress);
        }
        _;
    }

    /* ========== FUNCTIONS ========== */

    /* ========== constructor ========== */
    constructor(address initialOwner, address[] memory tokenAddresses, address[] memory priceFeedAddresses) {
        transferOwnership(initialOwner);
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            _priceFeeds[tokenAddresses[i]] = priceFeedAddresses[i];
            _allowedTokens.push(tokenAddresses[i]);
        }
        _printer = new Printer(address(this));
    }

    /* ========== Receive ========== */
    /* ========== Fallback ========== */
    /* ========== External functions ========== */

    function mint(address imageAddress, address to, address token)
        external
        nonReentrant
        onlyRegisteredImage(imageAddress)
        onlyAllowedToken(token)
    {
        Image image = Image(imageAddress);

        if (image.getNextId() >= image.getMaxSupply()) {
            revert ImageManager__MaxSupplyReached(imageAddress);
        }

        uint256 price = _imagePrices[imageAddress];
        uint256 amount = _getTokenAmountFromUsd(token, price);
        bool success = IERC20(token).transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert ImageManager__TransferFailed(token, address(this));
        }

        image.safeMint(to);
    }

    function lockImage(address imageAddress, uint256 tokenId) external nonReentrant onlyRegisteredImage(imageAddress) {
        Image image = Image(imageAddress);
        if (msg.sender != image.ownerOf(tokenId)) {
            revert ImageManager__NotTokenOwner(imageAddress, tokenId);
        }
        _printer.lock(imageAddress, tokenId, _printIds[imageAddress], msg.sender);
    }

    function unlockImage() external nonReentrant {
        _printer.unlock(msg.sender);
    }

    function confirmOrder(bytes32 cryptedOrderId) external nonReentrant {
        _printer.confirmOrder(msg.sender, cryptedOrderId);
    }

    function clearOrderId() external nonReentrant {
        _printer.clearOrderId(msg.sender);
    }

    function mintCertificate(address user) external nonReentrant {
        (address imageAddress,,,,,,) = _printer.getImageLockedByUser(user);
        if (imageAddress == address(0)) {
            revert ImageManager__NoTokenLocked(user);
        }
        address certificate = _imageToCertificate[imageAddress];
        _printer.mintCertificate(user, certificate);
    }

    // onlyOwner functions

    function createImage(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        string memory _baseURIString,
        uint256 _priceInUsd,
        uint256 _printId
    ) external onlyOwner returns (address) {
        Image image = new Image(address(this), _name, _symbol, _maxSupply, _baseURIString);
        Certificate certificate =
        new Certificate(address(_printer), string.concat(_name, " - Certificate"), string.concat(_symbol, "_C"), _maxSupply, _baseURIString);
        _images.push(address(image));
        _certificates.push(address(certificate));
        _imageToCertificate[address(image)] = address(certificate);
        _certificateToImage[address(certificate)] = address(image);
        _isImage[address(image)] = true;
        _imagePrices[address(image)] = _priceInUsd;
        _printIds[address(image)] = _printId;
        emit imageCreated(address(image));
        return address(image);
    }

    function withdrawToken(address _token, address _to) external onlyOwner {
        bool success = IERC20(_token).transfer(_to, IERC20(_token).balanceOf(address(this)));
        if (!success) {
            revert ImageManager__TransferFailed(_token, _to);
        }
    }

    function editPrintId(address imageAddress, uint256 _printId) external onlyOwner {
        _printIds[imageAddress] = _printId;
    }

    function setAdmin(address _admin) external onlyOwner {
        _printer.setAdmin(_admin);
    }

    function updateTokensAllowed(address[] memory tokenAddresses, address[] memory priceFeedAddresses)
        external
        onlyOwner
    {
        delete _allowedTokens;
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            _priceFeeds[tokenAddresses[i]] = priceFeedAddresses[i];
            _allowedTokens.push(tokenAddresses[i]);
        }
    }

    /* ========== Public functions ========== */
    /* ========== Internal functions ========== */

    /* ========== Private functions ========== */
    /* ========== Internal & private view / pure functions ========== */

    function _getTokenAmountFromUsd(address token, uint256 usdAmountInWei) private view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(_priceFeeds[token]);
        (, int256 price,,,) = priceFeed.staleCheckLatestRoundData();
        return (usdAmountInWei * PRECISION) / (uint256(price) * ADDITIONAL_FEED_PRECISION);
    }

    /* ========== External & public view / pure functions ========== */

    function getPrinterAddress() external view returns (address) {
        return address(_printer);
    }

    function getImagesAddresses() external view returns (address[] memory) {
        return _images;
    }

    function getCertificateByImage(address imageAddress) external view returns (address) {
        return _imageToCertificate[imageAddress];
    }

    function getImageByCertificate(address certificateAddress) external view returns (address) {
        return _certificateToImage[certificateAddress];
    }

    function getImagePrice(address imageAddress) external view returns (uint256) {
        return _imagePrices[imageAddress];
    }

    function getAllowedTokens() external view returns (address[] memory) {
        return _allowedTokens;
    }

    function getIsImage(address imageAddress) external view returns (bool) {
        return _isImage[imageAddress];
    }
}
