import express, { json, urlencoded } from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import multer from 'multer'
import compression from 'compression'
import mongoSanitize from 'express-mongo-sanitize'
import dotenv from 'dotenv'
import router from './routes/priv'
dotenv.config()

export const server = express()

// Disable detailed errors
server.set('trust proxy', 1)
server.disable('x-powered-by')

server.use(compression())

server.use(mongoSanitize())

server.use(express.json())
server.use(morgan('tiny'))
server.use(express.static('public'))

const m = multer()

server.use(m.any())

server.use(
  json({
    limit: '50mb',
    verify(req, _, buf) {
      ;(req as unknown as { rawBody: Buffer }).rawBody = buf
    },
  })
)

server.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    originAgentCluster: false,
    referrerPolicy: {
      policy: 'no-referrer',
    },
    hsts: {
      maxAge: 7776000, //90 days
    },
    noSniff: false,
    frameguard: {
      action: 'deny',
    },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    ieNoOpen: false,
    xssFilter: true,
    hidePoweredBy: false,
    permittedCrossDomainPolicies: {
      permittedPolicies: 'none',
    },
  })
)
server.use(urlencoded({ extended: true }))

//Get back to this later
server.use(
  cors({
    origin: (origin, callback) => {
      if (process.env.ENV !== 'production') {
        callback(null, origin)
      }
      //When we go to prod, we will revisit this
      // else {
      //     const targetDomain = 'settle.com';
      //     const validDomain = isSubdomain(origin, targetDomain);
      //     if (validDomain) {
      //         callback(null, origin);
      //     } else {
      //         callback(null, false);
      //     }
      // }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: true,
    optionsSuccessStatus: 200,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
  })
)
server.options('*', cors())

server.use(router)

const port = process.env.PORT
const env = process.env.ENV
server.listen(port, function () {
  console.log(`app running on ${port} on ${env}`)
})

process.on('uncaughtException', (err) => {
  console.warn('Uncaught Exception!! Shutting down process..')
  console.error(err.stack)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.warn('Unhandled Rejection!! ' + err)
  console.error(String(err))
})

process.on('SIGINT', () => {
  console.info(
    'Received SIGINT. Terminating Server. \n Press Control-D to exit.'
  )
  process.exit()
})

process.on('exit', (code) => {
  console.error('Server Terminated: ', code)
})
