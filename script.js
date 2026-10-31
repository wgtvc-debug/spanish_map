/* ===========================================================
 * ESPAÑA ATLAS 2.0 / script.js — 読みながら学べるJavaScript
 * ===========================================================
 * 実行の流れ:
 *   1. データ定義 (REGIONS / CLUBS / RAIL_LINES)
 *   2. 地図への位置変換 (geoToXY)
 *   3. 表示内容を切替 (setTopic / renderMarkers)
 *   4. 地図・一覧のクリックイベント (addEventListener)
 *   5. 都市間・都市内の交通検索
 *   6. 通信可能な場合だけ自治州の境界を追加 (fetch)
 * 注: HTMLの <script defer> によってDOM構築後に実行されます。
 */
'use strict';

// -----------------------------------------------------------
// 【STEP 1】 元サイトの地域データを引き継ぐ
// -----------------------------------------------------------
const REGIONS = [
  {id:'galicia',name:'ガリシア州',english:'GALICIA',spots:['サンティアゴ・デ・コンポステーラ','ビーゴ','リアス式海岸'],description:'巡礼路の終着地と大西洋の海岸が広がる、緑豊かな北西部。魚介料理も人気です。',theme:'巡礼・海岸・グルメ',category:'NATURE & HISTORY',icon:'✦',color:'#688a89',search:'ガリシア サンティアゴ ビーゴ'},
  {id:'asturias',name:'アストゥリアス州',english:'ASTURIAS',spots:['オビエド','ピコス・デ・エウロパ','ヒホン'],description:'緑の山々と海岸線、伝統的な街並みを楽しめる北スペインの自然豊かな地域です。',theme:'山・自然・街歩き',category:'MOUNTAIN & NATURE',icon:'⛰',color:'#70918c',search:'オビエド ヒホン'},
  {id:'cantabria',name:'カンタブリア州',english:'CANTABRIA',spots:['サンタンデール','サンティリャーナ・デル・マル','アルタミラ'],description:'海辺の街と緑の丘陵、先史時代の洞窟文化などが魅力の北部地域です。',theme:'海岸・歴史・自然',category:'COAST & HISTORY',icon:'≈',color:'#679c9a',search:'サンタンデール'},
  {id:'paisvasco',name:'バスク州',english:'BASQUE COUNTRY',spots:['ビルバオ','サン・セバスティアン','ゲルニカ'],description:'独自の文化と美食、モダンな建築に出会える大西洋沿岸の地域です。',theme:'美食・建築・海辺',category:'FOOD & CULTURE',icon:'✳',color:'#648c8a',search:'バスク ビルバオ サンセバスティアン'},
  {id:'navarra',name:'ナバラ州',english:'NAVARRE',spots:['パンプローナ','バルデナス・レアレス','オリテ城'],description:'ピレネーの自然から半砂漠まで、多様な景観が広がる地域です。',theme:'山・城・絶景',category:'LANDSCAPE & HISTORY',icon:'◇',color:'#af8b77',search:'ナバラ パンプローナ'},
  {id:'larioja',name:'ラ・リオハ州',english:'LA RIOJA',spots:['ログローニョ','アロ','サン・ミジャン'],description:'ぶどう畑の丘陵と歴史ある街並みで知られる、のどかな内陸地域です。',theme:'田園・歴史・街歩き',category:'COUNTRYSIDE',icon:'❋',color:'#ae8174',search:'リオハ ログローニョ'},
  {id:'castillayleon',name:'カスティーリャ・イ・レオン州',english:'CASTILE AND LEÓN',spots:['セゴビア','サラマンカ','ブルゴス'],description:'ローマ水道橋や壮麗な大聖堂、歴史的な大学都市など見どころが豊富です。',theme:'建築・旧市街・歴史',category:'HERITAGE & HISTORY',icon:'⌂',color:'#c0947b',search:'カスティーリャ レオン セゴビア サラマンカ'},
  {id:'aragon',name:'アラゴン州',english:'ARAGÓN',spots:['サラゴサ','オルデサ国立公園','テルエル'],description:'荘厳な歴史建築とピレネーの山々が共存する、魅力あふれる内陸地域です。',theme:'山岳・自然・歴史',category:'NATURE & HERITAGE',icon:'⛰',color:'#cc9a75',search:'アラゴン サラゴサ'},
  {id:'cataluna',name:'カタルーニャ州',english:'CATALONIA',spots:['バルセロナ','サグラダ・ファミリア','ジローナ'],description:'ガウディ建築、活気ある街並み、地中海沿いのビーチを一度に楽しめる地域です。',theme:'街歩き・建築・ビーチ',category:'CULTURE & CITY',icon:'✺',color:'#d88464',search:'カタルーニャ バルセロナ ジローナ カタルニア'},
  {id:'comunitatvalenciana',name:'バレンシア州',english:'VALENCIAN COMMUNITY',spots:['バレンシア','芸術科学都市','アリカンテ'],description:'明るい地中海のビーチと現代建築、パエリアなどの食文化を楽しめます。',theme:'ビーチ・建築・食',category:'SEA & DESIGN',icon:'☼',color:'#4b9db1',search:'バレンシア アリカンテ'},
  {id:'madrid',name:'マドリード州',english:'COMMUNITY OF MADRID',spots:['プラド美術館','マドリード王宮','レティーロ公園'],description:'世界的な美術館と広場、カフェが集まるスペインの首都圏。都市散策にぴったりです。',theme:'美術館・街歩き',category:'ART & CAPITAL',icon:'✷',color:'#637a9c',search:'マドリード'},
  {id:'castillalamancha',name:'カスティーリャ＝ラ・マンチャ州',english:'CASTILE-LA MANCHA',spots:['トレド','クエンカ','風車の丘'],description:'歴史都市トレドや断崖に建つ家々、風車が並ぶ景色で知られる内陸地方です。',theme:'古都・景観・文化',category:'OLD TOWNS',icon:'⌘',color:'#b9967c',search:'ラマンチャ トレド クエンカ'},
  {id:'extremadura',name:'エストレマドゥーラ州',english:'EXTREMADURA',spots:['カセレス','メリダ','トルヒーリョ'],description:'ローマ時代の遺構や中世の街並みをゆったり巡れる、西部の歴史的な地域です。',theme:'歴史遺産・旧市街',category:'ANCIENT CITIES',icon:'✦',color:'#9d8b71',search:'エストレマドゥーラ メリダ'},
  {id:'andalucia',name:'アンダルシア州',english:'ANDALUSIA',spots:['セビリア','グラナダ','アルハンブラ宮殿'],description:'イスラム文化の面影を残す宮殿、白い村、フラメンコなどを楽しめる南スペイン。',theme:'宮殿・文化・白い村',category:'SUN & HERITAGE',icon:'☀',color:'#d08360',search:'アンダルシア セビリア グラナダ マラガ コルドバ'},
  {id:'murcia',name:'ムルシア州',english:'REGION OF MURCIA',spots:['カルタヘナ','ムルシア','マール・メノール'],description:'穏やかな気候と海岸沿いの風景、ローマ時代から続く港町などが魅力です。',theme:'海辺・歴史・街歩き',category:'MEDITERRANEAN COAST',icon:'≈',color:'#b9947d',search:'ムルシア カルタヘナ'},
  {id:'baleares',name:'バレアレス諸島',english:'BALEARIC ISLANDS',spots:['マヨルカ島','イビサ島','メノルカ島'],description:'透明度の高い海と美しい入り江、島ごとに異なる景色に出会える地中海の楽園です。',theme:'ビーチ・島・リゾート',category:'ISLAND & BEACH',icon:'☼',color:'#3c9bad',search:'バレアレス マヨルカ イビサ メノルカ'},
  {id:'canarias',name:'カナリア諸島',english:'CANARY ISLANDS',spots:['テネリフェ島','ランサローテ島','グラン・カナリア島'],description:'大西洋に浮かぶ火山の島々。ユニークな地形と温暖な気候を楽しめます。',theme:'火山・島・自然',category:'VOLCANO & ISLAND',icon:'◈',color:'#a57f66',search:'カナリア テネリフェ ランサローテ'},
  {id:'ceuta',name:'セウタ',english:'CEUTA',spots:['王立城壁','旧市街','地中海沿岸'],description:'アフリカ大陸の北岸に位置するスペインの自治都市。要塞や港の景色が特徴です。',theme:'歴史・港町',category:'HISTORY & PORT',icon:'⚑',color:'#9a8b81',search:'セウタ'},
  {id:'melilla',name:'メリリャ',english:'MELILLA',spots:['メリリャ・ラ・ビエハ','モダニズム建築','港湾地区'],description:'北アフリカの地中海沿岸にある自治都市で、歴史的要塞や建築が見どころです。',theme:'建築・歴史・海辺',category:'ARCHITECTURE & SEA',icon:'✧',color:'#9f8e83',search:'メリリャ'}
];
const TOPIC_DATA = {"galicia":{"spots":{"nature":["シエス諸島","リアス・バイシャス"],"culture":["サンティアゴ大聖堂","ルーゴのローマ城壁"],"football":["セルタ・デ・ビーゴ","デポルティーボ・ラ・コルーニャ"],"food":["プルポ・ア・ラ・ガジェガ","エンパナーダ"]}},"asturias":{"spots":{"nature":["ピコス・デ・エウロパ","コバドンガ湖"],"culture":["オビエド旧市街","サンタ・マリア・デル・ナランコ"],"football":["レアル・オビエド","スポルティング・ヒホン"],"food":["ファバーダ","アストゥリアスのシードラ"]}},"cantabria":{"spots":{"nature":["カバルセノ自然公園","サルディネーロ海岸"],"culture":["アルタミラ洞窟","サンティリャーナ・デル・マル"],"football":["ラシン・サンタンデール","エル・サルディネーロ"],"food":["コシード・モンタニェス","ソバオ"]}},"paisvasco":{"spots":{"nature":["ラ・コンチャ海岸","ウルダイバイ生物圏保護区"],"culture":["グッゲンハイム美術館","ビルバオ旧市街"],"football":["アスレティック・ビルバオ","レアル・ソシエダ"],"food":["ピンチョス","バスクチーズケーキ"]}},"navarra":{"spots":{"nature":["バルデナス・レアレス","イラティの森"],"culture":["オリテ城","パンプローナ旧市街"],"football":["CAオサスナ","エル・サダール"],"food":["チストラ","ポチャス豆の煮込み"]}},"larioja":{"spots":{"nature":["エブロ川沿いの風景","ぶどう畑の丘陵"],"culture":["サン・ミジャンの修道院","ログローニョ旧市街"],"football":["UDログロニェス","ラス・ガウナス"],"food":["パタタス・ア・ラ・リオハナ","ピンチョス"]}},"castillayleon":{"spots":{"nature":["ラス・メドゥラス","グレドス山脈"],"culture":["セゴビア水道橋","ブルゴス大聖堂"],"football":["レアル・バリャドリード","ブルゴスCF"],"food":["レチャソ・アサード","モルシージャ"]}},"aragon":{"spots":{"nature":["オルデサ国立公園","ピレネー山脈"],"culture":["ピラール聖母大聖堂","アルハフェリア宮殿"],"football":["レアル・サラゴサ","SDウエスカ"],"food":["テルナスコ・デ・アラゴン","ミガス"]}},"cataluna":{"spots":{"nature":["コスタ・ブラバ","モンセラート山"],"culture":["サグラダ・ファミリア","カサ・バトリョ"],"football":["FCバルセロナ","RCDエスパニョール"],"food":["パン・コン・トマテ","クレマ・カタラーナ"]}},"comunitatvalenciana":{"spots":{"nature":["ペニスコラ海岸","アルブフェラ自然公園"],"culture":["芸術科学都市","バレンシア大聖堂"],"football":["バレンシアCF","ビジャレアルCF"],"food":["パエリア・バレンシアーナ","オルチャータ"]}},"madrid":{"spots":{"nature":["シエラ・デ・グアダラマ","レティーロ公園"],"culture":["マドリード王宮","プラド美術館"],"football":["レアル・マドリード","アトレティコ・マドリード"],"food":["ボカディージョ・デ・カラマレス","コシード・マドリレーニョ"]}},"castillalamancha":{"spots":{"nature":["ルイデラ湖群","タブラス・デ・ダイミエル国立公園"],"culture":["トレド旧市街","クエンカの宙吊りの家"],"football":["アルバセテ・バロンピエ","CDトレド"],"food":["マンチェゴチーズ","ピスト・マンチェゴ"]}},"extremadura":{"spots":{"nature":["モンフラグエ国立公園","ヘルテ渓谷"],"culture":["メリダのローマ劇場","カセレス旧市街"],"football":["CPカセレーニョ","CDバダホス"],"food":["イベリコ豚の生ハム","ミガス・エストレメーニャス"]}},"andalucia":{"spots":{"nature":["カボ・デ・ガタ","ドニャーナ国立公園"],"culture":["アルハンブラ宮殿","セビリア大聖堂"],"football":["レアル・ベティス","セビージャFC"],"food":["ガスパチョ","サルモレホ"]}},"murcia":{"spots":{"nature":["カラスパラの山景","カルブランケ自然公園"],"culture":["カルタヘナのローマ劇場","ムルシア大聖堂"],"football":["レアル・ムルシア","FCカルタヘナ"],"food":["カルデロ","パパラホテ"]}},"baleares":{"spots":{"nature":["カロ・デス・モロ","トラムンタナ山脈"],"culture":["パルマ大聖堂","ベルベル城"],"football":["RCDマジョルカ","エスタディ・ソン・モイシュ"],"food":["エンサイマーダ","ソブラサーダ"]}},"canarias":{"spots":{"nature":["テイデ国立公園","ティマンファヤ国立公園"],"culture":["ラ・ラグーナ歴史地区","セサル・マンリケの建築"],"football":["UDラス・パルマス","CDテネリフェ"],"food":["パパス・アルガダス","モホソース"]}},"ceuta":{"spots":{"nature":["モンテ・アチョ","地中海沿岸"],"culture":["王立城壁","ドラゴンの家"],"football":["ADセウタFC","アルフォンソ・ムルベ競技場"],"food":["魚介のタパス","クスクス"]}},"melilla":{"spots":{"nature":["アグアドゥ海岸","地中海の入江"],"culture":["メリリャ・ラ・ビエハ","モダニズム建築群"],"football":["UDメリリャ","アルバレス・クラロ競技場"],"food":["魚介料理","モロッコ風菓子"]}}};

// 地理座標は [経度, 緯度] です (緯度/経度を逆にしないよう注意)。
// 17自治州+2自治都市に対応する注目地点。実際の地理座標からSVGに投影します。
const REGION_POS={
  galicia:[-8.55,42.70],asturias:[-5.76,43.23],cantabria:[-4.02,43.16],
  paisvasco:[-2.67,42.97],navarra:[-1.58,42.66],larioja:[-2.51,42.32],
  castillayleon:[-4.88,41.72],aragon:[-.76,41.45],cataluna:[1.35,41.88],
  comunitatvalenciana:[-.47,39.50],madrid:[-3.72,40.42],
  castillalamancha:[-3.35,39.15],extremadura:[-6.16,39.15],
  andalucia:[-4.70,37.57],murcia:[-1.26,38.00],
  baleares:[2.83,39.62],canarias:[-16.57,28.31],
  ceuta:[-5.315,35.89],melilla:[-2.94,35.29]
};

const TOPICS={
  nature:{label:'自然',symbol:'🌿',description:'ビーチ・山・島々・自然公園'},
  culture:{label:'文化・建築',symbol:'🏛️',description:'世界遺産・歴史地区・建築'},
  food:{label:'グルメ',symbol:'🍽️',description:'地方の郷土料理・食文化'},
  football:{label:'LaLiga',symbol:'⚽',description:'2026/27シーズンの1部20クラブ'},
  transport:{label:'交通・鉄道',symbol:'🚄',description:'主要鉄道回廊と都市アクセス'}
};

// 【チームロゴ】検証済みのGitHub公開画像パスを読み込みます。
// 著作権・商標は各クラブに帰属。画像が取得できなければ短縮名を表示します。
const LOGO_BASE='https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/Spain%20-%20LaLiga/';
// [id, チーム名, ホームタウン, [経度,緯度], 画像ファイル名, 短縮名, [微調整x,y]]
// 同じ都市に複数クラブがあるため、ロゴを少しずらして重なりを防ぎます。
const CLUBS=[
 ['ath','Athletic Club','ビルバオ',[-2.949,43.264],'Athletic Bilbao.png','ATH',[-11,-17]],
 ['atleti','Atlético de Madrid','マドリード',[-3.599,40.436],'Atlético de Madrid.png','ATM',[-21,-29]],
 ['osasuna','CA Osasuna','パンプローナ',[-1.644,42.796],'CA Osasuna.png','OSA',[0,-8]],
 ['celta','RC Celta','ビーゴ',[-8.734,42.212],'Celta de Vigo.png','CEL',[0,0]],
 ['alaves','Deportivo Alavés','ビトリア',[-2.686,42.861],'Deportivo Alavés.png','ALA',[17,17]],
 ['elche','Elche CF','エルチェ',[-.701,38.270],'Elche CF.png','ELC',[-6,0]],
 ['barca','FC Barcelona','バルセロナ',[2.124,41.381],'FC Barcelona.png','BAR',[14,-25]],
 ['getafe','Getafe CF','ヘタフェ',[-3.733,40.329],'Getafe CF.png','GET',[-8,29]],
 ['levante','Levante UD','バレンシア',[-.352,39.472],'Levante UD.png','LEV',[20,-22]],
 ['malaga','Málaga CF','マラガ',[-4.434,36.734],'Málaga CF.png','MAL',[0,0]],
 ['racing','Racing Santander','サンタンデール',[-3.803,43.463],'Racing Santander.png','RAC',[0,-15]],
 ['rayo','Rayo Vallecano','マドリード',[-3.659,40.391],'Rayo Vallecano.png','RAY',[33,0]],
 ['deportivo','RC Deportivo','ア・コルーニャ',[-8.411,43.368],'Deportivo A Coruña.png','DEP',[-4,-17]],
 ['espanyol','RCD Espanyol','バルセロナ',[2.076,41.347],'RCD Espanyol Barcelona.png','ESP',[21,20]],
 ['betis','Real Betis','セビリア',[-5.984,37.385],'Real Betis Balompié.png','BET',[-23,5]],
 ['madrid','Real Madrid','マドリード',[-3.689,40.453],'Real Madrid.png','RMA',[-6,10]],
 ['sociedad','Real Sociedad','サン・セバスティアン',[-1.975,43.302],'Real Sociedad.png','RSO',[7,-13]],
 ['sevilla','Sevilla FC','セビリア',[-5.966,37.384],'Sevilla FC.png','SEV',[23,1]],
 ['valencia','Valencia CF','バレンシア',[-.357,39.474],'Valencia CF.png','VAL',[-19,16]],
 ['villarreal','Villarreal CF','ビジャレアル',[-.102,39.938],'Villarreal CF.png','VIL',[14,0]]
].map(([id,name,city,coordinate,file,short,offset])=>({id,name,city,coordinate,file,short,offset}));

// 【STEP 2】地理座標 -> SVGの座標への変換
// SVG 1200x860 に投影。横方向は縮尺を約0.79倍にして縦横比を自然に見せます。
// projectした数値はHTMLの地図(path)を生成したものと同じです。
const MAP_W=1200,MAP_H=860;
function geoToXY([lon,lat],key=''){
  // カナリア諸島だけ本土から大きく離れるため右下の囲み枠で表示。
  if(key==='canarias')return [915+(lon+18.35)*46,725+(30-lat)*47];
  return [(lon+11.1)*65,(45.35-lat)*82];
}
const MAP_NS='http://www.w3.org/2000/svg';

// 交通網を描くための主要駅。各駅の緯度経度をデータとして保持。
const STATIONS={
  madrid:['マドリード',-3.691,40.405],barcelona:['バルセロナ',2.140,41.379],
  zaragoza:['サラゴサ',-.912,41.657],lleida:['リェイダ',.622,41.619],
  girona:['ジローナ',2.821,41.980],figueres:['フィゲラス',2.958,42.267],
  valencia:['バレンシア',-.382,39.466],alicante:['アリカンテ',-.487,38.346],
  albacete:['アルバセテ',-1.858,38.997],cuenca:['クエンカ',-2.147,40.070],
  cordoba:['コルドバ',-4.780,37.888],sevilla:['セビリア',-5.976,37.392],
  antequera:['アンテケラ',-4.571,37.020],malaga:['マラガ',-4.431,36.711],
  granada:['グラナダ',-3.599,37.183],toledo:['トレド',-4.026,39.856],
  segovia:['セゴビア',-4.119,40.946],valladolid:['バリャドリード',-4.729,41.647],
  burgos:['ブルゴス',-3.676,42.344],leon:['レオン',-5.572,42.599],
  ourense:['オウレンセ',-7.864,42.338],santiago:['サンティアゴ',-8.540,42.870],
  coruna:['ア・コルーニャ',-8.412,43.353],murcia:['ムルシア',-1.125,37.991],
  castellon:['カステリョン',-.059,39.985],bilbao:['ビルバオ',-2.923,43.261],
  pamplona:['パンプローナ',-1.637,42.817],vitoria:['ビトリア',-2.672,42.849]
};
// 実在の都市を通る代表的な鉄道回廊。線分の位置は「略図」であり線路のGPS記録ではありません。
const RAIL_LINES=[
 {name:'マドリード ― バルセロナ',kind:'main',stops:['madrid','zaragoza','lleida','barcelona']},
 {name:'バルセロナ ― フィゲラス',kind:'main',stops:['barcelona','girona','figueres']},
 {name:'マドリード ― バレンシア',kind:'main',stops:['madrid','cuenca','valencia']},
 {name:'マドリード ― アリカンテ',kind:'main',stops:['cuenca','albacete','alicante']},
 {name:'マドリード ― セビリア',kind:'main',stops:['madrid','cordoba','sevilla']},
 {name:'コルドバ ― マラガ',kind:'main',stops:['cordoba','antequera','malaga']},
 {name:'アンテケラ ― グラナダ',kind:'main',stops:['antequera','granada']},
 {name:'マドリード ― トレド',kind:'main',stops:['madrid','toledo']},
 {name:'マドリード ― バリャドリード ― レオン',kind:'main',stops:['madrid','segovia','valladolid','leon']},
 {name:'ガリシア方面',kind:'main',stops:['valladolid','ourense','santiago','coruna']},
 {name:'バリャドリード ― ブルゴス',kind:'main',stops:['valladolid','burgos']},
 {name:'バルセロナ ― バレンシア沿岸',kind:'conventional',stops:['barcelona','castellon','valencia','alicante']},
 {name:'バスク方面の鉄道',kind:'conventional',stops:['burgos','vitoria','bilbao']},
 {name:'サラゴサ ― パンプローナ',kind:'conventional',stops:['zaragoza','pamplona']},
 {name:'バレンシア ― ムルシア方面',kind:'conventional',stops:['valencia','alicante','murcia']}
];

// もともとの都市内検索を維持するため、都市ごとの出発地・目的地の候補も登録。
const CITY_LIST={
 barcelona:{name:'バルセロナ',en:'Barcelona, Spain',station:'barcelona',starts:['カタルーニャ広場','Barcelona Sants 駅','バルセロナ空港'],spots:['サグラダ・ファミリア','カンプ・ノウ','グエル公園','バルセロネータ海岸']},
 madrid:{name:'マドリード',en:'Madrid, Spain',station:'madrid',starts:['マドリード・アトーチャ駅','プエルタ・デル・ソル','マドリード空港'],spots:['サンティアゴ・ベルナベウ','マドリード王宮','プラド美術館','メトロポリターノ']},
 valencia:{name:'バレンシア',en:'Valencia, Spain',station:'valencia',starts:['バレンシア北駅','市庁舎広場','バレンシア空港'],spots:['芸術科学都市','中央市場','マルバロサ海岸','メスタージャ']},
 sevilla:{name:'セビリア',en:'Seville, Spain',station:'sevilla',starts:['Santa Justa 駅','セビリア大聖堂','セビリア空港'],spots:['スペイン広場','セビリア大聖堂','アルカサル','ラ・カルトゥーハ競技場']},
 malaga:{name:'マラガ',en:'Malaga, Spain',station:'malaga',starts:['Málaga María Zambrano 駅','マラガ空港','マラガ中心部'],spots:['アルカサバ','ピカソ美術館','マラゲータ海岸','ラ・ロサレーダ']},
 granada:{name:'グラナダ',en:'Granada, Spain',station:'granada',starts:['グラナダ駅','グラナダ中心部'],spots:['アルハンブラ宮殿','アルバイシン地区']},
 bilbao:{name:'ビルバオ',en:'Bilbao, Spain',station:'bilbao',starts:['Bilbao-Abando 駅','ビルバオ空港','モジュア広場'],spots:['グッゲンハイム美術館','サン・マメス','旧市街']},
 zaragoza:{name:'サラゴサ',en:'Zaragoza, Spain',station:'zaragoza',starts:['Zaragoza Delicias 駅','ピラール広場'],spots:['ピラール聖母大聖堂','アルハフェリア宮殿']},
 palma:{name:'パルマ（マヨルカ島）',en:'Palma de Mallorca, Spain',station:null,starts:['パルマ空港','パルマ大聖堂','パルマ・インターモーダル駅'],spots:['パルマ大聖堂','ベルベル城','カラ・マヨール']},
 tenerife:{name:'サンタ・クルス（テネリフェ）',en:'Santa Cruz de Tenerife, Spain',station:null,starts:['サンタ・クルス中心部','テネリフェ北空港'],spots:['テイデ国立公園','ラ・ラグーナ旧市街']},
 alicante:{name:'アリカンテ',en:'Alicante, Spain',station:'alicante',starts:['Alicante Terminal 駅','アリカンテ空港'],spots:['サンタ・バルバラ城','ポスティゲト海岸']},
 coruna:{name:'ア・コルーニャ',en:'A Coruña, Spain',station:'coruna',starts:['A Coruña 駅','ア・コルーニャ中心部'],spots:['リアソール海岸','ヘラクレスの塔']}
};


/* ===========================================================
 * V3: 州別ズーム、インタラクティブ自治州、写真ツールチップ
 * ===========================================================
 * ファイル先頭の REGIONS / TOPIC_DATA / geoToXY を元版から引き継ぎます。
 * 使い方：
 *  1) 全国地図上の州をホバー → 塗りの色が変わる
 *  2) 州をクリック → SVG viewBox を変更し州別の地図へズーム
 *  3) 自然・文化・グルメ → 各州2スポットのピン、写真ポップアップ
 *  4) サッカー → 全国1部20、州別は1部+2部を表示
 */
const $=id=>document.getElementById(id);
const create=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
const byRegion=Object.fromEntries(REGIONS.map((r,i)=>[r.id,{...r,index:i}]));
const $svg=$('map-svg'),$canvas=document.querySelector('.map-canvas'),$popup=$('spot-popup');
const el={markers:$('markers'),grid:$('cards-grid'),source:$('map-source-status')};
let topic='nature', selectedRegion='baleares',selectedClub='barca',selectedStation='madrid';
let activeRegion=null; // null = 全国地図 / string = 選択中の州
let railOverlay=false,transportMode='intercity',highlightedRoute=[];
let view={x:0,y:0,w:MAP_W,h:MAP_H};
let tooltipTimer=null, hoverSpot=null;
const imageCache=new Map();
const normalize=str=>String(str||'').normalize('NFKC').toLowerCase().replace(/[\s\-・_]/g,'');
function link(label,url){const a=create('a','',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function getPosition(coord,key='',offset=[0,0]){const [x,y]=geoToXY(coord,key);return [x+offset[0],y+offset[1]];}
function logoUrl(club){return (club.division===2?LOGO_BASE_2:LOGO_BASE)+encodeURIComponent(club.file);}
function logoImg(club){const img=create('img');img.src=logoUrl(club);img.alt=club.name+' のエンブレム';img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>{img.hidden=true;};return img;}

// 2026/27の2部はLaLiga公式発表の22クラブ。[]は[識別子,名称,州,都市,経度緯度,ロゴファイル,略称]。
// FC Andorraのみ独立国家アンドラに本拠地があるため、スペイン州別の抽出には含めません。
const LOGO_BASE_2='https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/Spain%20-%20LaLiga%202/';
const SECOND_DIVISION=[
 ['mallorca','RCD Mallorca','baleares','パルマ',[2.63,39.59],'RCD Mallorca.png','MLL'],
 ['girona','Girona FC','cataluna','ジローナ',[2.826,41.963],'Girona FC.png','GIR'],
 ['oviedo','Real Oviedo','asturias','オビエド',[-5.87,43.36],'Real Oviedo.png','OVI'],
 ['almeria','UD Almería','andalucia','アルメリア',[-2.438,36.84],'UD Almería.png','ALM'],
 ['laspalmas','UD Las Palmas','canarias','ラス・パルマス',[-15.456,28.099],'UD Las Palmas.png','LPA'],
 ['castellon','CD Castellón','comunitatvalenciana','カステリョン',[-.065,39.985],'CD Castellón.png','CAS'],
 ['burgos','Burgos CF','castillayleon','ブルゴス',[-3.673,42.345],'Burgos CF.png','BUR'],
 ['eibar','SD Eibar','paisvasco','エイバル',[-2.474,43.18],'SD Eibar.png','EIB'],
 ['cordoba','Córdoba CF','andalucia','コルドバ',[-4.764,37.869],'Córdoba CF.png','COR'],
 ['sporting','Real Sporting','asturias','ヒホン',[-5.637,43.54],'Sporting de Gijón.png','SPO'],
 ['ceutaclub','AD Ceuta FC','ceuta','セウタ',[-5.325,35.887],'AD Ceuta FC.png','CEU'],
 ['albacete','Albacete BP','castillalamancha','アルバセテ',[-1.851,38.997],'Albacete Balompié.png','ALB'],
 ['andorraclub','FC Andorra',null,'アンドラ',[1.521,42.505],'FC Andorra.png','AND'],
 ['granada','Granada CF','andalucia','グラナダ',[-3.599,37.154],'Granada CF.png','GRA'],
 ['sociedadb','Real Sociedad B','paisvasco','サン・セバスティアン',[-1.972,43.299],'Real Sociedad B.png','RSB'],
 ['leganes','CD Leganés','madrid','レガネス',[-3.76,40.339],'CD Leganés.png','LEG'],
 ['valladolid','Real Valladolid CF','castillayleon','バリャドリード',[-4.760,41.644],'Real Valladolid.png','VLL'],
 ['cadiz','Cádiz CF','andalucia','カディス',[-6.004,36.503],'Cádiz CF.png','CAD'],
 ['tenerife','CD Tenerife','canarias','テネリフェ',[-16.565,28.459],'CD Tenerife.png','TEN'],
 ['eldense','CD Eldense','comunitatvalenciana','エルダ',[-.79,38.476],'CD Eldense.png','ELD'],
 ['sabadell','CE Sabadell','cataluna','サバデル',[2.106,41.55],'CE Sabadell.png','SAB'],
 ['celtafortuna','Celta Fortuna','galicia','ビーゴ',[-8.734,42.211],'Celta Fortuna.png','CFB']
].map(([id,name,region,city,coordinate,file,short])=>({id,name,region,city,coordinate,file,short,offset:[0,0],division:2}));
// 1部チームのホームタウン→自治州対応表。元のCLUBS配列にも同じregion属性を追加します。
const FIRST_DIVISION_REGIONS={ath:'paisvasco',atleti:'madrid',osasuna:'navarra',celta:'galicia',alaves:'paisvasco',elche:'comunitatvalenciana',barca:'cataluna',getafe:'madrid',levante:'comunitatvalenciana',malaga:'andalucia',racing:'cantabria',rayo:'madrid',deportivo:'galicia',espanyol:'cataluna',betis:'andalucia',madrid:'madrid',sociedad:'paisvasco',sevilla:'andalucia',valencia:'comunitatvalenciana',villarreal:'comunitatvalenciana'};
CLUBS.forEach(c=>{c.division=1;c.region=FIRST_DIVISION_REGIONS[c.id];});
const ALL_CLUBS=[...CLUBS,...SECOND_DIVISION];
const byClub=Object.fromEntries(ALL_CLUBS.map(c=>[c.id,c]));

// 訪問者が選ぶスポットの位置。未定義のスポットは州中心付近に置くため、完全なGPS点ではありません。
// 地図に載せるための表示座標であり、施設の入場口や正確なピン位置ではない点に注意。
const SPOT_COORDS={
 'シエス諸島':[-8.92,42.22],'リアス・バイシャス':[-8.78,42.45],'サンティアゴ大聖堂':[-8.545,42.881],'ルーゴのローマ城壁':[-7.556,43.01],
 'ピコス・デ・エウロパ':[-4.89,43.19],'コバドンガ湖':[-4.98,43.27],'オビエド旧市街':[-5.846,43.362],'サンタ・マリア・デル・ナランコ':[-5.865,43.381],
 'カバルセノ自然公園':[-3.841,43.358],'サルディネーロ海岸':[-3.794,43.476],'アルタミラ洞窟':[-4.119,43.377],'サンティリャーナ・デル・マル':[-4.109,43.391],
 'ラ・コンチャ海岸':[-1.991,43.315],'ウルダイバイ生物圏保護区':[-2.695,43.345],'グッゲンハイム美術館':[-2.934,43.268],'ビルバオ旧市街':[-2.921,43.257],
 'バルデナス・レアレス':[-1.52,42.18],'イラティの森':[-1.14,42.98],'オリテ城':[-1.651,42.482],'パンプローナ旧市街':[-1.644,42.816],
 'エブロ川沿いの風景':[-2.48,42.47],'ぶどう畑の丘陵':[-2.81,42.47],'サン・ミジャンの修道院':[-2.857,42.324],'ログローニョ旧市街':[-2.446,42.465],
 'ラス・メドゥラス':[-6.77,42.47],'グレドス山脈':[-5.26,40.25],'セゴビア水道橋':[-4.119,40.948],'ブルゴス大聖堂':[-3.703,42.341],
 'オルデサ国立公園':[-.054,42.63],'ピレネー山脈':[.06,42.72],'ピラール聖母大聖堂':[-.879,41.656],'アルハフェリア宮殿':[-.897,41.658],
 'コスタ・ブラバ':[3.12,41.93],'モンセラート山':[1.838,41.594],'サグラダ・ファミリア':[2.174,41.403],'カサ・バトリョ':[2.165,41.391],
 'ペニスコラ海岸':[.406,40.36],'アルブフェラ自然公園':[-.34,39.33],'芸術科学都市':[-.352,39.455],'バレンシア大聖堂':[-.375,39.476],
 'シエラ・デ・グアダラマ':[-4.02,40.8],'レティーロ公園':[-3.682,40.415],'マドリード王宮':[-3.715,40.418],'プラド美術館':[-3.692,40.414],
 'ルイデラ湖群':[-2.87,38.95],'タブラス・デ・ダイミエル国立公園':[-3.81,39.15],'トレド旧市街':[-4.025,39.856],'クエンカの宙吊りの家':[-2.128,40.077],
 'モンフラグエ国立公園':[-6.03,39.85],'ヘルテ渓谷':[-5.74,40.2],'メリダのローマ劇場':[-6.339,38.915],'カセレス旧市街':[-6.371,39.476],
 'カボ・デ・ガタ':[-2.19,36.77],'ドニャーナ国立公園':[-6.36,36.99],'アルハンブラ宮殿':[-3.588,37.176],'セビリア大聖堂':[-5.992,37.386],
 'カラスパラの山景':[-1.7,38.24],'カルブランケ自然公園':[-.75,37.6],'カルタヘナのローマ劇場':[-.983,37.601],'ムルシア大聖堂':[-1.13,37.983],
 'カロ・デス・モロ':[3.18,39.314],'トラムンタナ山脈':[2.69,39.72],'パルマ大聖堂':[2.648,39.568],'ベルベル城':[2.62,39.563],
 'テイデ国立公園':[-16.64,28.272],'ティマンファヤ国立公園':[-13.74,29.0],'ラ・ラグーナ歴史地区':[-16.316,28.487],'セサル・マンリケの建築':[-13.57,29.07],
 'モンテ・アチョ':[-5.3,35.889],'地中海沿岸':[-5.31,35.9],'王立城壁':[-5.316,35.891],'ドラゴンの家':[-5.311,35.888],
 'アグアドゥ海岸':[-2.98,35.32],'地中海の入江':[-2.94,35.29],'メリリャ・ラ・ビエハ':[-2.942,35.293],'モダニズム建築群':[-2.944,35.291]
};
// Wikipediaのページタイトル（英語）。pageimages API でそのページのサムネイルを取得します。
const WIKI_TITLES={
 'シエス諸島':'Cies_Islands','リアス・バイシャス':'Rías_Baixas','サンティアゴ大聖堂':'Santiago_de_Compostela_Cathedral','ルーゴのローマ城壁':'Roman_walls_of_Lugo',
 'ピコス・デ・エウロパ':'Picos_de_Europa','コバドンガ湖':'Lakes_of_Covadonga','オビエド旧市街':'Oviedo','サンタ・マリア・デル・ナランコ':'Santa_María_del_Naranco',
 'カバルセノ自然公園':'Cabárceno_Natural_Park','サルディネーロ海岸':'El_Sardinero','アルタミラ洞窟':'Cave_of_Altamira','サンティリャーナ・デル・マル':'Santillana_del_Mar',
 'ラ・コンチャ海岸':'La_Concha_Beach','ウルダイバイ生物圏保護区':'Urdaibai','グッゲンハイム美術館':'Guggenheim_Museum_Bilbao','ビルバオ旧市街':'Bilbao',
 'バルデナス・レアレス':'Bardenas_Reales','イラティの森':'Irati_Forest','オリテ城':'Royal_Palace_of_Olite','パンプローナ旧市街':'Pamplona',
 'エブロ川沿いの風景':'Ebro','ぶどう畑の丘陵':'La_Rioja_(Spain)','サン・ミジャンの修道院':'Monasteries_of_San_Millán_de_la_Cogolla','ログローニョ旧市街':'Logroño',
 'ラス・メドゥラス':'Las_Médulas','グレドス山脈':'Sierra_de_Gredos','セゴビア水道橋':'Aqueduct_of_Segovia','ブルゴス大聖堂':'Burgos_Cathedral',
 'オルデサ国立公園':'Ordesa_y_Monte_Perdido_National_Park','ピレネー山脈':'Pyrenees','ピラール聖母大聖堂':'Basilica_of_Our_Lady_of_the_Pillar','アルハフェリア宮殿':'Aljafería',
 'コスタ・ブラバ':'Costa_Brava','モンセラート山':'Montserrat_(mountain)','サグラダ・ファミリア':'Sagrada_Família','カサ・バトリョ':'Casa_Batlló',
 'ペニスコラ海岸':'Peniscola','アルブフェラ自然公園':'Albufera','芸術科学都市':'City_of_Arts_and_Sciences','バレンシア大聖堂':'Valencia_Cathedral',
 'シエラ・デ・グアダラマ':'Sierra_de_Guadarrama','レティーロ公園':'Buen_Retiro_Park','マドリード王宮':'Royal_Palace_of_Madrid','プラド美術館':'Museo_del_Prado',
 'ルイデラ湖群':'Lagunas_de_Ruidera','タブラス・デ・ダイミエル国立公園':'Tablas_de_Daimiel_National_Park','トレド旧市街':'Toledo,_Spain','クエンカの宙吊りの家':'Hanging_Houses_of_Cuenca',
 'モンフラグエ国立公園':'Monfragüe','ヘルテ渓谷':'Jerte_Valley','メリダのローマ劇場':'Roman_Theatre_of_Mérida','カセレス旧市街':'Cáceres,_Spain',
 'カボ・デ・ガタ':'Cabo_de_Gata-Níjar_Natural_Park','ドニャーナ国立公園':'Doñana_National_Park','アルハンブラ宮殿':'Alhambra','セビリア大聖堂':'Seville_Cathedral',
 'カラスパラの山景':'Caravaca_de_la_Cruz','カルブランケ自然公園':'Calblanque_Regional_Park','カルタヘナのローマ劇場':'Roman_theatre_of_Cartagena','ムルシア大聖堂':'Murcia_Cathedral',
 'カロ・デス・モロ':'Calo_des_Moro','トラムンタナ山脈':'Serra_de_Tramuntana','パルマ大聖堂':'Palma_Cathedral','ベルベル城':'Bellver_Castle',
 'テイデ国立公園':'Teide_National_Park','ティマンファヤ国立公園':'Timanfaya_National_Park','ラ・ラグーナ歴史地区':'San_Cristóbal_de_La_Laguna','セサル・マンリケの建築':'César_Manrique',
 'モンテ・アチョ':'Monte_Hacho','王立城壁':'Royal_Walls_of_Ceuta','ドラゴンの家':'Casa_de_los_Dragones','メリリャ・ラ・ビエハ':'Melilla_la_Vieja',
 // 食べ物は都市ではなく料理名をページとして検索します。
 'プルポ・ア・ラ・ガジェガ':'Polbo_á_feira','エンパナーダ':'Empanada','ファバーダ':'Fabada_asturiana','アストゥリアスのシードラ':'Cider_in_Spain',
 'コシード・モンタニェス':'Cocido_montañés','ソバオ':'Sobao','ピンチョス':'Pincho','バスクチーズケーキ':'Basque_cheesecake',
 'チストラ':'Chistorra','ポチャス豆の煮込み':'Pochas','パタタス・ア・ラ・リオハナ':'Patatas_a_la_riojana',
 'レチャソ・アサード':'Lechazo','モルシージャ':'Morcilla','テルナスコ・デ・アラゴン':'Ternasco','ミガス':'Migas',
 'パン・コン・トマテ':'Pa_amb_tomàquet','クレマ・カタラーナ':'Crema_catalana','パエリア・バレンシアーナ':'Paella','オルチャータ':'Horchata',
 'ボカディージョ・デ・カラマレス':'Bocadillo_de_calamares','コシード・マドリレーニョ':'Cocido_madrileño','マンチェゴチーズ':'Manchego',
 'ピスト・マンチェゴ':'Pisto','イベリコ豚の生ハム':'Jamón_ibérico','ガスパチョ':'Gazpacho','サルモレホ':'Salmorejo',
 'カルデロ':'Caldero','パパラホテ':'Paparajotes','エンサイマーダ':'Ensaimada','ソブラサーダ':'Sobrasada',
 'パパス・アルガダス':'Papas_arrugadas','モホソース':'Mojo_(sauce)','クスクス':'Couscous'
};
// 特定地域の風景を説明。説明辞書にない場合は地域ガイドを表示します。
const SPOT_DESCRIPTIONS={
 'カロ・デス・モロ':'マヨルカ島南東部の小さな入り江。ターコイズブルーの海と石灰岩の崖で知られます。',
 'サグラダ・ファミリア':'アントニ・ガウディが設計したバルセロナの大聖堂。独特の塔と装飾が魅力です。',
 'コスタ・ブラバ':'カタルーニャ北東部の海岸。岩場と入り江が連続し、海沿いの町々を楽しめます。',
 'ピコス・デ・エウロパ':'スペイン北部の石灰岩山脈。登山道と深い谷が特徴です。',
 'アルハンブラ宮殿':'グラナダの丘の上に広がる宮殿群。イスラム建築の精緻な装飾が見どころです。',
 'パルマ大聖堂':'マヨルカ島パルマの海沿いに建つ壮大なゴシック建築です。',
 'パエリア・バレンシアーナ':'バレンシアを代表する米料理。地域の食文化を知る定番の一皿です。',
 'エンサイマーダ':'マヨルカ島で親しまれている渦巻き状の菓子パンです。',
 'グッゲンハイム美術館':'ビルバオの川沿いに建つ曲線的な現代建築。現代アートの美術館です。'
};

// カテゴリーごとに地域の特徴を優先してアイコンを選ぶ。
function spotIcon(spot,kind){
 const n=spot.name;
 if(kind==='nature'){
  if(/テイデ|ティマンファヤ|火山/.test(n))return '🌋';
  if(/海岸|海|島|コスタ|カロ|サルディネーロ|ラ・コンチャ|カボ/.test(n))return '🌊';
  if(/山|山脈|ピコス|トラムンタナ|グレドス|モンセラート|ピレネー/.test(n))return '🏔️';
  if(/森|林/.test(n))return '🌲';
  if(/湖|川|アルブフェラ/.test(n))return '💧';
  if(/砂漠|バルデナス/.test(n))return '🏜️';
  return '🌿';
 }
 if(kind==='culture'){
  if(/大聖堂|修道院|ピラール|サンタ・マリア/.test(n))return '⛪';
  if(/城|宮殿|王宮|アルハンブラ|アルハフェリア/.test(n))return '🏰';
  if(/美術館|博物館|洞窟/.test(n))return '🖼️';
  if(/旧市街|歴史地区|モダニズム/.test(n))return '🏘️';
  return '🏛️';
 }
 if(/パエリア|ガスパチョ|サルモレホ|コシード|ミガス|ピスト|ファバーダ|カルデロ/.test(n))return '🥘';
 if(/タパス|プルポ|魚介/.test(n))return '🦐';
 if(/チーズ|モルシージャ|生ハム|ソブラサーダ|レチャソ/.test(n))return '🧀';
 if(/ケーキ|ソバオ|クレマ|エンサイマーダ|菓子/.test(n))return '🍮';
 if(/シードラ|オルチャータ/.test(n))return '🥤';
 if(/ぶどう/.test(n))return '🍇';
 return '🍽️';
}
function makeSpot(regionId,kind,index){
 const region=byRegion[regionId],name=TOPIC_DATA[regionId].spots[kind][index];
 const base=REGION_POS[regionId];const exact=SPOT_COORDS[name];
 // 小さな州でも重ならないように、料理のピンは州の中心から少しずらします。
 let coord=exact||[base[0]+(index?0.12:-0.10),base[1]+(index?-.07:.08)];
 if(kind==='food')coord=[base[0]+(index?.16:-.16),base[1]+(index?-.12:.12)];
 const icon=spotIcon({name},kind);
 const description=SPOT_DESCRIPTIONS[name]|| (kind==='food'?`${region.name}で親しまれる料理・名物です。現地のレストランや市場で探してみましょう。` : `${region.name}を代表するスポットのひとつ。${region.description}`);
 return {id:`${regionId}-${kind}-${index}`,region:regionId,kind,name,coord,icon,description,wiki:WIKI_TITLES[name]||region.english};
}
const SPOTS=REGIONS.flatMap(r=>['nature','culture','food'].flatMap(kind=>[0,1].map(i=>makeSpot(r.id,kind,i))));
const bySpot=Object.fromEntries(SPOTS.map(s=>[s.id,s]));
const NATIONAL_FEATURED={
 nature:['baleares','cataluna','galicia','aragon','andalucia','canarias','asturias','comunitatvalenciana'],
 culture:['cataluna','madrid','andalucia','castillayleon','baleares','galicia','aragon','castillalamancha'],
 food:['comunitatvalenciana','paisvasco','baleares','galicia','andalucia','cataluna','madrid','asturias']
};
const NATIONAL_SPOTS={};
for(const cat of ['nature','culture','food'])NATIONAL_SPOTS[cat]=NATIONAL_FEATURED[cat].map(r=>bySpot[`${r}-${cat}-0`]);

// 日時はスペイン現地のCET表記。サイト自体には時刻表APIへの接続を行わない。
const FIXTURES=[
 ['10/30','21:00','villarreal','espanyol'],
 ['10/31','14:00','levante','atleti'],['10/31','16:15','rayo','celta'],
 ['10/31','18:30','betis','malaga'],['10/31','21:00','barca','alaves'],
 ['11/01','14:00','getafe','sevilla'],['11/01','16:15','racing','madrid'],
 ['11/01','18:30','elche','valencia'],['11/01','21:00','ath','sociedad'],
 ['11/02','21:00','deportivo','osasuna'],['11/06','21:00','sevilla','alaves'],
 ['11/07','14:00','malaga','racing'],['11/07','16:15','espanyol','deportivo'],
 ['11/07','18:30','osasuna','ath'],['11/07','21:00','valencia','madrid'],
 ['11/08','14:00','elche','betis'],['11/08','16:15','sociedad','rayo'],
 ['11/08','18:30','celta','levante'],['11/08','18:30','villarreal','getafe'],
 ['11/08','21:00','atleti','barca']
];
function renderFixtures(){
 const box=$('fixtures'),grid=$('fixture-cards');box.hidden=topic!=='football';if(box.hidden)return;
 const current=activeRegion?FIXTURES.filter(f=>[f[2],f[3]].some(id=>byClub[id]?.region===activeRegion)):FIXTURES;
 const list=current.slice(0,activeRegion?9:9);
 $('fixtures-description').textContent=activeRegion?`${byRegion[activeRegion].name}の1部クラブが出場する試合を表示。2部の日程は公式サイトへ。`:'1部の主な試合を表示（スペイン現地時間・CET）';
 grid.replaceChildren();
 if(!list.length){grid.append(create('p','', 'この期間に該当地域の1部クラブの試合はありません。公式日程もご確認ください。'));return;}
 list.forEach(f=>{
  const item=create('article','fixture-item');item.append(create('div','fixture-date',`2026/${f[0]} · ${f[1]} CET`));
  item.append(create('div','fixture-team',`${byClub[f[2]]?.name||f[2]}  vs  ${byClub[f[3]]?.name||f[3]}`));
  item.append(create('div','fixture-sub','LaLiga EA SPORTS · 参考日程'));grid.append(item);
 });
}

// コンテンツがSVG viewBox内にあるときだけ通常のmarkerを配置する。
// ここで元の地理座標を、現在のviewBoxに対する割合(%)へ変換します。
function screenFraction(x,y){return [(x-view.x)/view.w*100,(y-view.y)/view.h*100];}
function placeMarker(x,y,cssClass,label,content,onClick){
 const [left,top]=screenFraction(x,y);
 if(left<-.5||left>100.5||top<-.5||top>100.5)return null;
 const b=create('button','marker '+cssClass);b.type='button';b.style.left=left+'%';b.style.top=top+'%';
 b.setAttribute('aria-label',label);
 if(typeof content==='string')b.textContent=content;else b.append(content);
 b.addEventListener('click',onClick);el.markers.append(b);return b;
}
function displayRegionSelection(){
 $('back-to-spain').hidden=!activeRegion;
 $('view-kicker').textContent=activeRegion?'REGIONAL MAP':'NATIONAL MAP';
 $('view-name').textContent=activeRegion?byRegion[activeRegion].name:'スペイン全体';
 $('region-picker').value=activeRegion||'';
 document.querySelectorAll('.region-shape').forEach(p=>p.classList.toggle('is-selected',p.dataset.region===activeRegion));
}
function getShapeForRegion(id){
 const layer=document.body.classList.contains('borders-ready')?'regional-borders':'offline-regions';
 return document.querySelector(`#${layer} [data-region="${id}"]`)||document.querySelector(`#offline-regions [data-region="${id}"]`);
}
function setViewBounds(x,y,w,h){
 // デフォルトの画面縦横比を維持したまま、ビューを拡大する。
 view={x,y,w,h};$svg.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);
}
function zoomToRegion(id){
 if(!id){setViewBounds(0,0,MAP_W,MAP_H);$canvas.classList.remove('is-regional');return;}
 const shape=getShapeForRegion(id);if(!shape){setViewBounds(0,0,MAP_W,MAP_H);return;}
 const r=shape.getBBox(),ratio=MAP_W/MAP_H;
 // 小さい州を極端に拡大しすぎないため最低の幅を設定。
 const minW=id==='ceuta'||id==='melilla'?210:id==='canarias'?320:155;
 const w=Math.max(r.width*1.5,r.height*1.5*ratio,minW),h=w/ratio;
 setViewBounds(r.x+r.width/2-w/2,r.y+r.height/2-h/2,w,h);$canvas.classList.add('is-regional');
}
function openRegion(id,scrollToMap=false,updateHistory=true){
 if(id&&!byRegion[id])return;
 hidePopup();activeRegion=id||null;if(id)selectedRegion=id;
 // URLのハッシュも記録し、州別ページの共有・ブラウザの戻る操作に対応。
 if(updateHistory){const nextHash=id?'#region/'+encodeURIComponent(id):'#explore';
   if(location.hash!==nextHash)history.pushState({region:id},'',nextHash);}
 zoomToRegion(id);displayRegionSelection();
 if(id)showRegion(id);else showRegion(selectedRegion);
 renderMarkers();renderCards();renderFixtures();updateRailVisibility();
 if(scrollToMap){$('map-scroll').scrollLeft=0; $('explore').scrollIntoView({behavior:'smooth',block:'start'});}
}

function showRegion(id){$('ticket-information').replaceChildren();
 const r=byRegion[id];if(!r)return;selectedRegion=id;
 const kind=['nature','culture','food'].includes(topic)?topic:'nature';
 const spots=TOPIC_DATA[id].spots[kind];
 $('detail-overline').textContent=`REGION GUIDE · ${String(r.index+1).padStart(2,'0')} / 19`;
 $('detail-symbol').replaceChildren(document.createTextNode(spotIcon({name:spots[0]},kind)));
 $('detail-title').textContent=r.name;
 $('detail-description').textContent=r.description;
 $('detail-list').replaceChildren(...spots.map(s=>create('span','',s)));
 $('detail-actions').replaceChildren();
 const button=create('button','back-region',activeRegion?'この州の地図を表示中':'この州の地図を開く →');button.disabled=activeRegion===id;
 button.addEventListener('click',()=>openRegion(id,true));$('detail-actions').append(button);
 $('detail-actions').append(link('Googleマップで探す ↗','https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(r.name+' Spain')));
 highlightCards();
}

// ===== v4: 料金・購入先の表示データ =====
// 値段は日時や券種によって変わるため、確証できないものは数値を記載しない。
// 施設公式URLが確認できている観光地のみ直接リンクする。
const OFFICIAL_ATTRACTIONS={
 'サグラダ・ファミリア': 'https://sagradafamilia.org/en/tickets',
 'カサ・バトリョ': 'https://www.casabatllo.es/en/online-tickets/',
 'アルハンブラ宮殿': 'https://tickets.alhambra-patronato.es/en/',
 'プラド美術館': 'https://www.museodelprado.es/en/visit-the-museum',
 'マドリード王宮': 'https://tickets.patrimonionacional.es/en',
 'グッゲンハイム美術館': 'https://www.guggenheim-bilbao.eus/en/tickets',
 'パルマ大聖堂': 'https://catedraldemallorca.org/en/',
 'セビリア大聖堂': 'https://www.catedraldesevilla.es/en/',
 'セゴビア水道橋': 'https://www.turismodesegovia.com/en/',
 'グエル公園': 'https://parkguell.barcelona/en/buy-tickets'
};
function accessInfo(s){
 const official=OFFICIAL_ATTRACTIONS[s.name];
 // 屋外を無料と断定しない。観光地自体の入場無料と施設の料金を区別する。
 const outdoor=/海岸|ビーチ|旧市街|山脈|山$|森林|森$|渓谷|湖群|丘陵|大西洋|海の入江|ビーチ|カラ・|コスタ・|岬|海辺|川沿い/.test(s.name);
 if(s.kind==='food')return {admission:'飲食店ごとに異なります',price:'メニュー・店舗ごとに異なります',url:null,label:'飲食店・メニューを地図で探す',note:'料理そのものに入場料はありません。'};
 if(official)return {admission:'有料券が必要な場合があります',price:'券種・訪問日によって変わります（公式で確認）',url:official,label:'施設の公式情報・チケット ↗',note:'入場条件、予約枠、価格は公式ページで最終確認してください。'};
 if(outdoor)return {admission:'屋外は無料で訪問できる場所が多いです',price:'施設・ツアー・駐車場等は別料金の場合あり',url:null,label:'アクセス・現地情報を検索 ↗',note:'保護区・遊歩道などは予約や入域制限がある場合があります。'};
 return {admission:'施設・エリアにより有料または無料',price:'未確認（公式窓口で確認してください）',url:null,label:'施設を地図で探す ↗',note:'価格や公式販売先を確認できない場合は推測して表示しません。'};
}
function mapsSpotUrl(s){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.name+' '+byRegion[s.region].name);}
function renderAdmission(target,entry,fallback){
 const box=$(target); if(!box)return;
 box.replaceChildren();
 const title=create('strong','', '🎟️ 入場・チケット情報');
 box.append(title,create('div','', '入場：'+entry.admission),create('div','', '料金：'+entry.price));
 const a=document.createElement('a');a.href=entry.url||fallback;a.target='_blank';a.rel='noopener noreferrer';a.textContent=entry.label;box.append(a);
 box.append(create('small','',entry.note));
}
// Aenaの公式空港一覧を基にした主要拠点（全空港ではありません）。
// [IATA, 日本語名, 経度, 緯度, 所属地域, AenaサイトのURL用スラッグ]
const AIRPORTS=[
 ['MAD','マドリード・バラハス',-3.568,40.472,'madrid','adolfo-suarez-madrid-barajas'],
 ['BCN','バルセロナ・エル・プラット',2.079,41.297,'cataluna','josep-tarradellas-barcelona-el-prat'],
 ['PMI','パルマ・デ・マヨルカ',2.739,39.552,'baleares','palma-de-mallorca'],
 ['AGP','マラガ・コスタ・デル・ソル',-4.499,36.675,'andalucia','malaga-costa-del-sol'],
 ['ALC','アリカンテ＝エルチェ',-0.558,38.282,'comunitatvalenciana','alicante-elche-miguel-hernandez'],
 ['VLC','バレンシア',-0.482,39.490,'comunitatvalenciana','valencia'],
 ['SVQ','セビリア',-5.899,37.418,'andalucia','sevilla'],
 ['BIO','ビルバオ',-2.911,43.301,'paisvasco','bilbao'],
 ['IBZ','イビサ',1.374,38.873,'baleares','ibiza'],
 ['LPA','グラン・カナリア',-15.386,27.932,'canarias','gran-canaria'],
 ['TFS','テネリフェ・スール',-16.572,28.045,'canarias','tenerife-sur'],
 ['TFN','テネリフェ・ノルテ',-16.341,28.483,'canarias','tenerife-norte-ciudad-de-la-laguna'],
 ['ACE','ランサローテ',-13.605,28.946,'canarias','cesar-manrique-lanzarote'],
 ['MAH','メノルカ',4.218,39.863,'baleares','menorca'],
 ['SCQ','サンティアゴ',-8.415,42.896,'galicia','santiago-rosalia-de-castro'],
 ['GRO','ジローナ',2.760,41.900,'cataluna','girona-costa-brava']
];
function airportUrl(a){return 'https://www.aena.es/en/passengers/our-airports.html';}
function showAirport(a){
 selectedStation='';$('detail-overline').textContent='AIRPORT / AENA';
 $('detail-symbol').textContent='✈️';$('detail-title').textContent=a[1]+' ('+a[0]+')';
 $('detail-description').textContent='主要空港の所在地を表示しています。航空券料金・就航路線・時刻は航空会社の情報を確認してください。';
 $('detail-list').replaceChildren(create('span','',a[0]),create('span','',byRegion[a[4]]?.name||'スペイン'));
 $('detail-actions').replaceChildren(link('Aena 公式空港情報 ↗',airportUrl(a)),link('航空便を検索 ↗','https://www.google.com/travel/flights?hl=ja'));
 $('ticket-information').replaceChildren(create('div','', '空港の利用に通常の観光入場券は不要です。航空券の料金は便・日付により変動します。'));
 highlightCards();
}
function showAirportCards(grid,term){
 let n=0;AIRPORTS.filter(a=>!activeRegion||a[4]===activeRegion).forEach(a=>{
  if(!normalize(a[0]+' '+a[1]).includes(term))return;
  const b=create('button','place-card');b.type='button';b.append(create('span','badge-icon','✈️'));
  const t=create('div');t.append(create('strong','',a[1]+' ('+a[0]+')'),create('small','','主要空港 · Aena'));b.append(t);
  b.addEventListener('click',()=>{showAirport(a);focusMap([a[2],a[3]],a[4]==='canarias'?'canarias':'');});grid.append(b);n++;
 });return n;
}

function showSpot(s){
 selectedRegion=s.region;const r=byRegion[s.region];
 $('detail-overline').textContent=`${TOPICS[s.kind].label.toUpperCase()} · ${r.name}`;
 $('detail-symbol').replaceChildren(document.createTextNode(s.icon));
 $('detail-title').textContent=s.name;
 $('detail-description').textContent=s.description;
 $('detail-list').replaceChildren(create('span','',r.name),create('span','',TOPICS[s.kind].label));
 $('detail-actions').replaceChildren(link('Googleマップで探す ↗',mapsSpotUrl(s)));
 renderAdmission('ticket-information',accessInfo(s),mapsSpotUrl(s));
 highlightCards();
}
function showClub(id){
 selectedClub=id;const c=byClub[id];if(!c)return;
 const place=c.region?byRegion[c.region].name:'アンドラ公国';
 $('detail-overline').textContent=`${c.division===1?'LALIGA EA SPORTS':'LALIGA HYPERMOTION'} · 2026/27`;
 const ic=$('detail-symbol');ic.replaceChildren();
 const img=logoImg(c);ic.append(img);img.onerror=()=>{ic.textContent='⚽';};
 $('detail-title').textContent=c.name;
 $('detail-description').textContent=`本拠地：${c.city}（${place}）。2026/27シーズンの${c.division}部クラブ。地図ではホームタウン付近を表示しています。`;
 $('detail-list').replaceChildren(create('span','',`${c.division}部`),create('span','',c.city));
 $('detail-actions').replaceChildren(link('ホームスタジアムを探す ↗','https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(c.name+' stadium')),link('LaLiga 公式日程・チケット案内 ↗',c.division===1?'https://www.laliga.com/laliga-easports/calendario':'https://www.laliga.com/laliga-hypermotion/calendario'));
 $('ticket-information').replaceChildren(create('strong','','🎟️ 観戦チケット'),create('div','','料金：試合・座席・対戦カードごとに変動します。'),create('small','','購入はクラブの公式販売ページで確認してください。未確認の販売サイトを直接案内しません。'));
 highlightCards();
}
function showStation(id){
 selectedStation=id;const s=STATIONS[id];if(!s)return;
 $('detail-overline').textContent='RAILWAY NETWORK · STATION';$('detail-symbol').textContent='🚄';
 $('detail-title').textContent=s[0];$('detail-description').textContent='代表的な鉄道回廊を地図に重ねています。線形や停車駅・ダイヤの正確性は保証しません。';
 $('detail-list').replaceChildren(create('span','','主要駅'),create('span','','地図は概略'));$('detail-actions').replaceChildren(link('Renfe公式 ↗','https://www.renfe.com/es/en'));$('ticket-information').replaceChildren(create('div','','列車の運賃は区間・日時・券種によって変動します。'));
 highlightCards();
}
// ネットに繋がらない場合もポップアップが空白にならないよう、簡易SVGイラストを使います。
function placeholderImage(s){
 const bg=s.kind==='nature'?['#71b9c1','#296b83']:s.kind==='culture'?['#c6a37a','#775d65']:['#f3c184','#a65c45'];
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs><rect width="640" height="320" fill="url(#g)"/><circle cx="540" cy="76" r="55" fill="#fff" opacity=".24"/><path d="M0 270Q130 150 245 240T510 225T640 205V320H0Z" fill="#fff" opacity=".17"/><text x="52" y="184" font-size="96" font-family="sans-serif">${s.icon}</text><text x="52" y="267" font-size="21" font-family="sans-serif" fill="white">ESPAÑA ATLAS · ${s.kind.toUpperCase()}</text></svg>`;
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
// Wikipedia公開APIはCORSに対応。写真URLは取得できた場合のみ使用します。
async function getSpotPhoto(s){
 if(imageCache.has(s.id))return imageCache.get(s.id);
 const title=s.wiki||s.name;
 const request=`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=720&titles=${encodeURIComponent(title)}`;
 try{
  const ctrl=new AbortController();const stop=setTimeout(()=>ctrl.abort(),7000);
  let response;try{response=await fetch(request,{signal:ctrl.signal});}finally{clearTimeout(stop);}
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();const pages=Object.values(data.query?.pages||{});
  const url=pages.find(x=>x.thumbnail?.source)?.thumbnail?.source;
  if(url&&url.startsWith('https://')){imageCache.set(s.id,url);return url;}
 }catch(e){}
 imageCache.set(s.id,null);return null;
}
function setPopupLocation(anchor){
 if(!anchor)return;const rect=anchor.getBoundingClientRect();
 const w=334,gap=12;
 const left=Math.min(window.innerWidth-w-12,Math.max(12,rect.left+rect.width/2-w/2));
 // 位置が上に入らない場合はピンの下に出す。モバイルはCSSで下端固定。
 const top=rect.top>320?Math.max(12,rect.top-350-gap):Math.min(window.innerHeight-360,rect.bottom+gap);
 $popup.style.left=left+'px';$popup.style.top=Math.max(12,top)+'px';
}
function showPopupForSpot(s,anchor){
 hoverSpot=s;clearTimeout(tooltipTimer);
 $('spot-popup-kicker').textContent=`${TOPICS[s.kind].label} / ${byRegion[s.region].name}`;
 $('spot-popup-title').textContent=s.name;$('spot-popup-text').textContent=s.description;
 renderAdmission('spot-popup-tickets',accessInfo(s),mapsSpotUrl(s));
 $('spot-popup-link').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.name+' '+byRegion[s.region].name);
 $('spot-popup-credit').textContent='参考イラスト · Wikipedia写真を読込中';
 const img=$('spot-popup-image');img.alt=s.name+'の参考イメージ';img.src=placeholderImage(s);
 $popup.hidden=false;setPopupLocation(anchor);
 getSpotPhoto(s).then(url=>{
  if(hoverSpot?.id!==s.id||$popup.hidden)return;
  if(url){img.src=url;img.alt=s.name+'のWikipedia記事に掲載された参考写真';$('spot-popup-credit').textContent='写真：Wikipedia掲載の参考画像（元記事に権利情報）';
  img.onerror=()=>{img.src=placeholderImage(s);$('spot-popup-credit').textContent='写真を読み込めなかったため参考イラストを表示';};}
  else $('spot-popup-credit').textContent='参考イラスト（写真を取得できませんでした）';
 });
}
function hidePopup(){clearTimeout(tooltipTimer);$popup.hidden=true;hoverSpot=null;}
function scheduleHidePopup(){clearTimeout(tooltipTimer);tooltipTimer=setTimeout(hidePopup,220);}
function attachSpotHover(button,s){
 if(!button)return;
 button.addEventListener('mouseenter',()=>showPopupForSpot(s,button));
 button.addEventListener('mouseleave',scheduleHidePopup);
 button.addEventListener('focus',()=>showPopupForSpot(s,button));
 button.addEventListener('blur',scheduleHidePopup);
}
function makeClubIcon(c){
 const span=create('span');const image=logoImg(c);span.append(image);
 const fallback=create('span','fallback-logo',c.short);span.append(fallback);
 image.onerror=()=>{image.hidden=true;fallback.style.display='inline';};
 return span;
}
function visibleClubs(){return activeRegion?ALL_CLUBS.filter(c=>c.region===activeRegion):CLUBS;}
function visibleSpots(){return activeRegion?SPOTS.filter(s=>s.region===activeRegion&&s.kind===topic):NATIONAL_SPOTS[topic]||[];}
function renderMarkers(){
 hidePopup();el.markers.replaceChildren();
 if(topic==='football'){
  const entries=visibleClubs();
  entries.forEach((club,i)=>{
   const shift=club.division===2?[i%3*7-7, (i%2?10:-8)]:club.offset;
   const [x,y]=getPosition(club.coordinate,club.region==='canarias'?'canarias':'',shift);
   const b=placeMarker(x,y,'club',club.name+'（'+club.division+'部）',makeClubIcon(club),()=>showClub(club.id));
   if(b)b.dataset.key=club.id;
  });
 }else if(topic==='transport'){
  const ids=new Set(RAIL_LINES.flatMap(r=>r.stops));
  ids.forEach(id=>{const s=STATIONS[id],[x,y]=geoToXY([s[1],s[2]]);
   const b=placeMarker(x,y,'city',s[0]+'（主要駅）','',()=>showStation(id));if(b)b.dataset.key=id;});
  // 交通タブでは駅だけでなく主要空港も青いピンで表示。
  AIRPORTS.filter(a=>!activeRegion||a[4]===activeRegion).forEach(a=>{const [x,y]=geoToXY([a[2],a[3]],a[4]==='canarias'?'canarias':'');placeMarker(x,y,'airport',a[1]+' ('+a[0]+')','✈ '+a[0],()=>showAirport(a));});
 }else{
  visibleSpots().forEach(s=>{
   const [x,y]=geoToXY(s.coord,s.region==='canarias'?'canarias':'');
   const b=placeMarker(x,y,'spot',s.name,s.icon,()=>{showSpot(s);showPopupForSpot(s,b);});
   if(b){b.dataset.key=s.id;attachSpotHover(b,s);}
  });
 }
 highlightMarkers();
}
function highlightMarkers(){document.querySelectorAll('.marker').forEach(b=>{
 const on=topic==='football'?b.dataset.key===selectedClub:topic==='transport'?b.dataset.key===selectedStation:false;
 b.classList.toggle('selected',on);
 });}
function highlightCards(){
 document.querySelectorAll('.place-card').forEach(c=>c.classList.toggle('current',topic==='football'?c.dataset.key===selectedClub:topic==='transport'?c.dataset.key===selectedStation:false));
 highlightMarkers();
}
function focusMap(coord,key=''){
 const map=$('map-scroll'),[x]=geoToXY(coord,key);
 const [fraction]=screenFraction(x,0);
 if(map.scrollWidth>map.clientWidth)map.scrollTo({left:Math.max(0,fraction/100*map.scrollWidth-map.clientWidth/2),behavior:'smooth'});
 $('explore').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderCards(){
 const term=normalize($('list-search').value),grid=el.grid;grid.replaceChildren();let count=0;
 if(topic==='football'){
  $('cards-title').textContent=activeRegion?`${byRegion[activeRegion].name}の1部・2部クラブ`:'LaLiga 1部の20クラブ';
  $('cards-description').textContent=activeRegion?'2026/27シーズンに1部と2部に所属する本拠地のクラブを表示します。':'全国では1部クラブを表示。州を選ぶと2部まで表示します。';
  visibleClubs().forEach(c=>{
   if(!normalize(c.name+' '+c.city).includes(term))return;count++;
   const b=create('button','place-card');b.type='button';b.dataset.key=c.id;
   const ic=create('span','badge-icon');ic.append(makeClubIcon(c));
   const txt=create('div');txt.append(create('strong','',c.name),create('small','',`LaLiga ${c.division}部 · ${c.city}`));
   b.append(ic,txt);b.addEventListener('click',()=>{showClub(c.id);focusMap(c.coordinate,c.region==='canarias'?'canarias':'');});grid.append(b);
  });$('list-count').textContent=count+'クラブ';
  if(activeRegion&&count===0)grid.append(create('p','', 'この州に本拠地がある1・2部クラブはありません。'));
 }else if(topic==='transport'){
  $('cards-title').textContent=activeRegion?`${byRegion[activeRegion].name}の主要駅`:'主要鉄道駅';
  $('cards-description').textContent='主要駅を選択すると地図上の場所が分かります。線路は概略図です。';
  Object.entries(STATIONS).forEach(([id,s])=>{
   const [x,y]=geoToXY([s[1],s[2]]),[fx,fy]=screenFraction(x,y);
   if(activeRegion&&(fx<0||fx>100||fy<0||fy>100))return;
   if(!normalize(s[0]).includes(term))return;count++;
   const b=create('button','place-card');b.type='button';b.dataset.key=id;
   b.append(create('span','badge-icon','🚄'));const t=create('div');t.append(create('strong','',s[0]),create('small','','主要駅'));b.append(t);
   b.addEventListener('click',()=>{showStation(id);focusMap([s[1],s[2]]);});grid.append(b);
  });count+=showAirportCards(grid,term);$('list-count').textContent=count+'地点（駅・空港）';
 }else if(activeRegion){
  $('cards-title').textContent=`${byRegion[activeRegion].name}の${TOPICS[topic].label}`;
  $('cards-description').textContent='スポットにホバーまたはタップすると画像付きの詳細が表示されます。';
  visibleSpots().forEach(s=>{
   if(!normalize(s.name+' '+byRegion[s.region].name).includes(term))return;count++;
   const b=create('button','place-card spot-card');b.type='button';b.dataset.key=s.id;
   b.append(create('span','badge-icon',s.icon));const t=create('div');t.append(create('strong','',s.name),create('small','',s.description.slice(0,32)+'…'));b.append(t);
   b.addEventListener('click',()=>{showSpot(s);showPopupForSpot(s,b);});attachSpotHover(b,s);grid.append(b);
  });$('list-count').textContent=count+'スポット';
 }else{
  $('cards-title').textContent='自治州・自治都市から探す';$('cards-description').textContent='地域を選ぶとその地域の専用地図に切り替わります。';
  REGIONS.forEach(r=>{
   if(!normalize(r.name+' '+r.english+' '+r.search+' '+TOPIC_DATA[r.id].spots[topic].join(' ')).includes(term))return;count++;
   const b=create('button','place-card');b.type='button';b.dataset.key=r.id;
   const s=bySpot[`${r.id}-${topic}-0`],i=create('span','badge-icon',s.icon),t=create('div');
   t.append(create('strong','',r.name),create('small','',TOPIC_DATA[r.id].spots[topic].join(' · ')));b.append(i,t);
   b.addEventListener('click',()=>openRegion(r.id,true));grid.append(b);
  });$('list-count').textContent=count+'地域';
 }
 highlightCards();
}

// SVG経由で描画した線を簡略表示（v2からの継続機能）。
function svgPath(pointIds){return 'M '+pointIds.map(id=>{const s=STATIONS[id],[x,y]=geoToXY([s[1],s[2]]);return `${x.toFixed(1)} ${y.toFixed(1)}`;}).join(' L ');}
function drawRails(){
 const group=$('rail-network');group.replaceChildren();
 RAIL_LINES.forEach(line=>{
  const p=document.createElementNS(MAP_NS,'path');p.setAttribute('d',svgPath(line.stops));
  if(line.kind==='conventional')p.setAttribute('class','conventional');
  const title=document.createElementNS(MAP_NS,'title');title.textContent=line.name+'（概略図）';p.append(title);group.append(p);
 });
 // 全主要駅を全て描くと重なるので、主要な結節点だけ小さい丸を打ちます。
 ['madrid','barcelona','zaragoza','valencia','sevilla','cordoba','malaga','valladolid','santiago','alicante','girona'].forEach(id=>{
  const s=STATIONS[id],[x,y]=geoToXY([s[1],s[2]]);const circle=document.createElementNS(MAP_NS,'circle');
  circle.setAttribute('cx',x);circle.setAttribute('cy',y);circle.setAttribute('r','6');group.append(circle);
 });
}
function updateRailVisibility(){
 const visible=railOverlay||topic==='transport';document.body.classList.toggle('rails-visible',visible);
 $('rail-toggle').setAttribute('aria-pressed',String(railOverlay));$('rail-toggle').textContent=railOverlay?'🚄 鉄道を隠す':'🚄 鉄道を重ねる';
}
// 主要駅間の接続から、ルート検索用の経路を計算します。
// これは実際の列車乗継案内ではなく、描画する路線を選ぶためのグラフ探索です。
function findRailPath(a,b){
 if(!a||!b||!STATIONS[a]||!STATIONS[b])return [];
 if(a===b)return [a];
 const edges=new Map(Object.keys(STATIONS).map(k=>[k,[]]));
 for(const route of RAIL_LINES){
  for(let i=0;i<route.stops.length-1;i++){
   const u=route.stops[i],v=route.stops[i+1];
   // 線形の本数が少ない場合の近似距離（緯度・経度の2次元距離）。
   const aa=STATIONS[u],bb=STATIONS[v];const dx=(aa[1]-bb[1])*.76,dy=aa[2]-bb[2];
   const cost=Math.hypot(dx,dy);
   edges.get(u).push([v,cost]);edges.get(v).push([u,cost]);
  }
 }
 const dist=new Map([[a,0]]),prev=new Map(),queue=[[a,0]];
 while(queue.length){queue.sort((u,v)=>u[1]-v[1]);const [u,cost]=queue.shift();
  if(u===b)break;if(cost>(dist.get(u)??Infinity))continue;
  for(const [v,w] of edges.get(u))if(cost+w<(dist.get(v)??Infinity)){
   dist.set(v,cost+w);prev.set(v,u);queue.push([v,cost+w]);
  }
 }
 if(!dist.has(b))return [];
 const path=[b];let at=b;while(prev.has(at)){at=prev.get(at);path.unshift(at);}return path;
}
function markRailPath(ids){
 const group=$('rail-selected');group.replaceChildren();highlightedRoute=ids;
 if(ids.length<2)return;
 const p=document.createElementNS(MAP_NS,'path');p.setAttribute('d',svgPath(ids));group.append(p);
}


function setTopic(next){
 if(!TOPICS[next])return;
 topic=next;hidePopup();
 document.querySelectorAll('.topic').forEach(b=>{const active=b.dataset.topic===next;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 $('map-subtitle').textContent=(activeRegion?byRegion[activeRegion].name+' / ':'')+TOPICS[topic].description;
 if(topic!=='transport')markRailPath([]);
 if(topic==='football'){
  const list=visibleClubs();if(list.length){const c=list.find(c=>c.id===selectedClub)||list[0];showClub(c.id);}else showRegion(activeRegion||selectedRegion);
 }else if(topic==='transport')showStation(selectedStation);
 else showRegion(activeRegion||selectedRegion);
 updateRailVisibility();renderMarkers();renderCards();renderFixtures();
}
// 元版の都市間・都市内交通を保持。下記の setTopic('transport') が新しい地図にも対応。
function fillSelect(el,entries){el.replaceChildren();for(const [value,label] of entries){const option=create('option','',label);option.value=value;el.append(option);}}
const cityOptions=Object.entries(CITY_LIST).map(([id,c])=>[id,c.name]);
fillSelect($('trip-from'),cityOptions);fillSelect($('trip-to'),cityOptions);
fillSelect($('local-city'),cityOptions);
$('trip-from').value='barcelona';$('trip-to').value='madrid';
const mapsUrl=(from,to,mode)=>'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(from)+'&destination='+encodeURIComponent(to)+(mode?'&travelmode='+mode:'');
function intercitySearch(showMap=false){
 const source=CITY_LIST[$('trip-from').value],dest=CITY_LIST[$('trip-to').value];
 $('trip-heading').textContent=source.name+' → '+dest.name;
 const same=source===dest,island=!source.station||!dest.station;
 const result=$('trip-options');result.replaceChildren();
 if(same){$('trip-status').textContent='出発地と目的地が同じです。異なる都市を選択してください。';markRailPath([]);return;}
 const route=(!island&&source.station&&dest.station)?findRailPath(source.station,dest.station):[];
 $('trip-status').textContent=island?'島への移動を含みます。航空便やフェリーを確認してください。':route.length>1?'地図には代表的な鉄道経由地を表示します（実際の乗り換えを保証しません）。':'主要鉄道回廊の対象外です。最新の移動手段を確認してください。';
 if(!island){result.append(link('🚄 鉄道・公共交通 ↗',mapsUrl(source.en,dest.en,'transit')));}
 result.append(link('✈️ 航空便を探す ↗','https://www.google.com/travel/flights?hl=ja'));
 if(!island)result.append(link('🚌 バス/道路 ↗',mapsUrl(source.en,dest.en,'driving')));
 if(island)result.append(link('⛴️ 島への航路 ↗','https://www.spain.info/en/discover-spain/main-sea-connections-spain/'));
 result.append(link('📍 地図で経路を見る ↗',mapsUrl(source.en,dest.en,island?'':'transit')));
 markRailPath(route);updateRailVisibility();
 if(showMap){setTopic('transport');markRailPath(route);const point=source.station?STATIONS[source.station]:null;
  if(point)focusMap([point[1],point[2]]);
 }
}
function localCityChange(){
 const city=CITY_LIST[$('local-city').value];
 fillSelect($('local-from'),city.starts.map(v=>[v,v]));fillSelect($('local-to'),city.spots.map(v=>[v,v]));localUpdate();
}
function localUpdate(){
 const city=CITY_LIST[$('local-city').value];
 const from=$('local-from').value+', '+city.en,to=$('local-to').value+', '+city.en;
 $('local-heading').textContent=$('local-from').value+' → '+$('local-to').value;
 $('local-public').href=mapsUrl(from,to,'transit');$('local-walk').href=mapsUrl(from,to,'walking');$('local-drive').href=mapsUrl(from,to,'driving');
}
function switchTravelTab(mode){
 transportMode=mode;
 const local=mode==='local';$('intercity-panel').hidden=local;$('local-panel').hidden=!local;
 $('intercity-tab').classList.toggle('active',!local);$('local-tab').classList.toggle('active',local);
 $('intercity-tab').setAttribute('aria-pressed',String(!local));$('local-tab').setAttribute('aria-pressed',String(local));
}


// --------------------------------------------------------------------
// 自治州境界（オンライン：正確 / オフライン：概略図）
// --------------------------------------------------------------------
const BOUNDARY_DATA_URL='https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/spain-communities.geojson';
function romanized(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'');}
const REGION_LOOKUP={
 galicia:'galicia',asturias:'asturias',principadodeasturias:'asturias',cantabria:'cantabria',
 paisvasco:'paisvasco',euskadi:'paisvasco',basquecountry:'paisvasco',navarra:'navarra',comunidadforaldenavarra:'navarra',
 larioja:'larioja',castillayleon:'castillayleon',castillaleon:'castillayleon',aragon:'aragon',
 cataluna:'cataluna',catalunya:'cataluna',catalonia:'cataluna',
 comunidadvalenciana:'comunitatvalenciana',comunitatvalenciana:'comunitatvalenciana',valencia:'comunitatvalenciana',
 madrid:'madrid',comunidaddemadrid:'madrid',castillalamancha:'castillalamancha',extremadura:'extremadura',
 andalucia:'andalucia',regiondemurcia:'murcia',murcia:'murcia',
 islasbaleares:'baleares',illesbalears:'baleares',baleares:'baleares',
 canarias:'canarias',islascanarias:'canarias',ceuta:'ceuta',melilla:'melilla'
};
function getRegionId(name){
 const s=romanized(name);if(REGION_LOOKUP[s])return REGION_LOOKUP[s];
 // ソースに自治州の接頭語が含まれる場合も認識する。
 for(const key of Object.keys(REGION_LOOKUP))if(s.includes(key)&&key.length>=5)return REGION_LOOKUP[key];
 return null;
}
function featurePath(geometry){
 if(!geometry)return '';
 const polys=geometry.type==='MultiPolygon'?geometry.coordinates:geometry.type==='Polygon'?[geometry.coordinates]:[];
 const paths=[];
 polys.forEach(poly=>poly.forEach(ring=>{
  if(!ring.length)return;
  let d='',last=null;
  ring.forEach(([lon,lat],i)=>{
   // カナリアは右下の囲み枠で表示するのでオンラインデータからは生成しない。
   const xy=geoToXY([lon,lat]);
   if(last&&i<ring.length-1&&Math.hypot(xy[0]-last[0],xy[1]-last[1])<.9)return;
   d+=(d?' L ':'M ')+xy[0].toFixed(1)+' '+xy[1].toFixed(1);last=xy;
  });paths.push(d+' Z');
 }));return paths.join(' ');
}
function bindShape(p,id){
 p.classList.add('region-shape');p.dataset.region=id;
 p.setAttribute('role','button');p.setAttribute('tabindex','0');
 p.setAttribute('aria-label',byRegion[id].name+' の州別地図を開く');
 p.addEventListener('click',e=>{e.stopPropagation();openRegion(id);});
 p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openRegion(id);}});
 p.addEventListener('mouseenter',()=>{$('map-subtitle').textContent=byRegion[id].name+' · クリックで拡大';});
 p.addEventListener('mouseleave',()=>{$('map-subtitle').textContent=TOPICS[topic].description;});
}
function activateShapes(layer){layer.querySelectorAll('[data-region]').forEach(p=>bindShape(p,p.dataset.region));}
async function loadRegionalBorders(){
 const c=new AbortController(),t=setTimeout(()=>c.abort(),12500);
 try{
  const response=await fetch(BOUNDARY_DATA_URL,{signal:c.signal});if(!response.ok)throw Error('HTTP '+response.status);
  const geo=await response.json(),group=$('regional-borders');group.replaceChildren();
  const used=new Set();
  for(const feature of geo.features||[]){
   const name=feature.properties?.name||feature.properties?.NAME_1||feature.properties?.nom||'';
   const id=getRegionId(name);
   if(!id||id==='canarias'||id==='ceuta'||id==='melilla')continue;
   const d=featurePath(feature.geometry);if(!d)continue;
   const p=document.createElementNS(MAP_NS,'path');p.setAttribute('d',d);p.setAttribute('fill-rule','evenodd');p.dataset.region=id;
   group.append(p);used.add(id);
  }
  if(used.size<13)throw Error('境界データの地域照合が不十分: '+used.size);
  // カナリア諸島は右下のインセットを使用。
  // GeoJSONに含まれない島や小さな自治都市は、明示的に補完します。
  for(const id of ['baleares','canarias','ceuta','melilla']){
   if(used.has(id))continue;
   const p=document.querySelector(`#offline-regions [data-region="${id}"]`);
   if(p){const cloned=p.cloneNode(true);group.append(cloned);used.add(id);}
  }
  document.body.classList.add('borders-ready');activateShapes(group);
  el.source.textContent=`自治州境界：地理データ（${used.size}地域）`;
  if(activeRegion){zoomToRegion(activeRegion);renderMarkers();renderCards();displayRegionSelection();}
 }catch(error){
  document.body.classList.remove('borders-ready');
  el.source.textContent='自治州境界：オフライン概略図（通信時は正確な境界）';
  if(activeRegion)zoomToRegion(activeRegion);
 }finally{clearTimeout(t);}
}
// --------------------------------------------------------------------
// イベント登録・初期化
// --------------------------------------------------------------------
// ChatGPTへは利用者自身が質問を貼り付ける（APIをサイトから呼ばない）。
$('ai-question').value='マヨルカ島でおすすめのビーチを3つ、交通手段と入場料の有無も含めて教えて。';
document.querySelectorAll('[data-ai-template]').forEach(b=>b.addEventListener('click',()=>{$('ai-question').value=b.dataset.aiTemplate;$('ai-question').focus();}));
$('ai-copy').addEventListener('click',async()=>{
 const value='スペイン旅行サイトで調べています。'+$('ai-question').value.trim();
 if(!$('ai-question').value.trim()){$('ai-copy-status').textContent='質問を入力してください。';return;}
 try{await navigator.clipboard.writeText(value);$('ai-copy-status').textContent='コピーしました。ChatGPTに貼り付けてください。';}
 catch(e){$('ai-question').focus();$('ai-question').select();$('ai-copy-status').textContent='選択した文章を手動でコピーしてください。';}
});
$('theme').addEventListener('click',()=>{
 const dark=document.body.classList.toggle('dark-theme');$('theme').lastElementChild.textContent=dark?'ライトモード':'ダークモード';
 try{localStorage.setItem('espana-atlas-dark',dark?'1':'0');}catch(e){}
});
try{if(localStorage.getItem('espana-atlas-dark')==='1')$('theme').click();}catch(e){}
for(const r of REGIONS){const option=create('option','',r.name);option.value=r.id;$('region-picker').append(option);}
$('region-picker').addEventListener('change',e=>openRegion(e.target.value));
$('back-to-spain').addEventListener('click',()=>openRegion(null,true));
window.addEventListener('popstate',()=>{const route=location.hash.startsWith('#region/')?decodeURIComponent(location.hash.slice(8)):null;openRegion(byRegion[route]?route:null,false,false);});
activateShapes($('offline-regions'));
$('spot-popup-close').addEventListener('click',hidePopup);
$popup.addEventListener('mouseenter',()=>clearTimeout(tooltipTimer));
$popup.addEventListener('mouseleave',scheduleHidePopup);
document.addEventListener('keydown',e=>{if(e.key==='Escape')hidePopup();});
window.addEventListener('scroll',()=>{if(window.innerWidth>600)hidePopup();},{passive:true});
document.querySelectorAll('.topic').forEach(b=>b.addEventListener('click',()=>setTopic(b.dataset.topic)));
$('rail-toggle').addEventListener('click',()=>{railOverlay=!railOverlay;updateRailVisibility();});
$('list-search').addEventListener('input',renderCards);
$('trip-from').addEventListener('change',()=>intercitySearch());
$('trip-to').addEventListener('change',()=>intercitySearch());
$('trip-swap').addEventListener('click',()=>{const f=$('trip-from').value;$('trip-from').value=$('trip-to').value;$('trip-to').value=f;intercitySearch();});
$('trip-show').addEventListener('click',()=>intercitySearch(true));
$('local-city').addEventListener('change',localCityChange);
$('local-from').addEventListener('change',localUpdate);
$('local-to').addEventListener('change',localUpdate);
$('intercity-tab').addEventListener('click',()=>switchTravelTab('intercity'));
$('local-tab').addEventListener('click',()=>switchTravelTab('local'));
$('list-search').placeholder='地域・観光スポット・クラブを検索…';
drawRails();localCityChange();switchTravelTab('intercity');intercitySearch();displayRegionSelection();setTopic('nature');
// 共有された #region/～ のURLを開いたときは最初から州別表示にする。
const initialRoute=location.hash.startsWith('#region/')?decodeURIComponent(location.hash.slice(8)):null;
if(initialRoute&&byRegion[initialRoute])openRegion(initialRoute,false,false);
loadRegionalBorders();
