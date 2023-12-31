// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {StdInvariant} from "forge-std/StdInvariant.sol";
import {Test, console} from "forge-std/Test.sol";
import {ImageManager} from "../../src/ImageManager.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {ImageManagerDeployer} from "../../script/ImageManagerDeployer.s.sol";
import {Handler} from "./Handler.t.sol";
import {Image} from "../../src/Image.sol";
import {Certificate} from "../../src/Certificate.sol";
import {MockV3Aggregator} from "../mocks/MockV3Aggregator.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/ERC20Mock.sol";

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

    uint256[] public totalNfts;

    function invariant_ImagePlusCertificateShouldNeverReduce() public {
        address[] memory imagesAddresses = imageManager.getImagesAddresses();
        for (uint256 i = 0; i < imagesAddresses.length; i++) {
            address imageAddress = imagesAddresses[i];
            address certificateAddress = imageManager.getCertificateByImage(imageAddress);
            uint256 imagesCount =
                Image(imageAddress).balanceOf(address(imageManager)) + Image(imageAddress).balanceOf(address(handler));
            uint256 certificatesCount = Certificate(certificateAddress).balanceOf(address(handler));
            uint256 totalNft = imagesCount + certificatesCount;
            if (totalNfts.length <= i) {
                totalNfts.push(totalNft);
            } else {
                assertGe(totalNft, totalNfts[i]);
                totalNfts[i] = totalNft;
            }
            // console.log("Total NFTs %s: %s", i, totalNfts[i]);
            // console.log("Address %s sold: %s", imageAddress, Image(imageAddress).getNextId());
            // console.log("Certificate address: %s, minted: %s", certificateAddress, Certificate(certificateAddress).getTotalMinted());
        }
    }

    function invariant_UsdOfOwnerPlusImageManagerShouldBeGreaterOrEqualToTotalSoldPrice() public {
        uint256 totalSoldInUsd = 0;
        address[] memory imagesAddresses = imageManager.getImagesAddresses();
        for (uint256 i = 0; i < imagesAddresses.length; i++) {
            address imageAddress = imagesAddresses[i];
            totalSoldInUsd =
                totalSoldInUsd + Image(imageAddress).getNextId() * imageManager.getImagePriceInUsdInWei(imageAddress);
        }

        uint256 totalBalanceInUsd = 0;
        address[] memory allowedTokens = imageManager.getAllowedTokens();
        for (uint256 i = 0; i < allowedTokens.length; i++) {
            address priceFeed = imageManager.getPriceFeeds(allowedTokens[i]);
            uint256 ownerBalance = ERC20Mock(allowedTokens[i]).balanceOf(owner);
            uint256 imageManagerBalance = ERC20Mock(allowedTokens[i]).balanceOf(address(imageManager));
            (, int256 price,,,) = MockV3Aggregator(priceFeed).latestRoundData();
            totalBalanceInUsd = totalBalanceInUsd + (ownerBalance + imageManagerBalance) * uint256(price) * 1e10 / 1e18;
        }
        assertGe(totalBalanceInUsd / 1e18 + 1, totalSoldInUsd / 1e18);
    }

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
            imageManager.getTokenAmountFromUsd(tokenAddress, 1e18);
            imageManager.getTokensAmountFromImage(imageAddress);
        }
        for (uint256 i = 0; i < imageAddresses.length; i++) {
            Image(imageAddresses[i]).getMaxSupply();
            Image(imageAddresses[i]).getNextId();
            Image(imageAddresses[i]).getUri();
            Image(imageAddresses[i]).getIdsByUser(address(handler));
        }
    }
}
