// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {StdInvariant} from "forge-std/StdInvariant.sol";
import {Test, console} from "forge-std/Test.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {ImageManagerDeployer} from "../../script/ImageManagerDeployer.s.sol";
import {ImageManager} from "../../src/ImageManager.sol";
import {Handler} from "./Handler.t.sol";
import {ActorManager} from "./ActorManager.t.sol";

contract MultiHandlerInvariants is StdInvariant, Test {
    ImageManager public imageManager;
    HelperConfig public config;
    ImageManagerDeployer deployer;

    ActorManager actorManager;
    Handler[] public handlers;

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
        for (uint256 i = 0; i < 5; i++) {
            handlers.push(new Handler(imageManager, config));
        }

        vm.startPrank(owner);
        imageManager.setAdmin(admin);
        imageManager.createImage("test", "TEST", 100, "https://test.com", 100 ether, 54125);
        imageManager.createImage("test_2", "TEST_2", 25, "https://test.com", 257 ether, 5885);
        imageManager.createImage("test_3", "TEST_3", 30, "https://test.com", 75 ether, 865);
        vm.stopPrank();

        actorManager = new ActorManager(handlers);
        targetContract(address(actorManager));
    }

}