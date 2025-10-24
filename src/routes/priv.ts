import { Router } from 'express'
import controllerWrapper from '../services/controllerWrapper'
import { PrivController } from '../controller/PrivController'

const router = Router()

router.get('/wallet', controllerWrapper(PrivController.createWallet))
router.get(
  '/wallet/balance',
  controllerWrapper(PrivController.fetchWalletBalance)
)
router.post('/wallet/sign', controllerWrapper(PrivController.signMessage))
router.post('/wallet/send', controllerWrapper(PrivController.sendTransaction))

export default router
