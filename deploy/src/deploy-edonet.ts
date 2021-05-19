import { ContractOriginationResult, initConseil, loadContract, deployContract, sendOperation } from './utils'
import { initOracleLib, Utils } from '@tacoinfra/harbinger-lib'
import { KeyStore, TezosNodeReader } from 'conseiljs'

const CONTRACTS = {
  TEST: {
    // Kolibri Contracts
    DEVELOPER_FUND: 'KT1UdVpxcdTF9RNF9qC6DGu3XF56vc3ciabk',
    MINTER: 'KT1FrAHTBboRCPh2osRP4ThNdEQRzgkqAd79',
    ORACLE: 'KT1X3Grb3j6xVD2yejdbHnVTWRE4NA2tyszM',
    OVEN_FACTORY: 'KT1VTHtbpktrybvERKN8jbAcMUXXZRfvZ5Sd',
    OVEN_PROXY: 'KT194yN9aZeUuC1YMhyCA2KcXNiSbRQL7Pqr',
    OVEN_REGISTRY: 'KT19NJHDViPacRfJkWjgK3pWPG4xiyamQ6Ht',
    STABILITY_FUND: 'KT1AcdJjeG96zGTVfAKswKzrJBdTRwV9Ca5Y',
    TOKEN: 'KT1WchDzW7rzdAf2TBfQfTgvabLKSn2XJtkb',

    // Liquidity Pool
    LIQUIDITY_POOL: 'KT1VLkQDbKg6sfz1M5p33grRFUbC3B76tUtt',

    // Murmuration Contracts
    COMMUNITY_FUND: 'KT1KrUuPe5RMZjHWg4tow8Un6ppsW4gHgGuC',
    VESTING_VAULTS: ['KT1S56jqhZePm4GCRcvv1hBwTGFbLK8EPJAj', 'KT19ouGreMy6Gfo1beq77RP8d1nh31RxdBGM', 'KT1VdJuWV1jsYKTyKsvr2GifmYmQphwAFJvG'],
  }
}

const daoAddress = 'KT1WebnFBXa33G3AoA5zC7eMyJjmuFJqCCCb'


// Load secret key
const privateKeyName = 'BREAK_GLASS_SK'
const privateKey = process.env[privateKeyName]

const logLevel = 'info'
const nodeUrl = "https://rpctest.tzbeta.net"

const deployBreakGlass = async (
  targetAddress: string,
  daoAddress: string,
  multisigAddress: string,
  breakGlassContract: string,
  keystore: KeyStore,
  counter: number,
  nodeAddress: string
): Promise<ContractOriginationResult> => {
  const storage = `(Pair "${daoAddress}" (Pair "${multisigAddress}" "${targetAddress}"))`
  const deployResult = await deployContract(
    breakGlassContract,
    storage,
    keystore,
    counter,
    nodeAddress,
  )
  console.log('')

  return deployResult
}

const deploy = async (): Promise<void> => {
  console.log('------------------------------------------------------')
  console.log('> Deploying Break Glass Infrastructure')
  console.log('>> Running Pre Flight Checks...')
  console.log('------------------------------------------------------')

  console.log('>>> [1/6] Loading Deployer Key')
  if (privateKey === undefined) {
    console.log('Fatal: No deployer private key defined.')
    console.log(`Set a ${privateKeyName} environment variable..`)
    return
  }
  console.log('Loaded.')
  console.log('')

  console.log('>>> [2/6] Input params:')
  console.log(`Tezos Node: ${nodeUrl}`)
  console.log('')

  console.log(
    `>>> [3/6] Initializing Conseil with logging level: ${logLevel}`,
  )
  initConseil(logLevel)
  initOracleLib(logLevel)
  console.log('Conseil initialized.')
  console.log('')

  console.log('>>> [4/6] Initializing Deployer')
  const keystore = await Utils.keyStoreFromPrivateKey(privateKey)
  await Utils.revealAccountIfNeeded(
    nodeUrl,
    keystore,
    await Utils.signerFromKeyStore(keystore),
  )
  console.log(`Initialized deployer: ${keystore.publicKeyHash}`)
  console.log('')

  console.log('>>> [5/6] Loading contracts...')
  const breakGlassContract = loadContract(
    `${__dirname}/../../smart_contracts/break-glass.tz`,
  )
  const liquidityPoolBreakGlassContract = loadContract(
    `${__dirname}/../../smart_contracts/liquidity-pool-break-glass.tz`,
  )
  const minterBreakGlassContract = loadContract(
    `${__dirname}/../../smart_contracts/minter-break-glass.tz`,
  )

  console.log('Contracts loaded.')
  console.log('')

  console.log('>>> [6/6] Getting Account Counter')
  let counter = await TezosNodeReader.getCounterForAccount(
    nodeUrl,
    keystore.publicKeyHash,
  )
  console.log(`Got counter: ${counter}`)
  console.log('')

  console.log('------------------------------------------------------')
  console.log('>> Preflight Checks Passed!')
  console.log('>> Deploying Contracts...')
  console.log('------------------------------------------------------')
  console.log('')

  const multisigAddress = keystore.publicKeyHash

  console.log('>>> [1/11] Deploying Break Glass for Developer Fund')
  counter++
  const developerFundDeployResult = await deployBreakGlass(CONTRACTS.TEST.DEVELOPER_FUND, daoAddress, multisigAddress, breakGlassContract, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [2/11] Deploying Break Glass for Oracle')
  counter++
  const oracleDeployResult = await deployBreakGlass(CONTRACTS.TEST.ORACLE, daoAddress, multisigAddress, breakGlassContract, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [3/11] Deploying Break Glass for Oven Factory')
  counter++
  const ovenFactoryDeployResult = await deployBreakGlass(CONTRACTS.TEST.OVEN_FACTORY, daoAddress, multisigAddress, breakGlassContract, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [4/11] Deploying Break Glass for Oven Proxy')
  counter++
  const ovenProxyDeployResult = await deployBreakGlass(CONTRACTS.TEST.OVEN_PROXY, daoAddress, multisigAddress, breakGlassContract, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [5/11] Deploying Break Glass for Oven Registry')
  counter++
  const ovenRegistryDeployResult = await deployBreakGlass(CONTRACTS.TEST.OVEN_REGISTRY, daoAddress, multisigAddress, breakGlassContract, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [6/11] Deploying Break Glass for Stability Fund')
  counter++
  const stabilityFundDeployResult = await deployBreakGlass(CONTRACTS.TEST.STABILITY_FUND, daoAddress, multisigAddress, breakGlassContract, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [7/11] Deploying Break Glass for Token')
  counter++
  const tokenDeployResult = await deployBreakGlass(CONTRACTS.TEST.TOKEN, daoAddress, multisigAddress, breakGlassContract, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [8/11] Deploying Break Glass for Liquidity POol')
  counter++
  const liquidityPoolResult = await deployBreakGlass(CONTRACTS.TEST.LIQUIDITY_POOL, daoAddress, multisigAddress, liquidityPoolBreakGlassContract, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [9/11] Deploying Break Glass for Community Fund')
  counter++
  const communityFundResult = await deployBreakGlass(CONTRACTS.TEST.COMMUNITY_FUND, daoAddress, multisigAddress, breakGlassContract, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [10/11] Deploying Break Glass for Vesting Contracts')
  const vestingResults: Array<string> = []
  for (var i = 0; i < CONTRACTS.TEST.VESTING_VAULTS.length; i++) {
    const vestingContract = CONTRACTS.TEST.VESTING_VAULTS[i]

    counter++
    const vestingResult = await deployBreakGlass(vestingContract, daoAddress, multisigAddress, breakGlassContract, keystore, counter, nodeUrl)
    vestingResults.push(vestingResult.contractAddress)
  }
  console.log('')

  console.log('>>> [11/11] Deploying Break Glass for Minter')
  counter++
  const minterBreakGlassStorage = `(Pair "${daoAddress}" (Pair "${multisigAddress}" "${CONTRACTS.TEST.MINTER}"))`
  const minterBreakGlassDeployResult = await deployContract(
    minterBreakGlassContract,
    minterBreakGlassStorage,
    keystore,
    counter,
    nodeUrl,
  )
  console.log('')

  console.log('------------------------------------------------------')
  console.log('>> Deploy Complete!')
  console.log('>> Wiring break glasses as governors...')
  console.log('------------------------------------------------------')
  console.log('')

  console.log('>>> [1/11] Setting Governor for Developer Fund')
  counter++
  await sendOperation(CONTRACTS.TEST.DEVELOPER_FUND, 'setGovernorContract', `"${developerFundDeployResult.contractAddress}"`, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [2/11] Setting Governor for Oracle')
  counter++
  await sendOperation(CONTRACTS.TEST.ORACLE, 'setGovernorContract', `"${oracleDeployResult.contractAddress}"`, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [3/11] Setting Governor for Oven Factory')
  counter++
  await sendOperation(CONTRACTS.TEST.OVEN_FACTORY, 'setGovernorContract', `"${ovenFactoryDeployResult.contractAddress}"`, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [4/11] Setting Governor for Oven Proxy')
  counter++
  await sendOperation(CONTRACTS.TEST.OVEN_PROXY, 'setGovernorContract', `"${ovenProxyDeployResult.contractAddress}"`, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [5/11] Setting Governor for Oven Registry')
  counter++
  await sendOperation(CONTRACTS.TEST.OVEN_REGISTRY, 'setGovernorContract', `"${ovenRegistryDeployResult.contractAddress}"`, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [6/11] Setting Governor for Stability Fund')
  counter++
  await sendOperation(CONTRACTS.TEST.STABILITY_FUND, 'setGovernorContract', `"${stabilityFundDeployResult.contractAddress}"`, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [7/11] Setting Governor for Token')
  counter++
  await sendOperation(CONTRACTS.TEST.TOKEN, 'setGovernorContract', `"${tokenDeployResult.contractAddress}"`, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [8/11] Setting Governor for Liquidity Pool')
  counter++
  await sendOperation(CONTRACTS.TEST.LIQUIDITY_POOL, 'updateGovernorAddress', `"${liquidityPoolResult.contractAddress}"`, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [9/11] Setting Governor for Community Fund')
  counter++
  await sendOperation(CONTRACTS.TEST.COMMUNITY_FUND, 'setGovernorContract', `"${communityFundResult.contractAddress}"`, keystore, counter, nodeUrl)
  console.log('')

  console.log('>>> [10/11] Setting Governor for Vesting Contracts')
  for (var i = 0; i < CONTRACTS.TEST.VESTING_VAULTS.length; i++) {
    const vestingContract = CONTRACTS.TEST.VESTING_VAULTS[i]
    const vestingResult = vestingResults[i]

    counter++
    await sendOperation(vestingContract, 'setGovernorContract', `"${vestingResult}"`, keystore, counter, nodeUrl)
  }
  console.log('')

  console.log('>>> [11/11] Setting Governor for Minter')
  counter++
  const minterParamStorage = `Pair "${minterBreakGlassDeployResult.contractAddress}" ("${CONTRACTS.TEST.TOKEN}" ("${CONTRACTS.TEST.OVEN_PROXY}" ("${CONTRACTS.TEST.STABILITY_FUND}" "${CONTRACTS.TEST.DEVELOPER_FUND}")))`
  await sendOperation(CONTRACTS.TEST.MINTER, 'updateContracts', minterParamStorage, keystore, counter, nodeUrl)
  console.log('')

  console.log('------------------------------------------------------')
  console.log('>> Wiring Complete!')
  console.log('>> Breaking Glass...')
  console.log('------------------------------------------------------')
  console.log('')

  const interestingHashes: Array<string> = []

  console.log('>>> [1/11] Breaking Glass for Developer Fund')
  counter++
  interestingHashes.push(await sendOperation(developerFundDeployResult.contractAddress, 'breakGlass', `"${multisigAddress}"`, keystore, counter, nodeUrl))
  console.log('')

  console.log('>>> [2/11] Breaking Glass for Oracle')
  counter++
  interestingHashes.push(await sendOperation(oracleDeployResult.contractAddress, 'breakGlass', `"${multisigAddress}"`, keystore, counter, nodeUrl))
  console.log('')

  console.log('>>> [3/11] Breaking Glass for Oven Factory')
  counter++
  interestingHashes.push(await sendOperation(ovenFactoryDeployResult.contractAddress, 'breakGlass', `"${multisigAddress}"`, keystore, counter, nodeUrl))
  console.log('')

  console.log('>>> [4/11] Breaking Glass for Oven Proxy')
  counter++
  interestingHashes.push(await sendOperation(ovenProxyDeployResult.contractAddress, 'breakGlass', `"${multisigAddress}"`, keystore, counter, nodeUrl))
  console.log('')

  console.log('>>> [5/11] Breaking Glass for Oven Registry')
  counter++
  interestingHashes.push(await sendOperation(ovenRegistryDeployResult.contractAddress, 'breakGlass', `"${multisigAddress}"`, keystore, counter, nodeUrl))
  console.log('')

  console.log('>>> [6/11] Breaking Glass for Stability Fund')
  counter++
  interestingHashes.push(await sendOperation(stabilityFundDeployResult.contractAddress, 'breakGlass', `"${multisigAddress}"`, keystore, counter, nodeUrl))
  console.log('')

  console.log('>>> [7/11] Breaking Glass for Token')
  counter++
  interestingHashes.push(await sendOperation(tokenDeployResult.contractAddress, 'breakGlass', `"${multisigAddress}"`, keystore, counter, nodeUrl))
  console.log('')

  console.log('>>> [8/11] Breaking Glass for Liquidity Pool')
  counter++
  interestingHashes.push(await sendOperation(liquidityPoolResult.contractAddress, 'breakGlass', `"${multisigAddress}"`, keystore, counter, nodeUrl))
  console.log('')

  console.log('>>> [9/11] Breaking Glass for Community Fund')
  counter++
  interestingHashes.push(await sendOperation(communityFundResult.contractAddress, 'breakGlass', `"${multisigAddress}"`, keystore, counter, nodeUrl))
  console.log('')

  console.log('>>> [10/11] Breaking Glass for Vesting Contracts')
  for (var i = 0; i < CONTRACTS.TEST.VESTING_VAULTS.length; i++) {
    const vestingBreakGlass = vestingResults[i]

    counter++
    interestingHashes.push(await sendOperation(vestingBreakGlass, 'breakGlass', `"${multisigAddress}"`, keystore, counter, nodeUrl))
  }
  console.log('')

  console.log('>>> [11/11] Breaking Glass for Minter')
  counter++
  const minterBreakGlassParam = `Pair "${multisigAddress}" (Pair "${CONTRACTS.TEST.TOKEN}" (Pair "${CONTRACTS.TEST.OVEN_PROXY}" (Pair "${CONTRACTS.TEST.STABILITY_FUND}" "${CONTRACTS.TEST.DEVELOPER_FUND}")))`
  interestingHashes.push(await sendOperation(minterBreakGlassDeployResult.contractAddress, "breakGlass", minterBreakGlassParam, keystore, counter, nodeUrl))
  console.log('')

  console.log('------------------------------------------------------')
  console.log('> Success!')
  console.log('------------------------------------------------------')
  console.log('')

  console.log('> Break Glass Hashes')
  console.log(JSON.stringify(interestingHashes))
  console.log('')
}

deploy()
