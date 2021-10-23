const axios = require('axios')
const cheerio = require('cheerio')
const Downloader = require('nodejs-file-downloader')
const fs = require('fs')
const ipfsGo = require('./ipfs_util')

function formatDate(dateText) {
    dateText = dateText.substr(3) // 移除週O
    return dateText.replace(/-/g, '')
}

module.exports = async function scrapper(url) {
    const res = await axios.get(url)
    const $ = cheerio.load(res.data)
    
    // Elements
    const title = $('h1.title').text()
    const heroImage = $('.post-content img.post-img').attr('data-src768') || $('.post-content img.post-img').attr('src')
    const date = formatDate($('.post-meta .date').text())
    const publisher = $('.post-meta .author').text()

    // Download hero
    const heroImgPath = 'hero' + heroImage.substring(heroImage.lastIndexOf('.'), heroImage.lastIndexOf('?'))
    let downloader = new Downloader({
        url: new URL(heroImage, url).href,
        directory: './working_folder',
        filename: heroImgPath
    })
    await downloader.download()

    // Process Imgs
    const imgs = $('.post-desc img')
    await Promise.all(imgs.map(async (idx, elem) => {
        const $elem = $(elem)
        const imgUrl = new URL($elem.attr('src'), url)
        let filename = `${idx}${imgUrl.pathname.substr(imgUrl.pathname.lastIndexOf('.'))}`
        const downloader = new Downloader({
            url: imgUrl.href,
            directory: './working_folder',
            filename: filename,
        })
        $elem.attr('src', `./${filename}`)
        await downloader.download()
    }))

    const restructured = `
        <html>
        <head>
        <title>${title.replace(/<[^>]*?>/g, ' ')}</title>
        <meta charset="utf-8">
        </head>
        <body>
        <h1>${title}</h1>
        <img src="./${heroImgPath}" />
        ${$('.post-desc').html()}
        </body>
        </html>
    `

    await new Promise(res => {
        fs.writeFile('./working_folder/index.html', restructured, () => { res() })
    })
    const hash = await ipfsGo()
    return {
        type: 'Article',
        datePublished: date,
        author: publisher,
        publisher,
        name: title,
        headline: title,
        url: `https://ipfs.io/ipfs/${hash}`,
        ipfsHash: hash,
        text: ''
    }
}