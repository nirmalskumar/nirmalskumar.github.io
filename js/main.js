require(['./conf/dev'], function () {
    require(['jquery', 'data/mscombo_data'], function ($, MSComboData) {
        $(document).ready(function () {
            var values = {
                'usage-min': 45,
                'usage-max': 55,
                'high-min': 80,
                'high-max': 90,
                'low-min': 0,
                'low-max': 10
            };
            var mscombo_data;
            $("#redraw").click(function () {
                var $inputs = $('#range-form :input');
                $inputs.each(function () {
                    if (this.name.match('min') || this.name.match('max')) {
                        values[this.name] = $(this).val();
                    }
                });
                
                mscombo_data = MSComboData.getRandomData(values);
                $('.canvas').empty();
                drawComboChart();
                drawColChart();
                return false;
            });
            $("#range-form").on('reset', function(){
                setTimeout(function() {
                    $("#redraw").trigger('click');
                  }, 1);
                
            });
            
            mscombo_data = MSComboData.getRandomData(values);
            drawComboChart();
            drawColChart();

            function drawComboChart() {
                require(['chart/mscombo'], function (MS) {
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
                            displayInteger: true
                        },
                        dataset: mscombo_data
                    });
                });
            }

            function drawColChart(){
                require(['chart/column'], function(Column){
                    Column.render({
                        chart: {
                            anchor: "#col-chart",
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
                            showValues: false,
                            showGridLines: true,
                            displayInteger: true
                        },
                        dataset: mscombo_data[0]['data']
                    });
                });
            }
        });
    });
});