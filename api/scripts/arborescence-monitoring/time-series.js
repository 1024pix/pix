const MAXIMUM_NUMBER_OF_POINTS_THRESHOLD = 30;

const PURGE_POINT_INDEX = 10;

const NB_POINTS_TO_PURGE = 1;

export class TimeSeries {
  constructor(points) {
    points.sort((pointA, pointB) => new Date(pointA.x).getTime() - new Date(pointB.x).getTime());
    this.points = points;
  }

  add({ x, y }) {
    const lastPoint = this.lastPoint();
    if (lastPoint.y === y) {
      return this;
    } else {
      this.points.push({ x, y });
      if (this.exceedMaxNumberOfPoints()) {
        this.points.splice(PURGE_POINT_INDEX, NB_POINTS_TO_PURGE);
      }
      return new TimeSeries(this.points);
    }
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
}
