// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {StdInvariant} from "forge-std/StdInvariant.sol";
import {Test, console} from "forge-std/Test.sol";
import {ImageManager} from "../../src/ImageManager.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {ImageManagerDeployer} from "../../script/ImageManagerDeployer.s.sol";
import {Handler} from "./Handler.t.sol";

contract InvariantsTest is StdInvariant, Test {
    ImageManager public imageManager;
    HelperConfig public config;
    ImageManagerDeployer deployer;

    Handler handler;

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

    address admin = makeAddr("admin");

    function setUp() external {
        deployer = new ImageManagerDeployer();
        (imageManager, config) = deployer.run();
        (wbtcUsdPriceFeed, wethUsdPriceFeed, daiUsdPriceFeed, usdcUsdPriceFeed, usdtUsdPriceFeed,,,,,,,) =
            config.activeNetworkConfig();
        (,,,,, wbtc, weth, dai, usdc, usdt, owner,) = config.activeNetworkConfig();
        handler = new Handler(imageManager, config);

        vm.startPrank(owner);
        imageManager.setAdmin(admin);
        imageManager.createImage("test", "TEST", 100, "https://test.com", 100 ether, 54125);
        imageManager.createImage("test_2", "TEST_2", 25, "https://test.com", 257 ether, 5885);
        vm.stopPrank();

        targetContract(address(handler));
    }

    function invariant_() public {}

    function invariant_gettersShouldNotRevert() public view {

        address[] memory imageAddresses = imageManager.getImagesAddresses();
        address imageAddress;
        if (imageAddresses.length > 0) {
            imageAddress = imageAddresses[0];
        }
        if (imageAddress != address(0)) {
            imageManager.getPrintId(imageAddress);
            address certificateAddress = imageManager.getCertificateByImage(imageAddress);
            imageManager.getImageByCertificate(certificateAddress);
            imageManager.getImagePriceInUsdInWei(imageAddress);
            imageManager.getIsImage(imageAddress);
        }

        imageManager.getPrinterAddress();
        imageManager.getImagesAddresses();

        address[] memory allowedTokens = imageManager.getAllowedTokens();
        if (allowedTokens.length > 0) {
            address tokenAddress = allowedTokens[0];
            imageManager.getPriceFeeds(tokenAddress);
        }
    }
}
