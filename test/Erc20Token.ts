import { expect } from "chai";
import { ethers } from "hardhat";

describe("Erc20Token", function () {

  let acc1: any;

  let acc2: any;

  let acc3: any;

  let erc20token: any;

  beforeEach(async function() {
    [acc1, acc2, acc3] = await ethers.getSigners()
    const Erc20Token = await ethers.getContractFactory('Erc20Token', acc1)
    erc20token = await Erc20Token.deploy("Pepelaz","PPLZ", ethers.utils.parseEther("10000"))
    await erc20token.deployed()  
  })


  it("should be deployed", async function(){
     expect(erc20token.address).to.be.properAddress
  })

  it("should be able to get token name", async function() {
     expect(await erc20token.name()).to.equal("Pepelaz");
  })

  it("should be able to get token symbol", async function() {
     expect(await erc20token.symbol()).to.equal("PPLZ");
  })

  it("should be able to get decimals", async function() {
      expect(await erc20token.decimals()).to.equal(18);
  })

  it("should be able to get total supply", async function() {
      expect(await erc20token.totalSupply()).to.equal(ethers.utils.parseEther("10000"));
  })

  it("should be able to get owner balance", async function() {
      expect(await erc20token.balanceOf(acc1.address)).to.equal(ethers.utils.parseEther("10000"));
  })

  it("should be able approve some amount of token to other account", async function() {
      const tx = await erc20token.approve(acc2.address, ethers.utils.parseEther("5000"));
      await tx.wait()

      expect(await erc20token.allowance(acc1.address, acc2.address)).to.equal(ethers.utils.parseEther("5000"));
  })

  it("should be able to increase allowance", async function() {
    const tx = await erc20token.increaseAllowance(acc2.address, ethers.utils.parseEther("5000"));
    await tx.wait()

    expect(await erc20token.allowance(acc1.address, acc2.address)).to.equal(ethers.utils.parseEther("5000"));
  })


  it("should be able to decrease allowance", async function() {
   let tx = await erc20token.approve(acc2.address, ethers.utils.parseEther("5000"));
    await tx.wait()

    tx = await erc20token.decreaseAllowance(acc2.address, ethers.utils.parseEther("5000"));
    await tx.wait()

    expect(await erc20token.allowance(acc1.address, acc2.address)).to.equal("0");
  })

  it("should not be able to decrease allowance more than approved", async function() {
    let tx = await erc20token.approve(acc2.address, ethers.utils.parseEther("5000"));
     await tx.wait()
 
     await expect(
      erc20token.decreaseAllowance(acc2.address, ethers.utils.parseEther("6000"))
    ).to.be.revertedWith("Not possible to decrease less than zero");
  })
 

  it("should be able transfer some amount", async function() {
      const tx = await erc20token.transfer(acc2.address, ethers.utils.parseEther("1000"));
      await tx.wait()

      expect(await erc20token.balanceOf(acc2.address)).to.equal(ethers.utils.parseEther("1000"));
  })

  it("should not be able transfer more than current balance", async function() {
      await expect(
        erc20token.transfer(acc2.address, ethers.utils.parseEther("11000"))
      ).to.be.revertedWith("Not possible to transfer more than exising amount");
  })

  it("should be able transfer from some account to other account", async function() {
    let tx = await erc20token.approve(acc2.address, ethers.utils.parseEther("5000"));
    await tx.wait();

    tx = await erc20token.connect(acc2).transferFrom(acc1.address, acc3.address, ethers.utils.parseEther("1000"));
    await tx.wait()

    expect(await erc20token.balanceOf(acc3.address)).to.equal(ethers.utils.parseEther("1000"));
  })

  it("should not be able transfer from some account more than existing amount", async function() {
    let tx = await erc20token.approve(acc2.address, ethers.utils.parseEther("10000"));
    await tx.wait();

    await expect(
      erc20token.transferFrom(acc1.address, acc3.address,ethers.utils.parseEther("11000"))
    ).to.be.revertedWith("Not possible to transfer more than exising amount");
  })

  it("should not be able transfer from some account more than approved amount", async function() {
    let tx = await erc20token.approve(acc2.address, ethers.utils.parseEther("5000"));
    await tx.wait();

    await expect(
      erc20token.transferFrom(acc1.address, acc3.address, ethers.utils.parseEther("6000"))
    ).to.be.revertedWith("Not possible to transfer more than approved amount");
  })

  it("should be able to mint some token", async function() {
    let tx = await erc20token.mint(acc2.address, ethers.utils.parseEther("3000"));
    await tx.wait();

    expect(await erc20token.totalSupply()).to.equal(ethers.utils.parseEther("13000"));
  })

  it("should be able to mint some token by owner only", async function() {
    await expect(
      erc20token.connect(acc2).mint(acc2.address, ethers.utils.parseEther("3000"))
    ).to.be.revertedWith("This operation is available only to the owner");
  })

  it("should be able to burn some token", async function() {
    let tx = await erc20token.burn(acc1.address, ethers.utils.parseEther("3000"));
    await tx.wait();

    expect(await erc20token.totalSupply()).to.equal(ethers.utils.parseEther("7000"));
  })

  it("should be able to burn some token by owner only", async function() {
    await expect(
      erc20token.connect(acc2).burn(acc2.address, ethers.utils.parseEther("3000"))
    ).to.be.revertedWith("This operation is available only to the owner");
  })

  it("should not be able to burn more than exising amount", async function() {
    await expect(
      erc20token.burn(acc1.address, ethers.utils.parseEther("11000"))
    ).to.be.revertedWith("Not possible to burn more than exising amount");
  })

});


