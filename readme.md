# Cluster Labels

## Overview

This JavaScript plugin solves a visualization problem for labeling items in a 2-d space. Consider if you have a map with a bunch of points on it (places you've been, markers of any kind) and you want to label all points, but some of the points are bunched up so you can't really use a single layout rule.  

This plugin will help you!  

By analyzing an array of points (with .x and. y properties), it will divide your data into an array of clusters. For clusters of more than 2 points, it will calculate an enclosing circle and provide a label position for each point outside of the circle circumfrence. By passing a DOM container in, you also get boundary detection, making sure your labels will be placed within the bounds of the container.

## Usage

defineClusters(pointsArray, '.container');

returns an array of clusters- use as you'd like!

TO BE CONTINUED...
