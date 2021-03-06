import { expect } from "chai";
import { ethers, network } from "hardhat";

const { MaxUint256 } = ethers.constants;
const { parseEther, formatEther } = ethers.utils;
const routerAddress = process.env.UNISWAP_ROUTER_ADDRESS as string;
const factoryAddress = process.env.UNISWAP_FACTORY_ADDRESS as string;


describe("Staking", function () {

  let acc1: any;

  let acc2: any;

  let acc3: any;

  let staking: any;

  let rewardToken: any;

  let tokenOne: any;

  let lpToken: any;

  let router: any;

  beforeEach(async function () {

    [acc1, acc2, acc3] = await ethers.getSigners()

    // deploy reward token
    const Erc20Token = await ethers.getContractFactory("Erc20Token");
    rewardToken = await Erc20Token.deploy("Reward", "RWD", parseEther("10"));
    await rewardToken.deployed();

    // delpoy TokenOne
    const TokenOne = await ethers.getContractFactory("Erc20Token");
    tokenOne = await TokenOne.deploy("TokenOne", "TO", parseEther("10000"));
    await tokenOne.deployed();

    let factory = await ethers.getContractAt("IUniswapV2Factory", factoryAddress);
    router = await ethers.getContractAt("IUniswapV2Router02", routerAddress);

    const wethAddress = await router.WETH()

    // create pair
    let tx = await factory.createPair(tokenOne.address, wethAddress);
    await tx.wait();

    const pairAddress = await factory.getPair(tokenOne.address, wethAddress);

    lpToken = await ethers.getContractAt("ERC20", pairAddress);

    // approve
    await tokenOne.approve(routerAddress, MaxUint256);
   
    // add liquidity     
    tx = await router.addLiquidityETH(tokenOne.address, parseEther('0.05'), 0, 0, acc1.address, MaxUint256, {
      value: parseEther('0.001')
    });
    await tx.wait();

    tx = await router.addLiquidityETH(tokenOne.address, parseEther('0.06'), 0, 0, acc2.address, MaxUint256, {
      value: parseEther('0.001')
    });
    await tx.wait();

    const Staking = await ethers.getContractFactory('Staking')
    staking = await Staking.deploy(lpToken.address, rewardToken.address)
    await staking.deployed()

    await lpToken.approve(staking.address, MaxUint256);


    lpToken = await ethers.getContractAt("ERC20", pairAddress, acc2);
    await lpToken.approve(staking.address, MaxUint256);


    // mint some reward to staking contract
    let rewardSupply = parseEther("3000")
    rewardToken.mint(staking.address, rewardSupply)
  })

  it("should be deployed", async function () {
    expect(staking.address).to.be.properAddress
  })


  it("should be able to stake", async function () {
    const amount = await lpToken.balanceOf(acc1.address)

    const tx = await staking.stake(amount)
    await tx.wait()

    expect(await staking.stakedBy(acc1.address)).to.equal(amount);
  })

  it("should be able to stake mutiple times", async function () {
    const amount = parseEther("0.0001")

    let tx = await staking.stake(amount)
    await tx.wait()

    expect(await staking.stakedBy(acc1.address)).to.equal(amount);

    await network.provider.send("evm_increaseTime", [20 * 60 + 1]) // add 3 mins and 1 sec to current time

    tx = await staking.stake(amount)
    await tx.wait()

    
    expect(await staking.stakedBy(acc1.address)).to.equal(amount.mul(2));
  })

  it("should be able to unstake", async function () {
    const amount = await lpToken.balanceOf(acc1.address)

    let tx = await staking.stake(amount)
    await tx.wait()

    await network.provider.send("evm_increaseTime", [10 * 60 + 1]) // add 10 mins and 1 sec to current time

    tx = await staking.unstake()
    await tx.wait() 

    expect(await staking.stakedBy(acc1.address)).to.equal(0);
  })

  it("should be able to unstake with claim after delay", async function () {
    const amount = await lpToken.balanceOf(acc1.address)

    let tx = await staking.stake(amount)
    await tx.wait()

    await network.provider.send("evm_increaseTime", [20 * 60 + 1]) // add 10 mins and 1 sec to current time

    tx = await staking.unstake()
    await tx.wait() 

    expect(await staking.stakedBy(acc1.address)).to.equal(0);
  })

  it("should not be able to unstake before configured delay", async function () {
    const amount = await lpToken.balanceOf(acc1.address)

    let tx = await staking.stake(amount)
    await tx.wait()

    await expect(staking.unstake()).to.be.revertedWith("Time delay has not passed yet");
  })

  it("should be able to claim reward", async function () {
    const amount = parseEther("0.0001")
    const before = await rewardToken.balanceOf(acc1.address)

    let tx = await staking.stake(amount)
    await tx.wait()

    await network.provider.send("evm_increaseTime", [60 * 60 + 1]) // add 60 mins and 1 sec to current time

    tx = await staking.claim()
    await tx.wait() 

    const result = before.add(parseEther("0.00006"))
    expect(await rewardToken.balanceOf(acc1.address)).to.equal(result);
  })

  it("should be able to stake and claim by different accounts", async function () {
    const amount1 = parseEther("0.0001")
    let before1 = await rewardToken.balanceOf(acc1.address);
    let tx = await staking.stake(amount1)
    await tx.wait()

    await network.provider.send("evm_increaseTime", [40 * 60 + 1]) 

    const amount2 = parseEther("0.0001")
    let before2 = await rewardToken.balanceOf(acc2.address)
    tx = await staking.connect(acc2).stake(amount2)
    await tx.wait()

    await network.provider.send("evm_increaseTime", [20 * 60 + 1]) 

    tx = await staking.connect(acc1).claim()
    await tx.wait() 

    tx = await staking.connect(acc2).claim()
    await tx.wait() 
   
    const result1 = before1.add(parseEther("0.00006"))
    expect(await rewardToken.balanceOf(acc1.address)).to.equal(result1);

    const result2 = before2.add(parseEther("0.00002"))
    expect(await rewardToken.balanceOf(acc2.address)).to.equal(result2);
  })


  it("should be able to configure params", async function () {
    let tx = await staking.configure(10, 20, 30)
    await tx.wait()

    expect(await staking.getRewardPercent()).to.equal(10);
    expect(await staking.getRewardDelay()).to.equal(20);
    expect(await staking.getUnstakeDelay()).to.equal(30);
  })

  it("should not be able to configure params no one except owner", async function () {
    await expect(staking.connect(acc2).configure(10, 20, 30)).to.be.revertedWith("This operation is available only to the owner");
  })
});
