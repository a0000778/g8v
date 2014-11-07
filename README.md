# G8V電視牆
## 相關資源
- 執行網址：http://a0000778.github.io/g8v/
- hackfoldr：http://hackfoldr.org/G8VTV/

## 資料格式
於 `#` 後方為儲存資料區域，每筆資料以 `&` 做分隔，然後依以下格式儲存資料：
```
模組名稱=參數1|參數2|參數3 ...
```
另有附加功能的格式，於前者最後一個參數後加上
```
+模組名稱=參數1|參數2|參數3 ...
```
附加功能可無上限附加

參數均經過 `encodeURIComponent` 進行編碼處理

## 自訂說明
### 選擇模組
於 `/js/main.js` 找到 `Load Module`，在其下方有載入模組的清單，與檔案 `/module/*.js` 相應，依需求增減即可

### 伺服器設定
需要伺服器的模組有
- bg (背景地圖資料)
- video (部分來源需要通過伺服端取得資料)
- chat (部分來源需要通過伺服端取得資料)
- sourceList (儲存清單，採用 ethercalc，G8V伺服端不負責此塊)

伺服端程式碼請見：https://github.com/a0000778/g8v_server

#### bg 伺服端位址修改方法
於 `/module/bg.js` 中尋找 `socket=new WebSocket`，即可找到

#### video 與 chat 伺服端位址修改方法
於 `/module/video.js` 及 `/module/chat.js` 中尋找所有 `getSourceId`，即可找到

#### sourceList 伺服端位址修改方法
於 `/module/sourceList.js` 中尋找 `ethercalc.org`，即可找到

## 程式架構
- `g8v` 所有程式碼均於此變數之下
- `g8v.bgLayer` 下個可用背景層編號
- `g8v.createObj(module,args[,title,posX,posY,width,height])` 新增物件
- `g8v.createWindow(obj,title,content[,option])` 新增一般視窗，option參數暫時無用
- `g8v.loadModule(module[],onload])` 載入模組
- `g8v.module.*.*` 模組 API
- `g8v.module.*.load(args)` 從 url 載入的 API
- `g8v.module.*.append(obj,args)` 從 url 載入的 API，針對現存功能再做附加功能操作
- `g8v.module.*.loadData(data)` 等同從選項清單對模組操作
- `g8v.objList` 當前物件列表
- `g8v.updateShareUrl()` 刷新分享網址
- `g8v.windowOption[*](obj)` 視窗附帶功能

##調用函式庫清單
- csvToArray (http://code.google.com/p/csv-to-array/)
- OpenLayers 3 (http://openlayers.org/)

## License
MIT License
