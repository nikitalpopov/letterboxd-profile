import compression from 'compression'
import express, { Request, Response, Router } from 'express'
import serverless from 'serverless-http'
import { generateHTML, generatePNG, generateSVG } from '../../generator'

const app = express()
const router = Router()

// Middleware to set Cache-Control header to expire after 8 hours
app.use((req, res, next) => {
  res.set('Cache-Control', `public, max-age=${16 * 60 * 60}`)
  next()
})

// Use compression only for text-based responses
router.use('/html/:userId', compression())
router.use('/svg/:userId', compression())

// Endpoint to serve HTML content
router.get('/html/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params

  let htmlContent: string | undefined
  try {
    htmlContent = await generateHTML(userId, 'rss')
  } catch (error) {
    if (error instanceof Error) {
      return void res.status(500).send(error.message)
    }
    return void res.status(500).send(error)
  }

  res.setHeader('Content-Type', 'text/html')
  res.send(htmlContent)
})

// Endpoint to serve SVG content
router.get('/svg/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params

  let svgContent: string | undefined
  try {
    svgContent = await generateSVG(userId, 'rss')
  } catch (error) {
    if (error instanceof Error) {
      return void res.status(500).send(error.message)
    }
    return void res.status(500).send(error)
  }

  res.setHeader('Content-Type', 'image/svg+xml')
  res.send(svgContent)
})

// Endpoint to serve PNG content
router.get('/png/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params

  let pngContent: Buffer | undefined
  try {
    pngContent = await generatePNG(userId, 'rss')
  } catch (error) {
    if (error instanceof Error) {
      return void res.status(500).send(error.message)
    }
    return void res.status(500).send(error)
  }

  res.setHeader('Content-Type', 'image/png')
  res.end(pngContent)
})

app.use('/api/', router)

export const handler = serverless(app, {
  binary: ['image/png'],
})
