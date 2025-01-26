const path = require("path");


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account", deployer.address);

    const productContract = await ethers.deployContract("ProductList");
    const contract_address = await productContract.getAddress()
    console.log("Contract address:", contract_address);
    saveFrontendFiles(contract_address);
}

function saveFrontendFiles(contract_address){
    const fs = require("fs");

    const contractsDir = path.join(__dirname, "..", "frontend", "contracts");

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
      }
    
      fs.writeFileSync(
        path.join(contractsDir, "contract-address.json"),
        JSON.stringify({ ProductList: contract_address }, undefined, 2)
      );

      const ProductArtifact = artifacts.readArtifactSync("ProductList");
  
      fs.writeFileSync(
        path.join(contractsDir, "ProductList.json"),
        JSON.stringify(ProductArtifact, null, 2)
      );
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});