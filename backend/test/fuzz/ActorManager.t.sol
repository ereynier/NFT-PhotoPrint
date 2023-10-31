// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {Handler} from "./Handler.t.sol";

import {CommonBase} from "forge-std/Base.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {StdUtils} from "forge-std/StdUtils.sol";

contract ActorManager is CommonBase, StdCheats, StdUtils {
    Handler[] public handlers;

    constructor(Handler[] memory _handlers) {
        handlers = _handlers;
    }

    function mint(uint256 handlerIndex, address imageAddress, address token) external {
        handlerIndex = bound(handlerIndex, 0, handlers.length - 1);
        handlers[handlerIndex].mint(imageAddress, token);
    }

    function lockImage(uint256 handlerIndex, address imageAddress) external {
        handlerIndex = bound(handlerIndex, 0, handlers.length - 1);
        handlers[handlerIndex].lockImage(imageAddress);
    }

    function unlockImage(uint256 handlerIndex) external {
        handlerIndex = bound(handlerIndex, 0, handlers.length - 1);
        handlers[handlerIndex].unlockImage();
    }

    function confirmOrder(uint256 handlerIndex) external {
        handlerIndex = bound(handlerIndex, 0, handlers.length - 1);
        handlers[handlerIndex].confirmOrder();
    }

    function clearOrderId(uint256 handlerIndex) external {
        handlerIndex = bound(handlerIndex, 0, handlers.length - 1);
        handlers[handlerIndex].clearOrderId();
    }

    function mintCertificate(uint256 handlerIndex) external {
        handlerIndex = bound(handlerIndex, 0, handlers.length - 1);
        handlers[handlerIndex].mintCertificate();
    }

    // /* ===== Owner Functions ===== */

    function withdrawToken(uint256 handlerIndex, address token) external {
        handlerIndex = bound(handlerIndex, 0, handlers.length - 1);
        handlers[handlerIndex].withdrawToken(token);
    }

    // /* ===== Admin Functions ===== */

    function setPrinted(uint256 handlerIndex) external {
        handlerIndex = bound(handlerIndex, 0, handlers.length - 1);
        handlers[handlerIndex].setPrinted();
    }

    // /* ===== Helper Functions ===== */

    // function updateTimestamp(uint256 handlerIndex) public {
    //    handlerIndex = bound(handlerIndex, 0, handlers.length - 1);
    //    handlers[handlerIndex].updateTimestamp();
    // }
}
