/**************************************** CLUSTERS *********************************************/

function defineClusters (_points, _container, _threshold,  _boost, _variance) {

    var container = _container ? jbone(_container) : jbone('body');

    if (container.length === 0) {
        console.error("CLUSTERS ERROR- DOM Selector for your containment did not work! Try again.");
        return;
    }

    var clientRect = container[0].getBoundingClientRect();
    var width = clientRect.width;
    var height = clientRect.height;

    _boost = _boost ? _boost : 20;

    // Function to return the euclidian distance between each point

    function distance (d1, d2) {
        var total = 0;

        total += Math.pow(d2.x - d1.x, 2);
        total += Math.pow(d2.y - d1.y, 2);

        return Math.sqrt(total);
    }

    // Compute distance threshold based on screen size, with a max threshold of 110px unless specified

    var threshold = _threshold ? _threshold : Math.min(width / 3, 110);

    // Find high-level clusters, with a threshold fixed around 150px

    var clusters = clusterfck.hcluster(JSON.parse(JSON.stringify(_points)), distance, "complete", threshold);

    // Recursively pull out the values from each nested cluster object

    function flattenCluster (data) {
        var values = [];

        function recurse (cur, prop) {
            if (Object(cur) !== cur) {
                result[prop] = cur;
            } else {
                var isEmpty = true;

                for (var p in cur) {
                    isEmpty = false;
                    if (p === 'left' || p === 'right') {
                        recurse(cur[p], "");
                    } else if (p === 'value') {
                        values.push(cur[p]);
                    }
                }

                if (isEmpty && prop) {
                    result[prop] = {};
                }
            }
        }
        recurse(data, "");

        return values;
    }

    // Map clusters to an object with a flat array of places and the smallest enclosing circle

    clusters = clusters.map(function (_cluster) {
        var cluster = {
            points: flattenCluster(_cluster)
        };

        if (cluster.points.length > 1) {
            cluster.circle = findSmallestCircle(cluster.points);

            //  Detect collisions with edge of container
            //  collisions:  [top, right, bottom, left]
            var collisions = [0, 0, 0, 0];

            if (width - cluster.circle.x < (cluster.circle.r + _boost) * 2.5) {
                collisions[1] = 1;
            }

            if (cluster.circle.x < (cluster.circle.r + _boost) * 2.5) {
                collisions[3] = 1;
            }

            if (cluster.circle.y < (cluster.circle.r + _boost) * 2.5) {
                collisions[0] = 1;
            }

            if (height - cluster.circle.y < (cluster.circle.r + _boost) * 2.5) {
                collisions[2] = 1;
            }

            collisions = collisions.join(' ');

            // If there are collisions, calculate adjusted circle
            if (collisions.indexOf('1') > -1) {
                cluster.adjusted = {};
                cluster.adjusted.circle = {};
            }

            switch (collisions) {
                case '1 0 0 0':
                    console.log("top collision!");
                    cluster.adjusted.circle.r = cluster.circle.y + cluster.circle.r;
                    cluster.adjusted.circle.x = cluster.circle.x;
                    cluster.adjusted.circle.y = 0;
                    break;
                case '0 1 0 0':
                    console.log("right collision!");
                    cluster.adjusted.circle.r = width - (cluster.circle.x - cluster.circle.r);
                    cluster.adjusted.circle.x = width;
                    cluster.adjusted.circle.y = cluster.circle.y;
                    break;
                case '0 0 1 0':
                    console.log("bottom collision!");
                    cluster.adjusted.circle.r = height - (cluster.circle.y - cluster.circle.r);
                    cluster.adjusted.circle.x = cluster.circle.x;
                    cluster.adjusted.circle.y = height;
                    break;
                case '0 0 0 1':
                    console.log("left collision!");
                    cluster.adjusted.circle.r = cluster.circle.x + cluster.circle.r;
                    cluster.adjusted.circle.x = 0;
                    cluster.adjusted.circle.y = cluster.circle.y;
                    break;
                case '1 1 0 0':
                    console.log("top right collision!");
                    var corner = {};
                    corner.x = cluster.circle.x + cluster.circle.r * Math.cos(3 * Math.PI / 4);
                    corner.y = cluster.circle.y + cluster.circle.r * Math.sin(3 * Math.PI / 4);
                    cluster.adjusted.circle.x = width;
                    cluster.adjusted.circle.y = 0;
                    cluster.adjusted.circle.r = Math.round(distance({x: cluster.adjusted.circle.x, y: cluster.adjusted.circle.y}, corner));
                    break;
                case '1 0 0 1':
                    console.log("top left collision!");
                    var corner = {};
                    corner.x = cluster.circle.x + cluster.circle.r * Math.cos(Math.PI / 4);
                    corner.y = cluster.circle.y + cluster.circle.r * Math.sin(Math.PI / 4);
                    cluster.adjusted.circle.x = 0;
                    cluster.adjusted.circle.y = 0;
                    cluster.adjusted.circle.r = Math.round(distance({x: cluster.adjusted.circle.x, y: cluster.adjusted.circle.y}, corner));
                    break;
                case '0 1 1 0':
                    console.log("bottom right collision!");
                    var corner = {};
                    corner.x = cluster.circle.x + cluster.circle.r * Math.cos(5 * Math.PI / 4);
                    corner.y = cluster.circle.y + cluster.circle.r * Math.sin(5 * Math.PI / 4);
                    cluster.adjusted.circle.x = width;
                    cluster.adjusted.circle.y = height;
                    cluster.adjusted.circle.r = Math.round(distance({x: cluster.adjusted.circle.x, y: cluster.adjusted.circle.y}, corner));
                    break;
                case '0 0 1 1':
                    console.log("bottom left collision!");
                    var corner = {};
                    corner.x = cluster.circle.x + cluster.circle.r * Math.cos(7 * Math.PI / 4);
                    corner.y = cluster.circle.y + cluster.circle.r * Math.sin(7 * Math.PI / 4);
                    cluster.adjusted.circle.x = 0;
                    cluster.adjusted.circle.y = height;
                    cluster.adjusted.circle.r = Math.round(distance({x: cluster.adjusted.circle.x, y: cluster.adjusted.circle.y}, corner));
                    break;
            }

            function calculateLabelAngles (point, circle) {
                point.label = {};

                // calculate radian angle of point offset from center of circle
                var theta = Math.atan2(point.y - circle.y, point.x - circle.x);

                // if theta came back as a negative angle, make it positive
                if (theta < 0) { theta = 2 * Math.PI + theta; }

                point.label.angle = theta;

                return point;
            }


            function calculateLabelPosition (point, circle, useDefaultRadius) {
                if (point.label.angle <= 3 * Math.PI / 9 || point.label.angle >= 13 * Math.PI / 9) {
                    // place right
                    point.label.position = 'right';
                } else if (point.label.angle > 3 * Math.PI / 9 && point.label.angle < 6 * Math.PI / 9) {
                    // place below
                    point.label.position = 'bottom';
                } else if (point.label.angle >= 6 * Math.PI / 9 && point.label.angle < 12 * Math.PI / 9) {
                    // place left
                    point.label.position = 'left';
                } else if (point.label.angle >= 12 * Math.PI / 9 && point.label.angle < 13 * Math.PI / 9) {
                    // place top
                    point.label.position = 'top';
                }

                point.label.x = circle.x + (circle.r + _boost) * Math.cos(point.label.angle),
                point.label.y = circle.y + (circle.r + _boost) * Math.sin(point.label.angle)

                return point;
            }

            // if there are collisions, align all points based on the edge

            cluster.points = cluster.points.map(function (d) {
                if (cluster.adjusted) {
                    return calculateLabelAngles(d, cluster.adjusted.circle);
                } else {
                    return calculateLabelAngles(d, cluster.circle);
                }
            });

            function finessePoints (points) {
                variance = _variance ? _variance : Math.PI / 10;

                function onceAround() {
                    for (var i = 0; i < points.length; i++) {
                        if (points[i].label.angle && i < points.length - 1) {
                            if (points[i+1].label.angle - points[i].label.angle < variance) {
                                if (points[i - 1]) {
                                    points[i - 1].label.angle -= variance / 2 - (points[i+1].label.angle - points[i].label.angle);
                                    points[i + 1].label.angle += variance / 2 - (points[i+1].label.angle - points[i].label.angle);
                                } else {
                                    points[i + 1].label.angle += variance - (points[i+1].label.angle - points[i].label.angle);
                                }

                                console.log("finesse")
                            }
                        }
                    }
                }

                onceAround();
            }

            cluster.points.sort(function (a, b) {
                if (a.label.angle > b.label.angle) {
                    return 1;
                } else if (a.label.angle < b.label.angle) {
                    return -1;
                }
                return 0;
            });

            finessePoints(cluster.points);

            cluster.points = cluster.points.map(function (d) {
                if (cluster.adjusted) {
                    return calculateLabelPosition(d, cluster.adjusted.circle);
                } else {
                    return calculateLabelPosition(d, cluster.circle);
                }
            });

        } else {

            cluster.points = cluster.points.map(function (d) {
                var circle = {};
                circle.x = width - d.x < 150 ? d.x + 1 : d.x - 1;
                circle.y = d.y;
                circle.r = 1;
                return calculateLabelAngles(d, circle, true)
            });

            cluster.points = cluster.points.map(function (d) {
                var circle = {};
                circle.x = width - d.x < 150 ? d.x + 1 : d.x - 1;
                circle.y = d.y;
                circle.r = 1;
                return calculateLabelPosition(d, circle, true)
            })
        }

        return cluster;
    });

    return clusters;

}
