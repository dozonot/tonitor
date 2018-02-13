//配列の初期化
var arraySorttime = [];
var todayRtemp = [];
var todayAtemp = [];
var yesterdayRtemp = [];
var yesterdayAtemp = [];
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
  var today_yyyymmdd = getVal.partday;
  var yesterday_yyyymmdd = String(Number(getVal.partday)-1);
} else {
  //URLパラメータの取得に失敗した場合
  var now = new Date();
  var today_yyyymmdd = now.getFullYear()+( "0"+( now.getMonth()+1 ) ).slice(-2)+( "0"+now.getDate() ).slice(-2);
  var yesterday_yyyymmdd = now.getFullYear()+( "0"+( now.getMonth()+1 ) ).slice(-2)+( "0"+(now.getDate()-1) ).slice(-2);
}

// グラフタイトル用の日時作成
var todayDate = today_yyyymmdd.slice(0,4) + "年";
todayDate += today_yyyymmdd.slice(4,6) + "月";
todayDate += today_yyyymmdd.slice(-2) + "日";
var yesterdayDate = yesterday_yyyymmdd.slice(0,4) + "年";
yesterdayDate += yesterday_yyyymmdd.slice(4,6) + "月";
yesterdayDate += yesterday_yyyymmdd.slice(-2) + "日";

// API Gateway用URLの作成
var url = 'https://n6t2fjv1wd.execute-api.ap-northeast-1.amazonaws.com/v1/tonitor' + '?partday=' + today_yyyymmdd 
// GETリクエスト
var req = new XMLHttpRequest();
req.onreadystatechange = function(){
  if( req.readyState == 4 && req.status == 200 ){
    //JSON取得成功時の処理
    obj = req.responseText;
    var jsonText = JSON.parse(obj);
    for(var i in jsonText['Items']){
      arraySorttime.push(jsonText['Items'][i]['sorttime']['N']);
      todayRtemp.push(jsonText['Items'][i]['rtemp']['N']);
      todayAtemp.push(jsonText['Items'][i]['atemp']['N']);
    }
  } else {
    //JSON取得失敗時の処理
  }
}
req.open( 'GET', url, false );
req.send( "" );

// API Gateway用URLの作成
var url = 'https://n6t2fjv1wd.execute-api.ap-northeast-1.amazonaws.com/v1/tonitor' + '?partday=' + yesterday_yyyymmdd 
// GETリクエスト
var req = new XMLHttpRequest();
req.onreadystatechange = function(){
  if( req.readyState == 4 && req.status == 200 ){
    //JSON取得成功時の処理
    obj = req.responseText;
    var jsonText = JSON.parse(obj);
    for(var i in jsonText['Items']){
      arraySorttime.push(jsonText['Items'][i]['sorttime']['N']);
      yesterdayRtemp.push(jsonText['Items'][i]['rtemp']['N']);
      yesterdayAtemp.push(jsonText['Items'][i]['atemp']['N']);
    }
  } else {
    //JSON取得失敗時の処理
  }
}
req.open( 'GET', url, false );
req.send( "" );

// Today gragh
Highcharts.chart('today', {
    title: {
        text: todayDate+'の温度(Temperature)'
    },
    subtitle: {
        text: 'Source: thesolarfoundation.com'
    },
    yAxis: {
        title: {
            text: 'Temperature'
        }
    },
    xAxis: {
        title: {
            text: 'Time'
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },
    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            pointStart: 0
        }
    },
    series: [{
        name: 'ラック内温度(Rack temperature)',
        data: JSON.parse("[" + todayRtemp + "]")
    }, {
        name: '外気温(Tokyo\'s temperature)',
        data: JSON.parse("[" + todayAtemp + "]")
    }],
});

// Yesterday gragh
Highcharts.chart('yesterday', {
    title: {
        text: yesterdayDate+'の温度(Temperature)'
    },
    subtitle: {
        text: 'Source: thesolarfoundation.com'
    },
    yAxis: {
        title: {
            text: 'Temperature'
        }
    },
    xAxis: {
        title: {
            text: 'Time'
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },
    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            pointStart: 0
        }
    },
    series: [{
        name: 'ラック内温度(Rack temperature)',
        data: JSON.parse("[" + yesterdayRtemp + "]")
    }, {
        name: '外気温(Tokyo\'s temperature)',
        data: JSON.parse("[" + yesterdayAtemp + "]")
    }],
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

//tonitor.identity.resolve({
//  id: id,
//  email: googleUser.getBasicProfile().getEmail(),
//  refresh: refresh
//});

