import compression from 'compression'
import express, { Request, Response, Router } from 'express'
import serverless from 'serverless-http'
import { generateHTML, generateSVG } from '../../generator'

const app = express()
const router = Router()

// Middleware to set Cache-Control header to expire after 8 hours
app.use((req, res, next) => {
  res.set('Cache-Control', `public, max-age=${16 * 60 * 60}`)
  next()
})

app.use(compression())

// Endpoint to serve HTML content
router.get('/html/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params
  const htmlContent = await generateHTML(userId)
  res.setHeader('Content-Type', 'text/html')
  res.send(htmlContent)
});

// Endpoint to serve SVG content
router.get('/svg/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params
  const svgContent = await generateSVG(userId)
  res.setHeader('Content-Type', 'image/svg+xml')
  res.send(svgContent)
})

app.use('/api/', router)

export const handler = serverless(app)
