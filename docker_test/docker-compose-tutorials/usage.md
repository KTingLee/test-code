## 設定 container 的 log 上限
### 大綱
1. 先利用 `docker-compose` 啟動服務
2. 在服務運作下，修改 `docker-compose` 內容，將註解拿掉
3. 重啟服務，確保有吃到 `docker-compose` 內容，最簡單就是看能不連進

```bash
# 1. 啟動服務(會自動下載 image)
docker-compose -f docker-compose-test.yml up -d mytest

# 2. 測試瀏覽器 localhost:5566 是否能連上服務

# 3. 修改 docker-compose-test.yml，將註解拿掉並儲存

# 4. 重啟服務，直接重新執行 第一步 即可，他會重新建立 container (參考[這裡](https://stackoverflow.com/questions/54114045/how-to-implement-changes-made-to-docker-compose-yml-to-detached-running-containe))
docker-compose -f docker-compose-test.yml up -d mytest

```

! 注意，不能用 `docker-compose restart`，因為這個指令不會重新載入 docker-compose.yml。
! 執行 `docker-compose down` 會停止並移除 container。

> 注意，有提供定值的 docker-compose.yml (例如 container 名稱固定)，在不同地方同時執行，可能會有衝突。
> 假設相同的 yml，在路徑 A 執行了，並建立了對應的 container；
> 這時如果將 yml 複製到路徑 B，一樣的指令執行會發現 docker 噴錯，會說 container 的名稱衝突。
> 參考[連結](https://stackoverflow.com/questions/57361075/docker-compose-command-is-failing-with-conflict)
