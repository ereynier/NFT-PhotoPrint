// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

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
            address owner,
            uint256 deployerKey
        ) = config.activeNetworkConfig();

        address[5] memory tmpTokenAddresses = [wbtc, weth, dai, usdc, usdt];
        address[5] memory tmpPriceFeedAddresses = [wbtcUsdPriceFeed, wethUsdPriceFeed, daiUsdPriceFeed, usdcUsdPriceFeed, usdtUsdPriceFeed];

        for (uint256 i = 0; i < tmpTokenAddresses.length; i++) {
            if (tmpTokenAddresses[i] != address(0) && tmpPriceFeedAddresses[i] != address(0)) {
                tokenAddresses.push(tmpTokenAddresses[i]);
                priceFeedAddresses.push(tmpPriceFeedAddresses[i]);
            }
        }

        vm.startBroadcast(deployerKey);
        ImageManager manager = new ImageManager(
            owner, tokenAddresses, priceFeedAddresses
        );
        vm.stopBroadcast();

        return (manager, config);
    }
}
