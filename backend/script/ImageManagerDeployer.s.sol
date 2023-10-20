// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import {Script} from "forge-std/Script.sol";
import {ImageManager} from "../src/ImageManager.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract ImageManagerDeployer is Script {
    address[] public tokenAddresses;
    address[] public priceFeedAddresses;

    function run() external returns (ImageManager, HelperConfig) {
        HelperConfig config = new HelperConfig();
        (
            address wbtcUsdPriceFeed,
            address wethUsdPriceFeed,
            address daiUsdPriceFeed,
            address usdcUsdPriceFeed,
            address usdtUsdPriceFeed,
            address wbtc,
            address weth,
            address dai,
            address usdc,
            address usdt,
            uint256 deployerKey
        ) = config.activeNetworkConfig();

        tokenAddresses = [wbtc, weth, dai, usdc, usdt];
        priceFeedAddresses = [wbtcUsdPriceFeed, wethUsdPriceFeed, daiUsdPriceFeed, usdcUsdPriceFeed, usdtUsdPriceFeed];

        vm.startBroadcast(deployerKey);
        ImageManager manager = new ImageManager(
            0xaA136C6bDfe6DfC154E9912Ead80F7179c55Bc08, tokenAddresses, priceFeedAddresses
        );
        vm.stopBroadcast();

        return (manager, config);
    }
}
