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
var TIME=10.0;
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
    document.data.spikes.value = "0.017 0.058 0.119 0.191 0.194 0.259 0.289 0.305 0.346 0.355 0.481 0.537 0.566 0.621 0.642 0.703 0.738 0.8 1.035 1.059 1.097 1.158 1.297 1.339 1.475 1.495 1.603 1.634 1.663 1.771 1.789 1.801 1.835 1.887 1.91 1.914 1.975 2 2.023 2.041 2.059 2.081 2.112 2.155 2.166 2.195 2.214 2.242 2.258 2.264 2.329 2.343 2.354 2.384 2.395 2.411 2.438 2.45 2.47 2.485 2.503 2.529 2.56 2.582 2.587 2.596 2.6 2.623 2.628 2.642 2.661 2.7 2.71 2.717 2.734 2.738 2.758 2.775 2.775 2.786 2.797 2.809 2.838 2.853 2.861 2.866 2.877 2.906 2.958 2.977 3.012 3.031 3.039 3.086 3.092 3.101 3.121 3.156 3.168 3.189 3.19 3.222 3.254 3.275 3.277 3.329 3.331 3.35 3.386 3.39 3.44 3.455 3.518 3.519 3.551 3.617 3.648 3.651 3.668 3.705 3.715 3.793 3.808 3.832 3.858 3.889 3.898 3.969 4.053 4.144 4.194 4.407 4.523 4.578 4.643 4.676 4.705 4.803 4.917 5.022 5.056 5.095 5.127 5.164 5.244 5.286 5.339 5.401 5.431 5.485 5.491 5.615 5.636 5.65 5.658 5.687 5.736 5.746 5.797 5.854 5.915 5.933 5.96 6.075 6.152 6.179 6.206 6.27 6.288 6.441 6.489 6.505 6.512 6.53 6.556 6.583 6.614 6.64 6.652 6.689 6.733 6.79 6.795 6.799 6.864 6.886 6.891 6.894 6.917 6.941 7.007 7.02 7.027 7.061 7.081 7.089 7.112 7.128 7.145 7.152 7.177 7.183 7.213 7.221 7.227 7.243 7.26 7.263 7.298 7.333 7.351 7.373 7.38 7.4 7.419 7.435 7.475 7.497 7.512 7.529 7.54 7.582 7.589 7.59 7.707 7.733 7.805 7.815 7.845 7.911 7.939 7.963 8.021 8.037 8.052 8.059 8.083 8.119 8.159 8.185 8.264 8.295 8.383 8.499 8.605 8.689 8.724 8.789 8.855 8.874 8.901 8.909 8.919 9.004 9.047 9.065 9.073 9.096 9.115 9.147 9.204 9.228 9.244 9.259 9.294 9.332 9.363 9.401 9.438 9.449 9.463 9.511 9.576 9.581 9.586 9.6 9.628 9.635 9.722 9.725 9.74 9.75 9.781 9.789 9.871 9.905 9.925 9.958";
    Main();
}

function ResetData(){
    //document.data.spikes.value="0.012 0.050 0.066 0.078 0.113 0.145 0.159 0.188 0.206 0.226 0.261 0.280 0.294 0.305 0.330 0.349 0.368 0.412 0.448 0.477 0.512 0.524 0.529 0.547 0.565 0.588 0.595 0.607 0.619 0.645 0.664 0.685 0.699 0.721 0.737 0.766 0.779 0.814 0.830 0.842 0.872 0.883 0.892 0.903 0.917 0.935 0.959 0.974 0.981 0.995 1.017 1.052 1.067 1.094 1.108 1.124 1.139 1.164 1.183 1.201 1.216 1.234 1.256 1.272 1.291 1.311 1.319 1.344 1.395 1.419 1.436 1.475 1.484 1.527 1.551 1.597 1.614 1.642 1.664 1.725 1.755 1.815 1.854 1.925 1.988 2.127 2.323 2.372 2.515 2.589 2.616 2.713 2.765 2.808 2.837 2.895 2.925 2.943 2.973 3.008 3.040 3.073 3.132 3.145 3.165 3.175 3.195 3.219 3.236 3.256 3.273 3.296 3.301 3.317 3.329 3.335 3.350 3.359 3.376 3.390 3.412 3.439";
    
    document.data.spikes.value = GenerateRandomSpikes();
    Main();
    return 0;
}

function Main(){
    
    var spike_time;
    var optimal_binsize_p,optimal_binsize_g;

    spike_time = new Array();
    PostData(spike_time);
    //SpikeRaster(spike_time);
    
    optimal_binsize_g=OS(spike_time);
    optimal_binsize_p=SS(spike_time);

    DrawGraphSS(spike_time, optimal_binsize_p);
    DrawHist2(spike_time, optimal_binsize_p, "graph_SSdiv", "lightskyblue");
    DrawGraphOS(spike_time, optimal_binsize_g);
    DrawHist2(spike_time, optimal_binsize_g, "graph_OSdiv", "aquamarine");
    //DrawGraph(spike_time,optimal_binsize_g,optimal_binsize_p);
    density(spike_time, "ShimazakiKernel");
    density2(spike_time, "ShimazakiKernel2");

    var bin_width = 0.05; // bin width in second
    var rate_hmm = get_hmm_ratefunc(spike_time, bin_width, rate_hmm);
    DrawGraphHMM(spike_time, rate_hmm);
    SpikeRaster(spike_time, "raster5");
    
    /*for output*/
    OUTPUT_binsize_p=optimal_binsize_p;
    OUTPUT_rate_p = new Array(); 
    Estimate_Rate(spike_time,optimal_binsize_p,OUTPUT_rate_p);
    
    OUTPUT_binsize_g=optimal_binsize_g;
    OUTPUT_rate_g = new Array(); 
    Estimate_Rate(spike_time,optimal_binsize_g,OUTPUT_rate_g);
    
    OUTPUT_lv=Calc_lv(spike_time);
    OUTPUT_onset  = spike_time[0]           - 0.001*(spike_time[spike_time.length-1]-spike_time[0]);
    OUTPUT_offset = spike_time[spike_time.length-1] + 0.001*(spike_time[spike_time.lenfth-1]-spike_time[0]);
    
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
    /* var check=0;
    var min,min_index;
	
    for(var i=0;i<spike_time.length-1;i++){
	if(spike_time[i]>spike_time[i+1]){ check=1; }
    }
	
    if( check==1 ){
	for(var i=0;i<spike_time.length;i++){
	    for(var j=i;j<spike_time.length;j++){
		if( j==i || min>spike_time[j] ){ min=spike_time[j]; min_index=j; }
	    }
	    spike_time[min_index]=spike_time[i];
	    spike_time[i]=min;
	}
    } */
    spike_time.sort(function(a, b) {
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
    })
    
    return 0;
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
    console.log("debag");
    console.log(optimal_binnum);
    for(var i=0;i<optimal_binnum;i++){  optimal_rate[i]=0;  }
    for(var i=0;i<spike_num;i++){   optimal_rate[Math.floor((spike_time[i]-onset)/optimal_binsize)]+=1.0/optimal_binsize;   }
    for(var i=0;i<optimal_binnum;i++){  if(i==0 || optimal_rate[i]>rate_max ) rate_max=optimal_rate[i];  }
    
    return rate_max;
}
///////////////////////////////////////////////
//Graph
///////////////////////////////////////////////
var x_base=40;
var width=600;
var y_raster=10;
var height_spike=5;
var y_graph=70;
var height_graph=60;
var height_hist=50;

/* function SpikeRaster(spike_time, canvas_id){

    var spike_num=spike_time.length;
    var onset  = spike_time[0]           - 0.001*(spike_time[spike_num-1]-spike_time[0]);
    var offset = spike_time[spike_num-1] + 0.001*(spike_time[spike_num-1]-spike_time[0]);
    
    var canvas = document.getElementById(canvas_id);
    if ( ! canvas || ! canvas.getContext ) {	return false;	}
    var ctx = canvas.getContext('2d');
	
    //reset canvas
    ctx.clearRect(0,0,800,y_raster);
    
    //raster
    ctx.strokeStyle = "black"
    ctx.strokeRect(x_base-10,y_raster, width+20,0);
	
    for(i=0;i<spike_num;i++){
	x=(spike_time[i]-onset)/(offset-onset);
	ctx.strokeStyle = "black";
	ctx.strokeRect(x_base+width*x,y_raster,0,-30);
    }
    
    return 0;

} */

function SpikeRaster(spike_time, div_id) {
    google.charts.setOnLoadCallback(
	function draw_chart() {
	    var arr = [['', '']].concat(spike_time.map(function(x) { return [x, 1]}));
	    var data = google.visualization.arrayToDataTable(arr);
	    var options1 = {
		legend: 'none',
		bar: {
		    groupWidth: 2},
		chartArea: {
		    left: x_base,
		    top: 0,
		    width: width,
		    height: 8},
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
	    var chart1 = new google.visualization.BarChart(document.getElementById(div_id));
	    chart1.draw(data, options1);
	})
}

function DrawHist( spike_time, optimal_binsize, canvas_id, color ) {
    var spike_num = spike_time.length;
    var onset = spike_time[0] - 0.001 * (spike_time[spike_num - 1] - spike_time[0]);
    var offset = spike_time[spike_num - 1] + 0.001 * (spike_time[spike_num - 1] - spike_time[0]);

    var optimal_rate;
    var rate_max;

    optimal_rate = new Array();
    rate_max = Estimate_Rate(spike_time, optimal_binsize, optimal_rate);

    var canvas = document.getElementById(canvas_id);
    if (!canvas || !canvas.getContext) {return false;}
    var ctx = canvas.getContext('2d');

    /* reset canvas */
    ctx.clearRect(0, 0, 800, y_graph);

    /* histogram */
    ctx.strokeStyle = "brack";
    ctx.strokeRect(x_base, y_graph, width, -height_graph);

    for(var i = 0; i < optimal_rate.length; i++) {
	var x = i * optimal_binsize / (offset - onset);
	var y = optimal_rate[i] / rate_max;

	var xx = x_base + width * x;
	var yy = height_hist * y;

	ctx.fillStyle= color;
	if (onset + (i + 1) * optimal_binsize < offset) {
	    ctx.fillRect(xx, y_graph, width * optimal_binsize / (offset - onset), -yy);
	    ctx.strokeRect(xx, y_graph, width * optimal_binsize / (offset - onset), -yy);
	}
	else {
	    ctx.fillRect(xx, y_graph, width - width * x, -height_hist * y);
	    ctx.strokeRect(xx, y_graph, width - width * x, -height_hist * y);
	}
    }
}

function DrawHist2(spike_time, optimal_binsize, div_id, color) {
    google.charts.setOnLoadCallback(
	function() {
	    var arr = spike_time.map(function(x) {return [x]});//GoogleChartの仕様、最初の要素はラベル名
	    var max = Math.max.apply(null, spike_time);
	    var min = Math.min.apply(null, spike_time);
	    var onset = min - 0.001 * (max - min);
	    var optimal_binnum = Math.ceil((max - onset) / optimal_binsize);
	    console.log(arr);
	    console.log(onset);
	    console.log(max);
	    console.log(optimal_binsize);
	    console.log(optimal_binnum);

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
		    maxValue: max,
		    minValue: onset,
		},
		vAxis: { //縦軸のいらないものを見えなくする
		    gridlines: {color: "transparent"},
		    baselineColor: "transparent",
		    textPosition: "none"
		},
		colors: [color], //グラフの色の設定
		bar: {groupWidth: "100%"}, //おまじない
		ticks: [onset],
		histogram: {bucketSize: optimal_binsize,
			    //maxNumBuckets: optimal_binnum + 1,
			    minNumBuckets: optimal_binnum,
			    minValue: onset,
			    maxValue: max}
	    }
	    var chart = new google.visualization.Histogram(document.getElementById(div_id));
	    chart.draw(data, options);
	});
}

function DrawGraphSS( spike_time, optimal_binsize ){
	
    DrawHist(spike_time, optimal_binsize, "graph_SS", "lightskyblue");
    SpikeRaster(spike_time, "raster");

    //ctx.font = "12px 'Arial'";
    //ctx.fillStyle = "black";
    //ctx.fillText((rate_max*height_graph/height_hist).toFixed(2),x_base-35,y_graph-height_graph);
    //ctx.fillText("0",x_base-20,y_graph);
    //ctx.fillText(spike_time[0].toFixed(2),x_base+5,y_graph+20);
    //ctx.fillText(spike_time[spike_num-1].toFixed(2),x_base+width+5,y_graph+20);
    //ctx.font = "16px 'Arial'";
    //ctx.fillText("time",x_base+0.5*width-20,y_graph+35);
    //ctx.fillText("Rate",20,y_graph-height_graph/2+10);
    
    /*output*/
    var np;
    if( Calc_lv(spike_time)<1 ) np="regular";
    else np="bursty";
    
    //document.getElementById("poisson").innerHTML="&nbsp;&nbsp;&nbsp;&nbsp;The red dotted line represents a histogram constructed with the Poissonian optimization method (Shimazaki & Shinomoto, 2007).";
	
    //document.getElementById('optimal').innerHTML="&nbsp;&nbsp;&nbsp;&nbsp;The optimal bin size is <font color=\"red\">" + optimal_binsize_g.toFixed(2) + "</font>.<br>&nbsp;&nbsp;&nbsp;&nbsp;The non-Poisson characteristic of your data is estimated by Lv as Lv = <font color=\"red\">" + Calc_lv(spike_time).toFixed(2) + "</font> (<font color=\"red\">" + np +"</font> firing).";
    document.getElementById('optimal_SS').innerHTML="&nbsp;&nbsp;&nbsp;&nbsp;Optimal binsize = <font color=\"red\">" + optimal_binsize.toFixed(2) + "</font>. <INPUT type='button' value = 'data sheet'><INPUT type='button' value = 'more detail' onclick=window.open('http://www.ton.scphys.kyoto-u.ac.jp/~shino/toolbox/sshist/hist.html')>";
	
}

function DrawGraphOS(spike_time, optimal_binsize) {
    DrawHist(spike_time, optimal_binsize, "graph_OS", "aquamarine");
    SpikeRaster(spike_time, "raster2");

    /* output */
    var np;
    if( Calc_lv(spike_time)<1 ) np="regular";
    else np="bursty";
    document.getElementById('optimal_OS').innerHTML="&nbsp;&nbsp;&nbsp;&nbsp;Optimal binsize = <font color=\"red\">" + optimal_binsize.toFixed(2) + "</font>. Irregularity is estimated as Lv = <font color=\"red\">" + Calc_lv(spike_time).toFixed(2) + "</font>. <INPUT type='button' value = 'data sheet'><INPUT type='button' value = 'more detail' onclick=window.open('http://www.ton.scphys.kyoto-u.ac.jp/~shino/toolbox/oshist/hist.html')>";
}

///////////////////////////////
//Output
///////////////////////////////
function OutputResults(){

    var result;
	
    var np;
    if( OUTPUT_lv<1 ) np="regular";
    else np="bursty";
	
    result="The optimal bin size is " + OUTPUT_binsize_g.toFixed(2) + ".<br>The non-Poisson characteristic of your data is estimated by Lv as Lv = " + OUTPUT_lv.toFixed(2) + " (" + np +" firing).<br><br><br>";
	
    result+="The rate estimated based on non-Poissonian optimization method.<br> time / rate<br>";
    
    for(var i=0;i<OUTPUT_rate_g.length;i++){ result+= (OUTPUT_onset+i*OUTPUT_binsize_g).toFixed(2) + "&nbsp;&nbsp;&nbsp;&nbsp;" + OUTPUT_rate_g[i].toFixed(2) + "<br>" + (OUTPUT_onset+(i+1)*OUTPUT_binsize_g).toFixed(2) + "&nbsp;&nbsp;&nbsp;&nbsp;" + OUTPUT_rate_g[i].toFixed(2) + "<br>"; }
	
    result+="<br><br>The rate estimated based on Poissonian optimization method.<br> time / rate<br>";
	
    for(var i=0;i<OUTPUT_rate_p.length;i++){ result+= (OUTPUT_onset+i*OUTPUT_binsize_p).toFixed(2) + "&nbsp;&nbsp;&nbsp;&nbsp;" + OUTPUT_rate_p[i].toFixed(2) + "<br>" + (OUTPUT_onset+(i+1)*OUTPUT_binsize_p).toFixed(2) + "&nbsp;&nbsp;&nbsp;&nbsp;" + OUTPUT_rate_p[i].toFixed(2) + "<br>"; }
	
    document.write(result);
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

function density(spike_time, canvas_id) {
    DATA_MAX = Math.max.apply(null, spike_time);
    DATA_MIN = Math.min.apply(null, spike_time);
    
    var optw = SearchMinimum(spike_time);
    var opty = kernel(spike_time, optw);
    var canvas = document.getElementById(canvas_id);
    if (canvas.getContext) {
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, 800, y_graph);
	ctx.beginPath();
	ctx.moveTo(x_base, y_graph);
	for (var i = 0; i < K; i++) {
	    PointX = Math.round(i * width / (K - 1) + x_base);
	    PointY = y_graph - Math.round(y_graph * opty[i] / (1.2 * Math.max.apply(null, opty)));
	    ctx.lineTo(PointX, PointY);
	}
	ctx.lineTo(width + x_base, y_graph)
	ctx.fillStyle = "rgb(255, 165, 0)";
	ctx.fill();
	ctx.strokeStyle = "brack";
	ctx.strokeRect(x_base, y_graph, width, -height_graph);

	ctx.stroke();

    }
    densitydiv(opty, "ShimazakiKernelDiv", "orange");
    SpikeRaster(spike_time, "raster3");
    document.getElementById('optimal_ShimazakiKernel').innerHTML="&nbsp;&nbsp;&nbsp;&nbsp;Optimal bandwidth = <font color=\"red\">" + optw.toFixed(2) + "</font>.<INPUT type='button' value = 'data sheet'><INPUT type='button' value = 'more detail' onclick=window.open('http://www.ton.scphys.kyoto-u.ac.jp/~shino/toolbox/sskernel/kernel.html')>";
}

function densitydiv(opty, div_id, color) {
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
		      textPosition: 'none'},
		  colors: [color]
		}
	    var chart = new google.visualization.AreaChart(document.getElementById(div_id));
	    chart.draw(data, options);
	})
}



function density2(spike_time, canvas_id) {
    var optw = SearchMinimum(spike_time);
    var opty = kernel2(spike_time, optw);
    var canvas = document.getElementById(canvas_id);
    if (canvas.getContext) {
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, 800, y_graph);
	ctx.beginPath();
	ctx.moveTo(x_base, y_graph);
	for (var i = 0; i < K; i++) {
	    PointX = Math.round(i * width / (K - 1) + x_base);
	    PointY = y_graph - Math.round(y_graph * opty[i] / (1.2 * Math.max.apply(null, opty)));
	    ctx.lineTo(PointX, PointY);
	}
	ctx.lineTo(width + x_base, y_graph)
	ctx.fillStyle = "mediumaquamarine";
	ctx.fill();
	ctx.stroke();
	ctx.strokeStyle = "brack";
	ctx.strokeRect(x_base, y_graph, width, -height_graph);


    }
    densitydiv(opty, "ShimazakiKernel2Div", "mediumaquamarine");    
    SpikeRaster(spike_time, "raster4");
    document.getElementById('optimal_ShimazakiKernel2').innerHTML="&nbsp;&nbsp;&nbsp;&nbsp;Optimal bandwidth = <font color=\"red\">" + optw.toFixed(2) + "</font>.<INPUT type='button' value = 'data sheet'><INPUT type='button' value = 'more detail' onclick=window.open('http://www.ton.scphys.kyoto-u.ac.jp/~shino/toolbox/reflectedkernel/reflectedkernel.html')>";
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
	y[i] = 0;
	for (var j = 0; j < spike_time.length; j++) {
	    y[i] = y[i] + Gauss(x[i] - spike_time[j], w) / spike_time.length;
	}
    }

    return y;
}

function kernel2(spike_time, w) {
    //鏡像折り返しに対応
    var x = xaxis();
    var y = new Array(K);

    for (var i = 0; i < K; i++) {
	y[i] = 0;
	for (var j = 0; j < spike_time.length; j++) {
	    y[i] = y[i] + Gauss(x[i] - spike_time[j], w) / spike_time.length
		+ Gauss(x[i] - (2 * DATA_MAX - spike_time[j]), w) / spike_time.length
		+ Gauss(x[i] - (2 * DATA_MIN - spike_time[j]), w) / spike_time.length;
	}
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
    var spike_num = spike_time.length;
    var onset = spike_time[0]              - 0.001 * (spike_time[spike_num - 1] - spike_time[0]);
    var offset = spike_time[spike_num - 1] + 0.001 * (spike_time[spike_num - 1] - spike_time[0]);

    var optimal_rate_p, optimal_rate_g;
    var rate_max;

    /* for (var i = 0; i < rate_hmm.length; i++) {
	if (i == 0 || rate_max < rate_hmm[i][1]) rate_max = rate_hmm[i][1];
    } */
    rate_max = Math.max.apply(null, rate_hmm.map(function(x) { return x[1] }));
    

    var canvas = document.getElementById("HMM");
    if (!canvas || !canvas.getContext) { return false;}
    var ctx = canvas.getContext('2d');

    /* reset canvas */
    ctx.clearRect(0, 0, 800, 70);

    /* sotowaku */
    ctx.strokeStyle = "black";
    ctx.strokeRect(x_base, y_graph, width, -height_graph);

    /* hmm */
    var gra_binwidth = width / rate_hmm.length;
    for (var i = 0; i < rate_hmm.length; i++) {
	ctx.fillStyle = "lightsalmon";
	var x_pos = x_base + i * gra_binwidth;
	var height = height_hist * rate_hmm[i][1] / rate_max;
	ctx.fillRect(x_pos, y_graph, gra_binwidth, -height);
	ctx.strokeStyle = "black";
	ctx.strokeRect(x_pos, y_graph, gra_binwidth, -height);
    }
    drawHMMDiv(rate_hmm, "HMMDiv", "lightsalmon");

}

function drawHMMDiv(rate_hmm, div_id, color) {
    google.charts.setOnLoadCallback(
	function() {
	    var arr = [['', '']].concat(rate_hmm);
	    var data = google.visualization.arrayToDataTable(arr);
	    var options = {
		legend: 'none',
		bar: {groupWidth: "100%"},
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
		    textPosition: 'none'},
		orientation: 'horizontal',
		colors: [color]}
	    var chart = new google.visualization.AreaChart(document.getElementById(div_id));
	    chart.draw(data, options);
	})
    document.getElementById('HMMMessage').innerHTML="&nbsp;&nbsp;&nbsp;&nbsp;<INPUT type='button' value = 'data sheet'><INPUT type='button' value = 'more detail' onclick=window.open('http://www.ton.scphys.kyoto-u.ac.jp/~shino/toolbox/msHMM/HMM.html')>";    
}
