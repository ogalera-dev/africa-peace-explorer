var select_item_callback = null;

function create(document_id, data, select_item){
    select_item_callback = select_item;

    select(document_id, data);

    console.log('Documents created');
}

function select(document_id, data){
    d3.select("#"+document_id)
        .selectAll("label")
        .remove();

    var labels = d3.select("#"+document_id)
        .selectAll("label")
        .data(data)
        .enter()
        .append("label");

    labels.append("input")
        .attr("type", "radio")
        .attr("name", "document")
        .attr("value", function(_, index){
            return index;
        });

    labels.append("span")
        .text(function(data){return " "+data;});

    labels.style('cursor', 'pointer');
    
    d3.select('#'+document_id)
        .selectAll('input')
        .on('change', function(){
            select_document(this.value);
        });

}

function select_document(selection){
    select_item_callback(selection);
}

export {create, select};