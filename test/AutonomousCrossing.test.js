const AutonomousCrossing = artifacts.require("AutonomousCrossing");
const { assert } = require('chai');

/*module.exports = function(deployer) {
  deployer.deploy(AutonomousCrossing);
};*/

/*
package.json

Openzeppelin NPM-ről (testhelper, 
Chai - assert

const { assert } = require('chai')

describe blokkosítja a teszteket

Függvényekben +1 paraméter
{from: accounts[n]}


*/


//contract->describe->it
//

// Lol lehetne payable módon adni ticketet a kocsiknak
//const result 7 await [...]
//const returnargument = result.logs[0].args.argumentwhatever;

contract("AutonomousCrossing", accounts => {
    it("should initialize correctly", () =>
      AutonomousCrossing.deployed()
        .then(instance => instance.getBalance.call(accounts[0]))
        .then(balance => {
          assert.equal(
            balance.valueOf(),
            10000,
            "10000 wasn't in the first account"
          );
        }));
  
    it("should call a function that depends on a linked library", () => {
      let meta;
      let AutonomousCrossingBalance;
      let AutonomousCrossingEthBalance;
  
      return AutonomousCrossing.deployed()
        .then(instance => {
          meta = instance;
          return meta.getBalance.call(accounts[0]);
        })
        .then(outCoinBalance => {
          AutonomousCrossingBalance = outCoinBalance.toNumber();
          return meta.getBalanceInEth.call(accounts[0]);
        })
        .then(outCoinBalanceEth => {
          AutonomousCrossingEthBalance = outCoinBalanceEth.toNumber();
        })
        .then(() => {
          assert.equal(
            AutonomousCrossingEthBalance,
            2 * AutonomousCrossingBalance,
            "Library function returned unexpected function, linkage may be broken"
          );
        });
    });
  
    it("should send coin correctly", () => {
      let meta;
  
      // Get initial balances of first and second account.
      const account_one = accounts[0];
      const account_two = accounts[1];
  
      let account_one_starting_balance;
      let account_two_starting_balance;
      let account_one_ending_balance;
      let account_two_ending_balance;
  
      const amount = 10;
  
      return AutonomousCrossing.deployed()
        .then(instance => {
          meta = instance;
          return meta.getBalance.call(account_one);
        })
        .then(balance => {
          account_one_starting_balance = balance.toNumber();
          return meta.getBalance.call(account_two);
        })
        .then(balance => {
          account_two_starting_balance = balance.toNumber();
          return meta.sendCoin(account_two, amount, { from: account_one });
        })
        .then(() => meta.getBalance.call(account_one))
        .then(balance => {
          account_one_ending_balance = balance.toNumber();
          return meta.getBalance.call(account_two);
        })
        .then(balance => {
          account_two_ending_balance = balance.toNumber();
  
          assert.equal(
            account_one_ending_balance,
            account_one_starting_balance - amount,
            "Amount wasn't correctly taken from the sender"
          );
          assert.equal(
            account_two_ending_balance,
            account_two_starting_balance + amount,
            "Amount wasn't correctly sent to the receiver"
          );
        });
    });
  });