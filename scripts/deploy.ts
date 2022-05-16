
import { ethers } from "hardhat";

async function main() {

    // delpoy TokenOne
    const TokenOne = await ethers.getContractFactory("TokenOne");
    const tokenOne = await TokenOne.deploy();
    await tokenOne.deployed();

    console.log("TokenOne deployed to:", tokenOne.address);


    // delpoy TokenTwo
    const TokenTwo = await ethers.getContractFactory("TokenTwo");
    const tokenTwo = await TokenTwo.deploy();
    await tokenTwo.deployed();
  
    console.log("TokenTwo deployed to:", tokenTwo.address);
 }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
