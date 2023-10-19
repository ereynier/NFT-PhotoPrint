// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;
/* ========== Imports ========== */

import {Image} from "./Image.sol";
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

    /* ========== Types ========== */

    using OracleLib for AggregatorV3Interface;

    /* ========== State variables ========== */

    Image[] private images;
    mapping(address image => bool) isImage;

    Printer immutable printer;

    mapping(address token => address priceFeed) priceFeeds;
    address[] allowedTokens;

    mapping(address image => uint256 priceInUsd) imagePrices;
    mapping(address image => uint256 printId) printIds;

    uint256 private constant ADDITIONAL_FEED_PRECISION = 1e10;
    uint256 private constant PRECISION = 1e18;

    /* ========== Events ========== */

    event imageCreated(address imageAddress);

    /* ========== Modifiers ========== */

    modifier onlyRegisteredImage(address imageAddress) {
        if (!isImage[imageAddress]) {
            revert ImageManager__ImageNotRegistered(imageAddress);
        }
        _;
    }

    modifier onlyAllowedToken(address tokenAddress) {
        if (priceFeeds[tokenAddress] == address(0)) {
            revert ImageManager__TokenNotAllowed(tokenAddress);
        }
        _;
    }

    /* ========== FUNCTIONS ========== */

    /* ========== constructor ========== */
    constructor(address initialOwner, address[] memory tokenAddresses, address[] memory priceFeedAddresses) {
        transferOwnership(initialOwner);
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            priceFeeds[tokenAddresses[i]] = priceFeedAddresses[i];
            allowedTokens.push(tokenAddresses[i]);
        }
        printer = new Printer();
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

        uint256 price = imagePrices[imageAddress];
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
        printer.lock(imageAddress, tokenId, printIds[imageAddress], msg.sender);
    }

    function unlockImage() external nonReentrant {
        printer.unlock(msg.sender);
    }

    // onlyOwner functions

    function createImage(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        string memory baseURIString,
        uint256 _priceInUsd,
        uint256 _printId
    ) external onlyOwner returns (address) {
        Image image = new Image(address(this), _name, _symbol, _maxSupply, baseURIString);
        images.push(image);
        isImage[address(image)] = true;
        imagePrices[address(image)] = _priceInUsd;
        printIds[address(image)] = _printId;
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
        printIds[imageAddress] = _printId;
    }

    function setAdmin(address _admin) external onlyOwner {
        printer.setAdmin(_admin);
    }

    /* ========== Public functions ========== */
    /* ========== Internal functions ========== */

    /* ========== Private functions ========== */
    /* ========== Internal & private view / pure functions ========== */

    function _getTokenAmountFromUsd(address token, uint256 usdAmountInWei) private view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeeds[token]);
        (, int256 price,,,) = priceFeed.staleCheckLatestRoundData();
        return (usdAmountInWei * PRECISION) / (uint256(price) * ADDITIONAL_FEED_PRECISION);
    }

    /* ========== External & public view / pure functions ========== */
}
