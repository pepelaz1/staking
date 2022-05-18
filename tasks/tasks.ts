import { HardhatUserConfig, task } from "hardhat/config";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});


task("stake", "Stake some tokens")
.addParam("address","Address of the contract")
.addParam("amount","Amount of tokens stake")
.setAction(async (taskArgs, hre) => {
    const { address: address, amount: amount } = taskArgs;
    const { abi } = await hre.artifacts.readArtifact("Staking");
    const [signer] = await hre.ethers.getSigners();

    const contract = new hre.ethers.Contract(
        address, abi, signer
    )
    contract.stake(amount);
});

task("unstake", "Unstake tokens")
.addParam("address","Address of the contract")
.setAction(async (taskArgs, hre) => {
    const { address: address } = taskArgs;
    const { abi } = await hre.artifacts.readArtifact("Staking");
    const [signer] = await hre.ethers.getSigners();

    const contract = new hre.ethers.Contract(
        address, abi, signer
    )
    contract.unstake();
});

task("claim", "Claim reward")
.addParam("address","Address of the contract")
.setAction(async (taskArgs, hre) => {
    const { address: address } = taskArgs;
    const { abi } = await hre.artifacts.readArtifact("Staking");
    const [signer] = await hre.ethers.getSigners();

    const contract = new hre.ethers.Contract(
        address, abi, signer
    )
    contract.claim();
});