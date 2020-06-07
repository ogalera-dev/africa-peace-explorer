var margin = {top: 30, right: 30, bottom: 80, left: 60};
var height = 0;


var last_year_selected = null;
var color_bar_no_selection = '#12BCB2';
var color_bar_selection_others = '#CCE1E0';
var color_bar_selection = '#147E78';
var stroke_with_no_selection = 1;
var stroke_with_selection = 3;

var callback_select_year = null;
var svg = null;

var years = [];

//Axis
var x_scale = null;
var y_scale = null;
var x_axis = null;
var y_axis = null;

function process_data(data){
    var reduced_years = data.reduce((processed, current) => {
        if(!processed.hasOwnProperty(current)){
            processed[current] = 0;
        }
        processed[current]++;
        return processed;
    }, {});

    var result = [];
    for(const year in reduced_years){
        result.push({'year': year, 'count': reduced_years[year]})
    }
    return result;
}

function create(document_id, time_height, data, select_year){
    height = time_height - margin.top - margin.bottom;

    var width = parseInt(d3.select('#'+document_id).style('width'), 10) - margin.left - margin.right;

    callback_select_year = select_year;
    years = process_data(data);

    svg = d3.select('#'+document_id)
        .append('svg')    
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x_scale = d3.scaleBand()
        .range([0, width])
        .domain(years.map(function(d) {return d.year;}))
        .padding(0.2);

    y_scale = d3.scaleLinear()
        .domain([0, d3.max(years, function(d){return d.count;})])
        .range([height, 0]);

    x_axis = d3.axisBottom(x_scale);
    y_axis = d3.axisLeft(y_scale);

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0, '+height+')')
        .call(x_axis)
        .selectAll('text')
            .attr('transform', 'translate(-10.0)rotate(-45)')
            .style('font-weight', 'bold')
            .style('font-size', '1.5em')
            .style('text-anchor', 'end');

    svg.append('g')
        .attr('class', 'y-axis')
        .call(y_axis)
        .selectAll('text')
        .style('font-weight', 'bold')
        .style('font-size', '1.5em');

    svg.selectAll('bar')
        .data(years)
        .enter()
        .append('rect')
            .attr('x', function(d) {return x_scale(d.year);})
            .attr('y', function(d) {return y_scale(d.count);})
            .attr('width', x_scale.bandwidth())
            .attr('height', function(d){return height - y_scale(d.count);})
            .attr('stroke', '#000')
            .attr('stroke-width', stroke_with_no_selection)
            .attr('fill', color_bar_no_selection)
            .style('cursor', 'pointer')
        .on('click', selectYear);

    d3.select('#'+document_id).select("button").on('click', function(){
        if(last_year_selected != null){
            selectYear({'year':last_year_selected});
        }
    });
}

function selectYear(selected){
    console.log(selected);
    paintSelected(selected.year);

    if(last_year_selected === selected.year){
        last_year_selected = null;
    }else{
        last_year_selected = selected.year;
    }

    callback_select_year(selected.year);
}

function paintSelected(year){
    svg.selectAll('rect')
    .attr('fill', function(a){
        if(last_year_selected === year){
            return color_bar_no_selection;
        }
        if(year === a.year){
            return color_bar_selection;
        }
        return color_bar_selection_others;
    })
    .attr('stroke-width', function(a){
        if(last_year_selected === year){
            return stroke_with_no_selection;
        }
        if(year === a.year){
            return stroke_with_selection;
        }
        return stroke_with_no_selection;
    });
}

function deselectYear(){
    svg.selectAll('rect')
        .attr('stroke-width', stroke_with_no_selection)
        .attr('fill', color_bar_no_selection);
    last_year_selected = null;
}

function filterYears(years_selected){
    if(years_selected.length == 0){
        svg.style('visibility', 'hidden');
        d3.select("#clear-time").style('visibility', 'hidden');
        d3.select("#no-data-time").style('visibility', 'visible');
        return;
    } else {
        d3.select("#no-data-time").style('visibility', 'hidden');
        svg.style('visibility', 'visible');
        d3.select("#clear-time").style('visibility', 'visible');
    }
    //Select data
    var years = process_data(years_selected);

    //Change scales
    x_scale.domain(years.map(function(d) {return d.year;}));
    y_scale.domain([0, d3.max(years, function(d){return d.count;})]);

    //Change bars
    var bars = svg.selectAll('rect')
        .data(years);

    bars.enter()
        .append('rect')
            .attr('stroke', '#000')
            .attr('stroke-width', stroke_with_no_selection)
            .attr('fill', color_bar_no_selection)
            .style('cursor', 'pointer')
            .on('click', selectYear)
        .merge(bars)
        .transition()
        .duration(1000)
            .attr('x', function(d) {return x_scale(d.year);})
            .attr('y', function(d) {return y_scale(d.count);})
            .attr('width', x_scale.bandwidth())
            .attr('height', function(d){return height - y_scale(d.count);});

    bars.exit().remove();

    //Update axis
    svg.select('.x-axis')
        .transition()
        .duration(1000)
        .call(x_axis);

    svg.select('.y-axis')
        .transition()
        .duration(1000)
        .call(y_axis);

    svg.select('.x-axis')
        .selectAll('text')
        .attr('transform', 'translate(-10.0)rotate(-45)')
        .style('font-weight', 'bold')
        .style('font-size', '1.5em')
        .style('text-anchor', 'end');

}

export {create, filterYears, deselectYear};