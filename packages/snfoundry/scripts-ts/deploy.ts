import {
    constants,
    Provider,
    Contract,
    Account,
    json,
    shortString,
    RpcProvider,
    hash,
  } from "starknet";
  import fs from "fs";
  
  async function main() {
    // Initialize RPC provider with a specified node URL (Goerli testnet in this case)
    const provider = new RpcProvider({
      nodeUrl: "https://starknet-sepolia.public.blastapi.io",
    });
  
    // Check that communication with provider is OK
    const ci = await provider.getChainId();
    console.log("chain Id =", ci);
  
    // initialize existing Argent X testnet account
    const accountAddress =
      "0x01298DEF6c1fDBbFD7A1A7883495992D56dc0928B013f94EFE4caC65EB9F41b9";
    const privateKey =
      "0x01298DEF6c1fDBbFD7A1A7883495992D56dc0928B013f94EFE4caC65EB9";
  
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log("existing_ACCOUNT_ADDRESS=", accountAddress);
    console.log("existing account connected.\n");
  
    // Parse the compiled contract files
    const compiledSierra = json.parse(
      fs
        .readFileSync(
          "target/dev/contracts_StateChannel.contract_class.json"
        )
        .toString("ascii")
    );
    const compiledCasm = json.parse(
      fs
        .readFileSync(
          "target/dev/contracts_StateChannel.compiled_contract_class.json"
        )
        .toString("ascii")
    );
  
    // Compute class hashes
    const classHash = hash.computeSierraContractClassHash(compiledSierra);
    const compiledClassHash = hash.computeCompiledClassHash(compiledCasm);
  
    console.log("Class hash calc =", classHash);
    console.log("compiled class hash =", compiledClassHash);
  
    // Declare the contract
    const declareResponse = await account0.declare({
      contract: compiledSierra,
      casm: compiledCasm,
    });
    const contractClassHash = declareResponse.class_hash;
  
    // Wait for the transaction to be confirmed
    await provider.waitForTransaction(declareResponse.transaction_hash);
    console.log("✅ Contract declared with classHash =", contractClassHash);
  
    // Deploy the contract
    console.log("Deploy of contract in progress...");
    const { transaction_hash: deployTxHash, address: contractAddress } = await account0.deployContract({
      classHash: contractClassHash,
      constructorCalldata: [accountAddress],
    });
  
    console.log("🚀 Contract address =", contractAddress);
  
    // Wait for the deployment transaction to be confirmed
    await provider.waitForTransaction(deployTxHash);
  
    console.log("✅ Deployment completed.");
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  