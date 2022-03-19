# README 
這是用來練習「coding style 檢查」以及「自動排版」的 project。

## 介紹
### Coding Style Rule
* 在團隊開發時，為了確保程式風格具有一致性，往往都會規定 Coding style。
* 常見的 Coding style 例如 Standardjs, airbnb 等等。
* 關於 Coding style 的規定，例如 Standard 不加分號、定義函數時名稱與參數會加空格...。
* 各種 Coding style 的規定可自行 google 搜尋。

#### ESLint
* ESLint 是一個「檢查程式碼是否符合規則」的工具。
* 當執行 ESLint 時，會檢查程式碼是否完全通過檢查，如果有地方不符合，就會直接跳錯誤訊息出來。
* 此外，除了檢查程式碼是否符合規範外，也有提供**錯誤修正**功能(只會處理不會動到邏輯的部份)。

#### VSCode 中的 ESLint 套件，與實際的 ESLint npm 套件差異
* VSCode 提供許多延伸功能，例如 ESLint 也是其中一個外掛。
* 但每個人有自己的 IDE，不能保證大家都用 VSCode，也就不能保證大家都有 ESLint 外掛可以用。
* 不過，若是將 ESLint 套件加到專案中(也就是 Package.json 有安裝 ESLint 的紀錄)，則可以確保團隊人員執行專案時，能夠去跑 ESLint 指令。
* 但通常，**IDE 都會提供 Linter 工具**，因為這些 IDE 工具能夠「即時地」將 Linter 錯誤顯示出來。
* 例如先前提到要執行 `npx eslint .` 才會知道程式碼哪裡不符規定，但若 IDE 有裝 ESLint，不合規定的程式碼就會被 IDE 顯示出來。省去下指令並等待檢查的時間。

### 自動排版
* 自動排版就只是自動排版，與 Coding style 無關。
* 例如**宣告很多沒用到的變數，可能排版上沒問題**，但 Coding style 會抓出這個錯誤。

## 導入 ESLint
1. 先安裝 ESLint 套件(可以連 IDE 外掛一起裝)
  ```bash
  # 因為只有開發環境需要檢查，所以加上 --save-dev

  # 安裝 eslint
  npm i eslint --save-dev

  # 安裝 eslint config creator，用來生成 eslint 的配置檔
  npm i @eslint/create-config --save-dev
  ```

2. 設定 ESLint 規則
  ```bash
  npm init @eslint/config

  # 接下來會問許多問題，這些問題與配置檔有關
  # 1. 為什麼要用 ESLint？  依照自己的需求去決定選誰，選得越嚴謹，配置就會越周全
  # 2. 要用哪種 js modules？  依照自己團隊去決定
  # 3. 專案用什麼框架？
  # 4. 專案採用 TypeScript？
  # 5. 程式碼會在哪執行？
  # 6. 要採用哪種 coding style？
  # 7. config 檔會採用哪種格式？ JS, YAML, JSON
  ```
  
  完成後，會發現根目錄多了一個 `.eslintrc`，裡面說明著 ESLint 的設定。
  這時，只要在根目錄下 `npx eslint .`，ESLint 就會檢查整個專案的 coding style。
  > 如果有跟著跑，應該會發現這個專案的 Coding style 很慘 XD

3. 看一下 ESLint config
  因為在初始化 ESLint config 時，有指定採用 standard coding style，因此會看到 extend 那邊多了一個 standard。
  ```js
  module.exports = {
    env: {
      es2021: true,  // 使用 ECMA2021 版本(才有支援 import, export)
      node: true  // 專案會在 Node.js 中執行
    },
    extends: [
      'standard'
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
    }
  }
  ```

  如果想要自定義規則，或是覆寫 standard 的規則(例如可以有分號)，則可以加入新規則在 `rules` 欄位中。
  但這些規則符合 [ESLint 提供的規則](https://eslint.org/docs/rules/)。
  ```js
  rules: {
    "semi": ["error", "always"],  // 分號的檢查，例如沒有分號就是 error
    "quotes": ["error", "double"] // 引號的檢查，例如字串用雙引號是 error
  }
  ```

### 不想被 ESLint 檢查的檔案
* 只要新增 `.eslintignore` 檔案，並在裡面加上忽略的檔案名稱即可(跟 `.gitignore` 一樣)

### ESLint 放入 npm 腳本
* 總不會一直想下 `npx eslint .` 吧！
* 所以把他寫進 `package.json` 的 `script` 欄位就好啦。
* 此外，上述提到的忽略腳本，預設是吃 `.eslintignore`，但也可用指定的，例如不想檢查的檔案就跟 `.gitignore`，這時就可以寫 `eslint --ignore-path .gitignore`。