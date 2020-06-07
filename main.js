import {create as createItems, select as selectItems} from './modules/items.js';
import {create as createTimeLine, filterYears, deselectYear} from './modules/time-line.js';
import {create as createMap, filterCountries} from './modules/map.js';
import {create as createWC, remove as removeWC} from './modules/word-cloud.js';

var id_document_wc = "document-wc";
var id_document_list = "document-list";
var id_form_document_list = "form-document-list";
var id_document_map = "document-map";
var id_document_time = "time-line";

var selected_document_name = null;
var selected_country_code = null;
var selected_country_name = null;
var selected_year = null;

var data = [];
var selected_ids = [];

function modelData(rows){
    var id = [];
    var countries = [];
    var countries_abr = [];
    var names = [];
    var years = [];
    var texts = [];

    for(var i = 0; i < rows.length; i++){
        var row = rows[i];
        id.push(i);
        countries.push(row.Pais);

        if(row.Nom.length > 100){
            names.push(row.Nom.slice(0, 100)+'...');
        } else{
            names.push(row.Nom);
        }

        countries_abr.push(row.ABR);
        years.push(row.Any);
        texts.push(row.Text);
    }

    return {'ids': id, 'names': names, 'countries': countries, 'countries_abr': countries_abr, 'years': years, 'texts': texts};
}

d3.csv('data/dades_with_abr.csv').then(function(rows){
    let window_width = window.innerWidth;
    if(window_width >= 1366){

        
        let map_width = 600;
        let map_ratio = 1.0;
        let list_width = 400;
        let time_height = 350;

        if(window_width < 1920){
            //Petit
            map_width = 350;
            list_width = 250;
            time_height = 250;
        }else if(window_width < 2560){
            //Mitja
            map_width = 420;
            list_width = 320;
            time_height = 320;
        }

        data = modelData(rows);
        selected_ids = data.ids;
        
        d3.select("#"+id_document_list)
            .style('width', list_width+'px');

        d3.select('#'+id_document_map)
            .style('width', map_width+'px')
            .style('bottom', time_height+'px');

        d3.select('#'+id_document_wc)
            .style('bottom', time_height+'px')
            .style('left', list_width+'px')
            .style('right', map_width+'px');

        d3.select('#document-time')
            .style('height', time_height+'px')
            .style('left', list_width+'px');

        createItems(id_form_document_list, data.names, selectDocument);
        createMap(id_document_map, map_ratio, data.countries_abr, selectCountry);
        createTimeLine(id_document_time, time_height, data.years, selectYear);

        d3.select(".loading").style("display", "none");
        d3.select(".content").style("visibility", "visible");
    } else {
        d3.select("#screen-out").style("visibility", "visible");
    }
});

function selectYearsByIndex(selected_indexs){
    var years = [];
    for(var i = 0; i < selected_indexs.length; i++){
        years.push(data['years'][selected_indexs[i]]);
    }
    return years;
}

function selectCountriesByIndex(selected_indexs){
    var countries_abr = [];
    for(var i = 0; i < selected_indexs.length; i++){
        countries_abr.push(data['countries_abr'][selected_indexs[i]]);
    }
    return countries_abr;
}

function getCountryNameByCountryCode(country_code){
    let i = 0;
    while(i < data['countries_abr'].length && data['countries_abr'][i] != country_code){
        i++;
    }
    return data['countries'][i];
}

function selectCountry(country_code){
    if(selected_document_name != null){
        selected_document_name = null;
        selected_country_code = null;
        selected_year = null;
    }

    var deselect_country_code = selected_country_code == country_code;
    if(deselect_country_code){
        selected_country_code = null;
        selected_country_name = null;
        d3.select(".country-name").style("visibility", "hidden");
    } else{
        selected_country_code = country_code;
        selected_country_name = getCountryNameByCountryCode(country_code);
        d3.select(".country-name").style("visibility", "visible");
    }

    selected_ids = applySelectionIndex();

    var selected_items = [];
    for(var i = 0; i < selected_ids.length; i++){
        selected_items.push(data.names[selected_ids[i]]);
    }

    selectItems("document-list", selected_items);
    removeWC(id_document_wc);
    buildPath();
    if(deselect_country_code) filterCountries(selectCountriesByIndex(selected_ids));
    filterYears(selectYearsByIndex(selected_ids));
    deselectYear();
}

function selectYear(year){
    console.log('year '+year+', selected year '+selected_year);
    if(selected_document_name != null){
        selected_document_name = null;
        selected_country_code = null;
        selected_country_name = null;
        selected_year = null;
    }

    var deselect_year = selected_year == year;
    if(deselect_year){
        selected_year = null;
    } else{
        selected_year = year;
    }

    selected_ids = applySelectionIndex();

    var selected_items = [];
    for(var i = 0; i < selected_ids.length; i++){
        selected_items.push(data.names[selected_ids[i]]);
    }

    selectItems("document-list", selected_items);
    removeWC(id_document_wc);
    buildPath();
    if(deselect_year) {
        filterYears(selectYearsByIndex(selected_ids));
        deselectYear();
    }
    filterCountries(selectCountriesByIndex(selected_ids));
}

function applySelectionIndex(){
    var selected_indexes = [];
    for(var i = 0; i < data.ids.length; i++){
        if((!selected_country_code || selected_country_code === data.countries_abr[i]) && 
            (!selected_year || selected_year === data.years[i])){
            selected_indexes.push(i);
        }
    }

    return selected_indexes;
}

function selectDocument(index){
    d3.select('#'+id_document_wc).select('.loading-data').style('display', 'unset');
    selected_year = data.years[selected_ids[index]];
    selected_country_code = data.countries_abr[selected_ids[index]];
    selected_country_name = data.countries[selected_ids[index]];
    selected_document_name = data.names[selected_ids[index]];
    
    createWC("document-wc", data.texts[selected_ids[index]], wordCloudReady);
    buildPath();
}

function wordCloudReady(){
    d3.select('#'+id_document_wc).select('.loading-data').style('display', 'none');
}

function buildPath(){
    d3.select("#document-wc").select("#path").text(function(_){
        if(!selected_country_name) return selected_year;
        if(!selected_year) return selected_country_name;
        if(!selected_document_name) return selected_year + ' / ' + selected_country_name;
        return selected_year + ' / ' + selected_country_name + ' / ' + selected_document_name;
    })
}