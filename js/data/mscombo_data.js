define(['d3'], function(d3){
    var dt = [];
    var bar_dt = {
        "seriesName": "Usage",
        "renderAs": "column",
        "UOM": "kWh",
        "data": []
    };
    var line1_dt = {};
    var line2_dt = {};

    var from_date = '2019-08-01';
    var to_date = '2019-08-31';

    var dt_format = d3.timeFormat("%m-%d-%Y");
    var get_date_range = function(){
        var date_range = d3.timeDays(new Date(2019, 7, 1), new Date(2019, 7, 31));
        var dt_range = date_range.map(function(d){
            return dt_format(d);
        });
        return dt_range;
    };


    return {
        getDateRange: function(){
            return get_date_range();
        }
    }
});