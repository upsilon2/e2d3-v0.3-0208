/**
 * Created by yuuu on 14/12/22.
 */

var width = 500; //���x���G���A������̂ŁA�O���t�����������w��
var height = 500;
//�O���t��"#e2d3-chart-area"���ɁB
var svg = d3.select("#e2d3-chart-area").append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geo.mercator()
    .center([136, 38])
    .scale(1200)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);
var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .attr("class","chart-tooltip");

var topo = {};
var colorButtons = $('<div>').attr('id', 'chart-color-selector');
var buttonBrue = $('<button>').addClass('btn red chart-color-selector-button').attr({
    'data-color-min': '#FEFFD1',
    'data-color-max': '#FF0000'
});
var buttonRed = $('<button>').addClass('btn blue chart-color-selector-button').attr({
    'data-color-min': '#C9FDFF',
    'data-color-max': '#0000FF'
});
var buttonMix = $('<button>').addClass('btn multi chart-color-selector-button').attr({
    'data-color-min': '#00FFFF',
    'data-color-max': '#FF0000'
});

//Excel�Ƀf�[�^���Z�b�g���ꂽ��A�ŏ��ɌĂ΂�郁�\�b�h
function e2d3Show(){

    jQuery('#chart-labels').remove();
    $(colorButtons).append([buttonBrue, buttonRed, buttonMix]);

    $('#e2d3-chart-area').append(colorButtons);

    //topojson.js��ǂݍ���
    $.getScript( baseUrl + "/topojson.v1.6.js",function(){
        //���{�n�}topojson�f�[�^��ǂݍ���
        d3.json("https://e2d3.azurewebsites.net/App/json/geo/japan.topojson", function (error, o) {
            svg.selectAll(".states")
                .data(topojson.feature(o, o.objects.japan).features)
                .enter().append("path")
                .attr("stroke", "gray")
                .attr("stroke-width", "0.5")
                .attr("id", function(d) {return "state_" + d.properties.id; })
                .attr("class", 'states')
                .attr("fill","#fff")
                .attr("d", path);
            topo = o;
            //�f�[�^�X�V���̃R�[���o�b�N��e2d3Update���w��
            e2d3.addChangeEvent(e2d3BindId, e2d3Update, function () {
                //Excel����f�[�^���擾���Ashow�����s
                e2d3.bind2Json(e2d3BindId, { dimension: '3d' }, show);
            });
        });

    });

}
//�f�[�^�X�V���ɁA�ēx�f�[�^���擾���Ȃ����Ashow()�����s
function e2d3Update(responce) {
    console.log("e2d3Update :" + responce);
    if (response) {
        e2d3.bind2Json(e2d3BindId, { dimension: '3d' }, show);
    }
}

function show(data) {
    console.log('show start');
    if (data && topo.objects) {

        //max and right slider labels
          var mins = [];
          var maxis = [];
        var labels = [];
        var values = []; // all of data;
        var data_row = 0;
        for (i in data) if (data.hasOwnProperty(i)) {
            var d = data[i];
            for (k in d) if (d.hasOwnProperty(k)) {

                if (d[k] !== i && data_row !== 0) {
                    values.push(d[k]);
                        
                         if(mins[k] === undefined){
                              mins[k] = d[k];
                              maxis[k] = d[k];
                         }else{
                              if(mins[k] > d[k]){
                                   mins[k] = d[k];
                              }
                              if(maxis[k] < d[k]){
                                   maxis[k] = d[k];
                              }
                         }
                } else if (d[k] !== i && data_row === 0) {
                    labels.push(k);
                    values.push(d[k]);
                }
            }
            data_row++;
        }
        //right slider
        var initLabel = '';
        var hasActive = false;
        jQuery('.chart-label').each(function () {
            if (jQuery(this).hasClass('active')) {
                initLabel = jQuery(this).attr('data-chart-label');
                if ($.inArray(initLabel, labels) === -1) {
                    initLabel = '';
                } else {
                    hasActive = true;
                }
            }
        });
        //color
        var colorSelector = jQuery('.chart-color-selector-button');
        var selectedColor = '';
        jQuery(colorSelector).each(function () {
            if (jQuery(this).hasClass('active')) {
                selectedColor = this;
            }
        });
        if (!selectedColor) {
            selectedColor = colorSelector[0];
            jQuery(colorSelector[0]).addClass('active');
        }

        console.log('hasActive : '+hasActive);
        if (!initLabel) {
            initLabel = labels[0];
        }

        //coloring and tooltip label.
        svg.selectAll(".states")
            .data(topojson.feature(topo, topo.objects.japan).features)
            .on('mouseover', function () { return tooltip.style("visibility", "visible"); })
            .on('mousemove', function (d) {
                var inner = '';
                var noValue = true;
                labels.forEach(function (label, i) {
                    var isActive = (label != initLabel) ? '' : 'active';

                    inner += '<dt class="' + isActive + '">' + label + '</dt><dd class="' + isActive + '">';
                    if(data[d.properties.nam_ja] && data[d.properties.nam_ja][label]){
                        inner += data[d.properties.nam_ja][label];
                        noValue = false;
                    }else{
                        inner += '0';
                    }
                    inner += '</dd>';
                })
                if (!noValue) {
                    return tooltip
                        .style("top", (d3.event.pageY - 10) + "px")
                        .style("left",(d3.event.pageX + 10)+"px")
                        .html('<h4>' + d.properties.nam_ja + '</h4><dl class="dl-horizontal">' + inner);
                }
            })
            .on('mouseout', function () { return tooltip.style("visibility", "hidden"); })
            .transition()
            .attr("fill", function (d) {
                return (data[d.properties.nam_ja] && data[d.properties.nam_ja][initLabel] && !isNaN(+data[d.properties.nam_ja][initLabel])) ? color(data[d.properties.nam_ja][initLabel], values, selectedColor,mins[initLabel],maxis[initLabel]) : "#ffffff";
            });

        if (!hasActive) {
            makeLabels(labels, initLabel);
        }

        //onchange label
        jQuery(document).on('click', '.chart-label', function () {
            jQuery('.chart-label').removeClass('active');
            jQuery(this).addClass('active');

            initLabel = jQuery(this).attr('data-chart-label');
            console.log('label change : ' + initLabel);
            svg.selectAll(".states")
                .data(topojson.feature(topo, topo.objects.japan).features)
                .on('mouseover', function () { return tooltip.style("visibility", "visible"); })
                .on('mousemove', function (d) {
                    var inner = '';
                    var noValue = true;
                    labels.forEach(function (label, i) {
                        var isActive = (label != initLabel) ? '' : 'active';

                        inner += '<dl class="dl-horizontal"><dt class="' + isActive + '">' + label + '</dt><dd class="' + isActive + '">';
                        if (data[d.properties.nam_ja] && data[d.properties.nam_ja][label]) {
                            inner += data[d.properties.nam_ja][label];
                            noValue = false;
                        } else {
                            inner += '0';
                        }
                        inner += '</dd>';
                    })
                    if (!noValue) {
                        return tooltip
                            .style("top", (d3.event.pageY - 10) + "px")
                            .style("left", (d3.event.pageX + 10) + "px")
                            .html('<h4>' + d.properties.nam_ja + '</h4><dl class="dl-horizontal">' + inner);
                    }
                })
                .on('mouseout', function () { return tooltip.style("visibility", "hidden"); })
                .transition()
                .attr("fill", function (d) {
                    return (data[d.properties.nam_ja] && data[d.properties.nam_ja][initLabel] && !isNaN(+data[d.properties.nam_ja][initLabel])) ? color(data[d.properties.nam_ja][initLabel], values, selectedColor,mins[initLabel],maxis[initLabel]) : "#ffffff";
                });
        });
        //change color
        jQuery(document).on('click', '.chart-color-selector-button', function () {
            jQuery('.chart-color-selector-button').removeClass('active');
            jQuery(this).addClass('active');
            console.log('color change : ');
            selectedColor = this;

            svg.selectAll(".states")
                .data(topojson.feature(topo, topo.objects.japan).features)
                .transition()
                .attr("fill", function (d) {
                    return (data[d.properties.nam_ja] && data[d.properties.nam_ja][initLabel] && !isNaN(+data[d.properties.nam_ja][initLabel])) ? color(data[d.properties.nam_ja][initLabel], values, selectedColor,mins[initLabel],maxis[initLabel]) : "#ffffff"
                });
        });
    }
}

function makeLabels(labels, value) {
    jQuery('#chart-labels').remove();
    var box = jQuery('<div>').attr('id','chart-labels');
    jQuery(labels).each(function () {
        var label = jQuery('<label>').addClass('chart-label').attr('data-chart-label',this).html(this);
        if (value == this) {
            jQuery(label).addClass('active');
        }
        jQuery(box).append(label);
    });

    if (labels) {
        jQuery('#e2d3-chart-area').append(box).hide().fadeIn();
    }
}
function color(d, values,selector, min, max) {
    if (!selector) {
        var colorSelector = jQuery('.chart-color-selector-button');
        selector = colorSelector[0];
    }
    var c;
    if (!jQuery(selector).hasClass('multi')) {
        c = d3.scale.linear()
            .domain([min, max])
            .range([jQuery(selector).attr('data-color-min'), jQuery(selector).attr('data-color-max')])
            .interpolate(d3.interpolateLab);
    } else {
        c = d3.scale.linear()
            .domain([min, Math.floor((max - min) * 0.5), max])
            .range([jQuery(selector).attr('data-color-min'), '#FEFCEA', jQuery(selector).attr('data-color-max')])
            .interpolate(d3.interpolateLab);
    }

    return c(d);
}