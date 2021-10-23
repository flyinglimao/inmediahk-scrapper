const axios = require('axios')
const cheerio = require('cheerio')
const scrapper = require('./scrapper')
const ObjectsToCsv = require('objects-to-csv')
const fs = require('fs')
const path = require('path')

const roots = [
    'https://www.inmediahk.net/socialmovement', // 社運
]/*
    'https://www.inmediahk.net/taxonomy/term/5030', // 政經
    'https://www.inmediahk.net/community', // 社區
    'https://www.inmediahk.net/world', // 國際
    'https://www.inmediahk.net/conservation', // 保育
    'https://www.inmediahk.net/media', // 媒體
    'https://www.inmediahk.net/lifestyle', // 生活
    'https://www.inmediahk.net/animalrights', // 動物
    'https://www.inmediahk.net/culture', // 文藝
    'https://www.inmediahk.net/sports', // 體育
    'https://www.inmediahk.net/taxonomy/term/530876', // 社區報
]
//*/

function clear() {
    return new Promise((res, rej) => {
        fs.readdir('./working_folder', (err, files) => {
            if (err) throw err

            for (const file of files) {
                fs.unlinkSync(path.join('./working_folder', file))
            }
            res()
        })
    })
}

;(async () => {
    let pageIdx = 0
    while (pageIdx < 3) {
        for (let url of roots) {
            const $ = cheerio.load((await axios(`${url}?page=${pageIdx}`)).data);
            const articles = $('.region .article .article-image a').map((_, e) => $(e).attr('href')).toArray()
            const buf = []
            for (let article of articles) {
                try {
                    await clear();
                    console.log('Post start');
                    buf.push(await scrapper(article));
                    console.log('Post finish');
                } catch (_) {
                    console.log('break')
                }
            }
            new ObjectsToCsv(buf).toDisk('./result.csv', { append: true });
        }
        pageIdx++
    }
})()
setInterval(() => { }, 100000)