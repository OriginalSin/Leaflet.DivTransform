L.DivTransform = L.ImageOverlay.extend({
    initialize: function (url, anchors, options) { // (String, LatLngBounds, Object)
        L.ImageOverlay.prototype.initialize.call(this, url, anchors, options);
        this.setAnchors(anchors);
    },

    setAnchors: function (anchors) {
        this._anchors = [];
        this._bounds = L.latLngBounds(anchors);
        for (var i = 0, len = anchors.length; i < len; i++) {
            var yx = anchors[i];
            this._anchors.push(L.latLng(yx));
        }
        
        if (this._map) {
            this._reset();
        }
    },

    _initImage: function () {
        this._image = L.DomUtil.create('div', 'leaflet-image-layer');

        // if (this._map.options.zoomAnimation && L.Browser.any3d) {
            // L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
        // } else {
            L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
        // }

        this._imgNode = L.DomUtil.create('div');
        this._imgNode.style[L.DomUtil.TRANSFORM_ORIGIN] = '0 0';
        
        this._imgNode.innerHTML = this.options.html;
        this._image.appendChild(this._imgNode);

        this._updateOpacity();
    },
    _reset: function () {
        var div = this._image,
            map = this._map,
            imgNode = this._imgNode,
            topLeft = map.latLngToLayerPoint(this._bounds.getNorthWest()),
            size = map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(topLeft),
            anchors = this._anchors,
            w = this.options.width, 
            h = this.options.height,
            pixels = [];

        for (var i = 0, len = anchors.length; i < len; i++) {
            var p = map.latLngToLayerPoint(anchors[i]);
            pixels.push(L.point(p.x - topLeft.x, p.y - topLeft.y));
        }

        L.DomUtil.setPosition(div, topLeft);

        var matrix3d = this._matrix3d = L.ImageTransform.Utils.general2DProjection(
            0, 0, pixels[0].x, pixels[0].y,
            w, 0, pixels[1].x, pixels[1].y,
            w, h, pixels[2].x, pixels[2].y,
            0, h, pixels[3].x, pixels[3].y
        );
        
        //matrix normalization
        for(i = 0; i != 9; ++i) matrix3d[i] = matrix3d[i]/matrix3d[8];
        
        this._matrix3d_inverse = L.ImageTransform.Utils.adj(matrix3d);
        
        imgNode.style[L.DomUtil.TRANSFORM] = this._getMatrix3dCSS(this._matrix3d);
    },

    _getMatrix3dCSS: function(arr)	{		// get CSS atribute matrix3d
        var css = 'matrix3d(';
        css += arr[0].toFixed(9) + "," + arr[3].toFixed(9) + ", 0," + arr[6].toFixed(9);
        css += "," + arr[1].toFixed(9) + "," + arr[4].toFixed(9) + ", 0," + arr[7].toFixed(9);
        css += ",0, 0, 1, 0";
        css += "," + arr[2].toFixed(9) + "," + arr[5].toFixed(9) + ", 0, " + arr[8].toFixed(9) + ")";
        return css;
    }
});

L.divTransform = function (url, bounds, options) {
	return new L.DivTransform(url, bounds, options);
};
