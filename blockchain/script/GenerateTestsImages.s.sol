// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {Script} from "forge-std/Script.sol";
import {ImageManager} from "../src/ImageManager.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract GenerateTestsImages is Script {
    function run(address manager) external {
        HelperConfig config = new HelperConfig();
        (,,,,,,,,,,, uint256 deployerKey) = config.activeNetworkConfig();
        vm.startBroadcast(deployerKey);
        ImageManager(manager).createImage(
            "test",
            "TEST",
            20,
            "https://res.cloudinary.com/dgi3lqqup/image/upload/v1686559212/samples/food/dessert.jpg",
            10 ether,
            8715
        );
        vm.stopBroadcast();
    }
}

//cast call 0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1 "createImage(string,string,uint256,string,uint256,uint256)" "test" "TEST" 20 "https://res.cloudinary.com/dgi3lqqup/image/upload/v1686559212/samples/food/dessert.jpg" 10000000000000000000 8715