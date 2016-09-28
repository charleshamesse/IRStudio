var svgtopng = {
  version: "0.1"
};
var svgpng_document = this.document;
function svgpng_documentElement(node) {
  return node && (node.ownerDocument || node.document || node).documentElement;
}
function svgpng_window(node) {
  return node && (node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView);
}
svgtopng.test = function(a) {
  console.log('svgpng says hi! \n' + a);
  return 0;
};
svgtopng.applyCssInline = function(SVGid) {
  var svgElement = document.getElementById(SVGid);
  var doSomethingWith = function(canvas) {
    document.body.appendChild(canvas)
  };

  var parseStyles = function(svg) {
    var styleSheets = [],
    i;
    // get the stylesheets of the document (ownerDocument in case svg is in <iframe> or <object>)
    var docStyles = svg.ownerDocument.styleSheets;
    // transform the live StyleSheetList to an array to avoid endless loop
    for (i = 0; i < docStyles.length; i++) {
      styleSheets.push(docStyles[i]);
    }
    if (styleSheets.length) {
      // getDef() will return an svg <defs> element if already into the node, or will create it otherwise
      getDef(svg);
      svg.matches = svg.matches || svg.webkitMatchesSelector || svg.mozMatchesSelector || svg.msMatchesSelector || svg.oMatchesSelector;
    }

    // iterate through all document's stylesheets
    for (i = 0; i < styleSheets.length; i++) {
      // create a new style element
      var style = document.createElement('style');
      // some stylesheets can't be accessed and will throw a security error
      try {
        var rules = styleSheets[i].cssRules,
        l = rules.length;
        // iterate through each cssRules of this stylesheet
        for (var j = 0; j < l; j++) {
          // get the selector of this cssRules
          var selector = rules[j].selectorText;
          // is it our svg node or one of its children ?
          if ((svg.matches && svg.matches(selector)) || svg.querySelector(selector)) {
            // append it to our <style> node
            style.innerHTML += rules[j].cssText + '\n';
          }
        }
        // if we got some rules
        if (style.innerHTML) {
          // append the style node to the clone's defs
          defs.appendChild(style);
        }
      } catch (e) {
        console.warn('Unable to get some CSS rules :\n', e);
      }
    }
    // small hack to avoid border and margins being applied inside the <img>
    var s = svg.style;
    s.border = s.padding = s.margin = 0;
    s.transform = 'initial';
    exportDoc(svg);
  };

  var defs;
  var getDef = function(svg) {
    // Do we have a `<defs>` element already ?
    defs = svg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    if (!defs.parentNode) {
      svg.insertBefore(defs, svg.firstElementChild);
    }
  };

  var exportDoc = function(svg) {
    console.log(svg.offsetWidth);
    // check if our svgNode has width and height properties set to absolute values
    // otherwise, canvas won't be able to draw it
    var bbox = svg.getBoundingClientRect();

    if (svg.offsetWidth.unitType !== 1) svg.setAttribute('width', bbox.width);
    if (svg.offsetHeight.unitType !== 1) svg.setAttribute('height', bbox.height);

    // serialize our node
    var svgData = (new XMLSerializer()).serializeToString(svg);
    // remember to encode special chars
    var svgURL = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svgData);

    var svgImg = new Image();

    svgImg.onload = function() {
      var canvas = document.createElement('canvas');
      // IE11 doesn't set a width on svg images...
      canvas.width = this.width || bbox.width;
      canvas.height = this.height || bbox.height;

      canvas.getContext('2d').drawImage(svgImg, 0, 0, canvas.width, canvas.height);
      doSomethingWith(canvas)
    };

    svgImg.src = svgURL;
  };

  parseStyles(svgElement);

};
svgtopng.getSVGImg = function(SVGid) {
  // Export to PNG
  // Copyright Simg
  var svgElement  = document.getElementById(SVGid),
  svghtml     = '<svg id="my-svg" pointer-events="none" width="' + svgElement.offsetWidth + '" height="600" style="position: absolute; margin: 0px; padding: 0px; border: 0px; transform: initial;" version="1.1" xmlns="http://www.w3.org/2000/svg">' + svgElement.innerHTML + '</svg>';
  svgb64      = 'data:image/svg+xml;base64,'+ btoa(unescape(encodeURIComponent(svghtml)));
  return svgb64;
};
svgtopng.getCanvasImg = function(SVGid) {
  var svgb64 = svgtopng.getSVGImg(SVGid);
  var img = document.createElement('img');
  img.setAttribute('src', svgb64);
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  // Make it hi res
  var pixelRatio = window.devicePixelRatio || 1;
  canvas.style.width = canvas.width +'px';
  canvas.style.height = canvas.height +'px';
  canvas.width *= pixelRatio;
  canvas.height *= pixelRatio;

  // Manage context
  var ctx = canvas.getContext("2d");
  ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/png");

  return dataURL; //.replace(/^data:image\/(png|jpg);base64,/, "");
};
