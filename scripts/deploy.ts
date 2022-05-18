
import { ethers } from "hardhat";
const { MaxUint256 } = ethers.constants;
const { parseEther, formatEther } = ethers.utils;
const routerAddress = process.env.UNISWAP_ROUTER_ADDRESS as string;
const factoryAddress = process.env.UNISWAP_FACTORY_ADDRESS as string;


//router's ABI
const abiRouter = require('../artifacts/@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol/IUniswapV2Router02.json').abi;


async function main() {


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
    const [addr] = await ethers.provider.listAccounts();
    console.log("lp token before: ", await lpToken.balanceOf(addr));
    
    tx = await router.addLiquidityETH(tokenOne.address,  parseEther('200'),  0, 0, addr, MaxUint256, {
      value: parseEther('0.01')
    });
    await tx.wait();

    console.log("lp token after: ", await lpToken.balanceOf(addr));
 }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
