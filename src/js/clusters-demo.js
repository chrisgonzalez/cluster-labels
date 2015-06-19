/**************************************** DESCRIPTION *********************************************


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

    var container, width, height;

    container = jbone('.container');

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
            label: randomString(5 + Math.round(Math.random() * 15))
        });
	}

    points = _.filter(points, function (d) {
        return d.x < width && d.x > 0 && d.y < height && d.y > 0;
    });

    return points;
}

function renderClusters (_clusters) {
    var container, width, height;

    container = jbone('.container');

    var clientRect = container[0].getBoundingClientRect();
    width = clientRect.width;
    height = clientRect.height;

    var actualClusters = _.filter(_clusters, function (cluster) {
        return cluster.points.length > 1;
    })

    var circles = d3.select('.container').selectAll('.circle').data(actualClusters);

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
            if (d.adjustedcircle) {
                d3.select('.container')
                    .append('div')
                    .attr('class', 'circle adjusted')
                    .style('top', function () {
                        return d.adjustedcircle.y - d.adjustedcircle.r + 'px';
                    })
                    .style('left', function () {
                        return d.adjustedcircle.x - d.adjustedcircle.r + 'px';
                    })
                    .style('border-radius', function () {
                        return d.adjustedcircle.r + 'px';
                    })
                    .style('width', function () {
                        return d.adjustedcircle.r * 2 + 'px'
                    })
                    .style('height', function () {
                        return d.adjustedcircle.r * 2 + 'px'
                    })
            }
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

domready(function () {
    var points = createPoints();

    renderClusters(defineClusters(points));
    renderPoints(points);
})
