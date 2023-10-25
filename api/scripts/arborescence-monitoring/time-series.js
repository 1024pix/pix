const MAXIMUM_NUMBER_OF_POINTS_THRESHOLD = 28;

const PURGE_POINT_INDEX = 10;

const NB_POINTS_TO_PURGE = 1;

export class TimeSeries {
  constructor(points) {
    points.sort((pointA, pointB) => new Date(pointA.x).getTime() - new Date(pointB.x).getTime());
    this.points = points;
  }

  add({ x, y }) {
    if (this.sameValueThanTheLast(y)) {
      return this.replaceLastPointByNewPoint({ x, y });
    } else {
      this.points.push({ x, y });
      if (this.exceedMaxNumberOfPoints()) {
        this.purgeOnePoint();
      }
      return new TimeSeries(this.points);
    }
  }

  purgeOnePoint() {
    this.points.splice(PURGE_POINT_INDEX, NB_POINTS_TO_PURGE);
  }

  replaceLastPointByNewPoint({ x, y }) {
    this.points.pop();
    this.points.push({ x, y });
    return new TimeSeries(this.points);
  }

  sameValueThanTheLast(y) {
    const lastPoint = this.lastPoint();
    return lastPoint?.y === y;
  }

  exceedMaxNumberOfPoints() {
    return this.points.length >= MAXIMUM_NUMBER_OF_POINTS_THRESHOLD;
  }

  lastPoint() {
    return this.points[this.points.length - 1];
  }

  size() {
    return this.points.length;
  }

  get(pointIndex) {
    return this.points[pointIndex];
  }

  toString() {
    return JSON.stringify(this.points);
  }
}
