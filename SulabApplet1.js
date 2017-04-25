function Bayesian(spike_time, div_id, color) {
    //内部函数たち ここから
    var EMmethod = function(t, beta0) {
	var N = t.length;
	var beta = 0;
	var beta_new = beta0;

	var t0;

	for (var j = 0; j < 100; j++) {
	    beta = beta_new;
	    kalman = KalmanFilter(t, beta);
	    t0 = 0;

	    for(var i = 0; i < N - 1; i++) {
		if(t[i] > 0) {
		    beta_new += (kalman[1][i + 1] + kalman[1][i] - 2 * kalman[2][i]
				 + (kalman[0][i + 1] - kalman[0][i])
				 * (kalman[0][i + 1] - kalman[0][i])) / t[i];
		} else {
		    //intervalが0のものがあった時の補正
		    t0 += 1;
		}
	    }
	    beta_new = (N - t0 - 1) / (2 * beta_new);
	}
	
	return beta_new;
    }

    var sum = function(arr) {
	var r = 0;
	for (var i = 0; i < arr.length; i++) {
	    r += arr[i];
	}

	return r;
    }
    
    var KalmanFilter = function(t, beta) {
	var N = t.length;
	var IEL = N / sum(t); //データなしでの平均
	var IVL = Math.pow((IEL / 3), 2); //データなしでの分散
	var A = IEL - ISI[0] * IVL;
	var EL = [[],[]];
	var VL = [[],[]];
	EL[0][0] = (A + Math.sqrt(A * A + 4 * IVL)) / 2;
	VL[0][0] = 1 / (1 / IVL + 1 / (Math.pow(EL[0][0], 2)));

	console.log(t);

	var EL_N = [];
	var VL_N = [];
	var COVL_N = [];

	//prediction and filtering
	for(var i = 0; i < N - 1; i++) {
	    //prediction
	    EL[1][i] = EL[0][i];
	    VL[1][i] = VL[0][i] + t[i] / (2 * beta);
	    //filtering
	    A = EL[1][i] - t[i + 1] * VL[1][i];
	    EL[0][i + 1] = (A + Math.sqrt(A * A + 4 * VL[1][i])) / 2;
	    VL[0][i + 1] = 1 / (1 / VL[1][i] + 1 / (EL[0][i + 1] * EL[0][i + 1]));
	}

	//smoothing
	EL_N[N - 1] = EL[0][N - 1]; //データはN番目まで
	VL_N[N - 1] = VL[0][N - 1];

	for (var i = N - 2; i >= 0; i--) {
	    var H = VL[0][i] / VL[1][i];

	    EL_N[i] = EL[0][i] + H * (EL_N[i + 1] - EL[1][i]);
	    VL_N[i] = VL[0][i] + H * H * (VL_N[i + 1] - VL[1][i]);
	    COVL_N[i] = H * VL_N[i + 1];
	}
	console.log("kalman");
	console.log(EL[0][0]);
	return [EL_N, VL_N, COVL_N];
    }

    var drawKalman = function(t, kalman, div_id, color) {
	google.charts.setOnLoadCallback(
	    function() {
		var arr = [["", ""]];

		for(var i = 0; i < t.length - 1; i++) {
		    arr[i + 1] = [(t[i] + t[i + 1]) / 2, kalman[0][i]];
		}

		var data = google.visualization.arrayToDataTable(arr);
		var options =
		    { legend: 'none',
		      lineWidth: 1,
		      curveType: 'function',
		      chartArea: {
			  left: x_base,
			  top: 1,
			  width: width,
			  height: height_graph,
			  backgroundColor: {
			      stroke: "black",
			      strokeWidth: 1
			  }
		      },
		      hAxis: {
			  gridlines: {color: 'transparent'},
			  baselineColor: 'transparent',
			  textPosition: 'none'
		      },
		      vAxis: {
			  gridlines: {color: 'transparent'},
			  baselineColor: 'transparent',
			  textPosition: 'none',
			  minValue: 0
		      },
		      colors: [color]
		    }
		var chart = new google.visualization.AreaChart(document.getElementById(div_id));
		console.log("Bayes");
		console.log(arr);
		console.log(kalman);
		chart.draw(data, options);
	    })
    }



    var data_length = spike_time.length;
    var ISI = new Array(data_length - 1);
    for (var i = 0; i < data_length - 1; i++) {
	ISI[i] = spike_time[i + 1] - spike_time[i];
    }

    //カルマンフィルタに対応する
    var xKalman = new Array(data_length - 1);
    var yKalman = new Array(data_length - 1);

    //平均発火率
    var mu = data_length / (spike_time[data_length - 1] - spike_time[0]);

    //平均発火率を使ってハイパーパラメータの設定(初期値)
    var beta0 = Math.pow(mu, -3);
    
    //EMアルゴリズムを使ってハイパーパラメータ決定
    var beta = EMmethod(ISI, beta0);
    
    //決定したBetaについてKalmanフィルターを使用
    var kalman = KalmanFilter(ISI, beta);

    //グラフの描画
    drawKalman(spike_time, kalman, div_id, color);
    SpikeRaster(spike_time, "raster6");

}
