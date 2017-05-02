function backMain() {
    document.getElementById("Output").style.display='none';
    document.getElementById("Main").style.display='block';
}

function OutputResults(message) {
    //document.getElementById("Main").style.display="none";
    //document.getElementById("Output").style.display="block";
    //document.getElementById("OutputMessage").innerHTML=message;

    var Subwin = window.open("", "DataSheet", "");
    Subwin.document.writeln("<html><style type='text/css'> body, td {font-size: 10pt}</style><body>");
    Subwin.document.writeln(message);
    Subwin.document.writeln("</body></html>");
    
}

function OutputSS(spike_time, optimal_binsize) {
    var results = "";

    results += "Histogram: L2 risk minimization";
    results += "<table width=300><tr><td>X-AXIS</td><td>Y-AXIS</td>";
    OutputHist(spike_time, optimal_binsize, results);
}

function OutputOS(spike_time, optimal_binsize) {
    var lv = Calc_lv(spike_time);
    var results = "";
    
    results += "Histogram: L2 risk minimization for non-Poisson spike trains<br>";
    results += "<table><tr><td>X-AXIS</td><td>Y-AXIS</td>";
    
    OutputHist(spike_time, optimal_binsize, results);
}

function OutputHist(spike_time, optimal_binsize, results) {
    var max = Math.max.apply(null, spike_time);
    var min = Math.min.apply(null, spike_time);
    var onset = min - 0.001 * (max - min);
    var offset = max + 0.001 * (max - min);
    
    var rate = [];
    Estimate_Rate(spike_time, optimal_binsize, rate);
    results += "<tr><td>" + onset.toFixed(2) + "</td><td>0</td>";
    for(var i = 0; i < rate.length; i++) {
	results += "<tr><td>" + (onset + i * optimal_binsize).toFixed(2) + "</td><td>" + rate[i].toFixed(2) + "</td>";
	results += "<tr><td>" + (onset + (i + 1) * optimal_binsize).toFixed(2) + "</td><td>" + rate[i].toFixed(2) + "</td>";
    }
    results += "<tr><td>" + (onset + rate.length * optimal_binsize).toFixed(2) + "</td><td>0</td>";
    results += "</table><br>"
    OutputResults(results);
}

function OutputKernelDensity(optw, opty) {
    var t = xaxis();
    var results = "Kernel density estimation: L2 risk minimization<br>";

    results += "<table><tr><td> X-AXIS </td><td>Y-AXIS</td>";

    results += "<tr><td>" + t[0].toPrecision(5) + "</td><td>0</td>";
    for (var i = 0; i < opty.length; i++) {
	results += "<tr><td>" + t[i].toPrecision(5) + "</td><td>" + opty[i].toPrecision(5) + "</td>";
    }
    results += "<tr><td>" + t[opty.length - 1].toPrecision(5) + "</td><td>0</td>";

    results += "</table><br>";

    OutputResults(results);
}

function OutputHMM(spike_time, rate_hmm) {
    var max = Math.max.apply(null, spike_time);
    var min = Math.min.apply(null, spike_time);
    var onset = min - 0.001 * (max - min);
    var results = "";

    results += "Two-state Hidden Markov Model<br>";
    results += "<table><tr><td>X-AXIS</td><td>Y-AXIS</td><br>";

    results += "<tr><td>" + ((onset + rate_hmm[0][0]).toFixed(2)) + "</td><td>0</td>";
    for (var i = 0; i < rate_hmm.length; i++) {
	var time = rate_hmm[i][0];
	var rate = rate_hmm[i][1];
	results += "<tr><td>" + ((onset + time).toFixed(2)) + "</td><td>" + rate + "</td>";
    }
    results += "<tr><td>" + ((onset + rate_hmm[rate_hmm.length - 1][0]).toFixed(2)) + "</td><td>0</td>";
    
    OutputResults(results);
}

function OutputBayes() {
    //中身はSulabApplet1で書いている
}
