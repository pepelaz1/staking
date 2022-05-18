
import { ethers } from "hardhat";
const { MaxUint256 } = ethers.constants;
const { parseEther, formatEther } = ethers.utils;
const routerAddress = process.env.UNISWAP_ROUTER_ADDRESS as string;
const factoryAddress = process.env.UNISWAP_FACTORY_ADDRESS as string;


async function main() {

    let [acc] = await ethers.getSigners()

    // deploy reward token
    const Erc20Token = await ethers.getContractFactory("Erc20Token");
    const rewardToken = await Erc20Token.deploy();
    await rewardToken.deployed();
    console.log("Reward token deployed to:", rewardToken.address);

    // delpoy TokenOne
    const TokenOne = await ethers.getContractFactory("TokenOne");
    const tokenOne = await TokenOne.deploy();
    await tokenOne.deployed();
    console.log("TokenOne deployed to:", tokenOne.address);

    let factory = await ethers.getContractAt("IUniswapV2Factory", factoryAddress);
    let router = await ethers.getContractAt("IUniswapV2Router02", routerAddress);

    const wethAddress = await router.WETH()

    // create pair
    let tx = await factory.createPair(tokenOne.address, wethAddress);
    await tx.wait();

    const pairAddress = await factory.getPair(tokenOne.address, wethAddress);
    console.log("LpToken address:", pairAddress);

    let lpToken = await ethers.getContractAt("LpToken", pairAddress);

    // approve
    await tokenOne.approve(routerAddress, MaxUint256);

    // add liquidity pool    
    tx = await router.addLiquidityETH(tokenOne.address, parseEther('0.05'), 0, 0, acc.address, MaxUint256, {
      value: parseEther('0.00001')
    });
    await tx.wait();

    const Staking = await ethers.getContractFactory('Staking', acc)
    let staking = await Staking.deploy(lpToken.address, rewardToken.address)
    await staking.deployed()
    console.log("Staking contract deployed to:", staking.address)

    await lpToken.approve(staking.address, MaxUint256);

    // mint some reward to staking contract
    let rewardSupply = parseEther("3000")
    rewardToken.mint(staking.address, rewardSupply)
 }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
