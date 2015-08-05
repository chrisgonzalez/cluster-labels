/**************************************** DESCRIPTION *********************************************/

var clusters;

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
        chars = 'delicious tacos are for eating lettuce is rabbit goat salsa cheese street Kyle';
        chars = chars.split(' ');
        var result = '';
        for (var i = length; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
            if (i > 1) {
                result += ' ';
            }
        }
        return result;
    }

    var container, width, height;

    container = jbone('.viz');

    var clientRect = container[0].getBoundingClientRect();
    width = clientRect.width;
    height = clientRect.height;

	var scale = Math.min(width, height);

    points = [];

    var multiplier = Math.round(30 * width / 350);

    var len = Math.floor((1 - Math.sqrt(Math.random())) * multiplier) + 15;  // 2 to 20, preferring smaller numbers

    for (var i = 0; i < len; i++) {
		var r = randomGaussianPair();
		points.push({
			x: r[0] * scale * 0.4 + width  / 2,
			y: r[1] * scale * 0.4 + height / 2,
            labelText: randomString(1 + Math.round(Math.random() * 3))
        });
	}

    points = _.filter(points, function (d) {
        return d.x < width && d.x > 0 && d.y < height && d.y > 0;
    });

    return points;
}

function renderClusters (_clusters) {
    var container, width, height;

    container = jbone('.viz');

    var clientRect = container[0].getBoundingClientRect();
    width = clientRect.width;
    height = clientRect.height;

    var actualClusters = _.filter(_clusters, function (cluster) {
        return cluster.points.length > 1;
    })

    var circles = d3.select('.viz').selectAll('.circle').data(actualClusters);

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
        .each(function (d) {
            if (d.adjusted) {
                d3.select('.viz')
                    .append('div')
                    .attr('class', 'circle adjusted')
                    .style('top', function () {
                        return d.adjusted.circle.y - d.adjusted.circle.r + 'px';
                    })
                    .style('left', function () {
                        return d.adjusted.circle.x - d.adjusted.circle.r + 'px';
                    })
                    .style('border-radius', function () {
                        return d.adjusted.circle.r + 'px';
                    })
                    .style('width', function () {
                        return d.adjusted.circle.r * 2 + 'px'
                    })
                    .style('height', function () {
                        return d.adjusted.circle.r * 2 + 'px'
                    })
                    .style('opacity', 0)
                    .transition()
                    .delay(1000)
                    .duration(1200)
                    .style('opacity', 1);
            }



        })
        .style('opacity', 0)
        .transition()
        .delay(300)
        .duration(1200)
        .style('opacity', 1);

    circles.exit()
        .remove();

    d3.select('.viz').append('svg');

    var clusters = d3.select('.viz svg').selectAll('.cluster').data(_clusters);

    clusters.enter()
        .append('g')
        .attr('class', 'cluster')
        .each(function (d, i) {
            var points = d3.select(this).selectAll('.point').data(d.points);

            points.enter()
                .append('circle')
                .attr('r', 2)
                .attr('cx', function (d) {
                    return d.x;
                })
                .attr('cy', function (d) {
                    return d.y;
                })

            var lines = d3.select(this).selectAll('.label').data(d.points);

            lines.enter()
                .append('line')
                .attr('x1', function (d) {
                    return d.x;
                })
                .attr('x2',  function (d, i) {
                    return d.label.x;
                })
                .attr('y1',  function (d, i) {
                    return d.y;
                })
                .attr('y2',  function (d, i) {
                    return d.label.y;
                })

            var labels = d3.select(this).selectAll('.label').data(d.points);

            labels.enter()
                .append('text')
                .attr('x', function (d) {
                    return d.label.x;
                })
                .attr('y', function (d) {
                    return d.label.y;
                })
                .attr('text-anchor',  function (d, i) {
                    if (d.label.position === "top" || d.label.position === "bottom") {
                        return "middle";
                    } else if (d.label.position === "left") {
                        return "end";
                    } else {
                        return "start";
                    }
                })
                .attr('transform', function (d) {
                    if (d.label.position === 'bottom') {
                        return 'translate(0, 10)';
                    } else if (d.label.position === 'left') {
                        return 'translate(-5, 2)';
                    } else if (d.label.position === 'right') {
                        return 'translate(5, 2)';
                    } else {
                        return 'translate(0, -5)';
                    }
                })
                .text(function (d) {
                    return d.labelText;
                })
        });
}

domready(function () {
    var points = createPoints();
    clusters = defineClusters(points, '.viz')

    renderClusters(clusters);
    // renderPoints(points);
})
