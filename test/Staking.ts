import { expect } from "chai";
import { ethers } from "hardhat";

const { MaxUint256 } = ethers.constants;
const { parseEther, formatEther } = ethers.utils;
const routerAddress = process.env.UNISWAP_ROUTER_ADDRESS as string;
const factoryAddress = process.env.UNISWAP_FACTORY_ADDRESS as string;


describe("Staking", function () {

  let acc1: any;

  let acc2: any;

  let acc3: any;

  let staking: any;

  let lpToken: any;

  beforeEach(async function () {

    [acc1, acc2, acc3] = await ethers.getSigners()

    // deploy reward token
    const Erc20Token = await ethers.getContractFactory("Erc20Token");
    const rewardToken = await Erc20Token.deploy();
    await rewardToken.deployed();
    //console.log("Reward token deployed to:", rewardToken.address);

    // delpoy TokenOne
    const TokenOne = await ethers.getContractFactory("TokenOne");
    const tokenOne = await TokenOne.deploy();
    await tokenOne.deployed();
    //console.log("TokenOne deployed to:", tokenOne.address);

    let factory = await ethers.getContractAt("IUniswapV2Factory", factoryAddress);
    let router = await ethers.getContractAt("IUniswapV2Router02", routerAddress);

    const wethAddress = await router.WETH()

    // create pair
    let tx = await factory.createPair(tokenOne.address, wethAddress);
    await tx.wait();

    const pairAddress = await factory.getPair(tokenOne.address, wethAddress);
    //console.log("LpToken address:", pairAddress);

    lpToken = await ethers.getContractAt("LpToken", pairAddress);

    // approve
    await tokenOne.approve(routerAddress, MaxUint256);
 

    // add liquidity pool    
    tx = await router.addLiquidityETH(tokenOne.address, parseEther('0.05'), 0, 0, acc1.address, MaxUint256, {
      value: parseEther('0.00001')
    });
    await tx.wait();

    const Staking = await ethers.getContractFactory('Staking', acc1)
    staking = await Staking.deploy(lpToken.address, rewardToken.address)
    await staking.deployed()
    //console.log("Staking contract deployed to: ", staking.address)

    await lpToken.approve(staking.address, MaxUint256);

    let rewardSupply = parseEther("3000")
    rewardToken.mint(staking.address, rewardSupply)
  })

  it("should be deployed", async function () {
    expect(staking.address).to.be.properAddress
  })


  it("should be able to stake", async function () {
    const amount = await lpToken.balanceOf(acc1.address)

    // console.log("stake: before");
    // console.log("lp token user balance", await lpToken.balanceOf(acc1.address));
    // console.log("lp token contract balance", await lpToken.balanceOf(staking.address));

    const tx = await staking.stake(amount)
    await tx.wait()

    // console.log("stake: after");
    // console.log("lp token user balance", await lpToken.balanceOf(acc1.address));
    // console.log("lp token contract balance", await lpToken.balanceOf(staking.address));
  })

  it("should be able to unstake", async function () {
    const amount = await lpToken.balanceOf(acc1.address)

    let tx = await staking.stake(amount)
    await tx.wait()

    // console.log("unstake: before");
    // console.log("lp token user balance", await lpToken.balanceOf(acc1.address));
    // console.log("lp token contract balance", await lpToken.balanceOf(staking.address));

    tx = await staking.unstake()
    await tx.wait() 

    // console.log("unstake: after");
    // console.log("lp token user balance", await lpToken.balanceOf(acc1.address));
    // console.log("lp token contract balance", await lpToken.balanceOf(staking.address));
  })

  it("should be able to claim reward", async function () {
    const amount = await lpToken.balanceOf(acc1.address)

    let tx = await staking.stake(amount)
    await tx.wait()

    tx = await staking.claim()
    await tx.wait() 
  })

  it("should be able to configure params", async function () {
 
  })
});
