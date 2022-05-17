import { expect } from "chai";
import { ethers } from "hardhat";

describe("LpToken", function () {

  let acc: any;

  let lpToken: any;

  beforeEach(async function() {
    [acc] = await ethers.getSigners()
    const LpToken = await ethers.getContractFactory('LpToken', acc)
    lpToken = await LpToken.deploy()
    await lpToken.deployed()  
  })

  it("should be deployed", async function(){
    expect(lpToken.address).to.be.properAddress
  })
});
