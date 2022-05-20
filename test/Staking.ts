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
    //console.log("Reward token deployed to:", rewardToken.address);

    // delpoy TokenOne
    const TokenOne = await ethers.getContractFactory("Erc20Token");
    tokenOne = await TokenOne.deploy("TokenOne", "TO", parseEther("10000"));
    await tokenOne.deployed();
    //console.log("TokenOne deployed to:", tokenOne.address);

    let factory = await ethers.getContractAt("IUniswapV2Factory", factoryAddress);
    router = await ethers.getContractAt("IUniswapV2Router02", routerAddress);

    const wethAddress = await router.WETH()

    // create pair
    let tx = await factory.createPair(tokenOne.address, wethAddress);
    await tx.wait();

    const pairAddress = await factory.getPair(tokenOne.address, wethAddress);
    //console.log("LpToken address:", pairAddress);

    lpToken = await ethers.getContractAt("ERC20", pairAddress);

    // approve
    await tokenOne.approve(routerAddress, MaxUint256);

    // add liquidity     
    tx = await router.addLiquidityETH(tokenOne.address, parseEther('0.05'), 0, 0, acc1.address, MaxUint256, {
      value: parseEther('0.00001')
    });
    await tx.wait();

    const Staking = await ethers.getContractFactory('Staking', acc1)
    staking = await Staking.deploy(lpToken.address, rewardToken.address)
    await staking.deployed()
    //console.log("Staking contract deployed to: ", staking.address)

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



  // it("should be able to stake, then claim, then stake again and claim", async function () {
  //   let initialValue = await rewardToken.balanceOf(acc1.address)

  //    // stake some amount
  //   let amount1 = parseEther("0.00001")
  //   let tx = await staking.stake(amount1)
  //   await tx.wait()

  //   expect(await staking.stakedBy(acc1.address)).to.equal(amount1)

  //   await network.provider.send("evm_increaseTime", [20 * 60 + 1])

  //   tx = await staking.claim()
  //   await tx.wait()

  //   let calculatedReward = amount1.mul(20).div(100).add(initialValue)
  //   expect(await rewardToken.balanceOf(acc1.address)).to.equal(calculatedReward)

  //   // stake some more
  //   let amount2 = parseEther("0.00003")
  //   tx = await staking.stake(amount2)
  //   await tx.wait()

  //   let sumAmount = amount1.add(amount2)
  //   expect(await staking.stakedBy(acc1.address)).to.equal(sumAmount)
  
  //   await network.provider.send("evm_increaseTime", [20 * 60 + 1])

  //   tx = await staking.claim()
  //   await tx.wait()

  //   let calculatedReward1 =  sumAmount.mul(20).div(100).add(initialValue).add(amount1.mul(20).div(100))
  //   expect(await rewardToken.balanceOf(acc1.address)).to.equal(calculatedReward1)
    
  // })

//   it("should be able to stake and then stake again before claim delay elapsed", async function () {
//     let initialValue = await rewardToken.balanceOf(acc1.address)

//     // stake some amount
//     let amount1 = parseEther("0.00001")
//     let tx = await staking.stake(amount1)
//     await tx.wait()

//     expect(await staking.stakedBy(acc1.address)).to.equal(amount1);

//     // don't claim this time

//     // await network.provider.send("evm_increaseTime", [20 * 60 + 1])
//     // tx = await staking.claim()
//     // await tx.wait()
//     // let calculatedReward =  amount1.mul(20).div(100)
//     // expect(await rewardToken.balanceOf(acc1.address)).to.equal(calculatedReward);

//     // wait some delay which less than allowed claim delay
//     await network.provider.send("evm_increaseTime", [5 * 60 + 1])

//     // and stake again 
//     let amount2 = parseEther("0.00003")
//     tx = await staking.stake(amount2)
//     await tx.wait()

//     let sumAmount = amount1.add(amount2)
//     expect(await staking.stakedBy(acc1.address)).to.equal(sumAmount)

//     await network.provider.send("evm_increaseTime", [20 * 60 + 1])

//     tx = await staking.claim()
//     await tx.wait()

//     let calculatedReward = sumAmount.mul(20).div(100).add(initialValue)
//     expect(await rewardToken.balanceOf(acc1.address)).to.equal(calculatedReward);
//  })

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
  const amount = await lpToken.balanceOf(acc1.address)

  let tx = await staking.stake(amount)
  await tx.wait()

  await network.provider.send("evm_increaseTime", [60 * 60 + 1]) // add 20 mins and 1 sec to current time

  tx = await staking.claim()
  await tx.wait() 
})

  // it("should not be able to claim before configured delay", async function () {
  //   const amount = await lpToken.balanceOf(acc1.address)

  //   let tx = await staking.stake(amount)
  //   await tx.wait()

  //   await expect(staking.claim()).to.be.revertedWith("Time delay has not passed yet");
  // })


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
