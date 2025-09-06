#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const url = require('url')
const { chromium } = require('playwright')

const htmlToPDF = async (htmlPath, options) => {
  if (!htmlPath.endsWith('.html')) {
    throw new Error(`Input file must have the '.html' extension: ${htmlPath}`)
  }
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Input file does not exist: ${htmlPath}`)
  }
  const outputPath = htmlPath.replace(/\.html$/, '.pdf')
  if (!options.force && fs.existsSync(outputPath)) {
    throw new Error(`Output file already exists: ${outputPath}`)
  }

  const browser = await chromium.launch({ channel: 'chrome' })
  const page = await browser.newPage()

  const htmlPathURL = url.pathToFileURL(htmlPath).toString()

  console.log(`Processing ${htmlPathURL}...`)
  await page.goto(htmlPathURL, { waitUntil: 'load' })

  await page.pdf({
    path: outputPath,
    format: 'A4',
    landscape: true,
    margin: { top: '0cm', bottom: '0cm', left: '0cm', right: '0cm' },
  })
  await browser.close()
}

const args = process.argv.slice(2)
const options = {}
while (args?.[0].startsWith('-')) {
  const arg = args.shift()
  if (arg === '--force' || arg === '-f') options.force = true
  else throw new Error(`Unknown argument: ${arg}`)
}

if (args.length !== 1) {
  process.stderr.write('Usage: html-to-pdf.js [--force] <input-file.html>\n')
  process.exit(1)
}

htmlToPDF(args[0], options).catch(e => {
  process.stderr.write(`${e.stack}\n`)
  process.exit(1)
})
