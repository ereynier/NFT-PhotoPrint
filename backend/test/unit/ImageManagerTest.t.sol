// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {ImageManager} from "../../src/ImageManager.sol";
import {Printer} from "../../src/Printer.sol";
import {Certificate} from "../../src/Certificate.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {ImageManagerDeployer} from "../../script/ImageManagerDeployer.s.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/ERC20Mock.sol";
import {MockV3Aggregator} from "../mocks/MockV3Aggregator.sol";
import {Image} from "../../src/Image.sol";

contract ImageManagerTest is Test {
    ImageManagerDeployer deployer;
    ImageManager imageManager;
    HelperConfig config;
    address printerAddress;

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

    address public OWNER = 0xaA136C6bDfe6DfC154E9912Ead80F7179c55Bc08;
    address public ADMIN = makeAddr("admin");
    address public USER_1 = makeAddr("user1");
    address public USER_2 = makeAddr("user2");

    address[] public allowedTokens;
    address[] public priceFeeds;

    uint256 public VALUE_IN_USD = 100e8;
    uint256 public MAX_SUPPLY = 20;
    uint256 public LOCKING_TIME = 7 days;

    uint256 public STARTING_ERC20_BALANCE = 100 ether;

    event ImageCreated(address imageAddress);

    function setUp() public {
        deployer = new ImageManagerDeployer();
        (imageManager, config) = deployer.run();
        (wbtcUsdPriceFeed, wethUsdPriceFeed, daiUsdPriceFeed, usdcUsdPriceFeed, usdtUsdPriceFeed,,,,,,) =
            config.activeNetworkConfig();
        (,,,,, wbtc, weth, dai, usdc, usdt,) = config.activeNetworkConfig();
        allowedTokens = [wbtc, weth, dai, usdc, usdt];
        priceFeeds = [wbtcUsdPriceFeed, wethUsdPriceFeed, daiUsdPriceFeed, usdcUsdPriceFeed, usdtUsdPriceFeed];
        vm.prank(OWNER);
        imageManager.setAdmin(ADMIN);
        printerAddress = imageManager.getPrinterAddress();
    }

    /* ===== test function constructor  ===== */

    function testConstructorRevertIfTokenLengthNotMatchPriceFeedLength() public {
        address[] memory tokens = new address[](1);
        tokens[0] = wbtc;
        address[] memory feeds = new address[](2);
        feeds[0] = wbtcUsdPriceFeed;
        feeds[1] = wethUsdPriceFeed;
        vm.expectRevert(ImageManager.ImageManager__TokensLengthDontMatchPriceFeeds.selector);
        new ImageManager(OWNER, tokens, feeds);
    }

    /* ===== test function mint ===== */

    function testMintRevertIfImageNotRegistered() public {
        vm.expectRevert(abi.encodeWithSelector(ImageManager.ImageManager__ImageNotRegistered.selector, OWNER));
        imageManager.mint(OWNER, USER_1, wbtc);
    }

    function testMintRevertIfTokenNotAllowed() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        vm.expectRevert(
            abi.encodeWithSelector(ImageManager.ImageManager__TokenNotAllowed.selector, makeAddr("notAllowedToken"))
        );
        imageManager.mint(imageAddress, USER_1, makeAddr("notAllowedToken"));
    }

    function testMintRevertIfMaxSupplyReached() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", 1, "https://test.com", VALUE_IN_USD, 2);
        deal(address(wbtc), USER_1, STARTING_ERC20_BALANCE);
        vm.startPrank(USER_1);
        ERC20Mock(wbtc).approve(address(imageManager), STARTING_ERC20_BALANCE);
        imageManager.mint(imageAddress, USER_1, wbtc);
        vm.expectRevert(abi.encodeWithSelector(ImageManager.ImageManager__MaxSupplyReached.selector, imageAddress));
        imageManager.mint(imageAddress, USER_1, wbtc);
        vm.stopPrank();
    }

    function testMintRevertIfNotEnoughTokenAllowed() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        vm.expectRevert(
            abi.encodeWithSelector(
                ImageManager.ImageManager__NotEnoughTokenAllowed.selector,
                wbtc,
                imageManager.getTokenAmountFromUsd(wbtc, VALUE_IN_USD),
                USER_1
            )
        );
        vm.prank(USER_1);
        imageManager.mint(imageAddress, USER_1, wbtc);
    }

    function testMintGood() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        deal(address(wbtc), USER_1, STARTING_ERC20_BALANCE);
        vm.startPrank(USER_1);
        ERC20Mock(wbtc).approve(address(imageManager), STARTING_ERC20_BALANCE);
        imageManager.mint(imageAddress, USER_1, wbtc);
        vm.stopPrank();
        Image image = Image(imageAddress);
        assertEq(image.getNextId(), 1);
        assertEq(image.ownerOf(0), USER_1);
        assertEq(
            ERC20Mock(wbtc).balanceOf(address(imageManager)), imageManager.getTokenAmountFromUsd(wbtc, VALUE_IN_USD)
        );
        assertEq(image.balanceOf(USER_1), 1);
        vm.startPrank(USER_1);
        imageManager.mint(imageAddress, USER_1, wbtc);
        vm.stopPrank();
        assertEq(image.getNextId(), 2);
        assertEq(image.ownerOf(1), USER_1);
        assertEq(
            ERC20Mock(wbtc).balanceOf(address(imageManager)), imageManager.getTokenAmountFromUsd(wbtc, VALUE_IN_USD) * 2
        );
        assertEq(image.balanceOf(USER_1), 2);
    }

    /* ===== test function lockImage ===== */

    function testLockImageRevertIfImageNotRegistered() public {
        vm.expectRevert(abi.encodeWithSelector(ImageManager.ImageManager__ImageNotRegistered.selector, OWNER));
        imageManager.lockImage(OWNER, 1);
    }

    function testLockImageRevertIfNotTokenOwner() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        deal(address(wbtc), USER_1, STARTING_ERC20_BALANCE);
        vm.startPrank(USER_1);
        ERC20Mock(wbtc).approve(address(imageManager), STARTING_ERC20_BALANCE);
        imageManager.mint(imageAddress, USER_1, wbtc);
        vm.stopPrank();
        vm.expectRevert(abi.encodeWithSelector(ImageManager.ImageManager__NotTokenOwner.selector, imageAddress, 0));
        imageManager.lockImage(imageAddress, 0);
    }

    function testLockImageGood() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        deal(address(wbtc), USER_1, STARTING_ERC20_BALANCE);
        vm.startPrank(USER_1);
        ERC20Mock(wbtc).approve(address(imageManager), STARTING_ERC20_BALANCE);
        imageManager.mint(imageAddress, USER_1, wbtc);
        Image image = Image(imageAddress);
        image.approve(address(printerAddress), 0);
        imageManager.lockImage(imageAddress, 0);
        vm.stopPrank();
        (address imageAddress_, uint256 imageId_,,,, address owner) =
            Printer(printerAddress).getImageLockedByUser(USER_1);
        assertEq(imageAddress_, imageAddress);
        assertEq(imageId_, 0);
        assertEq(owner, USER_1);
        assertEq(image.ownerOf(0), printerAddress);
    }

    /* ===== test function unlockImage ===== */

    function testUnlockImageGood() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        deal(address(wbtc), USER_1, STARTING_ERC20_BALANCE);
        vm.startPrank(USER_1);
        ERC20Mock(wbtc).approve(address(imageManager), STARTING_ERC20_BALANCE);
        imageManager.mint(imageAddress, USER_1, wbtc);
        Image image = Image(imageAddress);
        image.approve(address(printerAddress), 0);
        imageManager.lockImage(imageAddress, 0);
        imageManager.unlockImage();
        vm.stopPrank();
        (address imageAddress_, uint256 imageId_,,,, address owner) =
            Printer(printerAddress).getImageLockedByUser(USER_1);
        assertEq(imageAddress_, address(0));
        assertEq(imageId_, 0);
        assertEq(owner, address(0));
        assertEq(image.ownerOf(0), USER_1);
    }

    /* ===== test function confirmOrder ===== */

    function testConfirmOrderGood() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        deal(address(wbtc), USER_1, STARTING_ERC20_BALANCE);
        vm.startPrank(USER_1);
        ERC20Mock(wbtc).approve(address(imageManager), STARTING_ERC20_BALANCE);
        imageManager.mint(imageAddress, USER_1, wbtc);
        Image image = Image(imageAddress);
        image.approve(address(printerAddress), 0);
        imageManager.lockImage(imageAddress, 0);
        imageManager.confirmOrder("test");
        vm.stopPrank();
        (
            address imageAddress_,
            uint256 imageId_,
            bool printed_,
            uint256 timestampLock_,
            bytes32 cryptedOrderId,
            address owner
        ) = Printer(printerAddress).getImageLockedByUser(USER_1);
        assertEq(imageAddress_, imageAddress);
        assertEq(imageId_, 0);
        assertEq(printed_, false);
        assertEq(timestampLock_, block.timestamp);
        assertEq(cryptedOrderId, bytes32("test"));
        assertEq(owner, USER_1);
        assertEq(image.ownerOf(0), printerAddress);
    }

    /* ===== test function clearOrderId ===== */

    function testClearOrderIdGood() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        deal(address(wbtc), USER_1, STARTING_ERC20_BALANCE);
        vm.startPrank(USER_1);
        ERC20Mock(wbtc).approve(address(imageManager), STARTING_ERC20_BALANCE);
        imageManager.mint(imageAddress, USER_1, wbtc);
        Image image = Image(imageAddress);
        image.approve(address(printerAddress), 0);
        imageManager.lockImage(imageAddress, 0);
        imageManager.confirmOrder("test");
        vm.warp(block.timestamp + LOCKING_TIME + 1);
        imageManager.clearOrderId();
        vm.stopPrank();
        (
            address imageAddress_,
            uint256 imageId_,
            bool printed_,
            uint256 timestampLock_,
            bytes32 cryptedOrderId,
            address owner
        ) = Printer(printerAddress).getImageLockedByUser(USER_1);
        assertEq(imageAddress_, imageAddress);
        assertEq(imageId_, 0);
        assertEq(printed_, false);
        assertEq(timestampLock_, 0);
        assertEq(cryptedOrderId, bytes32(""));
        assertEq(owner, USER_1);
        assertEq(image.ownerOf(0), printerAddress);
    }

    /* ===== test function mintCertificate ===== */

    function testMintCertificateRevertIfNoTokenLocked() public {
        vm.startPrank(USER_1);
        vm.expectRevert(abi.encodeWithSelector(ImageManager.ImageManager__NoTokenLocked.selector, USER_1));
        imageManager.mintCertificate(USER_1);
        vm.stopPrank();
    }

    function testMintCertificateGood() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        deal(address(wbtc), USER_1, STARTING_ERC20_BALANCE);
        vm.startPrank(USER_1);
        ERC20Mock(wbtc).approve(address(imageManager), STARTING_ERC20_BALANCE);
        imageManager.mint(imageAddress, USER_1, wbtc);
        Image image = Image(imageAddress);
        image.approve(address(printerAddress), 0);
        imageManager.lockImage(imageAddress, 0);
        imageManager.confirmOrder("test");
        vm.stopPrank();
        vm.prank(ADMIN);
        Printer(printerAddress).setPrinted(USER_1);
        vm.prank(USER_1);
        imageManager.mintCertificate(USER_1);
        (
            address imageAddress_,
            uint256 imageId_,
            bool printed_,
            uint256 timestampLock_,
            bytes32 cryptedOrderId,
            address owner
        ) = Printer(printerAddress).getImageLockedByUser(USER_1);
        assertEq(imageAddress_, address(0));
        assertEq(imageId_, 0);
        assertEq(printed_, false);
        assertEq(timestampLock_, 0);
        assertEq(cryptedOrderId, bytes32(""));
        assertEq(owner, address(0));
        assertEq(Certificate(imageManager.getCertificateByImage(imageAddress)).ownerOf(0), USER_1);
    }

    /* ===== test function createImage ===== */

    function testCreateImageRevertIfNotOwner() public {
        vm.expectRevert("Ownable: caller is not the owner");
        imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
    }

    function testCreateImageGood() public {
        vm.startPrank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        vm.stopPrank();
        Image image = Image(imageAddress);
        Certificate certificate = Certificate(imageManager.getCertificateByImage(imageAddress));
        assertEq(image.name(), "test");
        assertEq(image.symbol(), "TEST");
        assertEq(image.getMaxSupply(), MAX_SUPPLY);
        assertEq(imageManager.getPrintId(address(image)), 2);
        assertEq(imageManager.getImagePriceInUsdInWei(address(imageAddress)), VALUE_IN_USD);
        assertEq(certificate.name(), "test - Certificate");
        assertEq(certificate.symbol(), "TEST_C");
        assertEq(image.getMaxSupply(), MAX_SUPPLY);
    }

    /* ===== test function withdrawToken ===== */

    function testWithdrawTokenRevertIfNotOwner() public {
        vm.expectRevert("Ownable: caller is not the owner");
        imageManager.withdrawToken(wbtc, OWNER);
    }

    function testWithdrawTokenGoodDeal() public {
        deal(address(wbtc), address(imageManager), STARTING_ERC20_BALANCE);
        deal(address(dai), address(imageManager), STARTING_ERC20_BALANCE);
        vm.startPrank(OWNER);
        imageManager.withdrawToken(wbtc, OWNER);
        vm.stopPrank();
        assertEq(ERC20Mock(wbtc).balanceOf(OWNER), STARTING_ERC20_BALANCE);
        assertEq(ERC20Mock(wbtc).balanceOf(address(imageManager)), 0);
        assertEq(ERC20Mock(dai).balanceOf(address(imageManager)), STARTING_ERC20_BALANCE);
        assertEq(ERC20Mock(dai).balanceOf(OWNER), 0);
        vm.startPrank(OWNER);
        imageManager.withdrawToken(dai, OWNER);
        vm.stopPrank();
        assertEq(ERC20Mock(dai).balanceOf(OWNER), STARTING_ERC20_BALANCE);
        assertEq(ERC20Mock(dai).balanceOf(address(imageManager)), 0);
    }

    function testWithdrawTokenGoodBuy() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        deal(address(weth), USER_1, STARTING_ERC20_BALANCE);
        deal(address(dai), USER_1, STARTING_ERC20_BALANCE);
        vm.startPrank(USER_1);
        ERC20Mock(weth).approve(address(imageManager), STARTING_ERC20_BALANCE);
        ERC20Mock(dai).approve(address(imageManager), STARTING_ERC20_BALANCE);
        imageManager.mint(imageAddress, USER_1, weth);
        imageManager.mint(imageAddress, USER_1, dai);
        vm.stopPrank();
        assertEq(
            ERC20Mock(weth).balanceOf(address(imageManager)), imageManager.getTokenAmountFromUsd(weth, VALUE_IN_USD)
        );
        assertEq(ERC20Mock(dai).balanceOf(address(imageManager)), imageManager.getTokenAmountFromUsd(dai, VALUE_IN_USD));
        vm.prank(OWNER);
        imageManager.withdrawToken(weth, OWNER);
        assertGt(ERC20Mock(weth).balanceOf(OWNER), 0);
        assertEq(ERC20Mock(weth).balanceOf(OWNER), imageManager.getTokenAmountFromUsd(weth, VALUE_IN_USD));
        assertEq(ERC20Mock(weth).balanceOf(address(imageManager)), 0);
        vm.prank(OWNER);
        imageManager.withdrawToken(dai, OWNER);
        assertGt(ERC20Mock(dai).balanceOf(OWNER), 0);
        assertEq(ERC20Mock(dai).balanceOf(OWNER), imageManager.getTokenAmountFromUsd(dai, VALUE_IN_USD));
        assertEq(ERC20Mock(dai).balanceOf(address(imageManager)), 0);
    }

    /* ===== test function editPrintId ===== */

    function testEditPrintIdRevertIfNotOWner() public {
        vm.expectRevert("Ownable: caller is not the owner");
        imageManager.editPrintId(USER_1, 1);
    }

    function testEditPrintIdGood() public {
        vm.startPrank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        imageManager.editPrintId(imageAddress, 545);
        vm.stopPrank();
        assertEq(imageManager.getPrintId(imageAddress), 545);
    }

    /* ===== test function setAdmin ===== */

    function testSetAdminRevertIfNotOwner() public {
        vm.expectRevert("Ownable: caller is not the owner");
        imageManager.setAdmin(USER_1);
    }

    function testSetAdminGood() public {
        vm.startPrank(OWNER);
        imageManager.setAdmin(USER_1);
        vm.stopPrank();
        Printer printer = Printer(printerAddress);
        assertEq(printer.getAdminAddress(), USER_1);
    }

    /* ===== test updateTokensAllowed ===== */

    function testUpdateTokensAllowedRevertIfNotOwner() public {
        vm.expectRevert("Ownable: caller is not the owner");
        imageManager.updateTokensAllowed(allowedTokens, priceFeeds);
    }

    function testUpdateTokensAllowedRevertIfTokensLenghtNotMatchPriceFeedsLength() public {
        address[] memory tokens = new address[](1);
        tokens[0] = wbtc;
        address[] memory feeds = new address[](2);
        feeds[0] = wbtcUsdPriceFeed;
        feeds[1] = wethUsdPriceFeed;
        vm.startPrank(OWNER);
        vm.expectRevert(ImageManager.ImageManager__TokensLengthDontMatchPriceFeeds.selector);
        imageManager.updateTokensAllowed(tokens, feeds);
        vm.stopPrank();
    }

    function testUpdateTokensAllowedGood() public {
        address[] memory allowedTokens_ = imageManager.getAllowedTokens();
        assertEq(allowedTokens_.length, 5);
        address[] memory tokens = new address[](2);
        tokens[0] = wbtc;
        tokens[1] = usdc;
        address[] memory feeds = new address[](2);
        feeds[0] = wbtcUsdPriceFeed;
        feeds[1] = usdcUsdPriceFeed;
        vm.startPrank(OWNER);
        imageManager.updateTokensAllowed(tokens, feeds);
        vm.stopPrank();
        assertEq(imageManager.getAllowedTokens()[0], wbtc);
        assertEq(imageManager.getPriceFeeds(wbtc), wbtcUsdPriceFeed);
        assertEq(imageManager.getAllowedTokens()[1], usdc);
        assertEq(imageManager.getPriceFeeds(usdc), usdcUsdPriceFeed);
        assertEq(imageManager.getAllowedTokens().length, 2);
    }

    /* ===== test public & external view / pure function ===== */

    function testGetPrinterAddress() public {
        assertEq(imageManager.getPrinterAddress(), printerAddress);
    }

    function testGetPrintId() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        assertEq(imageManager.getPrintId(imageAddress), 2);
    }

    function testGetImagesAddresses() public {
        vm.prank(OWNER);
        address imageAddress_1 = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        vm.prank(OWNER);
        address imageAddress_2 = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        assertEq(imageManager.getImagesAddresses().length, 2);
        assertEq(imageManager.getImagesAddresses()[0], imageAddress_1);
        assertEq(imageManager.getImagesAddresses()[1], imageAddress_2);
    }

    function testGetCertificateByImage() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        Certificate certificate = Certificate(imageManager.getCertificateByImage(imageAddress));
        assertEq(certificate.name(), "test - Certificate");
        assertEq(certificate.symbol(), "TEST_C");
        assertEq(certificate.getMaxSupply(), MAX_SUPPLY);
    }

    function testGetImageByCertificate() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        address certificateAddress = imageManager.getCertificateByImage(imageAddress);
        assertEq(imageManager.getImageByCertificate(certificateAddress), imageAddress);
    }

    function testGetImagePriceInUsdInWei() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        assertEq(imageManager.getImagePriceInUsdInWei(imageAddress), VALUE_IN_USD);
    }

    function testGetAllowedTokens() public {
        address[] memory allowedTokens_ = imageManager.getAllowedTokens();
        assertEq(allowedTokens_.length, 5);
        assertEq(allowedTokens_[0], wbtc);
        assertEq(allowedTokens_[1], weth);
        assertEq(allowedTokens_[2], dai);
        assertEq(allowedTokens_[3], usdc);
        assertEq(allowedTokens_[4], usdt);
    }

    function testGetPriceFeeds() public {
        assertEq(imageManager.getPriceFeeds(wbtc), wbtcUsdPriceFeed);
        assertEq(imageManager.getPriceFeeds(weth), wethUsdPriceFeed);
        assertEq(imageManager.getPriceFeeds(dai), daiUsdPriceFeed);
        assertEq(imageManager.getPriceFeeds(usdc), usdcUsdPriceFeed);
        assertEq(imageManager.getPriceFeeds(usdt), usdtUsdPriceFeed);
    }

    function testGetIsImage() public {
        vm.prank(OWNER);
        address imageAddress = imageManager.createImage("test", "TEST", MAX_SUPPLY, "https://test.com", VALUE_IN_USD, 2);
        assertEq(imageManager.getIsImage(imageAddress), true);
        assertEq(imageManager.getIsImage(OWNER), false);
    }

    function testGetTokenAmountFromUsd() public {
        MockV3Aggregator(usdcUsdPriceFeed).updateAnswer(1e8);
        assertEq(imageManager.getTokenAmountFromUsd(usdc, 1e8), 1e8);
        MockV3Aggregator(usdcUsdPriceFeed).updateAnswer(1e10);
        assertEq(imageManager.getTokenAmountFromUsd(usdc, 1e8), 1e6);
    }

}
