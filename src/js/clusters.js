/**************************************** DESCRIPTION *********************************************

Each viz file covers 3 steps-

1. How should I parse, summarize, or distribute the data for this timeshifter range?

    - Here is the logic for each set of data across different time ranges. Conditionals
      trigger data changes and high-level labels to apply.

2. Ok, let me parse, rearrange, and label the data.

    - Manipulate data, summarize it, prioritize it and return a new array useful for
      the view

3. Let's render the data out via d3

    - d3 methods parse the recently finessed data and change HTML content and labels.


Beyond this- transitions, visual styles, and interaction logic are stored elsewhere in
CSS and in mbtm.init.js (for event bindings).

//**************************************** RENDER FUNCTIONS ***************************************/

function createPoints () {

    function randomGaussianPair() {
    	// Use rejection sampling to pick a point uniformly distributed in the unit circle
    	var x, y, magsqr;
    	do {
    		x = Math.random() * 2 - 1;
    		y = Math.random() * 2 - 1;
    		magsqr = x * x + y * y;
    	} while (magsqr >= 1 || magsqr == 0);
    	// Box-Muller transform
    	var temp = Math.sqrt(-2 * Math.log(magsqr) / magsqr);
    	return [x * temp, y * temp];
    }

    function randomString(length) {
        chars = 'isthi sreal yathingtha tyoucan sayyoud idbut idi dntdoi ttoo';
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    }

    var width = $('.container').width();
    var height = $('.container').height();

	var scale = Math.min(width, height);

    points = [];

    var len = Math.floor((1 - Math.sqrt(Math.random())) * 60) + 25;  // 2 to 20, preferring smaller numbers

    for (var i = 0; i < len; i++) {
		var r = randomGaussianPair();
		points.push({
			x: r[0] * scale * 0.4 + width  / 2,
			y: r[1] * scale * 0.4 + height / 2,
            label: randomString(5 + Math.round(Math.random() * 15))
        });
	}

    points = _.filter(points, function (d) {
        console.log(d.x < width && d.x > 0 && d.y < height && d.y > 0)
        return d.x < width && d.x > 0 && d.y < height && d.y > 0;
    });

    renderPoints(points);
    defineClusters(points);
}

function defineClusters (_points) {
    // Function to return the euclidian distance between each place
    function distance (d1, d2) {
        var total = 0;

        total += Math.pow(d2.x - d1.x, 2);
        total += Math.pow(d2.y - d1.y, 2);

        return Math.sqrt(total);
    }

    // Find high-level clusters, with a threshold fixed around 150px
    var clusters = clusterfck.hcluster(JSON.parse(JSON.stringify(_points)), distance, null, 150);

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
    clusters = _.map(clusters, function (cluster) {
        var newCluster = {
            points: flattenCluster(cluster)
        };

        if (newCluster.points.length > 1) {
            newCluster.circle = findSmallestCircle(newCluster.points);

            newCluster.points = _.map(newCluster.points, function (d) {
                d.cx = newCluster.circle.x;
                d.cy = newCluster.circle.y;
                d.cr = newCluster.circle.r;
            })

            // if ($('.container').width() - newCluster.circle.x < newCluster.circle.r * 2) {
            //     console.log("right collision!");
            //     newCluster.circle.x = $('.container').width();
            //     newCluster.circle.r = newCluster.circle.r + ($('.container').width() - (newCluster.circle.x - newCluster.circle.r));
            // }
            //
            // if (newCluster.circle.x < newCluster.circle.r * 2) {
            //     console.log("left collision!");
            //     newCluster.circle.x = 0;
            //     newCluster.circle.r = newCluster.circle.r + (newCluster.circle.x + newCluster.circle.r);
            // }
            //
            // if (newCluster.circle.y < newCluster.circle.r * 2) {
            //     console.log("top collision!");
            // }
            //
            // if ($('.container').height() - newCluster.circle.y < newCluster.circle.r * 2) {
            //     console.log("bottom collision!");
            // }
        }

        return newCluster;
    });

    renderClusters(clusters);

}

function renderClusters (_clusters) {
    var width = $(".container").width();
    var height = $('.container').height();

    var actualClusters = _.filter(_clusters, function (cluster) {
        return cluster.points.length > 2;
    })

    var circles = d3.select('.container').selectAll('.circle').data(actualClusters);

    circles
        .style('top', function (d) {
            return d.circle.y - d.circle.r + 'px';
        })
        .style('left', function (d) {
            return d.circle.x - d.circle.r + 'px';
        })
        .style('border-radius', function (d) {
            return d.circle.r + 'px';
        })
        .style('width', function (d) {
            return d.circle.r * 2 + 'px'
        })
        .style('height', function (d) {
            return d.circle.r * 2 + 'px'
        });

    circles.enter()
        .append('div')
        .attr('class', 'circle')
        .style('top', function (d) {
            return d.circle.y - d.circle.r + 'px';
        })
        .style('left', function (d) {
            return d.circle.x - d.circle.r + 'px';
        })
        .style('border-radius', function (d) {
            return d.circle.r + 'px';
        })
        .style('width', function (d) {
            return d.circle.r * 2 + 'px'
        })
        .style('height', function (d) {
            return d.circle.r * 2 + 'px'
        })
        .style('opacity', 0)
        .transition()
        .delay(300)
        .duration(1200)
        .style('opacity', 1);

    circles.exit()
        .remove();
}


function renderPoints (_points) {

    var points = d3.select(".container").selectAll("div.place").data(_points);

    //random store for a depth while messing around
    var depth = 0;


    points
        .style("transform", function(d) {
            return "translate3d( "+d.x + "px, " + d.y + "px, 0px)";
        })

    points
        .enter()
            .append("div")
            .attr("class", "point")
            .attr('data-label', function (d) {
                return d.label
            })
            .style("transform", function (d) {
                return "translate3d( "+d.x + "px, " + d.y + "px, 0px)";
            })
            .style('opacity', 0)
            .transition()
            .duration(700)
            .style('opacity', 1);

    points
        .exit()
            .remove("div");

}

$(document).ready(function () {
    createPoints();
})
