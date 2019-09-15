define(['jquery', 'd3'], function ($, d3) {
    var Chart = function () {
        if (!(this instanceof Chart)) {
            throw new TypeError("Cannot call Chart as a function");
        }
        var self = this;
    };

    //Chart.prototype = Object.create(Base);

    Chart.prototype.initSetup = function (options) {
        var self = this;
        //Create the canvas and obtain its configurations
        var canvas_object = self.setupCanvas(options.chart);
        var canvas = canvas_object.canvas;
        var canvas_config = canvas_object.canvas_config;
        //Set the scale range
        var x_scale = self.scaleX(canvas_config.width);
        var y_scale = self.scaleY(canvas_config.height);

        //Setup the axes
        var x_axis = self.xAxis(x_scale);
        var y_axis = self.yAxis(y_scale);
        //Set the tooltip
        var tooltip = self.tooltip(options.chart.anchor);
        var render_params = {
            canvas: canvas,
            config: canvas_config,
            scale: {
                x: x_scale,
                y: y_scale
            },
            axis: {
                x: x_axis,
                y: y_axis
            },
            tooltip: tooltip,
            dataset: options.dataset,
            chart: options.chart
        };
        return render_params;

    };

    Chart.prototype.setupCanvas = function (chart_config) {
        var self = this;
        var canvas_config = self.setCanvasMargins(chart_config.anchor);
        var canvas = self.createCanvas(canvas_config, chart_config.anchor);
        return {
            "canvas": canvas,
            "canvas_config": canvas_config
        };
    };

    Chart.prototype.setCanvasMargins = function (chart_anchor) {
        var self = this;

        var container_width = $(chart_anchor).outerWidth(true);
        var container_height = parseInt(d3.select(chart_anchor).style('height'), 10) ||
            parseInt(container_width * 0.5, 10);

        var top_margin = parseInt((container_height * 0.2), 10);
        var bottom_margin = parseInt((container_height * 0.3), 10);
        var left_margin = parseInt((container_width * 0.12), 10);
        var right_margin = parseInt((container_width * 0.1), 10);


        var margin = {
            top: top_margin,
            right: right_margin,
            bottom: bottom_margin,
            left: left_margin
        };

        var width = container_width - margin.left - margin.right;
        var height = container_height - margin.top - margin.bottom;

        var canvas_config = {
            width: width,
            height: height,
            margin: margin,
        };
        return canvas_config;
    };

    Chart.prototype.createCanvas = function (canvas_config, anchor) {
        $(anchor).empty().html();
        var canvas = d3.select(anchor)
            .append('svg')
            .attr('class', 'canvas')
            .attr('width', canvas_config.width + canvas_config.margin.left + canvas_config.margin.right)
            .attr('height', canvas_config.height + canvas_config.margin.top + canvas_config.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + canvas_config.margin.left + "," + canvas_config.margin.top + ")");

        return canvas;
    };

    Chart.prototype.xAxis = function (x_scale) {
        var x_axis = d3.axisBottom(x_scale).tickPadding(5);
        return x_axis;
    };

    Chart.prototype.yAxis = function (y_scale) {
        var y_axis = d3.axisLeft(y_scale).tickPadding(5);
        return y_axis;
    };

    Chart.prototype.y1Axis = function (y_scale) {
        var y1_axis = d3.axisRight(y_scale).tickPadding(5).tickFormat(function (d) {
            return d + '°'
        });
        return y1_axis;
    };

    Chart.prototype.scaleX = function (width) {
        var x_scale = d3.scaleBand()
            .range([0, width])
            .paddingInner(0.5)
            .padding(0.1);
        return x_scale;
    };

    Chart.prototype.scaleY = function (height) {
        var y_scale = d3.scaleLinear()
            .rangeRound([height, 0]);
        return y_scale;
    };

    Chart.prototype.tooltip = function (ele) {
        var tooltip = d3.select(ele)
            .append("div")
            .attr("class", "chart-tooltip")
            .style("display", "none")
            .text("Tooltip will appear here");
        return tooltip;
    };

    Chart.prototype.displayChartTitle = function (canvas, config, title) {
        canvas.append("g").append("text")
            .attr("x", (config.width / 2))
            .attr("y", -(config.margin.top / 2))
            .attr("text-anchor", "middle")
            .attr("class", "chart-title")
            .text(title);
    };

    Chart.prototype.displayXAxisTitle = function (canvas, config, title) {
        canvas.append("g").append("text")
            .attr("x", config.width / 2)
            .attr("y", (config.height + config.margin.bottom) - 5)
            .attr("class", "xAxisTitle")
            .style("text-anchor", "middle")
            .text(title);
    };

    Chart.prototype.displayYAxisTitle = function (canvas, config, title, unit, orientation) {
        var t = canvas.append("g").append("text")
            .attr("transform", "rotate(-90)");
        if (orientation && orientation == 'right') {
            t.attr("y", config.width + (config.margin.right / 2));
        } else {
            t.attr("y", 0 - config.margin.left)
        }
        if (unit && unit !== undefined) {
            t.attr("x", 0 - (config.height / 2))
                .attr("dy", "1em")
                .attr("class", "yAxisTitle")
                .style("text-anchor", "middle")
                .text(title + '(' + unit + ')');
        } else {
            t.attr("x", 0 - (config.height / 2))
                .attr("dy", "1em")
                .attr("class", "yAxisTitle")
                .style("text-anchor", "middle")
                .text(title);
        }

    };

    Chart.prototype.attachX = function (canvas, config, x_axis, x_scale, transformLabels) {
        var xaxis = canvas.append("g")
            .attr("transform", "translate(0," + config.height + ")")
            .attr("class", "axis");

        var x_domain = x_scale.domain();
        var domain_length = x_domain.length;

        x_axis.tickValues(x_domain.filter(function (d, i) {
            if (i == 0) {
                return !i;

            } else if (i == parseInt(domain_length / 2, 10) || i == domain_length - 1) {
                return i;
            }
        }));

        if (transformLabels === true) {
            xaxis.call(x_axis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("x", 6.5)
                .attr("y", 25)
                .attr("dx", "-.8em")
                .attr("dy", "-.55em")
                .attr("transform", "rotate(-45)");
        } else {
            xaxis.call(x_axis);
        }
    };

    Chart.prototype.attachY = function (canvas, config, y_axis, min, max, orientation) {
        var self = this;
        var ticks_number;
        if (orientation == 'right') {
            ticks_number = self.setYTicks(min, max, 'right');
            y_axis.tickValues(d3.ticks(min, max, ticks_number)).tickFormat(d3.format("d"));
            canvas.append("g").attr("class", "axis").attr("transform", "translate( " + config.width + ", 0 )").call(y_axis);
        } else {
            ticks_number = self.setYTicks(min, max);
            y_axis.ticks(ticks_number).tickFormat(function (d, i, n) {
                if(n[i+1]){
                    if (Number.isInteger(d)) {
                        return d;
                    }
                    else if(i == 0){
                            return parseInt(d, 10);
                    }
                }
                else{
                    if (Number.isInteger(d)) {
                        return d;
                    }
                    else{
                        return parseInt(d, 10);
                    }
                }
            });
            canvas.append("g").attr("class", "axis").call(y_axis);
        }
    };

    Chart.prototype.setYTicks = function (min, max, orientation) {
        var ticks_number = 5;
        
        if (min >= 0 && max < 10) {
            ticks_number = max;
        }

        if((max - min) < 2){
            ticks_number = 2;
        }

        if (orientation == 'right') {
            if (max >= 10) {
                ticks_number = 10;
            }
        }
        return ticks_number;
    };

    Chart.prototype.showValues = function (canvas, dataset, x_scale, y_scale) {
        canvas.append("g").selectAll("text")
            .data(dataset)
            .enter()
            .append("text")
            .text(function (d) {
                return d.value;
            })
            .attr("x", function (d, i) {
                return x_scale(d.label) + x_scale.bandwidth() / 2;
            })
            .attr("y", function (d) {
                return y_scale(d.value);
            })
            .attr("text-anchor", "middle");
    };

    Chart.prototype.showGridLines = function (canvas, config, y_scale) {
        var ticks_data = y_scale.ticks();
        ticks_data.shift();
        canvas.append("g").selectAll("line.horizontalGrid").data(ticks_data).enter()
            .append("line")
            .attr("class", "horizontalGrid")
            .attr("x1", 0)
            .attr("x2", config.width)
            .attr("y1", function (d) {
                return y_scale(d);
            })
            .attr("y2", function (d) {
                return y_scale(d);
            })
            .attr("fill", "none")
            .attr("shape-rendering", "crispEdges")
            .attr("stroke", "#ededed")
            .attr("stroke-width", "1px");
    };

    Chart.prototype.getDateRange = function (from, to) {
        var dateRange = d3.timeDays(from, to);
        // This is a hack to include from and to dates as the
        // d3.timeDays function doesn't always generate range inclusive of start and end.
        if (dateRange[0] !== from) {
            dateRange.unshift(from);
        }

        var date_range_size = dateRange.length;
        if (dateRange[date_range_size - 1] !== to) {
            dateRange.push(to);
        }

        return dateRange;

    };

    Chart.prototype.getDateFormat = function (dateFormat) {
        dateFormat = dateFormat ? dateFormat : "%m/%d/%Y";
        var dt_format = d3.timeFormat(dateFormat);
        return dt_format;
    };

    Chart.prototype.extractDateIndices = function (dt_string) {
        var self = this;
        var input_format = dt_string.split(/\/|-/);
        var year;
        var month;
        var day;
        $.each(input_format, function (i, x) {
            if (x === 'mm' || x === 'MM') {
                month = i;
            } else if (x === 'yy' || x === 'YY' || x === 'YYYY') {
                year = i;
            } else if (x === 'dd' || x === 'DD') {
                day = i;
            }
        });
        return {
            mth: month,
            yr: year,
            dt: day
        };
    };

    Chart.prototype.convertDateFormat = function (data, from_format, to_format) {
        var self = this;
        if (from_format === undefined || to_format === undefined) {
            return false;
        }
        var dt_format = self.getDateFormat(to_format);
        var indices = self.extractDateIndices(from_format);

        var new_data = [];

        data.map(function (d) {
            var dt = d.label.split(/\/|-/);
            var new_dt = new Date(dt[indices.yr], dt[indices.mth] - 1, dt[indices.dt]);
            var label = dt_format(new_dt);
            var value = d.value;
            var UOM = d.UOM;
            if (d.UOM) {
                new_data.push({
                    label: label,
                    value: value,
                    UOM: UOM
                })
            } else {
                new_data.push({
                    label: label,
                    value: value
                });
            }
        });
        return new_data;
    };

    Chart.prototype.getMinMax = function (data) {

        var temp = data.filter(function (d) {
            return (d.value != null)
        });

        var min = 0;
        var max = 0;

        if (temp.length > 0) {
            min = d3.min(temp, function (d) {
                return Number(d.value);
            });
            max = d3.max(temp, function (d) {
                return Number(d.value);
            });

            if (min === max) {
                if (min > 0) {
                    min = Number(max) / 1.01;
                    max = Number(max);
                } else if (min < 0) {
                    min = Number(max);
                    max = Number(max) * 1.01;
                } else if (min === 0) {
                    max = Number(max) + 1;
                }
            }
            else if((max - min) > 2) {
                min = min / 1.01;
                max = max * 1.01;
            }
        }
        return [min, max];
    };

    Chart.prototype.getSecYMinMax = function (data) {
        var self = this;
        var merged_data = [];
        $.each(data, function (id, val) {
            if (val.parentYAxis && val.parentYAxis == 'S') {
                $.merge(merged_data, val.data);
            }
        });
        var extent = self.getMinMax(merged_data);
        return extent;
    };

    Chart.prototype.formatNumber = function (value, currency) {
        var self = this;
        var format = d3.format(",.2f");
        if (currency !== undefined) {
            var locale = $(document).triggerHandler('get_currency_locale', {
                code: currency
            });
            if (locale !== undefined) {
                d3.formatDefaultLocale(locale);
            }
            format = d3.format("$,.2f");
            return format(value);
        } else {
            return format(value);
        }
    };

    return new Chart();
});