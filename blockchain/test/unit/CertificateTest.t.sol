// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {Test} from "forge-std/Test.sol";
import {Certificate} from "../../src/Certificate.sol";

contract CertificateTest is Test {
    Certificate certificate;
    address public OWNER = makeAddr("owner");
    address public USER = makeAddr("user");
    string public NAME = "Certificate";
    string public SYMBOL = "CERTIF";
    uint256 public MAX_SUPPLY = 100;
    string public BASE_URI_STRING = "https://example.com/";

    function setUp() public {
        vm.prank(OWNER);
        certificate = new Certificate(OWNER, NAME, SYMBOL, MAX_SUPPLY, BASE_URI_STRING);
    }

    function testSafeMintRevertIfNotOwner() public {
        vm.startPrank(USER);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        certificate.safeMint(USER, 10);
        vm.stopPrank();
    }

    function testSafeMintRevertIfIdOverMaxSupply() public {
        vm.startPrank(OWNER);
        vm.expectRevert(Certificate.Certificate__MaxSupplyReached.selector);
        certificate.safeMint(USER, MAX_SUPPLY);
    }

    function testSafeMintRevertIfCertificateAlreadyMinted() public {
        vm.startPrank(OWNER);
        certificate.safeMint(USER, 3);
        vm.expectRevert(abi.encodeWithSelector(Certificate.Certificate__TokenAlreadyMinted.selector, 3));
        certificate.safeMint(USER, 3);
    }

    function testSafeMintGood() public {
        vm.prank(OWNER);
        certificate.safeMint(USER, 10);
        assertEq(certificate.balanceOf(USER), 1);
        assertEq(certificate.ownerOf(10), USER);
        vm.prank(OWNER);
        certificate.safeMint(USER, 42);
        assertEq(certificate.balanceOf(USER), 2);
        assertEq(certificate.ownerOf(42), USER);
    }

    function testGetMaxSupply() public {
        assertEq(certificate.getMaxSupply(), MAX_SUPPLY);
    }

    function testGetTotalMinted() public {
        assertEq(certificate.getTotalMinted(), 0);
        vm.prank(OWNER);
        certificate.safeMint(USER, 10);
        assertEq(certificate.getTotalMinted(), 1);
        vm.prank(OWNER);
        certificate.safeMint(USER, 42);
        assertEq(certificate.getTotalMinted(), 2);
    }

    function testGetBaseURIGood() public {
        assertEq(certificate.getUri(), BASE_URI_STRING);
    }

    function testTokenURIGood() public {
        vm.startPrank(OWNER);
        certificate.safeMint(USER, 10);
        vm.stopPrank();
        assertEq(certificate.tokenURI(10), BASE_URI_STRING);
        assertEq(certificate.tokenURI(42), BASE_URI_STRING);
    }

    function testTokenOfOwnerByIndexGood() public {
        vm.prank(OWNER);
        certificate.safeMint(USER, 10);
        assertEq(certificate.tokenOfOwnerByIndex(USER, 0), 10);
        vm.prank(OWNER);
        certificate.safeMint(USER, 11);
        for (uint256 i = 0; i < certificate.balanceOf(USER); i++) {
            assertEq(certificate.tokenOfOwnerByIndex(USER, i), 10 + i);
        }
        vm.startPrank(OWNER);
        certificate.safeMint(makeAddr("other"), 12);
        certificate.safeMint(USER, 13);
        vm.stopPrank();
        assertEq(certificate.tokenOfOwnerByIndex(USER, 2), 13);
    }

    function testGetIdsByUserGood() public {
        assertEq(certificate.getIdsByUser(USER).length, 0);
        vm.prank(OWNER);
        certificate.safeMint(USER, 7);
        assertEq(certificate.getIdsByUser(USER)[0], 7);
        vm.prank(OWNER);
        certificate.safeMint(USER, 8);
        assertEq(certificate.getIdsByUser(USER)[0], 7);
        assertEq(certificate.getIdsByUser(USER)[1], 8);
        vm.startPrank(OWNER);
        certificate.safeMint(makeAddr("other"), 9);
        certificate.safeMint(USER, 11);
        vm.stopPrank();
        assertEq(certificate.getIdsByUser(USER)[2], 11);
    }
}
