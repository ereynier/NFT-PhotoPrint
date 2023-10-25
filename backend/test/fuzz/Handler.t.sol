// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {ImageManager} from "../../src/ImageManager.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {ImageManagerDeployer} from "../../script/ImageManagerDeployer.s.sol";
import {Printer} from "../../src/Printer.sol";
import {Image} from "../../src/Image.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/ERC20Mock.sol";

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

    address[] users;
    mapping(address user => bool) isUser;

    address printer;

    constructor(ImageManager _imageManager, HelperConfig _config) {
        imageManager = _imageManager;
        config = _config;
        (wbtcUsdPriceFeed, wethUsdPriceFeed, daiUsdPriceFeed, usdcUsdPriceFeed, usdtUsdPriceFeed,,,,,,,) =
            config.activeNetworkConfig();
        (,,,,, wbtc, weth, dai, usdc, usdt, owner,) = config.activeNetworkConfig();
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
        deal(token, msg.sender, amount);
        ERC20Mock(token).approve(address(imageManager), amount);
        _addUser(msg.sender);
    }

    function lockImage() external {
        _addUser(msg.sender);
    }

    function unlockImage() external {
        _addUser(msg.sender);
    }

    function confirmOrder() external {
        _addUser(msg.sender);
    }

    function clearOrderId() external {
        _addUser(msg.sender);
    }

    function mintCertificate() external {
        _addUser(msg.sender);
    }

    /* ===== Owner Functions ===== */

    function withdrawToken(address token) external {
        token = _getAllowedTokenFromSeed(uint256(uint160(token)));
        vm.startPrank(owner);
        imageManager.withdrawToken(token, owner);
    }

    /* ===== Admin Functions ===== */

    function setPrinted(address user) external {
        user = _getUserFromSeed(uint256(uint160(user)));
        (address imageAddress,, bool printed, uint256 timestampLock,,) = Printer(printer).getImageLockedByUser(user);
        if (imageAddress == address(0) || printed || timestampLock == 0) {
            return;
        }
        address admin = Printer(printer).getAdminAddress();
        vm.prank(admin);
        Printer(printer).setPrinted(user);
    }

    /* ===== Helper Functions ===== */

    function updateTimestamp() public {
        vm.warp(block.timestamp + 60);
    }

    function _getAllowedTokenFromSeed(uint256 collateralSeed) private view returns (address) {
        uint256 randomSeed = collateralSeed % tokenAddresses.length;
        return tokenAddresses[randomSeed];
    }

    function _addUser(address user) private {
        if (!isUser[user]) {
            users.push(user);
            isUser[user] = true;
        }
    }

    function _getUserFromSeed(uint256 userSeed) private view returns (address) {
        uint256 randomSeed = userSeed % users.length;
        address user = users[randomSeed];
        return user;
    }

    function _getImageAddressFromSeed(uint256 imageSeed) private view returns (address) {
        uint256 randomSeed = imageSeed % imageManager.getImagesAddresses().length;
        address imageAddress = imageManager.getImagesAddresses()[randomSeed];
        return imageAddress;
    }
}
