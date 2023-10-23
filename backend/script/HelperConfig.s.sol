// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {Script} from "forge-std/Script.sol";
import {MockV3Aggregator} from "../test/mocks/MockV3Aggregator.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/ERC20Mock.sol";

contract HelperConfig is Script {
    struct NetworkConfig {
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
        uint256 deployerKey;
    }

    uint8 public constant DECIMALS = 8;
    int256 public constant ETH_USD_PRICE = 2000e8;
    int256 public constant BTC_USD_PRICE = 30000e8;
    int256 public constant DAI_USD_PRICE = 99e6;
    int256 public constant USDC_USD_PRICE = 1e8;
    int256 public constant USDT_USD_PRICE = 101e6;
    uint256 public DEFAULT_ANVIL_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    NetworkConfig public activeNetworkConfig;

    constructor() {
        if (block.chainid == 80001) {
            activeNetworkConfig = getMumbaiPolygonConfig();
        } else if (block.chainid == 137) {
            activeNetworkConfig = getMainnetPolygonConfig();
        } else {
            activeNetworkConfig = getOrCreateAnvilEthConfig();
        }
    }

    function getMumbaiPolygonConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            wbtcUsdPriceFeed: 0x007A22900a3B98143368Bd5906f8E17e9867581b,
            wethUsdPriceFeed: 0x0715A7794a1dc8e42615F059dD6e406A6594651A,
            daiUsdPriceFeed: 0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046,
            usdcUsdPriceFeed: address(0),
            usdtUsdPriceFeed: address(0),
            wbtc: 0x0d787a4a1548f673ed375445535a6c7A1EE56180,
            weth: 0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa,
            dai: 0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F,
            usdc: address(0),
            usdt: address(0),
            deployerKey: vm.envUint("PRIVATE_KEY")
        });
    }

    function getMainnetPolygonConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            wbtcUsdPriceFeed: 0xc907E116054Ad103354f2D350FD2514433D57F6f,
            wethUsdPriceFeed: 0xF9680D99D6C9589e2a93a78A04A279e509205945,
            daiUsdPriceFeed: 0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D,
            usdcUsdPriceFeed: 0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7,
            usdtUsdPriceFeed: 0x0A6513e40db6EB1b165753AD52E80663aeA50545,
            wbtc: 0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6,
            weth: 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619,
            dai: 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063,
            usdc: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174,
            usdt: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F,
            deployerKey: vm.envUint("PRIVATE_KEY")
        });
    }

    function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory) {
        if (activeNetworkConfig.wethUsdPriceFeed != address(0)) {
            return activeNetworkConfig;
        }

        vm.startBroadcast();
        MockV3Aggregator ethUsdPriceFeed = new MockV3Aggregator(DECIMALS, ETH_USD_PRICE);
        ERC20Mock wethMock = new ERC20Mock();
        wethMock.mint(msg.sender, 1000e8);
        MockV3Aggregator btcUsdPriceFeed = new MockV3Aggregator(DECIMALS, BTC_USD_PRICE);
        ERC20Mock wbtcMock = new ERC20Mock();
        wbtcMock.mint(msg.sender, 1000e8);
        MockV3Aggregator daiUsdPriceFeed = new MockV3Aggregator(DECIMALS, DAI_USD_PRICE);
        ERC20Mock daiMock = new ERC20Mock();
        daiMock.mint(msg.sender, 1000e8);
        MockV3Aggregator usdcUsdPriceFeed = new MockV3Aggregator(DECIMALS, USDC_USD_PRICE);
        ERC20Mock usdcMock = new ERC20Mock();
        usdcMock.mint(msg.sender, 1000e8);
        MockV3Aggregator usdtUsdPriceFeed = new MockV3Aggregator(DECIMALS, USDT_USD_PRICE);
        ERC20Mock usdtMock = new ERC20Mock();
        usdtMock.mint(msg.sender, 1000e8);
        vm.stopBroadcast();

        return NetworkConfig({
            wbtcUsdPriceFeed: address(btcUsdPriceFeed),
            wethUsdPriceFeed: address(ethUsdPriceFeed),
            daiUsdPriceFeed: address(daiUsdPriceFeed),
            usdcUsdPriceFeed: address(usdcUsdPriceFeed),
            usdtUsdPriceFeed: address(usdtUsdPriceFeed),
            wbtc: address(wbtcMock),
            weth: address(wethMock),
            dai: address(daiMock),
            usdc: address(usdcMock),
            usdt: address(usdtMock),
            deployerKey: DEFAULT_ANVIL_KEY
        });
    }
}