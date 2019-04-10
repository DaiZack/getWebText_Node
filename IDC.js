const csv = require('fast-csv')
const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
require('events').EventEmitter.defaultMaxListeners = Infinity;

function get_links(url) {
    return new Promise(resolve => {
        request.get({ url: url, followAllRedirects: true }, (err, res, body) => {
            if (err) { console.log('err', url) } else {
                var $ = cheerio.load(body)
                let links = []
                $('a').each((i, a) => {
                    href = $(a).attr('href')
                    if (href) {
                        if (href.startsWith(url)) {
                            links.push(href)
                        } else {
                            if (!href.startsWith('http')) {
                                match = href.match(/\w/)
                                findex = href.indexOf(match)
                                href = href.substring(findex, href.length)
                                href = url + '/' + href
                                links.push(href)
                            }
                        }
                    }
                })
                return resolve(links)
            }
        })
    })
}

function get_text(url) {
    return new Promise(resolve => {
        request.get({ url: url, followAllRedirects: true }, (err, res, body) => {
            if (err) { console.log('err', url) } else {
                if(res.statusCode===200){
                    var $ = cheerio.load(body)
                    drop_tag = ['style', 'script', 'footer', 'header', 'head', 'title', 'meta', '[document]']
                    for (tag in drop_tag) {
                        $(tag).remove()
                    }
                    var text = $('body').text();
                    text = text.replace(/[\n\r\s\|]+/g, ' ')
                    return resolve(text)
                }    
            }
        })
    })
}


async function get_pages(url) {
        var links = await get_links(url);
        links.push(url);
        var promises = links.map(get_text)
        var texts = await Promise.all(promises)
        texts = [...new Set(texts)]
        ntexts = texts.join(' ').replace(/[\n\s\r\|]+/g, ' ')
        if(ntexts.length>200){
            fs.writeFileSync('result/'+url.replace('http://www.', '')+'..json',JSON.stringify({ webset: url.replace('http://www.', ''), WebText: ntexts }))
        }
    }

csv.fromPath("O:\\rel8edto\\DataC\\IDC\\list.csv", { headers: true })
    .on("data", data => {
        url = 'http://www.' + data.Website
        console.log(url)
        get_pages(url)
    })


// function allpages(){
//     let urls=[]
//     csv.fromPath("O:\\rel8edto\\DataC\\IDC\\list.csv", { headers: true })
//         .on("data", data => {
//             url = 'http://www.' + data.Website
//             urls.push(url)
//         })
//         .on('end',()=>{ 
//             urls.map(get_pages);
//         })
// }

// allpages()
