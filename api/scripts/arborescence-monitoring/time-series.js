import { assertNotNullOrUndefined } from '../../src/shared/domain/models/asserts.js';

const MAXIMUM_NUMBER_OF_POINTS_THRESHOLD = 28;

const PURGE_MIDDLE_POINT_INDEX = 10;

const ONE_POINT_TO_PURGE = 1;

const NULL_OR_UNDEFINED_POINTS_ERROR_MESSAGE = 'Time series should have a non null/undefined array of points';

export class TimeSeries {
  #points;

  constructor(points) {
    assertNotNullOrUndefined(points, NULL_OR_UNDEFINED_POINTS_ERROR_MESSAGE);
    points.sort((pointA, pointB) => new Date(pointA.x).getTime() - new Date(pointB.x).getTime());
    this.#points = points;
  }

  size() {
    return this.#points.length;
  }

  get(pointIndex) {
    return this.#points[pointIndex];
  }

  toString() {
    return JSON.stringify(this.#points);
  }

  add({ x, y }) {
    if (this.#sameValueThanTheLast(y)) {
      return this.#replaceLastPointByNewPoint({ x, y });
    }
    this.#points.push({ x, y });
    if (this.#exceedsMaxNumberOfPoints()) {
      this.#purgeOnePoint();
    }
    return new TimeSeries(this.#points);
  }

  #purgeOnePoint() {
    this.#points.splice(PURGE_MIDDLE_POINT_INDEX, ONE_POINT_TO_PURGE);
  }

  #replaceLastPointByNewPoint({ x, y }) {
    this.#points.pop();
    this.#points.push({ x, y });
    return new TimeSeries(this.#points);
  }

  #sameValueThanTheLast(y) {
    return this.#lastPoint()?.y === y;
  }

  #exceedsMaxNumberOfPoints() {
    return this.size() >= MAXIMUM_NUMBER_OF_POINTS_THRESHOLD;
  }

  #lastPoint() {
    return this.#points[this.size() - 1];
  }
}
