// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {ImageManager} from "../../src/ImageManager.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {ImageManagerDeployer} from "../../script/ImageManagerDeployer.s.sol";
import {Printer} from "../../src/Printer.sol";
import {Image} from "../../src/Image.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/ERC20Mock.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {MockV3Aggregator} from "../mocks/MockV3Aggregator.sol";

contract Handler is Test {
    ImageManager public imageManager;
    HelperConfig public config;
    ImageManagerDeployer deployer;

    address wbtcUsdPriceFeed;
    address wethUsdPriceFeed;
    address daiUsdPriceFeed;
    address usdcUsdPriceFeed;
    address usdtUsdPriceFeed;
    address wbtc;
    address weth;
    address dai;
    address usdc;
    address usdt;
    address owner;

    address[] tokenAddresses;
    address[] priceFeedAddresses;

    address printer;

    uint256 public MUMBAI_CHAINID = 80001;
    uint256 public POLYGON_CHAINID = 137;

    mapping(address image => mapping(uint256 id => bool)) haveToken;

    mapping(bytes32 nft => bool) public nftPrinted;

    constructor(ImageManager _imageManager, HelperConfig _config) {
        imageManager = _imageManager;
        config = _config;
        (
            wbtcUsdPriceFeed,
            wethUsdPriceFeed,
            daiUsdPriceFeed,
            usdcUsdPriceFeed,
            usdtUsdPriceFeed,
            wbtc,
            weth,
            dai,
            usdc,
            usdt,
            owner,
        ) = config.activeNetworkConfig();
        printer = imageManager.getPrinterAddress();

        address[5] memory tmpTokenAddresses = [wbtc, weth, dai, usdc, usdt];
        address[5] memory tmpPriceFeedAddresses =
            [wbtcUsdPriceFeed, wethUsdPriceFeed, daiUsdPriceFeed, usdcUsdPriceFeed, usdtUsdPriceFeed];

        for (uint256 i = 0; i < tmpTokenAddresses.length; i++) {
            if (tmpTokenAddresses[i] != address(0) && tmpPriceFeedAddresses[i] != address(0)) {
                tokenAddresses.push(tmpTokenAddresses[i]);
                priceFeedAddresses.push(tmpPriceFeedAddresses[i]);
            }
        }
    }

    function mint(address imageAddress, address token) external {
        token = _getAllowedTokenFromSeed(uint256(uint160(token)));
        imageAddress = _getImageAddressFromSeed(uint256(uint160(imageAddress)));
        if (Image(imageAddress).getNextId() >= Image(imageAddress).getMaxSupply()) {
            return;
        }
        uint256 price = imageManager.getImagePriceInUsdInWei(imageAddress);
        uint256 amount = imageManager.getTokenAmountFromUsd(token, price);
        deal(token, address(this), amount);
        ERC20Mock(token).approve(address(imageManager), amount);
        //console.log(address(this), ERC20Mock(token).allowance(address(this), address(imageManager)), ERC20Mock(token).balanceOf(address(this)), amount);
        imageManager.mint(imageAddress, address(this), token);
        haveToken[imageAddress][Image(imageAddress).getNextId() - 1] = true;
    }

    function lockImage(address imageAddress) external {
        imageAddress = _getImageAddressFromSeed(uint256(uint160(imageAddress)));
        if (Image(imageAddress).balanceOf(address(this)) == 0) {
            return;
        }
        (address imageAddress_,,,,,) = Printer(printer).getImageLockedByUser(address(this));
        if (imageAddress_ != address(0)) {
            return;
        }
        (bool valid, uint256 tokenId) = _getValidTokenId(imageAddress);
        if (!valid) {
            return;
        }
        Image(imageAddress).approve(address(printer), tokenId);
        imageManager.lockImage(imageAddress, tokenId);
        haveToken[imageAddress][tokenId] = false;
    }

    function unlockImage() external {
        (address imageAddress, uint256 imageId, bool printed, uint256 timestampLock, bytes32 cryptedOrderId,) =
            Printer(printer).getImageLockedByUser(address(this));
        if (imageAddress == address(0) || printed || timestampLock == 0 || cryptedOrderId != bytes32(0)) {
            return;
        }
        imageManager.unlockImage();
        haveToken[imageAddress][imageId] = true;
    }

    function confirmOrder() external {
        (address imageAddress,, bool printed, uint256 timestampLock,,) =
            Printer(printer).getImageLockedByUser(address(this));
        if (imageAddress == address(0) || printed || timestampLock != 0) {
            return;
        }
        imageManager.confirmOrder(bytes32("test"));
    }

    function clearOrderId() external {
        (address imageAddress,, bool printed, uint256 timestampLock,,) =
            Printer(printer).getImageLockedByUser(address(this));
        if (
            imageAddress == address(0) || printed || timestampLock == 0
                || block.timestamp - timestampLock < Printer(printer).getLockingTime()
        ) {
            return;
        }
        imageManager.clearOrderId();
    }

    function mintCertificate() external {
        (address imageAddress,, bool printed,,,) = Printer(printer).getImageLockedByUser(address(this));
        if (imageAddress == address(0) || !printed) {
            return;
        }
        imageManager.mintCertificate();
    }

    // /* ===== Owner Functions ===== */

    function withdrawToken(address token) external {
        token = _getAllowedTokenFromSeed(uint256(uint160(token)));
        vm.prank(owner);
        imageManager.withdrawToken(token, owner);
    }

    // /* ===== Admin Functions ===== */

    function setPrinted() external {
        address user = address(this);
        (address imageAddress, uint256 imageId, bool printed, uint256 timestampLock,,) = Printer(printer).getImageLockedByUser(user);
        if (imageAddress == address(0) || printed || timestampLock == 0) {
            return;
        }
        address admin = Printer(printer).getAdminAddress();
        vm.prank(admin);
        Printer(printer).setPrinted(user);
        if (nftPrinted[sha256(abi.encodePacked(imageAddress, imageId))]) {
            revert("NFT already printed");
        }
        nftPrinted[sha256(abi.encodePacked(imageAddress, imageId))] = true;
    }

    // /* ===== Helper Functions ===== */

    // function updateTimestamp() public {
    //     vm.warp(block.timestamp + 3600 * 12);
    //     address[] memory allowedTokens = imageManager.getAllowedTokens();
    //     for (uint256 i = 0; i < allowedTokens.length; i++) {
    //         address priceFeed = imageManager.getPriceFeeds(allowedTokens[i]);
    //         (, int256 price,,,) = MockV3Aggregator(priceFeed).latestRoundData();
    //         MockV3Aggregator(priceFeed).updateAnswer(price);
    //     }
    // }

    function _getAllowedTokenFromSeed(uint256 tokenSeed) private view returns (address) {
        uint256 randomSeed = tokenSeed % tokenAddresses.length;
        return tokenAddresses[randomSeed];
    }

    function _getImageAddressFromSeed(uint256 imageSeed) private view returns (address) {
        uint256 randomSeed = imageSeed % imageManager.getImagesAddresses().length;
        address imageAddress = imageManager.getImagesAddresses()[randomSeed];
        return imageAddress;
    }

    function _getValidTokenId(address imageAddress) private view returns (bool, uint256) {
        for (uint256 i = 0; i < Image(imageAddress).getNextId(); i++) {
            if (haveToken[imageAddress][i] == true) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
