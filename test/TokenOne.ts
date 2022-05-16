import { expect } from "chai";
import { ethers } from "hardhat";

describe("TokenOne", function () {

  let acc: any;

  let tokenOne: any;

  beforeEach(async function() {
    [acc] = await ethers.getSigners()
    const TokenOne = await ethers.getContractFactory('TokenOne', acc)
    tokenOne = await TokenOne.deploy()
    await tokenOne.deployed()  
  })

  it("should be deployed", async function(){
    expect(tokenOne.address).to.be.properAddress
  })
});
