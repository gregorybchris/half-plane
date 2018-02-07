// https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function blendColors(c0, c1, p) {
    var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
    return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
}

function makeConvexLayers(s) {
    let pts = s.slice();
    let hulls = [];
    while (pts.length != 0) {
        let [hull, rest] = giftWrap(pts);
        hulls.push(hull);
        pts = rest;
    }
    return hulls;
}

/**
 * Returns an array containing an array of hull points and an
 * array of non-hull points
 */
function giftWrap(s) {
    let pts = s.slice();
    if (pts.length == 1)
        return [pts, []];
    let hull = [];
    let min = getMinX(pts);
    hull.push(min);
    let cur = min;
    while (true) {
        var noCurPts = pts.filter(pt => getName(cur) != getName(pt));
        cur = noCurPts.reduce((a, c) => turn(cur, a, c) >= 0 ? c : a);
        if (getName(cur) == getName(min))
            break;
        else
            hull.push(cur);
    }
    hull.forEach(p => pts = pts.filter(pt => getName(pt) != getName(p)));
    return [hull, pts];
}

var turn = (a, b, c) => ((getX(c) - getX(b)) * (getY(a) - getY(b))) - ((getX(a) - getX(b)) * (getY(c) - getY(b)));
var cos = (a, b) => (getX(a) * getX(b) + getY(a) * getY(b)) / vecMag(a) / vecMag(b);
var getMinX = pts => pts.reduce((a, c) => getX(a) < getX(c) ? a : c);
var getX = pt => parseFloat(pt.attr("cx"));
var getY = pt => parseFloat(pt.attr("cy"));
var getLoc = pt => ({ x: getX(pt), y: getY(pt) });
var getName = pt => pt.attr("name");
var vecMag = pt => Math.sqrt(getX(pt) * getX(pt) + getY(pt) * getY(pt));

export { makeConvexLayers }
