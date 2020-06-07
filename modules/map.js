var path_to_geodata = "data/africa.topojson";
var callbackSelectCountry = null;

var last_country_selected = null;
var stroke_with_no_selection = 0.5;
var stroke_with_selection = 3.5;

var svg = null;
var countries = null;
let color = d3.scaleSequential().interpolator(d3.interpolateGreens);

var width = 0;
var height = 0;

var legend = null;

function processData(data){
    return data.reduce((processed, current) => {
        let upperCase = current.toUpperCase();
        if(!processed.hasOwnProperty(upperCase)){
            processed[upperCase] = 0;
        }
        processed[upperCase]++;
        return processed;
    }, {});
}

function create(document_id, map_size, data, select_country){
    width = parseInt(d3.select('#'+document_id).style('width'), 10)*map_size;
    height = parseInt(d3.select('#'+document_id).style('height'), 10)*map_size;

    let projection = d3.geoMercator()
        .scale(width/1.4)
        .translate([width/3, height / 2]);
    
    let path = d3.geoPath()
        .projection(projection);

    callbackSelectCountry = select_country;
    d3.json(path_to_geodata).then(function (africa){
        countries = processData(data);
        
        color.domain([0, d3.max(Object.values(countries))]);

        svg = d3.select("#"+document_id)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        let group = svg.append('g')
            .attr("class", "continent");
        
        
        let countryPath = group.selectAll(".countries")
            .data(topojson.feature(africa, africa.objects.collection).features)
            .enter()
            .append('path')
            .attr('fill', 'none')
            .attr('pointer-events','all')
            .attr('stroke-linejoin','round')
            .attr('stroke-linecap','round')
            .attr('stroke', '#000')
            .attr('stroke-width', 0.5)
            .attr('d', path);

        countryPath
            .transition()
            .duration(1000)
            .style("fill", function(current_country){
                return getCountryColor(current_country.properties.adm0_a3_is);
            })
            .style('cursor', 'pointer');


        buildLegend();

        d3.select('#'+document_id).select("button").on('click', function(){
            if(last_country_selected != null){
                selectCountry({'properties':{'adm0_a3_is':last_country_selected}});
            }
        });

        new Promise(r => setTimeout(r, 1200)).then(function(){
            countryPath.on('click', selectCountry);
        });

    });
}

function buildLegend(){
    legend = d3.legendColor()
        .shapeWidth(width / 10)
        .cells(9)
        .orient("horizontal")
        .labelOffset(10)
        .ascending(true)
        .labelAlign("middle")
        .shapePadding(0);

    legend
        .labelFormat(function(d) {
            return Math.round(d);
        })
        .title('Number of documents')
        .scale(color);

    svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width / 24) + "," + (height * 6 / 7) + ")")
        .call(legend);
}

function getCountryColor(country_abr){
    let country = countries[country_abr];
    if(country && country !== 0){
        return color(country);
    }
    return color(0);
}

function selectCountry(data){
    console.log(data);
    var country_abr = data.properties.adm0_a3_is;
    svg.selectAll('path')
        .style('fill', function(current_country){
            var current_country_abr = current_country.properties.adm0_a3_is;
            if(last_country_selected === country_abr){
                return getCountryColor(current_country_abr);
            }

            if(country_abr === current_country_abr){
                return getCountryColor(current_country_abr);
            }
            return color(0);
        })
        .attr('stroke-width', function(current_country){
            if(last_country_selected === country_abr){
                return stroke_with_no_selection;
            }

            var current_country_abr = current_country.properties.adm0_a3_is;
            if(country_abr === current_country_abr){
                return stroke_with_selection;
            }
            return stroke_with_no_selection;
        });

    if(last_country_selected === country_abr){
        last_country_selected = null;
    }else{
        last_country_selected = country_abr;
        d3.select(".country-name").text(data.properties.brk_name).style("visibility", "visible");
    }
    callbackSelectCountry(country_abr);
}

function filterCountries(countries_selected){
    //Select data
    countries = processData(countries_selected);
    
    color.domain([0, d3.max(Object.values(countries))]);

    svg.selectAll('path')
        .transition()
        .duration(1000)
        .style("fill", function(current_country){
            let a = countries[current_country.properties.adm0_a3_is.toString().toUpperCase()];
            if(a) return color(a);
            return color(0);
        });

    //if(num_bins_legend > 1.0){
        //legend.cells(Math.ceil(num_bins_legend));
        //legend.cells(Math.ceil(d3.max(Object.values(countries))/5)+1);
        //legend.cells(4).scale(color);
    
        legend.cells(4).scale(color);

        svg.select(".legend").call(legend);
        //    .style('visibility', 'visible')
        //    .call(legend);
    //} else {
    //    svg.select('.legend').style('visibility', 'hidden');
        //legend.style('visible', 'hidden');
    //}
    
}

export {create, filterCountries};