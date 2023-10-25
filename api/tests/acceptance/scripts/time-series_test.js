import { expect } from '../../test-helper.js';
import { TimeSeries } from '../../../scripts/arborescence-monitoring/time-series.js';

describe('Unit | Scripts | time-series.js', function () {
  describe('#add', function () {
    describe('Given less than 30 points', function () {
      describe('New value to add', function () {
        it('should add the point sorted to the time series', async function () {
          const timeSeries = new TimeSeries([
            { x: '2023-07-19T07:00:00.000Z', y: 298 },
            { x: '2023-10-20T07:04:01.550Z', y: 305 },
            { x: '2023-10-25T07:03:47.926Z', y: 306 },
          ]);

          const updatedTimeSeries = timeSeries.add({ x: '2021-07-19T07:00:00.000Z', y: 298 });

          const expectedNumberOfPoints = 4;
          expect(updatedTimeSeries.size()).to.equal(expectedNumberOfPoints);
          expect(updatedTimeSeries.get(expectedNumberOfPoints - 1).x).to.equal('2023-10-25T07:03:47.926Z');
        });
      });
      describe('Same value than the last to add', function () {
        it('should not add the point', async function () {
          const timeSeries = new TimeSeries([{ x: '2023-07-19T07:00:00.000Z', y: 298 }]);

          const updatedTimeSeries = timeSeries.add({ x: '2023-08-19T07:00:00.000Z', y: 298 });

          const expectedNumberOfPoints = 1;
          expect(updatedTimeSeries.size()).to.equal(expectedNumberOfPoints);
          expect(updatedTimeSeries.get(0).x).to.equal('2023-07-19T07:00:00.000Z');
        });
      });
    });
    describe('Given more or equal than 30 points', function () {
      let timeSeries;
      const expectedNumberOfPoints = 30;
      beforeEach(function () {
        timeSeries = new TimeSeries(Array(30).fill({ x: '2023-10-25T07:03:47.926Z', y: 306 }));
      });

      describe('New value to add', function () {
        it('should add the new point and remove one by keeping the first one of the time series', async function () {
          const updatedTimeSeries = timeSeries.add({ x: '2023-17-19T07:00:00.000Z', y: 298 });

          expect(updatedTimeSeries.size()).to.equal(expectedNumberOfPoints);
          expect(updatedTimeSeries.get(expectedNumberOfPoints - 1).y).to.equal(298);
        });
      });
      describe('Same value than the last to add', function () {
        it('should not add the point', async function () {
          const updatedTimeSeries = timeSeries.add({ x: '2023-08-19T07:00:00.000Z', y: 306 });

          expect(updatedTimeSeries.size()).to.equal(expectedNumberOfPoints);
          expect(updatedTimeSeries.get(expectedNumberOfPoints - 1).x).to.equal('2023-10-25T07:03:47.926Z');
        });
      });
    });
  });
});
