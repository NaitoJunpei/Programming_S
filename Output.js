function backMain() {
    document.getElementById("Output").style.display='none';
    document.getElementById("Main").style.display='block';
}

function OutputResults(message) {
    document.getElementById("Main").style.display="none";
    document.getElementById("Output").style.display="block";
    document.getElementById("OutputMessage").innerHTML=message;
}

function OutputSS(spike_time, optimal_binsize) {
    var results = "";

    results += "The optimal bin size is " + optimal_binsize +".<br>";
    results += "The rate estimated based on Poissonian optimization method.<br>";
    results += "time / rate<br>";
    OutputHist(spike_time, optimal_binsize, results);
}

function OutputOS(spike_time, optimal_binsize) {
    var lv = Calc_lv(spike_time);
    var results = "";
    var np;
    if(lv < 1) np = "regular";
    else np = "bursty";
    
    results += "The optimal bin size is " + optimal_binsize + ".<br>";
    results += "The non-Poisson characteristic of your data is estimated by Lv as Lv = " + lv.toFixed(2) + "(" + np + " firing).<br>";
    results += "The rate estimated based on non-Poissonian optimization method.<br>";
    results += "time / rate<br>";
    
    OutputHist(spike_time, optimal_binsize, results);
}

function OutputHist(spike_time, optimal_binsize, results) {
    var max = Math.max.apply(null, spike_time);
    var min = Math.min.apply(null, spike_time);
    var onset = min - 0.001 * (max - min);
    var offset = max + 0.001 * (max - min);
    
    var rate = [];
    Estimate_Rate(spike_time, optimal_binsize, rate);
    for(var i = 0; i < rate.length; i++) {
	results += (onset + i * optimal_binsize).toFixed(2) + "&nbsp;&nbsp;&nbsp;&nbsp;" + rate[i].toFixed(2) + "<br>";
	results += (onset + (i + 1) * optimal_binsize).toFixed(2) + "&nbsp;&nbsp;&nbsp;&nbsp;" + rate[i].toFixed(2) + "<br>";
    }
    OutputResults(results);
}

function OutputKernelDensity(optw, opty) {
    var t = xaxis();
    var results = "";

    results += "工事中<br>";
    OutputResults(results);
}

function OutputKernelDensityR(optw, opty) {
    var t = xaxis();
    var results = "";

    results += "工事中<br>";
    OutputResults(results);
}

function OutputHMM(spike_time, rate_hmm) {
    var max = Math.max.apply(null, spike_time);
    var min = Math.min.apply(null, spike_time);
    var onset = min - 0.001 * (max - min);
    var results = "";

    results += "The rate estimated by two state hidden Markov model.<br>";
    results += "time / rate<br>";

    for (var i = 0; i < rate_hmm.length; i++) {
	var time = rate_hmm[i][0];
	var rate = rate_hmm[i][1];
	results += ((onset + time).toFixed(2)) + "&nbsp;&nbsp;&nbsp;&nbsp;" + rate + "<br>";
    }
    OutputResults(results);
}
