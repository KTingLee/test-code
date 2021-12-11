const fs = require('fs')
const imgPath = './Jojo.jpeg'

// readFileSync 本身就能轉成 base64
const base64ImgByFs = fs.readFileSync(imgPath, 'base64')  

// 利用 readFileSync 讀取圖片(binary格式)，並以 Buffer 轉成 base64 格式
const image = fs.readFileSync(imgPath)
const base64ImgByBuffer = Buffer.from(image, 'binary').toString('base64')

// 比較結果是否一致
console.log(base64ImgByFs === base64ImgByBuffer)

// 將 base64 轉回成 binary 格式，並輸出結果
const output = Buffer.from(base64ImgByFs, 'base64')
fs.writeFileSync('./output.jpeg', output)