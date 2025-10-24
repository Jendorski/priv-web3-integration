/* eslint-disable no-useless-catch */
import { NextFunction, Request, Response } from 'express'

type ControllerInterface = (
  req: Request,
  res: Response,
  next?: NextFunction
) => unknown

const controllerWrapper =
  (controller: ControllerInterface) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(controller(req, res, next)).catch(next)

export default controllerWrapper
