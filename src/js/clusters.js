/**************************************** CLUSTERS *********************************************/

function defineClusters (_points, _container, _threshold) {

    var container = jbone('.container');

    if (container.length === 0) {
        console.error("CLUSTERS ERROR- DOM Selector for your containment did not work! Try again.");
        return;
    }

    var clientRect = container[0].getBoundingClientRect();
    var width = clientRect.width;
    var height = clientRect.height;

    // Function to return the euclidian distance between each place

    function distance (d1, d2) {
        var total = 0;

        total += Math.pow(d2.x - d1.x, 2);
        total += Math.pow(d2.y - d1.y, 2);

        return Math.sqrt(total);
    }

    // Compute distance threshold based on screen size, with a max threshold of 110px unless specified

    var threshold = _threshold ? _threshold : Math.min(width / 4, 110);

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

            //  collisions:  [top, right, bottom, left]
            var collisions = [0, 0, 0, 0];

            if (width - cluster.circle.x < cluster.circle.r * 2) {
                collisions[1] = 1;
            }

            if (cluster.circle.x < cluster.circle.r * 2) {
                collisions[3] = 1;
            }

            if (cluster.circle.y < cluster.circle.r * 2) {
                collisions[0] = 1;
            }

            if (height - cluster.circle.y < cluster.circle.r * 2) {
                collisions[2] = 1;
            }

            collisions = collisions.join(' ');

            if (collisions.indexOf('1') > -1) {
                cluster.adjustedcircle = {};
            }

            switch (collisions) {
                case '1 0 0 0':
                    console.log("top collision!");
                    cluster.adjustedcircle.r = cluster.circle.y + cluster.circle.r;
                    cluster.adjustedcircle.x = cluster.circle.x;
                    cluster.adjustedcircle.y = 0;
                    break;
                case '0 1 0 0':
                    console.log("right collision!");
                    cluster.adjustedcircle.r = width - (cluster.circle.x - cluster.circle.r);
                    cluster.adjustedcircle.x = width;
                    cluster.adjustedcircle.y = cluster.circle.y;
                    break;
                case '0 0 1 0':
                    console.log("bottom collision!");
                    cluster.adjustedcircle.r = height - (cluster.circle.y - cluster.circle.r);
                    cluster.adjustedcircle.x = cluster.circle.x;
                    cluster.adjustedcircle.y = height;
                    break;
                case '0 0 0 1':
                    console.log("left collision!");
                    cluster.adjustedcircle.r = cluster.circle.x + cluster.circle.r;
                    cluster.adjustedcircle.x = 0;
                    cluster.adjustedcircle.y = cluster.circle.y;
                    break;
                case '1 1 0 0':
                    console.log("top right collision!");
                    var corner = {};
                    corner.x = cluster.circle.x + cluster.circle.r * Math.cos(3 * Math.PI / 4);
                    corner.y = cluster.circle.y + cluster.circle.r * Math.sin(3 * Math.PI / 4);
                    cluster.adjustedcircle.x = width;
                    cluster.adjustedcircle.y = 0;
                    cluster.adjustedcircle.r = Math.round(distance({x: cluster.adjustedcircle.x, y: cluster.adjustedcircle.y}, corner));
                    console.log("Distance: ", distance({x: cluster.adjustedcircle.x, y: cluster.adjustedcircle.y}, corner), "Points: ", corner, cluster.adjustedcircle);
                    break;
                case '1 0 0 1':
                    console.log("top left collision!");
                    var corner = {};
                    corner.x = cluster.circle.x + cluster.circle.r * Math.cos(Math.PI / 4);
                    corner.y = cluster.circle.y + cluster.circle.r * Math.sin(Math.PI / 4);
                    cluster.adjustedcircle.x = 0;
                    cluster.adjustedcircle.y = 0;
                    cluster.adjustedcircle.r = Math.round(distance({x: cluster.adjustedcircle.x, y: cluster.adjustedcircle.y}, corner));
                    console.log("Distance: ", distance({x: cluster.adjustedcircle.x, y: cluster.adjustedcircle.y}, corner), "Points: ", corner, cluster.adjustedcircle);
                    break;
                case '0 1 1 0':
                    console.log("bottom right collision!");
                    var corner = {};
                    corner.x = cluster.circle.x + cluster.circle.r * Math.cos(5 * Math.PI / 4);
                    corner.y = cluster.circle.y + cluster.circle.r * Math.sin(5 * Math.PI / 4);
                    cluster.adjustedcircle.x = width;
                    cluster.adjustedcircle.y = height;
                    cluster.adjustedcircle.r = Math.round(distance({x: cluster.adjustedcircle.x, y: cluster.adjustedcircle.y}, corner));
                    console.log("Distance: ", distance({x: cluster.adjustedcircle.x, y: cluster.adjustedcircle.y}, corner), "Points: ", corner, cluster.adjustedcircle);
                    break;
                case '0 0 1 1':
                    console.log("bottom left collision!");
                    var corner = {};
                    corner.x = cluster.circle.x + cluster.circle.r * Math.cos(7 * Math.PI / 4);
                    corner.y = cluster.circle.y + cluster.circle.r * Math.sin(7 * Math.PI / 4);
                    cluster.adjustedcircle.x = 0;
                    cluster.adjustedcircle.y = height;
                    cluster.adjustedcircle.r = Math.round(distance({x: cluster.adjustedcircle.x, y: cluster.adjustedcircle.y}, corner));
                    console.log("Distance: ", distance({x: cluster.adjustedcircle.x, y: cluster.adjustedcircle.y}, corner), "Points: ", corner, cluster.adjustedcircle);
                    break;
            }

        } else {

        }

        return cluster;
    });

    return clusters;

}
