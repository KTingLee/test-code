## 設定 練習YAML-variable 寫法
### 介紹
有時需要同時啟動許多服務，而各個服務可能會有一些相同的設定值，這時如果還要一個一個設定，就稍嫌麻煩，尤其當那個設定又有很多細項的時候。
因此，YAML 也有提供「變數功能」，可以將某個欄位設定成變數(利用 `&` 宣告)，並在要使用的位置引入變數(利用 `*`)

### 大綱
1. 仔細看 yaml-variable-test.yml 的寫法(變數用法)
2. 執行 `docker-compose -f yaml-variable-test.yml up -d mytest`
3. 觀察 container_name、port、logging 設定，可以利用 `docker inspect {container_name}` 來查看。
    ```bash
    執行
    docker inspect mytest-container --format '{{.Name}}, {{.HostConfig.PortBindings}}, {{.HostConfig.LogConfig}}'

    container_name 應該會是 mytest-container，覆蓋掉樣本預設的 default-container
    port 應該會是樣板提供的 8080:80，所以應該能利用 localhost:8080 連到 container 的服務
    logging 的 max_size 應該會是外部設定的 5k
    ```


