// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.
import "remix_accounts.sol";
import "../contracts/asdasdasd.sol";

// File name has to end with '_test.sol', this file can contain more than one testSuite contracts
contract testSuite {

    AutonomousCrossing public AC;

    ///'beforeEach', 'beforeAll', 'afterEach' & 'afterAll'
    function beforeAll() public {
        
        // Contract init
        AC = new AutonomousCrossing(Acc(0));

    }

    function Acc(uint16 accountID) internal returns(address) {
        return TestsAccounts.getAccount(accountID);
    }

    function checkSuccess2() public pure returns (bool) {
        // Use the return value (true or false) to test the contract
        return true;
    }

    /// See more: https://remix-ide.readthedocs.io/en/latest/unittesting.html#customization
    /// #sender: account-1
    /// #value: 100
    function checkSenderAndValue() public payable {
        // account index varies 0-9, value is in wei
        Assert.equal(msg.sender, TestsAccounts.getAccount(1), "Invalid sender");
        Assert.equal(msg.value, 100, "Invalid value");
    }

    /// TESTING INITIAL CONDITIONS
    
    function aliasTest() public {
        Assert.equal(Acc(0), TestsAccounts.getAccount(0), "Account alias error 0");
        Assert.equal(Acc(1), TestsAccounts.getAccount(1), "Account alias error 1");
        Assert.equal(Acc(2), TestsAccounts.getAccount(2), "Account alias error 2");
        Assert.equal(Acc(3), TestsAccounts.getAccount(3), "Account alias error 3");
        Assert.notEqual(Acc(2), TestsAccounts.getAccount(3), "Account alias error 2-3");
    }
    
    function testAdmin() public {
        Assert.equal(AC.getAuthority(), Acc(0), "Authority must be account 0 for the tests.");
    }

    /// TESTING REGISTRATIONS

    function registerCrossing() public {
        
        address newCrossingAddress = Acc(1);

        uint8 newLaneNum = 2;
        uint8 newCarsPerLane = 3;
        uint16 newTimeout = 3600;

        // lanes: 2, carsperlane: 3, timetopass: 3600
        AC.RegisterCrossing(newCrossingAddress, newLaneNum, newCarsPerLane, newTimeout);

        Assert.ok(AC.crossings[newCrossingAddress].isSet, "Crossing is not set");
        Assert.ok(AC.crossing_lanes[newCrossingAddress].isSet, "Lane data not set");
        Assert.equal(AC.crossings[newCrossingAddress].id, newCrossingAddress, "ID mismatch");
        Assert.equal(AC.crossing_lanes[newCrossingAddress].id, newCrossingAddress, "ID mismatch");
        Assert.equal(AC.crossings[newCrossingAddress].state, AC.CrossingState.FREE, "State mismatch");
        Assert.equal(AC.crossings[newCrossingAddress].train_lock, address(0), "Train_lock mismatch");

        Assert.equal(AC.crossing_lanes[newCrossingAddress].lane_num, newLaneNum, "Lane_num mismatch");
        Assert.equal(AC.crossing_lanes[newCrossingAddress].cars_per_lane, newCarsPerLane, "Lane_num mismatch");
        Assert.equal(AC.crossings[newCrossingAddress].time_to_pass, newTimeout, "Time_to_pass mismatch");
        
    }

    function registerCar() public {
        address newCarAddress = Acc(2);
        
        AC.registerCar();
        Assert.ok(AC.cars[newCarAddress].isSet, "Car couldn't be set");
        Assert.equal(AC.cars[newCarAddress].passValidity, 0, "Invalid validity time");
    }

    /// TESTING CAR

    function requestPermission() public {

    }
    
    function releasePermission() public {
        
    }

    /// TESTING LOCKS

    function requestLock() public{
        
    }
    
    function releaseLock() public{
        
    }
    
}
