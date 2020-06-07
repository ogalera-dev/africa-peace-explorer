var margin = {top: 20, right: 20, bottom: 40, left: 20};

function process_data(text){
    var result = {};
    var words = text.split(' ');
    for(var i = 0; i < words.length; i++){
        let word = words[i];
        if(!result[word]){
            result[word] = 0;
        }
        result[word]++;
    }
    return result;
}

function create(document_id, text, callback){
    var width = parseInt(d3.select('#'+document_id).style('width'), 10) - margin.left - margin.right;
    var height = parseInt(d3.select('#'+document_id).style('height'), 10) - margin.top - margin.bottom;

    console.log('Word cloud created');

    remove(document_id);

    if(text){
        d3.select("#"+document_id)
            .select("#text")
            .style("display","none");

        var words = process_data(text);

        var color = d3.scaleSequential().interpolator(d3.interpolateGnBu);
        color.domain([d3.min(Object.values(words)), d3.max(Object.values(words))]);

        var word_entries = d3.entries(words);
    
        var xScale = d3.scaleLinear()
            .domain([0, d3.max(word_entries, function(d) { return d.value; }) ])
            .range([10,100]);
    
        d3.layout.cloud()
            .size([width, height])
            .timeInterval(20)
            .words(word_entries)
            .fontSize(function(d) { return xScale(+d.value); })
            .text(function(d) { return d.key; })
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .font("Impact")
            .on("end", draw)
            .start();

        function draw(words) {
            d3.select("#"+document_id).append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) { return xScale(d.value) + "px"; })
                .style("font-family", "Impact")
                .style("fill", function(d, i) { return color(d.value); })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.key; });

                callback();
        }
    }
    else{
        d3.select("#"+document_id)
            .select("#text")
            .style("visibility","visible");
    }
}

function remove(document_id){
    d3.select("#"+document_id).select("svg").remove();
    d3.select("#"+document_id)
        .select("#text")
        .style("display","inline-block");
}

export {create, remove};