
import Parser from 'rss-parser'

type LetterboxdFeed = {
  feedUrl: string
  paginationLinks: { self: string }
  link: string
  title: string
  description: string
}

type LetterboxdItem = {
  creator: string
  title: string
  link: string
  pubDate: string
  content: string
  contentSnippet: string
  guid: string
  isoDate: string
  'letterboxd:watchedDate': string
  'letterboxd:rewatch': string
  'letterboxd:filmTitle': string
  'letterboxd:filmYear': string
  'letterboxd:memberRating': string
  'tmdb:movieId': string
  'dc:creator': string
}

export const rssParser = new Parser<LetterboxdFeed, LetterboxdItem>({ customFields: { item: ['letterboxd:watchedDate', 'letterboxd:rewatch', 'letterboxd:filmTitle', 'letterboxd:filmYear', 'letterboxd:memberRating', 'tmdb:movieId', 'dc:creator'] } })
