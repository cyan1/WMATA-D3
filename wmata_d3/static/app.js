var wmata = (function () {
    const RADIUS = 6,
        SVG_OFFSET = 10,
        RECT_PADDING_X = 10,
        RECT_PADDING_Y = 8,
        LINE_HEIGHT = 18,
        BOARDING = 'BRD',
        ARRIVING = 'ARR',
        WHITE = '#fff',
        LIGHT_GRAY = '#ccc',
        GRAY = '#888',
        DARK_GRAY = '#444',
        BLACK = '#000';

    var attrId = function (prefix, x, y) {
        return prefix + Math.round(x) + "-" + Math.round(y);
    },

    minToHex = function (min) {
        // bin wait times to grayscale color
        if (min < 5) {
            return DARK_GRAY;
        } else if (min < 10) {
            return GRAY;
        } else if (min < 15) {
            return LIGHT_GRAY;
        } else {
            return WHITE;
        }
    },

    init = function (stations) {
        var lineColorMap = {};
        var projection = d3.geo.mercator();
        var svg = d3.select('#map').append('svg');

        var center = d3.geom.polygon([
            [stations.xMin.long, stations.xMin.lat],
            [stations.yMax.long, stations.yMax.lat],
            [stations.xMax.long, stations.xMax.lat],
            [stations.yMin.long, stations.yMin.lat],
            [stations.xMin.long, stations.xMin.lat]
        ]).centroid();

        projection.scale(100000).center(center);

        var xMin = projection([stations.xMin.long, stations.yMin.lat])[0],
            yMin = projection([stations.xMin.long, stations.yMin.lat])[1],
            xMax = projection([stations.xMax.long, stations.yMax.lat])[0],
            yMax = projection([stations.xMax.long, stations.yMax.lat])[1];

        var xScale = d3.scale.linear()
            .domain([xMin, xMax])
            .range([0, xMax - xMin]);

        var yScale = d3.scale.linear()
            .domain([yMin, yMax])
            .range([0, yMax - yMin]);

        var xCoord = function (long, lat) {
            return xScale(projection([long, lat])[0]);
        };

        var yCoord = function (long, lat) {
            return yScale(projection([long, lat])[1]);
        };

        var mouseOver = function (data) {
            var circle = d3.select(this);

            var groupId = attrId('g', circle.attr('cx'), circle.attr('cy')),
                textId = attrId('t', circle.attr('cx'), circle.attr('cy'));

            var group = svg.append('g')
                .attr('id', function () { return groupId; });

            var innerGroup = svg.append('g');

            var text = svg.append('text')
                .attr('id', function () { return textId; })
                .attr('x', function () { return Number(circle.attr('cx')) + SVG_OFFSET * 2; })
                .attr('y', function () { return Number(circle.attr('cy')) + SVG_OFFSET; });

            text.append('tspan')
                .text(function () { return data.name; })
                .classed('station-name', true);

            innerGroup.append(function () { return text.node(); });

            data.predictions.forEach(function (c, i, a) {
                var prediction = svg.append('g')
                    .attr('transform', function () {
                        return 'translate(' + text.attr('x') + ',' +
                            (Number(text.attr('y')) + (i + 1) * LINE_HEIGHT) + ')';
                    });

                prediction.append('circle')
                    .attr('r', RADIUS)
                    .attr('fill', function () { return lineColorMap[c.Line]; });

                prediction.append('text')
                    .attr('dx', '1em')
                    .attr('dy', '.4em')
                    .text(function () {
                        var str = c.DestinationName + ", " + c.Min;

                        if (!(c.Min == BOARDING || c.Min == ARRIVING)) {
                            str += ' min.';
                        }

                        return str;
                    });

                innerGroup.append(function () { return prediction.node(); });
            });

            var bbox = innerGroup.node().getBBox();

            // keep predictions text within svg bounds
            if (bbox.x + bbox.width > svg.attr('width') ||
                bbox.y + bbox.height > svg.attr('height'))
            {
                innerGroup.select('text')
                    .attr('x', bbox.x - bbox.width - SVG_OFFSET * 2)
                    .attr('y', bbox.y - bbox.height);

                innerGroup.selectAll('g').each(function (d, i) {
                    d3.select(this).attr('transform', function () {
                        return 'translate(' + text.attr('x') + "," +
                            (Number(text.attr('y')) + (i + 1) * LINE_HEIGHT) + ')';
                    });
                });

                bbox = innerGroup.node().getBBox();
            }

            group.append('rect')
                .attr('width', function () { return bbox.width + RECT_PADDING_X; })
                .attr('height', function () { return bbox.height + RECT_PADDING_Y; })
                .attr('x', function () { return bbox.x - RECT_PADDING_X / 2; })
                .attr('y', function () { return bbox.y - RECT_PADDING_Y / 2; })
                .attr('fill', function () { return WHITE; })
                .attr('fill-opacity', .9);

            group.append(function () { return innerGroup.node(); });
        };

        var mouseOut = function () {
            var circle = d3.select(this);
            var id = attrId('#g', circle.attr('cx'), circle.attr('cy'));
            d3.select(id).remove();
        };

        var setUp = function (stationMap, svgStations) {
            svgStations.attr('cx', function (d) { return xCoord(d.long, d.lat) + SVG_OFFSET; })
                .attr('cy', function (d) { return yCoord(d.long, d.lat) + SVG_OFFSET; })
                .attr('r', RADIUS)
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut);

            svg.attr('width', xMax - xMin + SVG_OFFSET * 2)
                .attr('height', yMax - yMin + SVG_OFFSET * 2);

            d3.select('#map-text').style('display', null);
        };

        var updateFill = function (svgStations) {
            svgStations.attr('fill', function (d) { return d.fill; });
        };

        var getPredictions = function (stationMap, svgStations, success, failure) {
            d3.json('/predictions', function (error, predictions) {
                if (error) failure(error);

                for (var loc in stationMap) {
                    stationMap[loc].fill = WHITE;
                    stationMap[loc].predictions = [];
                }

                var arrivalMap = {};
                for (var i in predictions.Trains) {
                    var p = predictions.Trains[i];

                    // add predictions for the next train per station platform
                    if (!(arrivalMap.hasOwnProperty(p.LocationCode + p.DestinationCode) ||
                        p.DestinationCode == null ||
                        p.Min == ""))
                    {
                        stationMap[p.LocationCode].predictions.push(p);
                        arrivalMap[p.LocationCode + p.DestinationCode] = true;

                        // set grayscale using next train arrival per station
                        if (stationMap[p.LocationCode].predictions.length == 1) {
                            if (p.Min == BOARDING || p.Min == ARRIVING) {
                                stationMap[p.LocationCode].fill = BLACK;
                            } else {
                                stationMap[p.LocationCode].fill = minToHex(p.Min);
                            }
                        }
                    }
                }

                success();
            });
        };

        var pollPredictions = function (stationMap, svgStations) {
            new Promise(function (resolve, reject) {
                getPredictions(stationMap, svgStations, resolve, reject);
            }).then(function () {
                updateFill(svgStations);

                setTimeout(function () {
                    pollPredictions(stationMap, svgStations);
                }, 5000);
            }).catch(function (error) {
                console.log(error);
            });
        };

        d3.json('/paths', function (error, data) {
            var stationMap = {};
            var i = 0;

            while (i < stations.results.length) {
                var s = stations.results[i];

                // filter duplicate transfer stations and shallow copy stations into map
                if (stationMap.hasOwnProperty(s.stationTogether1)) {
                    stations.results.splice(i, 1);
                    stationMap[s.code] = stationMap[s.stationTogether1];
                } else {
                    stationMap[s.code] = s;
                    i++;
                }
            }

            var line = d3.svg.line()
                .x(function (d) {
                    return xCoord(stationMap[d.StationCode].long, stationMap[d.StationCode].lat) + SVG_OFFSET;
                })
                .y(function (d) {
                    return yCoord(stationMap[d.StationCode].long, stationMap[d.StationCode].lat) + SVG_OFFSET;
                });

            data.paths.forEach(function (c, i, a) {
                svg.append('path')
                    .attr('id', c.LineCode)
                    .attr('d', line(c.Path))
                    .attr('stroke', c.DisplayName);

                // use end station as basis for line label
                var stationCode = c.Path[0].StationCode;

                var group = svg.append('g')
                    .classed('line-code', true);

                var text = svg.append('text')
                    .attr('x', function () {
                        return c.ClientXScalar * SVG_OFFSET +
                            xCoord(stationMap[stationCode].long, stationMap[stationCode].lat);
                    })
                    .attr('y', function () {
                        return c.ClientYScalar * SVG_OFFSET +
                            yCoord(stationMap[stationCode].long, stationMap[stationCode].lat);
                    })
                    .attr('font-size', '10pt')
                    .attr('fill', function () { return c.LabelTextColor; })
                    .text(function () { return c.LineCode; });

                var bbox = text.node().getBBox();

                group.append('circle')
                    .attr('cx', function () { return bbox.x + bbox.width / 2; })
                    .attr('cy', function () { return bbox.y + bbox.height / 2; })
                    .attr('r', bbox.width * 3 / 4)
                    .attr('fill', function () { return c.DisplayName; });

                group.on('mouseover', function () {
                    d3.selectAll('path').classed('light-stroke', function () {
                        return d3.select(this).attr('id') != c.LineCode;
                    });
                })
                .on('mouseout', function () {
                    d3.selectAll('path').classed('light-stroke', false);
                });

                group.append(function () { return text.node(); });

                lineColorMap[c.LineCode] = c.DisplayName;
            });

            var svgStations = svg.selectAll('circle')
                .data(stations.results, function (d) {
                    // filter line label circles from the station selection
                    if (d !== undefined) {
                        return d.code;
                    }
                })
                .enter().append('circle');

            // bind events and set svg dimensions
            setUp(stationMap, svgStations);

            // begin polling predictions
            pollPredictions(stationMap, svgStations);
        });
    };

    return {
        init: init
    };
})();