//配列の初期化
var arraySorttime = [];
var arrayRtemp = [];
var arrayAtemp = [];
var tonitor = {
  poolId: 'ap-northeast-1:3faa8e7d-fbc1-48ba-89d8-7e569539e837'
};

//URLパラメータの取得
var getUrlVars = function(){
  var vars = {};
  var param = location.search.substring(1).split('&');
  for(var i = 0; i < param.length; i++) {
    var keySearch = param[i].search(/=/);
    var key = '';
    if(keySearch != -1) key = param[i].slice(0, keySearch);
    var val = param[i].slice(param[i].indexOf('=', 0) + 1);
    if(key != '') vars[key] = decodeURI(val);
  }
  return vars;
};
var getVal = getUrlVars();
//URLパラメータ有無確認
if (getVal.partday) {
  //URLパラメータの取得に成功した場合
  var yyyymmdd = getVal.partday;
} else {
  //URLパラメータの取得に失敗した場合
  var now = new Date();
  var yyyymmdd = now.getFullYear()+( "0"+( now.getMonth()+1 ) ).slice(-2)+( "0"+now.getDate() ).slice(-2);
}
// グラフタイトル用の日時作成
var nowDate = yyyymmdd.slice(0,4) + "年";
nowDate += yyyymmdd.slice(4,6) + "月";
nowDate += yyyymmdd.slice(-2) + "日";

// API Gateway用URLの作成
var url = 'https://n6t2fjv1wd.execute-api.ap-northeast-1.amazonaws.com/v1/tonitor' + '?partday=' + yyyymmdd 
// GETリクエスト
var req = new XMLHttpRequest();
req.onreadystatechange = function(){
  if( req.readyState == 4 && req.status == 200 ){
    //JSON取得成功時の処理
    obj = req.responseText;
    var jsonText = JSON.parse(obj);
    for(var i in jsonText['Items']){
      arraySorttime.push(jsonText['Items'][i]['sorttime']['N']);
      arrayRtemp.push(jsonText['Items'][i]['rtemp']['N']);
      arrayAtemp.push(jsonText['Items'][i]['atemp']['N']);
    }
  } else {
    //JSON取得失敗時の処理
  }
}
req.open( 'GET', url, false );
req.send( "" );

//グラフ描画処理
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: arraySorttime,
    datasets: [{
      label: 'ラック内温度(Rack temperature)',
      data: arrayRtemp,
      backgroundColor: "rgba(255,192,128,0.3)"
    }, {
      label: '外気温(Tokyo)',
      data: arrayAtemp,
      backgroundColor: "rgba(128,255,128,0.4)"
    }]
  },
  options: {
    responsive : 'true',
    title: {
      display: true,
      text: nowDate+'の温度(Temperature)'
    },
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
  	labelString: "温度(Temperature)"
        }
      }],
      xAxes: [{
        scaleLabel: {
          display: true,
  	labelString: "時刻(Time)"
        }
      }],
    }
  }
});

function googleSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  AWS.config.update({
    region: 'ap-northeast-1',
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: tonitor.poolId,
      Logins: {
        'accounts.google.com': id_token
      }
    })
  })
}

tonitor.awsRefresh = function() {
  var deferred = new $.Deferred();
  AWS.config.credentials.refresh(function(err) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(AWS.config.credentials.identityId);
    }
  });
  return deferred.promise();
}

tonitor.identity = new $.Deferred();

tonitor.identity.resolve({
  id: id,
  email: googleUser.getBasicProfile().getEmail(),
  refresh: refresh
});
