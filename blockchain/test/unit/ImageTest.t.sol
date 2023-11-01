// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {Test} from "forge-std/Test.sol";
import {Image} from "../../src/Image.sol";

contract ImageTest is Test {
    Image image;
    address public OWNER = makeAddr("owner");
    address public USER = makeAddr("user");
    string public NAME = "Image";
    string public SYMBOL = "IMG";
    uint256 public MAX_SUPPLY = 100;
    string public BASE_URI_STRING = "https://example.com/";

    function setUp() public {
        vm.prank(OWNER);
        image = new Image(OWNER, NAME, SYMBOL, MAX_SUPPLY, BASE_URI_STRING);
    }

    function testSafeMintRevertIfNotOwner() public {
        vm.startPrank(USER);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        image.safeMint(USER);
        vm.stopPrank();
    }

    function testSafeMintGood() public {
        vm.prank(OWNER);
        image.safeMint(USER);
        assertEq(image.balanceOf(USER), 1);
    }

    function testSafeMintRevertIfFullSupplyReached() public {
        vm.startPrank(OWNER);
        for (uint256 i = 0; i < MAX_SUPPLY; i++) {
            image.safeMint(USER);
        }
        assertEq(image.balanceOf(USER), MAX_SUPPLY);
        assertEq(image.getNextId(), MAX_SUPPLY);
        vm.expectRevert(Image.Image__MaxSupplyReached.selector);
        image.safeMint(USER);
    }

    function testBurnGood() public {
        vm.prank(OWNER);
        image.safeMint(USER);
        assertEq(image.balanceOf(USER), 1);
        vm.prank(USER);
        image.burn(0);
        assertEq(image.balanceOf(USER), 0);
    }

    function testGetMaxSupply() public {
        assertEq(image.getMaxSupply(), MAX_SUPPLY);
    }

    function testGetNextId() public {
        assertEq(image.getNextId(), 0);
        vm.prank(OWNER);
        image.safeMint(USER);
        assertEq(image.getNextId(), 1);
    }
}
