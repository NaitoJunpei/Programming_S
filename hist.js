var OUTPUT_rate_p;
var OUTPUT_rate_g;
var OUTPUT_binsize_p;
var OUTPUT_binsize_g;
var OUTPUT_lv;
var OUTPUT_onset,OUTPUT_offset;


function ResetData(){
    document.data.spikes.value="0.012 0.050 0.066 0.078 0.113 0.145 0.159 0.188 0.206 0.226 0.261 0.280 0.294 0.305 0.330 0.349 0.368 0.412 0.448 0.477 0.512 0.524 0.529 0.547 0.565 0.588 0.595 0.607 0.619 0.645 0.664 0.685 0.699 0.721 0.737 0.766 0.779 0.814 0.830 0.842 0.872 0.883 0.892 0.903 0.917 0.935 0.959 0.974 0.981 0.995 1.017 1.052 1.067 1.094 1.108 1.124 1.139 1.164 1.183 1.201 1.216 1.234 1.256 1.272 1.291 1.311 1.319 1.344 1.395 1.419 1.436 1.475 1.484 1.527 1.551 1.597 1.614 1.642 1.664 1.725 1.755 1.815 1.854 1.925 1.988 2.127 2.323 2.372 2.515 2.589 2.616 2.713 2.765 2.808 2.837 2.895 2.925 2.943 2.973 3.008 3.040 3.073 3.132 3.145 3.165 3.175 3.195 3.219 3.236 3.256 3.273 3.296 3.301 3.317 3.329 3.335 3.350 3.359 3.376 3.390 3.412 3.439";
    return 0;
}

function Main(){
    
    var spike_time;
    var optimal_binsize_p,optimal_binsize_g;
    
    spike_time = new Array();
    PostData(spike_time);
    SpikeRaster(spike_time);
    
    optimal_binsize_g=OS(spike_time);
    optimal_binsize_p=SS(spike_time);
    
    
    DrawGraph(spike_time,optimal_binsize_g,optimal_binsize_p);
    
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
    
    for(var i=0;i<optimal_binnum;i++){  optimal_rate[i]=0;  }
    for(var i=0;i<spike_num;i++){   optimal_rate[Math.floor((spike_time[i]-onset)/optimal_binsize)]+=1.0/optimal_binsize;   }
    for(var i=0;i<optimal_binnum;i++){  if(i==0 || optimal_rate[i]>rate_max ) rate_max=optimal_rate[i];  }
    
    return rate_max;
}
///////////////////////////////////////////////
//Graph
///////////////////////////////////////////////
var x_base=140;
var width=600;
var y_raster=40;
var height_spike=30;
var y_graph=140;
var height_graph=130;
var height_hist=120;

function SpikeRaster(spike_time){

    var spike_num=spike_time.length;
    var onset  = spike_time[0]           - 0.001*(spike_time[spike_num-1]-spike_time[0]);
    var offset = spike_time[spike_num-1] + 0.001*(spike_time[spike_num-1]-spike_time[0]);
    
    var canvas = document.getElementById('raster');
    if ( ! canvas || ! canvas.getContext ) {	return false;	}
    var ctx = canvas.getContext('2d');
	
    /*reset canvas*/
    ctx.clearRect(0,0,800,70);
    
    /*raster*/
    ctx.strokeStyle = "black"
    ctx.strokeRect(x_base-10,y_raster,width+20,0);
	
    for(i=0;i<spike_num;i++){
	x=(spike_time[i]-onset)/(offset-onset);
	ctx.strokeStyle = "black";
	ctx.strokeRect(x_base+width*x,y_raster,0,-30);
    }
    
    /*text*/
    ctx.font = "16px 'Arial'";
    ctx.fillText("Spikes",10,y_raster-10);
    
    return 0;

}

function DrawGraph( spike_time, optimal_binsize_g, optimal_binsize_p ){
	
    var spike_num=spike_time.length;
    var onset  = spike_time[0]           - 0.001*(spike_time[spike_num-1]-spike_time[0]);
    var offset = spike_time[spike_num-1] + 0.001*(spike_time[spike_num-1]-spike_time[0]);
    
    var optimal_rate_p,optimal_rate_g;
    var rate_max;
    
    optimal_rate_g = new Array();
    rate_max = Estimate_Rate( spike_time, optimal_binsize_g, optimal_rate_g );
    
    optimal_rate_p = new Array();
    if( rate_max < Estimate_Rate( spike_time, optimal_binsize_p, optimal_rate_p ) ) rate_max = Estimate_Rate( spike_time, optimal_binsize_p, optimal_rate_p );
    
    var canvas = document.getElementById('graph');
    if ( ! canvas || ! canvas.getContext ) {	return false;	}
    var ctx = canvas.getContext('2d');
	
    /*reset canvas*/
    ctx.clearRect(0,0,800,200);
	
    /*histogram*/
    ctx.strokeStyle = "black";
    ctx.strokeRect(x_base,y_graph,width,-height_graph);
	
    /*0S*/
    for(var i=0;i<optimal_rate_g.length;i++){
		
        var x=i*optimal_binsize_g/(offset-onset);
	var y=optimal_rate_g[i]/rate_max;
        
        var xx=x_base+width*x;
        var yy=height_hist*y;
        
        ctx.fillStyle="blue";
		
        if( onset + (i+1)*optimal_binsize_g < offset ) ctx.fillRect(xx,y_graph,width*optimal_binsize_g/(offset-onset),-yy);
        else ctx.fillRect(xx,y_graph,width-width*x,-height_hist*y);
    }
    
    /*SS*/
    for(var i=0;i<optimal_rate_p.length;i++){
		
        var x=i*optimal_binsize_p/(offset-onset);
	var y=optimal_rate_p[i]/rate_max;
        
        ctx.fillStyle="red";
        
        for(var xx=x_base+width*x; xx< x_base+width*(i+1)*optimal_binsize_p/(offset-onset) ; xx+=4 ) {
            
            if(xx > x_base+width ) break;
            
            var yy=y_graph-height_hist*y;
            ctx.fillRect(xx,yy-1,2,2);

        }
        
        /*horizontal*/
        for(var xx=x_base+width*x; xx< x_base+width*(i+1)*optimal_binsize_p/(offset-onset) ; xx+=4 ) {
            var yy=y_graph-height_hist*y;
            ctx.fillRect(xx,yy-1,2,2);
        }
        
        /*vertical*/
        if( i < optimal_rate_p.length-1 ){
        
            if( optimal_rate_p[i] < optimal_rate_p[i+1] ){
                for(var yy=y_graph-height_hist*y; yy>y_graph-height_hist*optimal_rate_p[i+1]/rate_max; yy-=4) {
                    var xx=x_base+width*(i+1)*optimal_binsize_p/(offset-onset);
                    ctx.fillRect(xx-1,yy,2,-2);
                }
            }
        
            else{
                for(var yy=y_graph-height_hist*y; yy<y_graph-height_hist*optimal_rate_p[i+1]/rate_max; yy+=4) {
                    var xx=x_base+width*(i+1)*optimal_binsize_p/(offset-onset);
                    ctx.fillRect(xx-1,yy,2,2);
                }
            }
        }   
        
    }
	
    ctx.font = "12px 'Arial'";
    ctx.fillStyle = "black";
    ctx.fillText((rate_max*height_graph/height_hist).toFixed(2),x_base-35,y_graph-height_graph);
    ctx.fillText("0",x_base-20,y_graph);
    ctx.fillText(spike_time[0].toFixed(2),x_base+5,y_graph+20);
    ctx.fillText(spike_time[spike_num-1].toFixed(2),x_base+width+5,y_graph+20);
    ctx.font = "16px 'Arial'";
    ctx.fillText("time",x_base+0.5*width-20,y_graph+35);
    ctx.fillText("Rate",20,y_graph-height_graph/2+10);
    
    /*output*/
    var np;
    if( Calc_lv(spike_time)<1 ) np="regular";
    else np="bursty";
    
    document.getElementById("poisson").innerHTML="&nbsp;&nbsp;&nbsp;&nbsp;The red dotted line represents a histogram constructed with the Poissonian optimization method (Shimazaki & Shinomoto, 2007).";
	
    document.getElementById('optimal').innerHTML="&nbsp;&nbsp;&nbsp;&nbsp;The optimal bin size is <font color=\"red\">" + optimal_binsize_g.toFixed(2) + "</font>.<br>&nbsp;&nbsp;&nbsp;&nbsp;The non-Poisson characteristic of your data is estimated by Lv as Lv = <font color=\"red\">" + Calc_lv(spike_time).toFixed(2) + "</font> (<font color=\"red\">" + np +"</font> firing).";
	
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
p	interval[0]=spike_time[i+1]-spike_time[i];
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
