define(['d3'], function(d3){
    var dt = [];
    var bar_dt = {};
    var line1_dt = {};
    var line2_dt = {};

    var from_date = '2019-08-01';
    var to_date = '2019-08-31';

    var get_date_range = function(){
        var date_range = d3.timeDays(new Date(2019, 7, 1), new Date(2019, 7, 31));
        return date_range;
    };


    return {
        getDateRange: function(){
            return get_date_range();
        }
    }
});