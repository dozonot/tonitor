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
        text: todayDate+'の温度'
    },
    chart: {
        type: 'area',
        backgroundColor: '#FAFAFA'
    },
    colors: ['#FE9A2E', '#81F79F'],
    yAxis: {
        title: {
            text: 'Temperature'
        }
    },
    xAxis: {
        title: {
            text: 'Time'
        },
	max: 24,
	tickInterval: 3
    },
    series: [{
        name: 'ラック内温度',
        data: JSON.parse("[" + todayRtemp + "]")
    }, {
        name: '外気温(品川区)',
        data: JSON.parse("[" + todayAtemp + "]")
    }],
});

// Yesterday gragh
Highcharts.chart('yesterday', {
    title: {
        text: '前日('+yesterdayDate+')の温度'
    },
    chart: {
        type: 'area',
        backgroundColor: '#F2F2F2'
    },
    colors: ['#FE9A2E', '#81F79F'],
    yAxis: {
        title: {
            text: 'Temperature'
        }
    },
    xAxis: {
        title: {
            text: 'Time'
        },
	max: 24,
	tickInterval: 3
    },
    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            }
        }
    },
    series: [{
        name: 'ラック内温度',
        data: JSON.parse("[" + yesterdayRtemp + "]")
    }, {
        name: '外気温(品川区)',
        data: JSON.parse("[" + yesterdayAtemp + "]")
    }],
});

// realtime gragh
Highcharts.chart('realtime', {

    chart: {
        type: 'gauge',
        //plotBackgroundColor: null,
        //plotBackgroundImage: null,
        backgroundColor: '#F2F2F2',
        plotBorderWidth: 0,
        plotShadow: false
    },

    title: {
        text: '現在の室温'
    },

    pane: {
        startAngle: -150,
        endAngle: 150,
        background: [{
            backgroundColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, '#FFF'],
                    [1, '#333']
                ]
            },
            borderWidth: 0,
            outerRadius: '109%'
        }, {
            backgroundColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, '#333'],
                    [1, '#FFF']
                ]
            },
            borderWidth: 1,
            outerRadius: '107%'
        }, {
            // default background
        }, {
            backgroundColor: '#DDD',
            borderWidth: 0,
            outerRadius: '105%',
            innerRadius: '103%'
        }]
    },

    yAxis: {
        min: -10,
        max: 50,

        minorTickInterval: 'auto',
        minorTickWidth: 1,
        minorTickLength: 10,
        minorTickPosition: 'inside',
        minorTickColor: '#666',

        tickPixelInterval: 30,
        tickWidth: 2,
        tickPosition: 'inside',
        tickLength: 10,
        tickColor: '#666',
        labels: {
            step: 2,
            rotation: 'auto'
        },
        title: {
            text: '℃'
        },
        plotBands: [{
            from: -10,
            to: 0,
            color: '#58ACFA' // brue
        }, {
            from: 0,
            to: 25,
            color: '#55BF3B' // green
        }, {
            from: 25,
            to: 35,
            color: '#DDDF0D' // yellow
        }, {
            from: 35,
            to: 50,
            color: '#DF5353' // red
        }]
    },
    series: [{
        name: 'Temperature',
        data: JSON.parse("["+Number(todayRtemp[todayRtemp.length-1])+"]"),
        tooltip: {
            valueSuffix: ' ℃'
        }
    }]
});

// Month graph
Highcharts.chart('month', {
    title: {
        text: '月間の温度'
    },
    chart: {
        type: 'line',
        backgroundColor: '#FAFAFA'
    },
    yAxis: {
        title: {
            text: 'Temperature'
        }
    },
    xAxis: {
        title: {
            text: 'Time'
        },
	max: 24,
	tickInterval: 3
    },
    series: [{
        name: '最大気温',
        data: JSON.parse("[" + todayRtemp + "]")
    }, {
        name: '最低気温',
        data: JSON.parse("[" + todayAtemp + "]")
    }, {
        name: '平均気温',
        data: JSON.parse("[" + todayAtemp + "]")
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

