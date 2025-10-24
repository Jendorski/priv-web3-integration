import { PrivyClient, APIError, PrivyAPIError } from '@privy-io/node'
import web3 from 'web3'
import dotenv from 'dotenv'
dotenv.config()

const appId = process.env.PRIV_APP_ID
const appSecret = process.env.PRIV_APP_SECRET

const privy = new PrivyClient({
  appId: appId as string,
  appSecret: appSecret as string,
})

export type IAsset =
  | 'usdc'
  | 'eth'
  | 'pol'
  | 'usdt'
  | 'sol'
  | Array<'usdc' | 'eth' | 'pol' | 'usdt' | 'sol'>

export type IChain =
  | 'ethereum'
  | 'arbitrum'
  | 'base'
  | 'linea'
  | 'optimism'
  | 'polygon'
  | 'solana'
  | 'zksync_era'
  | 'sepolia'
  | 'arbitrum_sepolia'
  | 'base_sepolia'
  | 'linea_testnet'
  | 'optimism_sepolia'
  | 'polygon_amoy'
  | Array<
      | 'ethereum'
      | 'arbitrum'
      | 'base'
      | 'linea'
      | 'optimism'
      | 'polygon'
      | 'solana'
      | 'zksync_era'
      | 'sepolia'
      | 'arbitrum_sepolia'
      | 'base_sepolia'
      | 'linea_testnet'
      | 'optimism_sepolia'
      | 'polygon_amoy'
    >

export const getWalletBalance = async (props: {
  walletId: string
  assets: IAsset
  chain: IChain
}) => {
  const { walletId, assets, chain } = props
  try {
    const balance = await privy
      .wallets()
      .balance.get(walletId, { asset: assets, chain })
    console.log({ balance })
    return balance
  } catch (error) {
    if (error instanceof APIError) {
      // When the library is unable to connect to the API,
      // or if the API returns a non-success status code (i.e., 4xx or 5xx response),
      // a subclass of `APIError` will be thrown:
      console.log(error.status) // 400
      console.log(error.name) // BadRequestError
    } else if (error instanceof PrivyAPIError) {
      // Other errors from the Privy SDK all subclass `PrivyAPIError`.
      console.log(error.message)
      throw error
    } else {
      // This error is not related to the Privy SDK.
      throw error
    }
  }
}

export const setupWallet = async () => {
  console.log({ appId, appSecret })
  try {
    const createdWallet = await privy
      .wallets()
      .create({ chain_type: 'ethereum' })
    console.log({ createdWallet })
    return createdWallet.id
  } catch (error) {
    if (error instanceof APIError) {
      // When the library is unable to connect to the API,
      // or if the API returns a non-success status code (i.e., 4xx or 5xx response),
      // a subclass of `APIError` will be thrown:
      console.log(error.status) // 400
      console.log(error.name) // BadRequestError
    } else if (error instanceof PrivyAPIError) {
      // Other errors from the Privy SDK all subclass `PrivyAPIError`.
      console.log(error.message)
      throw error
    } else {
      // This error is not related to the Privy SDK.
      throw error
    }
  }
}

export const signPrivMessage = async (walletId: string) => {
  try {
    const message = 'Hello, Privy!'

    const response = await privy
      .wallets()
      .ethereum()
      .signMessage(walletId, { message })
    // Signature is hex-encoded for Ethereum
    const signature = response.signature
    console.log({ signature })

    return signature
  } catch (error) {
    if (error instanceof APIError) {
      console.log(error.status, error.name)
    } else if (error instanceof PrivyAPIError) {
      console.log(error.message)
    } else {
      throw error
    }
  }
}

export const sendPrivTransaction = async (props: {
  walletId: string
  recipientAddress: string
  value: string | number
}) => {
  const { walletId, recipientAddress, value } = props
  try {
    const caip2 = 'eip155:84532' //Base Sepolia testnet
    //'eip155:11155111' // Sepolia testnet

    const balance = await getWalletBalance({
      walletId,
      assets: 'eth',
      chain: 'base_sepolia',
    })
    console.log({ balance: { ...balance } })

    const toStr = String(value)

    const toHex = web3.utils.toWei(toStr, 'ether')
    console.log({ toHex })

    const response = await privy
      .wallets()
      .ethereum()
      .sendTransaction(walletId, {
        caip2,
        params: {
          transaction: {
            to: recipientAddress,
            value: `0x${toHex}`, //: '0x1', // 1 wei
            chain_id: 84532, // 11_155_111, // Sepolia testnet
          },
        },
      })
    console.log({ response })
    const transactionHash = response.hash
    console.log({ transactionHash })

    return response
  } catch (error) {
    if (error instanceof APIError) {
      console.log(error.status, error.name)
      throw error
    } else if (error instanceof PrivyAPIError) {
      console.log(error.message)
      throw error
    } else {
      throw error
    }
  }
}
