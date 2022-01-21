# uart io 開發相關
主要是記錄一些 uart 開發的架構

## 資料夾說明
1. rs232_route
  * rs232.lib: 負責 rs232 物件、訊號解析器(parser)的建立
  * rs232.route: 會引用 rs232.lib，並在 route 層監聽訊號，進行下一步處理

  ```
    缺點：
    1. 有些設備沒辦法接 rs232，所以 lib 建立 rs232 物件時就會報錯，
       而 rs232.route 會使用 rs232.on，所以這時候也會跟著報錯。
    2. route 層要解析訊號，產生很多的判別式
  ```

2. rs232_route_express
  * 模仿 Express 的機制，讓 route 層可以寫得更直觀一點
  * rs232.lib: 負責
    - rs232 物件、訊號解析器(parser)的建立
    - rs232 訊號的接收，並進行訊號解析(toString、分析 route)
    - 建立 rs232 專用的 req, res, next，以便 controller 的函數可以使用
    - 解析後的訊號要傳給對應的 route handler
  * rs232.route: 負責
    - 定義 route，及對應的 handler