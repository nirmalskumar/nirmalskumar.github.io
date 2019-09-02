require(['./conf/dev'], function () {
    require(['jquery', 'data/mscombo_data'], function ($, MSComboData) {
        $(document).ready(function () {
            console.log('Loaded');
            
            var mscombo_data = MSComboData.getRandomData();
            require(['chart/mscombo'], function(MS) {
                MS.render({
                    chart: {
                        anchor: "#combo-chart",
                        xAxis: {
                            title: "Days",
                            dateSeries: {
                                format_date: true,
                                input_dt_format: "YYYY-MM-DD",
                                output_dt_format: "%d-%b",
                                from_date: '2019-08-01',
                                to_date: '2019-08-30'
                            },
                        },
                        yAxis: {
                            title: 'Usage',
                            unit: 'kWh'
                        },
                        sYAxis: {
                            title: "Temperature",
                            unit: "F"
                        },
                        showValues: false,
                        showGridLines: true,
                    },
                    dataset: mscombo_data
                });
            });
        });
    });
});