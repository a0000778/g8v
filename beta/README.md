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
於 `/index.html` 找到 `<script src="module/`，依需求增減即可，亦可直接刪除相關檔案使瀏覽器載入失敗

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
### 變數
- `g8v.bgLayer` 下個可用背景層編號
- `g8v.itemList` 當前物件列表，不包含附加物件
- `g8v.topLayer` 下個可用頂層編號
- `g8v.topZIndex` 下個視窗圖層
- `g8v.windowOption[*](obj)` 視窗附帶功能

### Class
- `g8v.AppendItem` 附加物件基礎 Class
- `g8v.ContentItem` 內容物件基礎 Class
- `g8v.WindowItem` 視窗物件基礎 Class，繼承 `g8v.ContentItem`

### Function
- `g8v.addControlBottom(ele)` 新增控制項目至控制介面底部
- `g8v.addControlTop(ele)` 新增控制項目至控制介面頂部
- `g8v.loaded(modName)` 標注載入中的模組為載入完畢
- `g8v.loading(modName)` 標注模組載入中
- `g8v.module.set(*,{})` 定義模組 API
- `g8v.module.get(*).*` 模組 API
- `g8v.module.get(*).load(args)` 從 url 載入的 API
- `g8v.module.get(*).append(item,args)` 從 url 載入的 API，針對現存功能再做附加功能操作
- `g8v.module.get(*).loadData(data)` 等同從選項清單對模組操作
- `g8v.onLoad(func)` 所有模組載入完畢後觸發的事件
- `g8v.onLoad(modName,func)` 指定模組載入完畢後觸發的事件，標注不存在的模組則不會觸發

##調用函式庫清單
- csvToArray (http://code.google.com/p/csv-to-array/)
- OpenLayers 3 (http://openlayers.org/)

## License
MIT License
