L.DivTransform = L.ImageTransform.extend({
    _initImage: function () {
        this._image = L.DomUtil.create('div', 'leaflet-image-layer');
        //this._image.style.pointerEvents = 'none';

            if (this._map.options.zoomAnimation && L.Browser.any3d) {
            L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
        } else {
            L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
        }

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

        div.style.width  = size.x + 'px';
        div.style.height = size.y + 'px';

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
    }
});

L.divTransform = function (url, bounds, options) {
	return new L.DivTransform(url, bounds, options);
};
