export class Point2D {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

export class Spline {

    public points: Point2D[];

    constructor() {
        this.points = [];
    }

    getSplinePoint(t: number, looped: boolean) {
        var p0, p1, p2, p3;
        if (!looped) {
            p1 = Math.floor(t);
            p2 = Math.min(p1 + 1, this.points.length - 1);
            p3 = Math.min(p2 + 1, this.points.length - 1);
            p0 = Math.max(p1 - 1, 0);
            //console.log(`t: ${t}, ${p0}, ${p1}, ${p2}, ${p3}`);
        }
        else {
            p1 = Math.floor(t);
            p2 = (p1 + 1) % this.points.length;
            p3 = (p2 + 1) % this.points.length;
            p0 = (p1 >= 1) ? p1 - 1 : this.points.length - 1;
        }

        t = t - Math.floor(t);

        var tt = t * t;
        var ttt = tt * t;

        var q1 = -ttt + 2.0*tt - t;
        var q2 = 3.0*ttt - 5.0*tt + 2.0;
        var q3 = -3.0*ttt + 4.0*tt + t;
        var q4 = ttt - tt;

        var tx = 0.5 * (this.points[p0].x * q1 +
                        this.points[p1].x * q2 +
                        this.points[p2].x * q3 +
                        this.points[p3].x * q4);

        var ty = 0.5 * (this.points[p0].y * q1 +
                        this.points[p1].y * q2 +
                        this.points[p2].y * q3 +
                        this.points[p3].y * q4);

        return new Point2D(tx, ty);
    }

    getSplineGradient(t: number, looped: boolean) {
        var p0, p1, p2, p3;
        if (!looped) {
            p1 = Math.floor (t) + 1;
            p2 = p1 + 1;
            p3 = p2 + 1;
            p0 = p1 - 1;
        }
        else {
            p1 = Math.floor(t);
            p2 = (p1 + 1) % this.points.length;
            p3 = (p2 + 1) % this.points.length;
            p0 = (p1 >= 1) ? p1 - 1 : this.points.length - 1;
        }

        t = t - Math.floor(t);

        var tt = t * t;
        var ttt = tt * t;

        var q1 = -3.0 * tt + 4.0*t - 1.0;
        var q2 = 9.0*tt - 10.0*t;
        var q3 = -9.0*tt + 8.0*t + 1.0;
        var q4 = 3.0*tt - 2.0*t;

        var tx = 0.5 * (this.points[p0].x * q1 +
                        this.points[p1].x * q2 +
                        this.points[p2].x * q3 +
                        this.points[p3].x * q4);

        var ty = 0.5 * (this.points[p0].y * q1 +
                        this.points[p1].y * q2 +
                        this.points[p2].y * q3 +
                        this.points[p3].y * q4);

        return new Point2D(tx, ty);
    }
}