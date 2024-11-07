import fs from 'fs'
import { minify } from 'html-minifier-terser'
import { JSDOM } from 'jsdom'
import posthtml from 'posthtml'
import inlineAssets from 'posthtml-inline-assets'
import satori from 'satori'
import { html } from 'satori-html'

async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Failed to fetch HTML data: ${response.statusText}`)
  }
  return response.text()
}

function parseHTML(htmlString: string): Document {
  const { window } = new JSDOM()
  const parser = new window.DOMParser()
  return parser.parseFromString(htmlString, 'text/html')
}

async function processHTML(htmlDocument: Document): Promise<string> {
  const data = htmlDocument.getElementById('diary-table')
  const rows = Array.from(data?.querySelectorAll('tbody > tr.diary-entry-row') || []).slice(0, 4)
  const result = (await Promise.all(rows.map(async r => {
    const filmDetails = r.querySelector('td.td-film-details')

    let poster = ''
    let hint = filmDetails?.querySelector('img.image') || null
    if (hint) {
      const posterDetails = filmDetails?.querySelector('div.linked-film-poster')
      const filmSlug = posterDetails?.getAttribute('data-film-slug')
      const posterId = posterDetails?.getAttribute('data-cache-busting-key')
      const preview = await fetch(`https://letterboxd.com/ajax/poster/film/${filmSlug}/std/35x52/?k=${posterId}`, { cache: "no-store" }).then(r => r.text()).then(t => parseHTML(t))
      poster = preview?.querySelector('img.image')?.outerHTML || ''
    }

    const movieTitle = filmDetails?.querySelector('a')
    movieTitle?.setAttribute('href', 'https://letterboxd.com' + movieTitle?.getAttribute('href'))
    movieTitle?.classList.add('movie-title')
    const name = movieTitle?.outerHTML || ''

    const releaseYear = `<span class="release-year">${r.querySelector('td.td-released')?.textContent || ''}</span>`

    const rating = `<span class="rating">${r.querySelector('td.td-rating span.rating')?.textContent || ''}</span>`
    return { name, releaseYear, poster, rating }
  }))).map(({ name, releaseYear, poster, rating }) =>
    `<div class="movie">
      ${poster}
      <div class="movie-details">
        ${name}
        ${releaseYear}
        ${rating}
      </div>
    </div>`
  ).join('')

  return `${result}`
}

function applyBody({ body }: { body: string }) {
  const doc = fs.readFileSync('index.html', 'utf8')

  return doc.replace('<!-- content -->', body)
}

async function fetchData(url: string): Promise<string> {
  try {
    const response = await fetchHTML(url)
    const diaryData = parseHTML(response)
    const body = await processHTML(diaryData)
    return applyBody({ body })
  } catch (error) {
    console.error('Error fetching data:', error)
    return ''
  }
}

export async function generateHTML(userId: string): Promise<string | undefined> {
  return fetchData(`https://letterboxd.com/${userId}/films/diary/`).then(async htmlString => {
    const processed = posthtml([
      inlineAssets(),
    ])
      .process(htmlString)

    try {
      return await processed.then(({ html: htmlString }) => {
        // Minify the inlined HTML
        return minify(htmlString, {
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
          removeComments: true,
        })
      }).then((minifiedHtml: string) => {
        // Write the output
        // fs.writeFileSync('./example.html', minifiedHtml)
        console.log('HTML inlined and minified successfully!')

        return minifiedHtml
      })
    } catch (error) {
      console.error('Error processing HTML:', error)
    }
  })
}

export async function generateSVG(userId: string): Promise<string | undefined> {
  return await generateHTML(userId).then(async (htmlString?: string) => {
    if (!htmlString) throw new Error('No HTML provided')
    return htmlString.replaceAll('★', '*').replace('<title>letterboxd profile</title>', '')
  }).then(async (htmlString: string) => {
    let fontData: ArrayBuffer
    try {
      fontData = await fetch('https://8font.com/wp-content/uploads/2023/10/TiemposText-Semibold.ttf').then(r => r.arrayBuffer())
    } catch {
      fontData = await fetch('https://github.com/google/fonts/blob/main/ofl/cantataone/CantataOne-Regular.ttf').then(r => r.arrayBuffer())
    }

    return satori(html(htmlString), {
      width: 854,
      height: 160,
      fonts: [
        {
          name: 'TiemposText-Semibold',
          // Use `fs` (Node.js only) or `fetch` to read the font as Buffer/ArrayBuffer and provide `data` here.
          // data: fs.readFileSync(path.join(__dirname, '/assets/TiemposText-Semibold.ttf')),
          data: fontData,
          weight: 600,
          style: 'normal',
        },
      ], })
  }).then((svg: string) => {
    // fs.writeFileSync('./example.svg', svg)
    console.log('SVG generated successfully!')
    return svg
  })
}

generateSVG('nikitalpopov')