define(['d3'], function (d3) {
    var dt = [];
    var usage_data = {
        "seriesName": "Usage",
        "renderAs": "column",
        "UOM": "kWh",
        "data": []
    };
    var high_temperature = {
        "seriesName": "High",
        "renderAs": "line",
        "UOM": "F",
        "color": "blue",
        "parentYAxis": "S",
        "referenceScale": 1,
        "data": []
    };
    var low_tempertature = {
        "seriesName": "Low",
        "renderAs": "line",
        "UOM": "F",
        "color": "red",
        "parentYAxis": "S",
        "referenceScale": 1,
        "data": []
    };

    var from_date = '2019-08-01';
    var to_date = '2019-08-31';
    var dt_format = d3.timeFormat("%Y-%m-%d");
    var get_date_range = function () {
        var date_range = d3.timeDays(new Date(2019, 7, 1), new Date(2019, 7, 31));
        var dt_range = date_range.map(function (d) {
            return dt_format(d);
        });
        return dt_range;
    };

    var range = get_date_range();
    

    var generate_random_data = function (ds, max) {
        range.forEach(function (date) {
            var value = Math.floor(Math.random() * Math.floor(max));
            ds['data'].push({
                "label": date,
                "value": value
            });
        });
    };

    var get_random_data = function () {
        generate_random_data(usage_data, 20);
        generate_random_data(high_temperature, 40);
        get_random_data(low_temperature, 20);
        dt.push(usage_data, high_temperature, low_tempertature);

        return dt;
    };
    


    return {
        getRandomData: function () {
            return get_random_data();
        }
    }
});