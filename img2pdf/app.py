import os
import math
from PIL import Image

def verticalComb (imgs):
  # 計算底圖大小
  maxWidth = 0
  totalHeight = 0
  for img in imgs:
    width, height = img.size
    totalHeight += height
    if width > maxWidth:
      maxWidth = width
  ret = Image.new('RGB', (maxWidth, totalHeight), 0)

  # 合併圖片，並放到底圖
  center = math.ceil(maxWidth/2)
  bottom = 0
  for img in imgs:
    width, height = img.size
    # 置中合併
    ret.paste(img, (center - math.ceil(width/2), bottom))
    bottom += height
  return ret

def getImages ():
  files = sorted(os.listdir('./imgs'))
  imgs = []

  for file in files:
    imgs.append(Image.open(r'./imgs/' + file))
  return imgs

def saveAsLongPDF (imgs):
  output = verticalComb(imgs)
  # output.show()
  pdf = output.convert('RGB').save('./result.pdf')

def saveAsSinglePDF (imgs):
  for idx, img in enumerate(imgs):
    img.convert('RGB').save(f'./pdf/{idx}.pdf')

# NOTE: 之後吃 CLI 的參數去決定用哪個 pdf 輸出
imgs = getImages()
saveAsSinglePDF(imgs)