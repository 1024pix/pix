import sinon from 'sinon';

import { scoringAndCapacitySimulatorController } from '../../../../../src/certification/evaluation/application/scoring-and-capacity-simulator-controller.js';
import { usecases } from '../../../../../src/certification/evaluation/domain/usecases/index.js';

import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Application | scoringAndCapacitySimulatorController', function () {
  describe('#simulateScoringOrCapacity', function () {
    let clock;
    let now;

    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now: new Date(),
        toFake: ['Date'],
      });
      now = new Date(clock.now);
    });

    afterEach(async function () {
      clock.restore();
    });

    describe('when given a capacity', function () {
      it('should simulate a score', async function () {
        // given
        const capacity = 2;
        sinon.stub(usecases, 'simulateScoreFromCapacity');

        const request = {
          payload: {
            data: {
              capacity,
              score: undefined,
              date: now,
            },
          },
        };

        // when
        const response = await scoringAndCapacitySimulatorController.simulateScoringOrCapacity(request, hFake);

        // then
        expect(response.statusCode).to.equal(200);
        expect(usecases.simulateScoreFromCapacity).to.have.been.calledWith({
          capacity,
          date: now,
        });
      });
    });

    describe('when given a score', function () {
      it('should simulate a capacity', async function () {
        // given
        const score = 128;
        sinon.stub(usecases, 'simulateCapacityFromScore');

        const request = {
          payload: {
            data: {
              capacity: undefined,
              score,
              date: now,
            },
          },
        };

        // when
        const response = await scoringAndCapacitySimulatorController.simulateScoringOrCapacity(request, hFake);

        // then
        expect(response.statusCode).to.equal(200);
        expect(usecases.simulateCapacityFromScore).to.have.been.calledWith({
          score,
          date: now,
        });
      });
    });
  });
});
