define(['jquery', 'd3', 'chartBase'], function($, d3, Chart) {

    var self;
    var MSComboDualY = function() {
        if(!(this instanceof MSComboDualY)) {
            throw new TypeError("Cannot call MSComboDualY as function");
        }
        self = this;
        self.graph_settings = {};
    };

    MSComboDualY.prototype = Object.create(Chart);

    MSComboDualY.prototype.render = function(options) {

        var graph_settings = self.initSetup(options);
        self.graph_settings = graph_settings;

        var canvas = graph_settings.canvas;
        var config = graph_settings.config;
        var x_scale = graph_settings.scale.x;
        var y_scale = graph_settings.scale.y;

        var x_axis = graph_settings.axis.x;
        var y_axis = graph_settings.axis.y;

        var y1_scale = self.scaleY(config.height);
        var y1_axis = self.y1Axis(y1_scale);

        var tooltip = graph_settings.tooltip;
        var dataset = graph_settings.dataset;
        var dateSeries = options.chart.xAxis.dateSeries || undefined;

        if(dateSeries) {
            var from = dateSeries.from_date || undefined;
            var to = dateSeries.to_date || undefined;
            var input_dt_format = dateSeries.input_dt_format || undefined;
            var output_dt_format = dateSeries.output_dt_format || undefined;
            var dt_format;
            if(dateSeries.format_date === true) {
                dt_format = self.getDateFormat(output_dt_format);
            } else {
                dt_format = self.getDateFormat();
            }
        }

        // To set same zero line for both Y axes        
        var adjusted_min_max = self.syncAxes(dataset);
        if(!adjusted_min_max) {
            $(options.chart.anchor).empty().html('\
			<div class="empty-card-body">No data available</div>');
            return;
        }

        $.each(dataset, function(i, data) {

            // If XAxis is date series then data has to be converted to the preferred format
            // Check for data is done again to handle cases for line chart

            var new_data; //This is needed so that we don't have data issue when reloading the chart

            if(data.data) {
                if(dateSeries && dateSeries.format_date === true) {
                    new_data = self.convertDateFormat(data.data, input_dt_format, output_dt_format);
                } else {
                    new_data = $.merge([], data.data);
                }
            }
            if(!new_data) {
                $(options.chart.anchor).empty().html('<p>Sorry something went wrong !</p>');
                return false;
            }

            if(data.renderAs == 'column') {

                //Scale the data

                // The following code can be made better by having conditional for only 'from'
                // and 'to' but I intend to play around with this a little more so retaining
                // this approach

                if(dateSeries) {
                    if(from !== undefined && to !== undefined) {
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

                y_scale.domain([adjusted_min_max['y1min'], adjusted_min_max['y1max']]).nice();

                // End of scaling data

                // Appending horizontal gridlines.
                // SVG elements are rendered in the order of appending.
                // Hence calling this function before datapoint rendition.
                // Note: The gridlines are based on left side Y-axis

                if(options.chart.showGridLines === true) {
                    self.showGridLines(canvas, config, y_scale);
                }

                //Render the chart
                canvas.append("g").selectAll("rect")
                    .data(new_data)
                    .enter()
                    .append("rect")
                    .attr("class", function(d) {
                        // As of now both +ve and -ve are in same color.
                        // They can be assigned different colors, if needed.
                        return d.value > 0 ? 'positive' : 'negative';
                    })
                    .attr("x", function(d, i) {
                        return x_scale(d.label) + 0.5;
                    })
                    .attr("y", function(d, i) {
                        if(d.value > 0) {
                            return y_scale(d.value);
                        } else {
                            return y_scale(0);
                        }
                    })
                    .attr("width", function(d, i) {
                        return x_scale.bandwidth();
                    })
                    .attr("height", function(d) {
                        if (adjusted_min_max['y1min'] < 0) {
                            return Math.abs(y_scale(d.value) - y_scale(0)); // if data contains both positive and negative values
                        } else {
                            return config.height - y_scale(d.value);
                        }
                    })
                    .on("mouseover", function(d, i) {
                        //TODO: A better approach for tooltip
                        //As a work around for date format conversion, actual date and formatted
                        //date are passed.
                        return self.comboTooltip(d.label, data.data[i].label, dataset, tooltip);
                    })
                    .on("mousemove", function() {
                        var coords = d3.mouse(this);
                        return tooltip.style("top", (coords[1] - 65) + "px").style("left", (coords[0] + 85) + "px");
                    })
                    .on("mouseout", function() {
                        return tooltip.style("display", "none");
                    });
            } else if(data.renderAs == 'line') {
                var x = x_scale;
                var y = y1_scale;
                if(data.parentYAxis && data.parentYAxis == 'S') {
                    if(data.referenceScale === 1) {
                        y.domain([adjusted_min_max['y2min'], adjusted_min_max['y2max']]).nice();
                    }
                    //Setup the line generator
                    var valueline = d3.line()
                        .defined(function(d) {
                            if (d.value !== null && d.value !== undefined) {
                                return d;
                            }
                        })
                        .x(function(d) {
                            return x(d.label) + x.bandwidth() / 2;
                        })
                        .y(function(d) {
                            return y(d.value);
                        })
                        .curve(d3.curveMonotoneX);

                    var g = canvas.append("g");
                    g.append("path")
                        .datum(new_data)
                        .attr("class", function(d) {
                            return "line " + data.color;
                        })
                        .attr("d", valueline);

                    g.selectAll("circle")
                        .data(new_data)
                        .enter().append("circle")
                        .attr("class", "circle--" + data.color)
                        .attr("cx", function(d) {
                            if(d.value !== null && d.value !== undefined) {
                                return x(d.label) + x.bandwidth() / 2;
                            }
                        })
                        .attr("cy", function(d) {
                            if(d.value !== null && d.value !== undefined) {
                                return y(d.value);
                            }
                        })
                        .attr("r", function(d) {
                            if (d.value !== null && d.value !== undefined) {
                                return 2;
                            }
                        })
                        .on("mouseover", function(d, i) {
                            //TODO: A better approach for tooltip
                            //As a work around for date format conversion, actual date and formatted
                            //date are passed.
                            return self.comboTooltip(d.label, data.data[i].label, dataset, tooltip);
                        })
                        .on("mousemove", function() {
                            var coords = d3.mouse(this);
                            return tooltip.style("top", (coords[1] - 65) + "px").style("left", (coords[0] + 85) + "px");
                        })
                        .on("mouseout", function() {
                            return tooltip.style("display", "none");
                        });
                }
            }

        });

        self.attachX(canvas, config, x_axis, x_scale, options.chart.transformLabels);
        self.attachY(canvas, config, y_axis,adjusted_min_max.y1min, adjusted_min_max.y1max);
        self.attachY(canvas, config, y1_axis,adjusted_min_max.y2min, adjusted_min_max.y2max, 'right');

        self.displayChartTitle(canvas, config, options.chart.caption);
        self.displayXAxisTitle(canvas, config, options.chart.xAxis.title);
        var formatted_unit = options.chart.yAxis.unit;

        if(options.chart.yAxis.money === true) {
            formatted_unit = $(document).triggerHandler('get_currency_symbol', {
                code: formatted_unit
            });
        }
        self.displayYAxisTitle(canvas, config, options.chart.yAxis.title, formatted_unit);
        self.displayYAxisTitle(canvas, config, options.chart.sYAxis.title, options.chart.sYAxis.unit, 'right');


    };

    MSComboDualY.prototype.comboTooltip = function(display_dt, dt, data, tooltip) {
        var self = this;
        // I understand that this goes against my philosophy of keeping
        // HTML and JS separate but having a HBS template for this will be an overkill
        var html_str = '<div class="chart-tooltip_table">';
        html_str += '<div class="chart-tooltip_row">';
        html_str += '<div class="chart-tooltip_cell">Date</div>';
        html_str += '<div class="chart-tooltip_cell">' + display_dt + '</div>';
        html_str += '</div>';
        $.each(data, function(idx, val) {
            var data_value;
            var data_uom;
            $.each(val.data, function(i, x) {
                if(x.label === dt) {
                    if(x.value === null || x.value === undefined) {
                        data_value = '--';
                    } else {
                        data_value = x.value;
                    }
                    if(x.UOM && x.UOM !== undefined) {
                        data_uom = x.UOM;
                    } else {
                        data_uom = val.UOM;
                    }
                    return false;
                } else {
                    data_value = '--';
                }

            });

            html_str += '<div class="chart-tooltip_row">';
            html_str += '<div class="chart-tooltip_cell">' + val['seriesName'] + '</div>';
            if(data_value === '--') {
                html_str += '<div class="chart-tooltip_cell">' + data_value + '</div>';
            } else {
                if(data_uom && data_uom !== undefined) {

                    if(data_uom === 'F' || data_uom === 'C') {
                        html_str += '<div class="chart-tooltip_cell">' + data_value + '&#176;' + data_uom + '</div>';
                    } else {
                        html_str += '<div class="chart-tooltip_cell">' + data_value + ' ' + data_uom + '</div>';
                    }
                } else {
                    if(self.graph_settings.chart.yAxis.money) {
                        html_str += '<div class="chart-tooltip_cell">' + self.formatNumber(data_value, self.graph_settings.chart.yAxis.unit) + '</div>';
                    } else {
                        html_str += '<div class="chart-tooltip_cell">' + data_value + '</div>';
                    }
                }
            }
            html_str += '</div>';
        });
        html_str += '</div>';
        tooltip.html(html_str);
        return tooltip.style("display", "block");
    };

    MSComboDualY.prototype.syncAxes = function(data) {
        var self = this;
        var x_min_max;
        var no_data = false;

        $.each(data, function(i, x) {
            if(x.renderAs == 'column') {
                if(x.data === undefined || x.data === null || x.data.length <= 0) {
                    no_data = true;
                } else {
                    x_min_max = self.getMinMax(x.data);
                    if((x_min_max[0] === undefined && x_min_max[1] === undefined)) {
                        no_data = true;
                    }
                }
                return false; //To exit each loop
            }
        });

        if(no_data || !x_min_max) {
            return false;
        } else {
            var y1min, y1max, y2max, y2min;
            var sec_y_extent = self.getSecYMinMax(data);

            if(sec_y_extent[0] === undefined && sec_y_extent[1] === undefined) {
                sec_y_extent[0] = 0;
                sec_y_extent[1] = 0;
            } else if(sec_y_extent[0] === 0 && sec_y_extent[1] === 0) {
                sec_y_extent[1] = 0;
            }

            y1min = x_min_max[0];
            y1max = x_min_max[1];
            y2min = sec_y_extent[0];
            y2max = sec_y_extent[1];



            return {
                y1min: y1min,
                y1max: y1max,
                y2min: y2min,
                y2max: y2max
            };
        }

    };

    return new MSComboDualY();
});