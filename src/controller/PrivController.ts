import { Request, Response } from 'express'
import {
  getWalletBalance,
  IAsset,
  IChain,
  sendPrivTransaction,
  setupWallet,
  signPrivMessage,
} from '../services/priv'

export class PrivController {
  static readonly createWallet = async (req: Request, res: Response) => {
    const resp = await setupWallet()

    res.status(200).json({ wallet: resp })
  }

  static readonly signMessage = async (req: Request, res: Response) => {
    const { walletId } = req.body

    const resp = await signPrivMessage(walletId)

    res.status(200).json({ message: resp })
  }

  static readonly sendTransaction = async (req: Request, res: Response) => {
    const { walletId, value, recipientAddress } = req.body

    const resp = await sendPrivTransaction({
      walletId,
      value,
      recipientAddress,
    })

    res.status(200).json({ transaction: resp })
  }

  static readonly fetchWalletBalance = async (req: Request, res: Response) => {
    const { walletId, asset, chain } = req.query

    const resp = await getWalletBalance({
      walletId: walletId as string,
      assets: asset as IAsset,
      chain: chain as IChain,
    })

    res.status(200).json({ resp })
  }
}
