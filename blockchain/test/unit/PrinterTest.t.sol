// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {Test} from "forge-std/Test.sol";
import {Printer} from "../../src/Printer.sol";
import {MockImage} from "../mocks/MockImage.sol";
import {MockCertificate} from "../mocks/MockCertificate.sol";

contract PrinterTest is Test {
    Printer printer;
    address public OWNER = makeAddr("owner");
    address public ADMIN = makeAddr("admin");
    address public USER = makeAddr("user");
    uint256 public constant LOCKING_TIME = 7 days;

    MockImage mockImage;
    MockCertificate mockCertificate;

    event ConfirmOrder(address indexed user, bytes32 cryptedOrderId);
    event ImageLocked(address indexed user, address imageAddress, uint256 imageId);
    event CertificateMinted(address indexed user, address certificateAddress, uint256 imageId);
    event AdminChanged(address indexed admin);

    function setUp() public {
        printer = new Printer(OWNER);
        vm.prank(OWNER);
        printer.setAdmin(ADMIN);
        mockImage = new MockImage(OWNER);
        mockCertificate = new MockCertificate(address(printer));
    }

    function mintAndLockInPrinter() public {
        vm.prank(OWNER);
        mockImage.safeMint(USER);
        vm.prank(USER);
        mockImage.approve(address(printer), 0);
        vm.prank(OWNER);
        printer.lock(address(mockImage), 0, USER);
    }

    /* ===== test function lock ===== */

    function testLockRevertIfNotOwner() public {
        vm.expectRevert("Ownable: caller is not the owner");
        printer.lock(address(mockImage), 0, USER);
    }

    function testLockRevertIfATokenAlreadyLocked() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        mockImage.safeMint(USER);
        vm.prank(USER);
        mockImage.approve(address(printer), 1);
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NFTAlreadyLocked.selector, USER));
        printer.lock(address(mockImage), 1, USER);
    }

    function testLockRevertIfTokenNotApproved() public {
        vm.prank(OWNER);
        mockImage.safeMint(USER);
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NotApproved.selector, address(mockImage), 0));
        printer.lock(address(mockImage), 0, USER);
    }

    function testLockGood() public {
        vm.prank(OWNER);
        mockImage.safeMint(USER);
        vm.prank(USER);
        mockImage.approve(address(printer), 0);
        vm.startPrank(OWNER);
        vm.expectEmit(true, false, false, true);
        emit ImageLocked(USER, address(mockImage), 0);
        printer.lock(address(mockImage), 0, USER);
        vm.stopPrank();
        (address imageAddress, uint256 imageId, bool printed, uint256 timestampLock,,) =
            printer.getImageLockedByUser(USER);
        assertEq(imageAddress, address(mockImage));
        assertEq(imageId, 0);
        assertEq(printed, false);
        assertEq(timestampLock, 0);
        vm.prank(OWNER);
        mockImage.safeMint(OWNER);
        vm.prank(OWNER);
        mockImage.approve(address(printer), 1);
        vm.prank(OWNER);
        printer.lock(address(mockImage), 1, OWNER);
        (imageAddress, imageId, printed, timestampLock,,) = printer.getImageLockedByUser(OWNER);
        assertEq(imageAddress, address(mockImage));
        assertEq(imageId, 1);
        assertEq(printed, false);
        assertEq(timestampLock, 0);
    }

    /* ===== test function unlock ===== */

    function testUnlockRevertIfNotOwner() public {
        mintAndLockInPrinter();
        vm.expectRevert("Ownable: caller is not the owner");
        printer.unlock(USER);
    }

    function testUnlockRevertIfNoTokenLocked() public {
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NoTokenLocked.selector, USER));
        printer.unlock(USER);
    }

    function testUnlockRevertIfPrinted() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        vm.prank(ADMIN);
        printer.setPrinted(USER);
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NFTCantBeUnlocked.selector, USER));
        printer.unlock(USER);
    }

    function testUnlockRevertIfOrderConfirmed() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NFTCantBeUnlocked.selector, USER));
        printer.unlock(USER);
    }

    function testUnlockGood() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.unlock(USER);
        (address imageAddress, uint256 imageId, bool printed, uint256 timestampLock,,) =
            printer.getImageLockedByUser(USER);
        assertEq(imageAddress, address(0));
        assertEq(imageId, 0);
        assertEq(printed, false);
        assertEq(timestampLock, 0);
    }

    /* ===== test function confirmOrder ===== */

    function testConfirmOrderRevertIfNotOwner() public {
        mintAndLockInPrinter();
        vm.expectRevert("Ownable: caller is not the owner");
        printer.confirmOrder(USER, bytes32("test"));
    }

    function testConfirmOrderRevertIfNoTokenLocked() public {
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NoTokenLocked.selector, USER));
        printer.confirmOrder(USER, bytes32("test"));
    }

    function testConfirmOrderRevertIfAlreadyPrinted() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        vm.prank(ADMIN);
        printer.setPrinted(USER);
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__CommandIsPrinted.selector, USER));
        printer.confirmOrder(USER, bytes32("test"));
    }

    function testConfirmOrderRevertIfAlreadyConfirmed() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__CommandAlreadyConfirmed.selector, USER));
        printer.confirmOrder(USER, bytes32("test"));
    }

    function testConfirmOrderGood() public {
        mintAndLockInPrinter();
        vm.warp(block.timestamp + 1 days);
        vm.startPrank(OWNER);
        vm.expectEmit(true, false, false, true);
        emit ConfirmOrder(USER, bytes32("test"));
        printer.confirmOrder(USER, bytes32("test"));
        vm.stopPrank();
        (address imageAddress, uint256 imageId, bool printed, uint256 timestampLock, bytes32 cryptedOrderId,) =
            printer.getImageLockedByUser(USER);
        assertEq(imageAddress, address(mockImage));
        assertEq(imageId, 0);
        assertEq(printed, false);
        assertEq(timestampLock, block.timestamp);
        assertEq(cryptedOrderId, bytes32("test"));
    }

    /* ===== test function clearOrderId ===== */

    function testClearOrderIdRevertIfNotOwner() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        vm.expectRevert("Ownable: caller is not the owner");
        printer.clearOrderId(USER);
    }

    function testClearOrderIdRevertIfNoTokenLocked() public {
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NoTokenLocked.selector, USER));
        printer.clearOrderId(USER);
    }

    function testClearOrderIdRevertIfPrinted() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        vm.prank(ADMIN);
        printer.setPrinted(USER);
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__CommandIsPrinted.selector, USER));
        printer.clearOrderId(USER);
    }

    function testClearOrderIdRevertIfNotConfirmed() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__CommandIsNotSet.selector, USER));
        printer.clearOrderId(USER);
    }

    function testClearOrderIdRevertIfTimestampNotReached() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NFTIsLocked.selector, USER));
        printer.clearOrderId(USER);
    }

    function testClearOrderIdGood() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        (address imageAddress, uint256 imageId, bool printed, uint256 timestampLock, bytes32 cryptedOrderId,) =
            printer.getImageLockedByUser(USER);
        assertEq(imageAddress, address(mockImage));
        assertEq(imageId, 0);
        assertEq(printed, false);
        assertEq(timestampLock, block.timestamp);
        assertEq(cryptedOrderId, bytes32("test"));
        vm.warp(block.timestamp + LOCKING_TIME + 1);
        vm.prank(OWNER);
        printer.clearOrderId(USER);
        (imageAddress, imageId, printed, timestampLock, cryptedOrderId,) = printer.getImageLockedByUser(USER);
        assertEq(imageAddress, address(mockImage));
        assertEq(imageId, 0);
        assertEq(printed, false);
        assertEq(timestampLock, 0);
        assertEq(cryptedOrderId, bytes32(0));
    }

    /* ===== test function mintCertificate ===== */

    function testMintCertificateRevertIfNotOwner() public {
        vm.expectRevert("Ownable: caller is not the owner");
        printer.mintCertificate(USER, address(mockCertificate));
    }

    function testMintCertificateRevertIfNoTokenLocked() public {
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NoTokenLocked.selector, USER));
        printer.mintCertificate(USER, address(mockCertificate));
    }

    function testMintCertificateRevertIfTokenNotPrinted() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NFTNotPrinted.selector, USER));
        printer.mintCertificate(USER, address(mockCertificate));
    }

    function testMintCertificateGood() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        vm.prank(ADMIN);
        printer.setPrinted(USER);
        vm.prank(OWNER);
        vm.expectEmit(true, false, false, true);
        emit CertificateMinted(USER, address(mockCertificate), 0);
        printer.mintCertificate(USER, address(mockCertificate));
        assertEq(mockCertificate.ownerOf(0), USER);
        (address imageAddress,, bool printed,,,) = printer.getImageLockedByUser(USER);
        assertEq(imageAddress, address(0));
        assertEq(printed, false);
    }

    /* ===== test function setPrinted ===== */

    function testSetPrintedRevertIfNotAdmin() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        vm.startPrank(USER);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NotAdmin.selector, USER));
        printer.setPrinted(USER);
    }

    function testSetPrintedRevertIfNoTokenLocked() public {
        vm.prank(ADMIN);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NoTokenLocked.selector, USER));
        printer.setPrinted(USER);
    }

    function testSetPrintedRevertIfAlreadyPrinted() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        vm.prank(ADMIN);
        printer.setPrinted(USER);
        vm.prank(ADMIN);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__NFTAlreadyPrinted.selector, USER));
        printer.setPrinted(USER);
    }

    function testSetPrintedRevertIfNotConfirmed() public {
        mintAndLockInPrinter();
        vm.prank(ADMIN);
        vm.expectRevert(abi.encodeWithSelector(Printer.Printer__CommandIsNotSet.selector, USER));
        printer.setPrinted(USER);
    }

    function testSetPrintedGood() public {
        mintAndLockInPrinter();
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        (,, bool printed,,,) = printer.getImageLockedByUser(USER);
        assertEq(printed, false);
        vm.prank(ADMIN);
        printer.setPrinted(USER);
        (,, printed,,,) = printer.getImageLockedByUser(USER);
        assertEq(printed, true);
    }

    /* ===== test function setAdmin ===== */

    function testSetAdminRevertIfZeroAddress() public {
        vm.startPrank(OWNER);
        vm.expectRevert(Printer.Printer__ZeroAddress.selector);
        printer.setAdmin(address(0));
        vm.stopPrank();
    }

    function testSetAdmin() public {
        assertEq(printer.getAdminAddress(), ADMIN);
        vm.startPrank(OWNER);
        vm.expectEmit(true, false, false, false);
        emit AdminChanged(USER);
        printer.setAdmin(USER);
        assertEq(printer.getAdminAddress(), USER);
        printer.setAdmin(ADMIN);
        assertEq(printer.getAdminAddress(), ADMIN);
        vm.stopPrank();
    }

    /* ===== test public & external view / pure function ===== */

    function testGetImageLockerNoImageLocked() public {
        (
            address imageAddress,
            uint256 imageId,
            bool printed,
            uint256 timestampLock,
            bytes32 cryptedOrderId,
            address owner
        ) = printer.getImageLockedByUser(USER);
        assertEq(imageAddress, address(0));
        assertEq(imageId, 0);
        assertEq(printed, false);
        assertEq(timestampLock, 0);
        assertEq(cryptedOrderId, bytes32(0));
        assertEq(owner, address(0));
    }

    function testGetImageLockerWithImageLocked() public {
        vm.warp(block.timestamp + 1 days);
        mintAndLockInPrinter();
        (
            address imageAddress,
            uint256 imageId,
            bool printed,
            uint256 timestampLock,
            bytes32 cryptedOrderId,
            address owner
        ) = printer.getImageLockedByUser(USER);
        assertEq(imageAddress, address(mockImage));
        assertEq(imageId, 0);
        assertEq(printed, false);
        assertEq(timestampLock, 0);
        assertEq(cryptedOrderId, bytes32(0));
        assertEq(owner, USER);
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        (imageAddress, imageId, printed, timestampLock, cryptedOrderId, owner) = printer.getImageLockedByUser(USER);
        assertEq(imageAddress, address(mockImage));
        assertEq(imageId, 0);
        assertEq(printed, false);
        assertEq(timestampLock, block.timestamp);
        assertEq(cryptedOrderId, bytes32("test"));
        assertEq(owner, USER);
    }

    function testGetLockingTime() public {
        assertEq(printer.getLockingTime(), LOCKING_TIME);
    }

    function testGetAdminAddress() public {
        Printer testPrinter = new Printer(OWNER);
        assertEq(testPrinter.getAdminAddress(), address(0));
        vm.prank(OWNER);
        testPrinter.setAdmin(ADMIN);
        assertEq(testPrinter.getAdminAddress(), ADMIN);
    }
}
