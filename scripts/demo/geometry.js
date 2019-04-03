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
        cur = noCurPts.reduce((a, c) => pointTurn(cur, a, c) >= 0 ? c : a);
        if (getName(cur) == getName(min))
            break;
        else
            hull.push(cur);
    }
    hull.forEach(p => pts = pts.filter(pt => getName(pt) != getName(p)));
    return [hull, pts];
}

var turn = (ax, ay, bx, by, cx, cy) => ((cx - bx) * (ay - by)) - ((ax - bx) * (cy - by));
var pointTurn = (a, b, c) => turn(getX(a), getY(a), getX(b), getY(b), getX(c), getY(c));
var cos = (a, b) => (getX(a) * getX(b) + getY(a) * getY(b)) / vecMag(a) / vecMag(b);
var getMinX = pts => pts.reduce((a, c) => getX(a) < getX(c) ? a : c);
var getX = pt => parseFloat(pt.attr("cx"));
var getY = pt => parseFloat(pt.attr("cy"));
var getLoc = pt => ({ x: getX(pt), y: getY(pt) });
var getName = pt => pt.attr("name");
var vecMag = pt => Math.sqrt(getX(pt) * getX(pt) + getY(pt) * getY(pt));

export { makeConvexLayers, turn }
