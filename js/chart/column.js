define(['jquery', 'd3', 'chartBase'], function($, d3, Chart) {
    var self;

    var Column = function() {
        if (!(this instanceof Column)) {

            throw new TypeError("Cannot call Column as function");
        }
        self = this;
    };

    Column.prototype = Object.create(Chart);

    Column.prototype.render = function(options) {
        var graph_settings = self.initSetup(options);
        var canvas = graph_settings.canvas;
        var config = graph_settings.config;
        var x_scale = graph_settings.scale.x;
        var y_scale = graph_settings.scale.y;

        var x_axis = graph_settings.axis.x;
        var y_axis = graph_settings.axis.y;

        var tooltip = graph_settings.tooltip;
        var dataset = graph_settings.dataset;

        var dateSeries = options.chart.xAxis.dateSeries || undefined;

        if (dateSeries) {
            var from = dateSeries.from_date || undefined;
            var to = dateSeries.to_date || undefined;
            var input_dt_format = dateSeries.input_dt_format || undefined;
            var output_dt_format = dateSeries.output_dt_format || undefined;
            var dt_format;
            if (dateSeries.format_date === true) {
                dt_format = self.getDateFormat(output_dt_format);
            } else {
                dt_format = self.getDateFormat();
            }
        }

        //Scale the data
        if (dataset === undefined || dataset === null) {
            $(options.chart.anchor).empty().html('<div class="empty empty-card-body">No data available</div>');
            return;
        }
        var new_data; //This is needed so that we don't have data issue when reloading the chart

        if (dateSeries && dateSeries.format_date === true) {
            new_data = self.convertDateFormat(dataset, input_dt_format, output_dt_format);
        } else {
            new_data = $.merge([], dataset);
        }

        if (!new_data) {
            $(options.chart.anchor).empty().html('<p>Sorry something went wrong !</p>');
            return false;
        }
        //The following code can be made better by having conditional for only 'from' and 'to'
        //but I intend to play around with this a little more so retaining this approach

        if (dateSeries) {
            if (from !== undefined && to !== undefined) {
                // IE accepts only specific date formats; so the following work around
                // Note: The assumed date format for from and to is: YYYY-MM-DD
                var start = from.split("-");
                var end = to.split("-");

                from = new Date(start[0], start[1] - 1, start[2]);
                to = new Date(end[0], end[1] - 1, end[2]);

                var dateRange = self.getDateRange(from, to);
                x_scale.domain(dateRange.map(function(d) {
                    return dt_format(d);
                }));
            } else {
                x_scale.domain(new_data.map(function(d) {
                    return d.label;

                }));
            }
        } else {
            x_scale.domain(new_data.map(function(d) {
                return d.label;
            }));
        }

        var min_max = self.getMinMax(dataset);


        if ((min_max[0] === undefined && min_max[1] === undefined) || (min_max[0] === 0 && min_max[1] === 0)) {
            $(options.chart.anchor).empty().html('<div class="empty empty-card-body">No data available</div>');
            return;
        }

        //Adding buffer for min and max value
        if (min_max[0] > 0 && min_max[1] > 0) {
            y_scale.domain([min_max[0] / 1.30, min_max[1] * 1.30]).nice();
        } else if (min_max[0] < 0 && min_max[1] < 0) {
            y_scale.domain([min_max[0], 0]).nice();
        } else {
            y_scale.domain([min_max[0], min_max[1] * 1.30]).nice();
        }

        // Appending horizontal gridlines.
        // SVG elements are rendered in the order of appending.
        // Hence calling this function before datapoint rendition.

        if (options.chart.showGridLines === true) {
            self.showGridLines(canvas, config, y_scale);
        }


        self.attachX(canvas, config, x_axis, options.chart.transformLabels);
        self.attachY(canvas, config, y_axis, min_max[0],min_max[1],'',options.chart.displayInteger);
        self.displayChartTitle(canvas, config, options.chart.caption);
        self.displayXAxisTitle(canvas, config, options.chart.xAxis.title);
        var formatted_unit = options.chart.yAxis.unit;

        if (options.chart.yAxis.money === true) {
            formatted_unit = $(document).triggerHandler('get_currency_symbol', {
                code: formatted_unit
            });
        }

        self.displayYAxisTitle(canvas, config, options.chart.yAxis.title, formatted_unit);

        //Render the chart
        canvas.append("g").selectAll("rect")
            .data(new_data)
            .enter()
            .append("rect")
            .attr("class", function(d) {
                return d.value > 0 ? 'positive' : 'negative';
            })
            .attr("x", function(d, i) {
                return x_scale(d.label) + 0.5;
            })
            .attr("y", function(d) {
                if (d.value > 0) {
                    return y_scale(d.value);
                } else {
                    return y_scale(0);
                }
            })
            .attr("width", function(d, i) {
                return x_scale.bandwidth();
            })
            .attr("height", function(d) {
                if (min_max[0] < 0) {
                    return Math.abs(y_scale(d.value) - y_scale(0)); // if data contains both positive and negative values
                } else {
                    return graph_settings.config.height - y_scale(d.value);
                }
            })
            .on("mouseover", function(d) {
                var display_money = graph_settings.chart.yAxis.money;
                var html_str = '<div class="chart-tooltip_table">';
                html_str += '<div class="chart-tooltip_row">';
                html_str += '<div class="chart-tooltip_cell">' + d.label + '</div>';
                html_str += '</div>';
                html_str += '<div class="chart-tooltip_row">';
                if (d.UOM && d.UOM !== undefined) {
                    html_str += '<div class="chart-tooltip_cell">' + d.value + ' ' + d.UOM + '</div>';
                } else if (display_money && display_money != undefined) {
                    html_str += '<div class="chart-tooltip_cell">' + self.formatNumber(d.value, graph_settings.chart.yAxis.unit) + '</div>';
                } else if (graph_settings.chart.yAxis.unit) {
                    html_str += '<div class="chart-tooltip_cell">' + d.value + ' ' + graph_settings.chart.yAxis.unit + '</div>';
                } else {
                    html_str += '<div class="chart-tooltip_cell">' + d.value + '</div>';
                }
                html_str += '</div>';
                html_str += '</div>';
                tooltip.html(html_str);
                return tooltip.style("display", "block");
            })
            .on("mousemove", function() {
                var coords = d3.mouse(this);
                return tooltip.style("top", (coords[1] - 25) + "px").style("left", (coords[0] + 10) + "px");
            })
            .on("mouseout", function() {
                return tooltip.style("display", "none");
            })
            .on("click", function(d, i) {
                if (options.chart.handleClick) {
                    var fn = options.chart.handleClick;
                    fn(dataset[i].label);
                }
            });

    };

    return new Column();
});