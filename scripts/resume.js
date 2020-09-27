// const markdown = require('markdown-it')
const nodePath = require('path')
// const fs = require('fs')
// const marked =  require("hexo-renderer-marked")
const hexoFs = require('hexo-fs')
const ejs = require('ejs')

// const Hexo = require('hexo');

// const sorceFile = path.resolve(__dirname, '../source/others/resume.md')

// const md = markdown({ html: true })
// const html = md.render(fs.readFileSync(sorceFile, { encoding: 'utf-8' }))

// const htmlContent = `<html class=""><head><meta name="generator" content="Hexo 3.9.0">
// <meta charset="utf-8">

// <title>奔跑的蜗牛</title>
// <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
// <meta name="description" content="前端开发工程师">
// <meta name="keywords" content="React、node、css3、html5">
// <meta property="og:type" content="website">
// <meta property="og:title" content="奔跑的蜗牛">
// <meta property="og:url" content="http://yoursite.com/index.html">
// <meta property="og:site_name" content="奔跑的蜗牛">
// <meta property="og:description" content="前端开发工程师">
// <meta property="og:locale" content="zh_CN">
// <meta name="twitter:card" content="summary">
// <meta name="twitter:title" content="奔跑的蜗牛">
// <meta name="twitter:description" content="前端开发工程师">

//   <link rel="icon" href="0001.jpg#/favicon.png">

//   <link href="//fonts.googleapis.com/css?family=Source+Code+Pro" rel="stylesheet" type="text/css">

// <link rel="stylesheet" href="/images/css/markdown.css">

// <style type="text/css">.fancybox-margin{margin-right:17px;}</style></head>
// <body style="">
// ${html}
// </body></html>`

// // console.log('htmlContent', htmlContent)
// fs.writeFileSync(path.resolve(__dirname, '../public/resume.html'), htmlContent)
if (typeof hexo !== 'undefined' && hexo) {
  // hexo.once('generateBefore', () => {
  //   const pages = hexo.locals.get('pages')
  //   // hexo.theme.setView(
  //   //   '../../custom/layout/resume.ejs',
  //   //   hexoFs.readFileSync(
  //   //     nodePath.resolve(__dirname, '../themes/custom/layout/resume.ejs'),
  //   //     { encoding: 'utf-8' },
  //   //   ),
  //   // )
  //   // hexo.locals.set.sidebar = false
  //   console.log(
  //     'hexo.theme.config',
  //     // hexo.theme,
  //     pages.data.filter((item) => /others/.test(item.path)).length,
  //   )
  //   hexo.locals.set('pages', () => {
  //     const data = pages.data.filter((item) => !/others/.test(item.path))
  //     return data
  //   })
  // })

  // hexo.source.addProcessor(/others\/resume/, (file) => {
  //   const others = hexo.locals.get('others') || []
  //   const { source } = file

  //   // console.log('source', source)
  //   const content = hexoFs.readFileSync(source, { encoding: 'utf-8' })
  //   hexo.locals.set('others', () => {
  //     others.push({ ...file, content })
  //     return others
  //   })
  // })

  hexo.extend.generator.register('resume', function (locals) {
    return locals.pages.map((item) => {
      if (/resume/.test(item.path)) {
        return {
          path: 'others/resume.html',
          data: item,
          layout: 'resume',
        }
      } else {
        return {
          path: item.path,
          data: item,
          layout: 'page',
        }
      }
    })
  })

  hexo.extend.renderer.register(
    'ejs',
    'html',
    function (data, options) {
      const { path } = data
      const { filename } = options
      if (
        (path && /resume/.test(path)) ||
        (filename && /resume/.test(filename))
      ) {
        options.filename = data.path

        const realOptions = {
          ...options,
          theme: { ...options.theme, sidebar: '' },
        }
        return ejs.render(data.text, realOptions)
      }
      return ejs.render(data.text, options)
    },
    true,
  )
}
