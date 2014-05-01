module.exports = {
  /**
   * Get svg dimensions: width and height
   *
   * @param  {object} svg
   * @return {object}     {width: 0, height: 0}
   */
  getSvgDimensions: function(svg) {
 var svgBoundingClientRect = svg.getBoundingClientRect();
    var boundingClientWidth = parseFloat(svgBoundingClientRect.width);
    var boundingClientHeight = parseFloat(svgBoundingClientRect.height);
    var styleWidth, styleHeight;

    if (!!parseFloat(svg.clip)) {
      styleWidth = svg.clip.width;
      styleHeight = svg.clip.height;
    }
    else if (!!parseFloat(svg.style.pixelWidth)) {
      styleWidth = svg.style.pixelWidth;
      styleHeight = svg.style.pixelWidth;
    }
    else if (!!parseFloat(svg.style.width)) {
      styleWidth = svg.style.width;
      styleHeight = svg.style.height;
    }
    else {
      styleWidth = svg.getAttribute('width');
      styleHeight = svg.getAttribute('height');
    }

    styleWidth = styleWidth || 0;
    styleHeight = styleHeight || 0;
    if (styleWidth.toString().indexOf('%') === -1) {
      styleWidth = parseFloat(styleWidth);
    }
    else {
      styleWidth = 0;
    }
    if (styleHeight.toString().indexOf('%') === -1) {
      styleHeight = parseFloat(styleHeight);
    }
    else {
      styleHeight = 0;
    }
    var result = {
  //    width: Math.max(boundingClientWidth, styleWidth),
   //   height: Math.max(boundingClientHeight, styleHeight)
      width: styleWidth,
      height: styleHeight
    };
    return result;
  }

  /**
   * Gets g.viewport element or creates it if it doesn't exist
   * @param  {object} svg
   * @return {object}     g element
   */
, getOrCreateViewport: function(svg) {
    var viewport = svg.querySelector('g.viewport')

    // If no g container with id 'viewport' exists, create one
    if (!viewport) {
      var viewport = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      viewport.setAttribute('class', 'viewport');

      var svgChildren = svg.childNodes || svg.children;
      do {
        viewport.appendChild(svgChildren[0]);
      } while (svgChildren.length > 0);
      svg.appendChild(viewport);
    }

    return viewport
  }

, setupSvgAttributes: function(svg) {
    // Setting default attributes
    svg.setAttribute('xmlns', 'http://www.w3.org/1999/xlink');
    svg.setAttributeNS('xmlns', 'xlink', 'http://www.w3.org/1999/xlink');
    svg.setAttributeNS('xmlns', 'ev', 'http://www.w3.org/2001/xml-events');

    // Needed for Internet Explorer, otherwise the viewport overflows
    if (svg.parentNode !== null) {
      var style = svg.getAttribute('style') || '';
      if (style.toLowerCase().indexOf('overflow') === -1) {
        svg.setAttribute('style', 'overflow: hidden; ' + style);
      }
    }
  }

  /**
   * Sets the current transform matrix of an element
   * @param {object} element SVG Element
   * @param {object} matrix  CTM
   */
, setCTM: function(element, matrix) {
    var s = 'matrix(' + matrix.a + ',' + matrix.b + ',' + matrix.c + ',' + matrix.d + ',' + matrix.e + ',' + matrix.f + ')';
    element.setAttribute('transform', s);
  }

  /**
   * Time-based cache for svg.getScreenCTM().
   * Needed because getScreenCTM() is very slow on Firefox (FF 28 at time of writing).
   * The cache expires every 300ms... this is a pretty safe time because it's only called
   * when we're zooming, when the screenCTM is unlikely/impossible to change.
   *
   * @param {object} svg SVG Element
   * @return {[type]} [description]
   */
, getScreenCTMCached: (function() {
    var svgs = {};
    return function(svg) {
      var cur = Date.now();
      if (svgs.hasOwnProperty(svg)) {
        var cached = svgs[svg];
        if (cur - cached.time > 300) {
          // Cache expired
          cached.time = cur;
          cached.ctm = svg.getScreenCTM();
        }
        return cached.ctm;
      } else {
        var ctm = svg.getScreenCTM();
        svgs[svg] = {time: cur, ctm: ctm};
        return ctm;
      }
    };
  })()

  /**
   * Get an SVGPoint of the mouse co-ordinates of the event, relative to the SVG element
   *
   * @param  {object} svg SVG Element
   * @param  {object} evt Event
   * @return {object}     point
   */
, getRelativeMousePoint: function(svg, evt) {
    var point = svg.createSVGPoint()

    point.x = evt.clientX
    point.y = evt.clientY

    return point.matrixTransform(this.getScreenCTMCached(svg).inverse())
  }

  /**
   * Instantiate an SVGPoint object with given event coordinates
   *
   * @param {object} evt Event
   */
, getEventPoint: function(evt) {
    var svg = (evt.target.tagName === 'svg' || evt.target.tagName === 'SVG') ? evt.target : evt.target.ownerSVGElement || evt.target.correspondingElement.ownerSVGElement
      , point = svg.createSVGPoint()

    point.x = evt.clientX
    point.y = evt.clientY

    return point
  }

  /**
   * Get SVG center point
   *
   * @param  {object} svg SVG Element
   * @return {object}     SVG Point
   */
, getSvgCenterPoint: function(svg) {
    var boundingClientRect = svg.getBoundingClientRect()
      , width = boundingClientRect.width
      , height = boundingClientRect.height
      , point = svg.createSVGPoint()

    point.x = width / 2
    point.y = height / 2

    return point
  }
}
