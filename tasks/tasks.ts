import { HardhatUserConfig, task } from "hardhat/config";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});


task("latestBlock", "Prints the latest block number", async (taskArgs, hre) => {
    const blockNumber = await hre.ethers.provider.getBlock("latest")
    console.log(blockNumber);
});

