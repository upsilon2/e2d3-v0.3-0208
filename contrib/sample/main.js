/**
サンプル用main.js

Window幅は、グローバル変数 windowSize を使用することができます
*/

//Excelにデータがセットされた後、最初に呼ばれるメソッド（必須）
function e2d3Show() {

    //Excel上でのデータ変更イベントを補足（この場合はe2d3Updateメソッドをコールバックに指定）
    //"e2d3BindId"はグローバルな変数です
    e2d3.addChangeEvent(e2d3BindId, e2d3Update, function () {

        //Excel上のバインド範囲のデータをjsonに変換（必須）。(この場合コールバックにshowメソッドを指定)
        e2d3.bind2Json(e2d3BindId, { dimension: '3d' }, show);
    });
}
//データ変更時のコールバック用メソッド（必須）
function e2d3Update(responce) {
    console.log("e2d3Update :" + responce);
    dataUpdate(responce);
}

//変換されたjsonデータを使ってグラフ描画
function show(data) {
    //dataは、bind2jsonで渡すdimensionオプションによって、整形されたJsonオブジェクトです。
    //描画は、#e2d3-chart-area 内にしてください。


}

