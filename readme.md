# Cluster Labels

## Overview

This JavaScript plugin solves a visualization problem for labeling items in a 2-d space. Consider if you have a map with a bunch of points on it (places you've been, markers of any kind) and you want to label all points, but some of the points are bunched up so you can't really use a single layout rule.  

This plugin will help you!  

By analyzing an array of points (with .x and. y properties), it will divide your data into an array of clusters. For clusters of more than 2 points, it will calculate an enclosing circle and provide a label position for each point outside of the circle circumfrence. By passing a DOM container in, you also get boundary detection, making sure your labels will be placed within the bounds of the container.

[Check out the demo!](http://chrisgonzalez.github.io/cluster-labels/)

# Usage

```
defineClusters(points, container, threshold)
```

## [points]
### an array of objects, each containing an x and y property:

	{x: 200, y: 110} for example
    you can include any other data that is useful to you within these objects
    the keyword "label" is reserved though, and will be overwritten

## "container"
### a CSS selector string for your containing element

## threshold
### an integer for the maximum size of the clusters you'd like to identify

	totally optional, defaults to 150 at largest sizes


# Returns

```
[
	{
		"circle": {
			"x": 598.5650989744661,
			"y": 419.88695677402393,
			"r": 36.342391361840335
		},
		"points": [
			{
				"x": 631.4068271939661,
				"y": 404.32449239804345,
				"label": {
					"position": "right",
					"angle": 5.840665454418236,
					"x": 640.4435820658495,
					"y": 400.04231288458385
				}
			}
			...
		]
	}
}

```

Where each item returned in the array represents a cluster.

"circle" is the circle of smallest fit around all the points in the cluster.

Each point contains the x and y values supplied, and a "label" object containing the position the
label should be placed (top, right, bottom, or left) based on the point's position within the circle
and a suggested x and y position for the label.

Additionally he angle in radians is supplied in case you need to accomplish some circle math. Keep
in mind that in JavaScript, 0/2*Pi radians is the 3 o'clock position on the circle (instead of 12).

### Edge collisions

In the case of a circle being too close to an edge or corner of the containing element, the cluster
will also contain an "adjusted" property that contains a larger circle area. The point.label properties
represent the x and y from the center of this adjusted circle.

### Clusters of 1

Clusters of 1 (ie not a cluster) are returned, but will not contain a circle or an adjusted property.
The "points" within this object will be an array of 1.
