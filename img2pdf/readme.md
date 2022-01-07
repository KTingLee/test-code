# 介紹
* 這個小工具是將圖片檔轉成 pdf 檔

# 功能
1. 將單一圖片轉成 pdf 檔
2. 將多張圖片垂直合併成單一 pdf 檔

## 一般用法
1. 將要(連接的)圖片放到 imgs 資料夾，並依照順序重新命名
2. 依照要輸出的結果，去 app.py 修改使用的函數，並執行 app.py
* 沒考慮圖片大小不一的問題，直接置中合併

## 用 docker 操作
### 完整流程
1. `docker build -t pilpython .` 會產生 image，名稱自訂，例如這邊命名為 `pilpython` (因為這個 image 主要是提供 PIL 功能)
2. `docker run --rm -it --name pil pilpython` 會啟動第一步驟建立的 image，並進入該容器內，這時的工作目錄應該會有 app.py
3. 依照一般用法，根據要輸出的結果，在容器中修改完 app.py 之後，直接在容器中下 `python app.py` 即可
4. 可以利用 `docker cp pil:/usr/src/img2pdf/pdf ./` 將結果取出

### 用 docker-compose 啟動
1. 執行前先確定 docker-compose.yml 的 image 來源要採用 image 還是用 build。
2. `docker-compose run --rm --name img2pdf img2pdf`
3. 進入容器後執行 `python app.py`
4. 因為容器的 pdf 資料夾與主機的 pdf 共享，所以可以直接拿資料。
## TODO:
1. 改成吃 CLI 參數的方式決定使用的函數
例如要合併，就直接用 `python app.py --vCombine` 之類的
2. 容器的啟動指令，直接 `python app.py` 就好，然後一樣可以吃 `docker run` 時提供的參數
3. 容器要有預設 volume，就可省去 `docker cp` 取出結果