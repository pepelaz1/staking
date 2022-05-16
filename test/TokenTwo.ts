import { expect } from "chai";
import { ethers } from "hardhat";

describe("TokenTwo", function () {

  let acc: any;

  let tokenTwo: any;

  beforeEach(async function() {
    [acc] = await ethers.getSigners()
    const TokenTwo = await ethers.getContractFactory('TokenTwo', acc)
    tokenTwo = await TokenTwo.deploy()
    await tokenTwo.deployed()  
  })

  it("should be deployed", async function(){
    expect(tokenTwo.address).to.be.properAddress
  })
});
