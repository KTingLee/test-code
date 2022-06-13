import os from 'os'

;(async () => {
  await sleep(2000)
  console.log(os.platform)
})

function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}