var buildify = require('buildify'),
scripts = [],
styles = [];

// extract all comments: /<!--[\s\S]*?-->/g
// match anything between two (word)[\s\S]*(word)

buildify('src')
.load('index.html')
.perform(function(content) {
    var i, j, outputFileName,
    comments = content.match(/<!--[\s\S]*?-->/g);

    // for each matching set of comments w/ filename
    for (i = 0; i < comments.length; i+=2) {

        while (comments[i].indexOf('scripts') < 0 && comments[i].indexOf('styles') < 0) {
            i++;
        }

        var opening = comments[i],
        closing = comments[i+1];

        var regex = new RegExp('(' + opening + ')[\\s\\S]*' + '(' + closing + ')', 'gi');

        var enclosed = content.match(regex)[0];

        if (enclosed.indexOf('scripts') > -1) {
            console.log('Found a script block!');

            outputFileName = opening.replace('<!-- scripts', '').replace('-->', '').trim();

            var scriptSrc = enclosed.match(/src=\"[\s\S]*?\"/gi);

            var scriptFiles = [];

            for (j = 0; j < scriptSrc.length; j++) {
                var src = scriptSrc[j].replace('src="', '').replace('"', '');
                scriptFiles.push(src);
            }

            scripts.push({
                filename: outputFileName,
                files: scriptFiles
            });

            content = content.replace(regex, '<script src="' + outputFileName + '"></script>')

        } else if (enclosed.indexOf('styles') > -1) {
            console.log('Found a styles block!');

            outputFileName = opening.replace('<!-- styles', '').replace('-->', '').trim();

            var linkHref = enclosed.match(/href=\"[\s\S]*?\"/gi);

            var styleFiles = [];

            for (j = 0; j < linkHref.length; j++) {
                var href = linkHref[j].replace('href="', '').replace('"', '');
                styleFiles.push(href);
            }

            styles.push({
                filename: outputFileName,
                files: styleFiles
            });

            content = content.replace(regex, '<link type="text/css" rel="stylesheet" href="' + outputFileName + '" />');
        }
    }

    return content;
});
// .changeDir('../')
// .save('index.html');


for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].filename.charAt(0) === '/' ) {
        scripts[i].filename = scripts[i].filename.substring(1);
    }

    if (scripts[i].files.length > 1) {
        buildify('src')
        .load(scripts[i].files[0])
        .concat(scripts[i].files.slice(1))
        .uglify()
        .changeDir('../')
        .save('/' + scripts[i].filename);
    } else {
        buildify('src')
        .load(scripts[i].files[0])
        .uglify()
        .changeDir('../')
        .save('/' + scripts[i].filename);
    }
}

for (var j = 0; j < styles.length; j++) {
    if (styles[j].filename.charAt(0) === '/' ) {
        styles[j].filename = styles[j].filename.substring(1);
    }

    if (styles[j].files.length > 1) {
        buildify('src')
        .load(styles[j].files[0])
        .concat(styles[j].files.slice(1))
        .cssmin()
        .changeDir('../')
        .save('/' + styles[j].filename);
    } else {
        buildify('src')
        .load(styles[j].files[0])
        .cssmin()
        .changeDir('../')
        .save('/' + styles[j].filename);
    }
}
