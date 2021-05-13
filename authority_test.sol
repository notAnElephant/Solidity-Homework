// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.
import "remix_accounts.sol";
import "../contracts/asdasdasd.sol";

// File name has to end with '_test.sol', this file can contain more than one testSuite contracts
contract testSuite {

    AutonomousCrossing AC;

    ///'beforeEach', 'beforeAll', 'afterEach' & 'afterAll'
    function beforeAll() public {
        
        // Contract init
        AC = new AutonomousCrossing(TestsAccounts.getAccount(0));

    }

    function Acc(uint16 accountID) public returns(TestAccount) {
        return TestsAccounts.getAccount(accountID);
    }

    function checkSuccess() public {
        // See documentation: https://remix-ide.readthedocs.io/en/latest/assert_library.html
        Assert.equal(uint(2), uint(2), "2 should be equal to 2");
        Assert.notEqual(uint(2), uint(3), "2 should not be equal to 3");
    }

    function checkSuccess2() public pure returns (bool) {
        // Use the return value (true or false) to test the contract
        return true;
    }
    
    function checkFailure() public {
        Assert.equal(uint(1), uint(2), "1 is not equal to 2");
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
    
    function testInit() public {
        AC.authority = TestsAccounts.getAccount(0);
    }

    /// TESTING REGISTRATIONS

    function registerCar() public {
        Assert.ok();
    }
    
    function registerTrain() public
    {
        
    }

    function registerCrossing() public {

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
