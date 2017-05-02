var OUTPUT_rate_p;
var OUTPUT_rate_g;
var OUTPUT_binsize_p;
var OUTPUT_binsize_g;
var OUTPUT_lv;
var OUTPUT_onset,OUTPUT_offset;
var MT;
var Alpha = new Array(3), Beta = new Array(3), Theta = new Array(3);
var Amp = new Array(3);
var SpikeData = new Array(3);

//入力関連

function GenerateRandomSpikes( ) {
    /* CHALLENGEの方法を使って作ったランダムなスパイク列を’’’文字列で’’’返す */
    MT = new MersenneTwister(); //乱数を作る

    for (var i = 0; i < 3; i++) {
	Alpha[i] = 2.0 * Math.PI * MT.next();
	Beta[i] = 2.0 * Math.PI * MT.next();
	Theta[i] = 2.0 * Math.PI * MT.next();

	Amp[i] = 0.3 + 1.2 * MT.next();
    }
    
    var kappa = new Array(3)
    kappa[0] = 5.0; kappa[1] = MT.next() * (2.0 - 0.75) + 0.75; kappa[2] = 0.8;
    for (var i = 0; i < 3; i++) {
	SpikeData[i] = new Array();
	GenerateSpikes(i, kappa[i], SpikeData[i]);
    }

    var str = "";
    for (var i = 0; i < SpikeData[1].length; i++) {
	str = str + String(SpikeData[1][i]) + " ";
    }
    
    return str;
}

//////////////////////////////////////////////////
//Generate Spike Train
//////////////////////////////////////////////////
var Base=30.0;
var Amplitude=10.0;
var TIME=6.0;
var Period=[2.0/Math.PI,1.41421356/Math.PI,0.8989898/Math.PI];

function Rate( index, t ){
	return Base+Amplitude*( Math.sin(Alpha[index]+t/Period[0]/Amp[index]) + Math.sin(Beta[index]+t/Period[1]/Amp[index]) + Math.sin(Theta[index]+t/Period[2]/Amp[index]) );
}

function Rate_integral(index, prev_time,new_time){
	return Base*(new_time-prev_time) - Amplitude*Period[0]*Amp[index]*( Math.cos(Alpha[index]+new_time/Period[0]/Amp[index]) - Math.cos(Alpha[index]+prev_time/Period[0]/Amp[index]) ) - Amplitude*Period[1]*Amp[index]*( Math.cos(Beta[index]+new_time/Period[1]/Amp[index]) - Math.cos(Beta[index]+prev_time/Period[1]/Amp[index]) ) - Amplitude*Period[2]*Amp[index]*( Math.cos(Theta[index]+new_time/Period[2]/Amp[index]) - Math.cos(Theta[index]+prev_time/Period[2]/Amp[index]) );
}

function Solve(index, prev_time,interval){
       
	var boundary = new Array(2);
	var new_interval;
	
	boundary[0]=0;	boundary[1]=0.5/Base;
	
	while( Rate_integral(index, prev_time,prev_time+boundary[1]) < interval ){		boundary[1]+=0.5/Base;		}
	
	while( boundary[1]-boundary[0] > Math.pow(10.0,-6.0) ){
		new_interval=0.5*(boundary[0]+boundary[1]);
		
		if( Rate_integral(index, prev_time,prev_time+new_interval) > interval )	boundary[1]=new_interval;
		else																boundary[0]=new_interval;	
	}
	
	new_interval=0.5*(boundary[0]+boundary[1]);
	if(new_interval<Math.pow(10.0,-8.0)) new_interval=Math.pow(10.0,-8.0);
	
	return new_interval;
	
}
function Gamma( kappa ){

    var int_kappa=Math.floor(kappa);
    var frac_kappa=kappa-Math.floor(kappa);
	var x_frac,x_int;
	
	/*integer part*/
	x_int=0;
	for(var i=0;i<int_kappa;i++){
		x_int+=-Math.log(MT.next());
	}
    
    /*fractional part*/
	if( frac_kappa < 0.01 ) x_frac=0;

	else{
		var b=(Math.exp(1.0)+frac_kappa)/Math.exp(1.0);

		while(1){
		
			var u=MT.next();
			var p=b*u;
			var uu=MT.next();
			
			if(p<=1.0){
				x_frac=Math.pow(p,1.0/frac_kappa);
				if(uu<=Math.exp(-x_frac)) break;
			}
			
			if(p>1.0){
				x_frac=-Math.log((b-p)/frac_kappa);
				if(uu<=Math.pow(x_frac,frac_kappa-1.0)) break;
			}
		
		}
	}
	
	return (x_int+x_frac)/kappa;
    
}

function GenerateSpikes(index, kappa, spike_time){
    
    var t1,t2;
    
    t1=Solve(0.0,Gamma(1.0));
    spike_time[0]=Number(t1.toFixed(3));
        
    var j=1;
        
    while(1){
        t2=t1+Solve(index,t1,Gamma(kappa));
        if(t2>TIME) break;
        spike_time[j]=Number(t2.toFixed(3));
        t1=t2;
        j++;
    }
    
    return 0;

}

function Initialize() {
    document.data.spikes.value = "0.017 0.068 0.224 0.428 0.502 0.543 0.563 0.638 0.702 0.725 0.749 0.773 0.848 0.884 0.938 0.965 0.985 0.995 1.05 1.058 1.075 1.131 1.15 1.191 1.203 1.223 1.236 1.271 1.32 1.344 1.349 1.379 1.38 1.382 1.417 1.448 1.475 1.499 1.53 1.564 1.577 1.584 1.594 1.602 1.694 1.718 1.728 1.74 1.774 1.777 1.789 1.798 1.806 1.823 1.854 1.902 1.916 1.986 1.991 2.003 2.049 2.084 2.099 2.11 2.131 2.157 2.17 2.224 2.348 2.356 2.38 2.415 2.452 2.48 2.545 2.597 2.622 2.656 2.804 2.926 2.946 2.967 2.979 3.063 3.076 3.11 3.167 3.18 3.222 3.231 3.314 3.345 3.388 3.403 3.422 3.455 3.483 3.546 3.578 3.593 3.627 3.637 3.677 3.707 3.716 3.721 3.827 3.832 3.845 3.847 3.863 3.88 3.897 3.932 3.977 3.989 4.032 4.065 4.072 4.095 4.105 4.122 4.166 4.186 4.195 4.212 4.232 4.25 4.251 4.268 4.289 4.295 4.302 4.303 4.334 4.357 4.372 4.394 4.41 4.415 4.429 4.474 4.488 4.5 4.528 4.536 4.544 4.546 4.566 4.576 4.594 4.598 4.636 4.704 4.721 4.773 4.838 4.9 4.923 4.988 4.99 5.003 5.008 5.018 5.092 5.105 5.122 5.176 5.298 5.327 5.369 5.442 5.511 5.555 5.578 5.61 5.654 5.697 5.771 5.786 5.862 5.899 5.943 5.967 5.998 ";
    document.getElementById("Output").style.display="none";
    Main();
}

function ResetData(){
    document.data.spikes.value = GenerateRandomSpikes();
    Main();
    return 0;
}

function PostData( spike_time ){
	
    /*convert data*/
    var data_text=document.data.spikes.value;
    var data_seq;
		
    data_text=data_text.split(/[^0-9\.]+/).join("@");
    if(data_text[0]=="@"){data_text=data_text.substring(1,data_text.length); }
    if(data_text[data_text.length-1]=="@"){data_text=data_text.substring(0,data_text.length-1); }
    if(data_text.length==0){ alert("No valid data!"); return 1; }
	
    data_seq=data_text.split("@");
    
    for(var i=0;i<data_seq.length;i++){
	spike_time[i]=Number(data_seq[i]);
    }
	
    /*sort if necessary*/
    spike_time.sort(function(a, b) {
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
    })
    
    return 0;
}

/* 本体 */

function Main(){
    var spike_time;
    var optimal_binsize_p,optimal_binsize_g;

    spike_time = new Array();

    //input
    PostData(spike_time);
    
    //ShimazakiShinomoto
    optimal_binsize_p=SS(spike_time);
    DrawGraphSS(spike_time, optimal_binsize_p);

    //OmiShinomoto
    optimal_binsize_g=OS(spike_time);
    DrawGraphOS(spike_time, optimal_binsize_g);
    
    //Kernel bandwidth optimization
    density(spike_time, "ShimazakiKernel");
    
    //Kernel density estimation with reflection boundary
    densityR(spike_time, "ShimazakiKernelR");
    
    
    //Hidden Markov Model
    // bin width in second
    var bin_width = (spike_time[spike_time.length - 1] - spike_time[0]) / spike_time.length;
    //if (bin_width < 0.05) {
    //bin_width = 0.05;
    //}
    console.log(bin_width);
    var rate_hmm = get_hmm_ratefunc(spike_time, bin_width, rate_hmm);
    DrawGraphHMM(spike_time, rate_hmm);
    
    //Bayesian Rate Estimation
    Bayesian(spike_time, "Bayes", "blue");
    

}


///////////////////////////////////////////////
//Estimate Rate
///////////////////////////////////////////////
function Estimate_Rate( spike_time, optimal_binsize, optimal_rate ){
    
    var spike_num=spike_time.length;
    var onset  = spike_time[0]           - 0.001*(spike_time[spike_num-1]-spike_time[0]);
    var offset = spike_time[spike_num-1] + 0.001*(spike_time[spike_num-1]-spike_time[0]);
    
    var optimal_binnum=Math.ceil((spike_time[spike_num-1]-onset)/optimal_binsize);
    var rate_max;
    for(var i=0;i<optimal_binnum;i++){  optimal_rate[i]=0;  }
    for(var i=0;i<spike_num;i++){   optimal_rate[Math.floor((spike_time[i]-onset)/optimal_binsize)]+=1.0/optimal_binsize;   }
    for(var i=0;i<optimal_binnum;i++){  if(i==0 || optimal_rate[i]>rate_max ) rate_max=optimal_rate[i];  }
    
    return rate_max;
}

///////////////////////////////////////////////
//Graph
///////////////////////////////////////////////
var x_base=40;
var width=800;
var height_raster=5;
var height_graph=70;

function SpikeRaster(spike_time, div_id) {
    google.charts.setOnLoadCallback(
	function draw_chart() {
	    var arr = [['', '']].concat(spike_time.map(function(x) { return [x, 1]}));
	    var data = google.visualization.arrayToDataTable(arr);
	    var options = {
		legend: 'none',
		bar: {groupWidth: "100"},
		chartArea: {
		    left: x_base,
		    top: 0,
		    width: width,
		    height: height_raster},
		hAxis: {
		    gridlines: {color: 'transparent'},
		    baselineColor: 'transparent',
		    textPosition: 'none'},
		vAxis: {
		    gridlines: {color: 'transparent'},
		    baselineColor: 'transparent',
		    textPosition: 'none',
		    maxValue: 0.5},
		colors: ["black"],
		orientation: 'horizontal',
		focusTarget: 'none'}
	    var chart = new google.visualization.BarChart(document.getElementById(div_id));
	    chart.draw(data, options);
	})
}

function DrawHist(spike_time, optimal_binsize, div_id, color) {
    google.charts.setOnLoadCallback(
	function() {
	    var arr = spike_time.map(function(x) {return [x]});//GoogleChartの仕様、最初の要素はラベル名
	    var max = Math.max.apply(null, spike_time);
	    var min = Math.min.apply(null, spike_time);
	    var onset = min - 0.001 * (max - min);
	    var optimal_binnum = Math.ceil((max - onset) / optimal_binsize);

	    var arr = [['']].concat(arr.map(function(x) {return [x[0] - onset]}));
	    var data = google.visualization.arrayToDataTable(arr); //データとして利用できる形に変換
	   
	    var options = {
		legend: 'none', //多分要素の名前とかを出力する設定
		chartArea: { //グラフの場所とか
		    left: x_base,
		    top: 1,
		    width: width,
		    height: height_graph,
		    backgroundColor: { //グラフの範囲を四角で囲む
			stroke: "black",
			strokeWidth: 1}},
		hAxis: { //横軸のいらないものを見えなくする
		    gridlines: {color: "transparent"},
		    baselineColor: "transparent",
		    textPosition: "none",
		    minValue: onset,
		},
		vAxis: { //縦軸のいらないものを見えなくする
		    gridlines: {color: "transparent"},
		    baselineColor: "transparent",
		    textPosition: "none",
		    minValue: 0
		},
		
		colors: [color], //グラフの色の設定
		ticks: [onset],
		histogram: {bucketSize: optimal_binsize,
			    hideBucketItems: true,
			    //maxNumBuckets: optimal_binnum + 1,
			    minNumBuckets: optimal_binnum,
			    minValue: onset,
			   },
	    }
	    var chart = new google.visualization.Histogram(document.getElementById(div_id));
	    chart.draw(data, options);
	});
}

function DrawHist2(spike_time, optimal_binsize, div_id, color) {
    var optimal_rate = [];
    Estimate_Rate(spike_time, optimal_binsize, optimal_rate);
    google.charts.setOnLoadCallback(
	function() {
	    var i = 0;
	    var arr = [['', '']].concat(optimal_rate.map(function(x) { return [i++, x];}));

	    var data = google.visualization.arrayToDataTable(arr); //データとして利用できる形に

	    var options = {
		legend: 'none',
		chartArea: {
		    left: x_base,
		    top: 1,
		    width: width,
		    height: height_graph,
		    backgroundColor: {
			stroke: "black",
			strokeWidth: 1}},
		hAxis: {
		    gridlines: {color: "transparent"},
		    baselineColor: "transparent",
		    textPosition: "none",
		    //minValue: onset,
		},
		vAxis: {
		    gridlines: {color: "transparent"},
		    baselineColor: "transparent",
		    textPosition: "none",
		    minValue: 0,
		},
		orientation: "horizontal",
		colors: [color],
		bar: {groupWidth: "100%"}
	    }
	    
	    var chart = new google.visualization.BarChart(document.getElementById(div_id));
	    chart.draw(data, options);
	});
}

    

function DrawGraphSS( spike_time, optimal_binsize ){
	
    DrawHist2(spike_time, optimal_binsize, "graph_SS", "mediumblue");
    SpikeRaster(spike_time, "raster");
    document.getElementById('optimal_SS').innerHTML=optimal_binsize.toFixed(2);
    document.getElementById('outputSS').addEventListener("click", function() {OutputSS(spike_time, optimal_binsize)});
    
}

function DrawGraphOS(spike_time, optimal_binsize) {
    DrawHist2(spike_time, optimal_binsize, "graph_OS", "mediumaquamarine");
    SpikeRaster(spike_time, "raster2");
    document.getElementById("optimal_OS1").innerHTML = optimal_binsize.toFixed(2);
    document.getElementById("optimal_OS2").innerHTML = Calc_lv(spike_time).toFixed(2);
    document.getElementById("outputOS").addEventListener("click", function() {OutputOS(spike_time, optimal_binsize);});
}


/////////////////////////////
//lv
/////////////////////////////
function Calc_lv(spike_time){
    var spike_num=spike_time.length;
    var lv=0;
	
    for(var i=0;i<spike_num-2;i++){
        var interval= new Array(2);
	interval[0]=spike_time[i+1]-spike_time[i];
	interval[1]=spike_time[i+2]-spike_time[i+1];
        
	if( (interval[0]+interval[1])!=0 ) lv+=3*Math.pow(interval[0]-interval[1],2.0)/Math.pow(interval[0]+interval[1],2.0)/(spike_num-2);
        else lv+=3.0/(spike_num-2);
    }
    
    return lv;

}
///////////////////////////////////////////////////////
//Optimization Algorithm
///////////////////////////////////////////////////////
function OS( spike_time ){
    
    var spike_num=spike_time.length;
    var onset  = spike_time[0]           - 0.001*(spike_time[spike_num-1]-spike_time[0]);
    var offset = spike_time[spike_num-1] + 0.001*(spike_time[spike_num-1]-spike_time[0]);
    var optimal_binsize;
    
    /*global lv*/
    var lv=0;
	
    for(var i=0;i<spike_num-2;i++){
        var interval= new Array(2);
	interval[0]=spike_time[i+1]-spike_time[i];
	interval[1]=spike_time[i+2]-spike_time[i+1];
        
	if( (interval[0]+interval[1])!=0 ) lv+=3*Math.pow(interval[0]-interval[1],2.0)/Math.pow(interval[0]+interval[1],2.0)/(spike_num-2);
        else lv+=3.0/(spike_num-2);
    }
    
    /*finding optimal bin-size*/
    for(var bin_num=1;bin_num<500;bin_num++){
	
	var bin_width=(offset-onset)/bin_num;
        var count = new Array();
        var cost,cost_min;
        var w_av=0,av=0,va=0;
        var cost,cost_min;
        
	for(var i=0;i<bin_num;i++){ count[i]=0; }
	for(var i=0;i<spike_num;i++){	count[Math.floor((spike_time[i]-onset)/bin_width)]++;  }
        
        
        for(var i=0;i<bin_num;i++){
	    
            var fano; 
            if(count[i]>2){ fano=2.0*lv/(3.0-lv);   }
	    else{ fano=1.0; }
            
            w_av+=fano*count[i]/bin_num;
            av+=count[i]/bin_num;
            va+=Math.pow(count[i],2.0)/bin_num;
        }
        
        cost=(2.0*w_av-(va-av*av))/Math.pow(bin_width,2.0);
        if( cost < cost_min || bin_num==1 ){ cost_min=cost; optimal_binsize=bin_width; }
        
    }
    
    return optimal_binsize;
}

function SS( spike_time ){
    
    var spike_num=spike_time.length;
    var onset  = spike_time[0]           - 0.001*(spike_time[spike_num-1]-spike_time[0]);
    var offset = spike_time[spike_num-1] + 0.001*(spike_time[spike_num-1]-spike_time[0]);
    var optimal_binsize;
    
    /*finding optimal bin-size*/
    for(var bin_num=1;bin_num<500;bin_num++){
	
	var bin_width=(offset-onset)/bin_num;
        var count = new Array();
        var cost,cost_min;
        
	for(var i=0;i<bin_num;i++){ count[i]=0; }
	for(var i=0;i<spike_num;i++){	count[Math.floor((spike_time[i]-onset)/bin_width)]++;  }
	
        var av=0,va=0;
        for(var i=0;i<bin_num;i++){
            av+=count[i]/bin_num;
            va+=Math.pow(count[i],2.0)/bin_num;
        }
	
        cost=(2.0*av-(va-av*av))/Math.pow(bin_width,2.0);
        if( cost < cost_min || bin_num==1 ){ cost_min=cost; optimal_binsize=bin_width; }
	
    }
    
    return optimal_binsize;
}

//ShimazakiKernel
var DATA_MIN;
var DATA_MAX;
var W;
var C;
var N;
var K = 200;
var t;

function SearchMinimum(spike_time) {
    W = new Array(50);
    C = new Array(W.length);
    for (var i = 0; i < W.length; i++) {
	W[i] = (DATA_MAX - DATA_MIN) / (i + 1);
	C[i] = Cost(spike_time, W[i]);
    }

    var C_MIN = Math.min.apply(null, C);
    //var IDX = MIN_Idx(C);
    var IDX = C.indexOf(C_MIN);
    var w = W[IDX];

    return w;

}

function density(spike_time, div_id) {
    DATA_MAX = Math.max.apply(null, spike_time);
    DATA_MIN = Math.min.apply(null, spike_time);
    
    var optw = SearchMinimum(spike_time);
    var opty = kernel(spike_time, optw);

    drawDensity(opty, "ShimazakiKernel", "darkorange");
    SpikeRaster(spike_time, "raster3");
    document.getElementById('optimal_ShimazakiKernel').innerHTML=optw.toFixed(2);
    document.getElementById('outputSSKernel').addEventListener("click", function() {OutputKernelDensity(optw, opty)});
}

function drawDensity(opty, div_id, color) {
    google.charts.setOnLoadCallback(
	function() {
	    var arr = [];
	    arr[0] = ["", ""];
	    for (var i = 0; i < K; i++) {
		arr[i + 1] = [i, opty[i]];
	    }

	    var data = google.visualization.arrayToDataTable(arr);
	    var options =
		{ legend: 'none',
		  lineWidth: 1,
		  curveType: 'function',
		  chartArea: { //グラフの場所とか
		      left: x_base,
		      top: 1,
		      width: width,
		      height: height_graph,
		      backgroundColor: { //グラフの範囲を四角で囲む
			  stroke: "black",
			  strokeWidth: 1}},
		  hAxis: {
		      gridlines: {color: 'transparent'},
		      baselineColor: 'transparent',
		      textPosition: 'none'},
		  vAxis: {
		      gridlines: {color: 'transparent'},
		      baselineColor: 'transparent',
		      textPosition: 'none',
		      minValue: 0},
		  colors: [color]
		}
	    var chart = new google.visualization.AreaChart(document.getElementById(div_id));
	    chart.draw(data, options);
	})
}



function densityR(spike_time, canvas_id) { //Kernel density estimation with reflection boundary
    var optw = SearchMinimum(spike_time);
    var opty = kernelR(spike_time, optw);

    drawDensity(opty, "ShimazakiKernelR", "teal");    
    SpikeRaster(spike_time, "raster4");
    document.getElementById('optimal_ShimazakiKernelR').innerHTML=optw.toFixed(2);
    document.getElementById('outputSSKernelR').addEventListener("click", function() {OutputKernelDensity(optw, opty)});
}

function xaxis() {
    var x = new Array(K);
    x[0] = DATA_MIN;
    for (var i = 0; i < K; i++) {
	x[i + 1] = x[i] + (DATA_MAX - DATA_MIN) / (K - 1);
    }
    return x;
}

function kernel(spike_time, w) {
    var x = xaxis();
    var y = new Array(K);

    for (var i = 0; i < K; i++) {
	//y[i] = 0;
	temp = 0;
	for (var j = 0; j < spike_time.length; j++) {
	    diff = x[i] - spike_time[j];
	    if(Math.abs(diff) < 5 * w) {
		temp += Gauss(diff, w) / spike_time.length;
	    }
	}
	y[i] = temp;
    }

    return y;
}

function kernelR(spike_time, w) {
    //鏡像折り返しに対応
    var x = xaxis();
    var y = new Array(K);

    for (var i = 0; i < K; i++) {
	//y[i] = 0;
	var temp = 0;
	for (var j = 0; j < spike_time.length; j++) {
	    diff1 = x[i] - spike_time[j];
	    diff2 = x[i] - (2 * DATA_MAX - spike_time[j]);
	    diff3 = x[i] - (2 * DATA_MIN - spike_time[j]);
	    if (Math.abs(diff1) < 5 * w) {
		temp += Gauss(diff1, w) / spike_time.length;
	    }
	    if (Math.abs(diff2) < 5 * w) {
		temp += Gauss(diff2, w) / spike_time.length;
	    }
	    if (Math.abs(diff3) < 5 * w) {
		temp += Gauss(diff3, w) / spike_time.length;
	    }
	}
	y[i] = temp;
    }
    
    return y;
}

function Cost(spike_time, w) {
    N = spike_time.length;
    var A = 0;
    for (var i = 0; i < N; i++) {
	for (var j = i + 1; j < N; j++) {
	    var x = spike_time[i] - spike_time[j];
	    if (x < 5 * w) {
		A = A + 2 * Math.exp(-x * x / 4 / w / w) - 4 * Math.sqrt(2) * Math.exp(-x * x / 2 / w / w);
	    }
	}
    }

    return (N / w + A / w) / 2 / Math.sqrt(Math.PI);
}

function Gauss(x, w) {
    return 1 / Math.sqrt(2 * Math.PI) / w * Math.exp(- x * x / 2 / w / w);
}


//////Hidden Markov Model//////
function DrawGraphHMM(spike_time, rate_hmm, bin_width) {
    // 真ん中でグラフの高さを変えたい
    var arr = [['', '']];
    arr.push([0, rate_hmm[0][1]])
    for (var i = 0; i < rate_hmm.length - 1; i++) {
	if (rate_hmm[i][1] != rate_hmm[i + 1][1]) { //値が変わったら
	    mid = (rate_hmm[i][0] + rate_hmm[i + 1][0]) / 2; //真ん中の値を出して
	    ///rate_hmm.splice(i + 1, 0, [mid, rate_hmm[i][1]], [mid, rate_hmm[i + 1][1]]); //高さを変える
	    ///i += 2; //加えたデータは飛ばさないと大変なことに
	    arr.push([mid, rate_hmm[i][1]]);
	    arr.push([mid, rate_hmm[i + 1][1]]);
	}
	
    }
    arr.push([rate_hmm[rate_hmm.length - 1][0], rate_hmm[rate_hmm.length - 1][1]]);
    var max = Math.max.apply(null, rate_hmm.map(function(x) { return x[1]; }));

    google.charts.setOnLoadCallback(
	function() {
	    //var arr = [['', '']].concat(rate_hmm);
	    var data = google.visualization.arrayToDataTable(arr);
	    var options = {
		legend: 'none',
		lineWidth: 1,
		chartArea: {
		    left: x_base,
		    top: 1,
		    width: width,
		    height: height_graph,
		    backgroundColor: {
			stroke: "black",
			strokeWidth: 1}},
		hAxis: {
		    gridlines: {color: 'transparent'},
		    baselineColor: 'transparent',
		    textPosition: 'none'},
		vAxis: {
		    gridlines: {color: 'transparent'},
		    baselineColor: 'transparent',
		    textPosition: 'none',
		    minValue: 0,
		    maxValue: max * 1.1},
		colors: ["salmon"]}
	    var chart = new google.visualization.AreaChart(document.getElementById("HMM"));
	    chart.draw(data, options);
	})

    SpikeRaster(spike_time, "raster5");
    document.getElementById("outputHMM").addEventListener("click", function() {OutputHMM(spike_time, rate_hmm);});
}

