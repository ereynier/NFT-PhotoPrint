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

    function setUp() public {
        printer = new Printer(OWNER);
        vm.prank(OWNER);
        printer.setAdmin(ADMIN);
        mockImage = new MockImage(OWNER);
        mockCertificate = new MockCertificate(address(printer));
    }

    /* ===== test function lock ===== */

    /* ===== test function unlock ===== */

    /* ===== test function confirmOrder ===== */

    /* ===== test function clearOrderId ===== */

    /* ===== test function mintCertificate ===== */

    /* ===== test function setPrinted ===== */

    /* ===== test function setAdmin ===== */

    /* ===== test public & external view / pure function ===== */

    function testGetImageLockerNoImageLocked() public {
        (
            address imageAddress,
            uint256 imageId,
            uint256 printId,
            bool printed,
            uint256 timestampLock,
            bytes32 cryptedOrderId,
            address owner
        ) = printer.getImageLockedByUser(USER);
        assertEq(imageAddress, address(0));
        assertEq(imageId, 0);
        assertEq(printId, 0);
        assertEq(printed, false);
        assertEq(timestampLock, 0);
        assertEq(cryptedOrderId, bytes32(0));
        assertEq(owner, address(0));
    }

    function testGetImageLockerWithImageLocked() public {
        vm.warp(block.timestamp + 1 days);
        vm.prank(OWNER);
        mockImage.safeMint(USER);
        vm.prank(USER);
        mockImage.approve(address(printer), 0);
        vm.prank(OWNER);
        printer.lock(address(mockImage), 0, 1, USER);
        (
            address imageAddress,
            uint256 imageId,
            uint256 printId,
            bool printed,
            uint256 timestampLock,
            bytes32 cryptedOrderId,
            address owner
        ) = printer.getImageLockedByUser(USER);
        assertEq(imageAddress, address(mockImage));
        assertEq(imageId, 0);
        assertEq(printId, 1);
        assertEq(printed, false);
        assertEq(timestampLock, 0);
        assertEq(cryptedOrderId, bytes32(0));
        assertEq(owner, USER);
        vm.prank(OWNER);
        printer.confirmOrder(USER, bytes32("test"));
        (imageAddress, imageId, printId, printed, timestampLock, cryptedOrderId, owner) =
            printer.getImageLockedByUser(USER);
        assertEq(imageAddress, address(mockImage));
        assertEq(imageId, 0);
        assertEq(printId, 1);
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
