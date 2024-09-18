import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { computeGlobalResult } from '../../../../../src/school/domain/services/compute-global-result.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Pix Junior | compute global result', function () {
  context('When the dare is successful', function () {
    it(`should return ${Assessment.results.EXCEEDED}`, function () {
      const stepResults = [Assessment.results.REACHED];
      const dareResult = Assessment.results.REACHED;

      const result = computeGlobalResult(stepResults, dareResult);

      expect(result).to.equal(Assessment.results.EXCEEDED);
    });
  });

  context('When the dare is unsuccessful', function () {
    it(`should return ${Assessment.results.REACHED}`, function () {
      const stepResults = [Assessment.results.REACHED];
      const dareResult = Assessment.results.NOT_REACHED;

      const result = computeGlobalResult(stepResults, dareResult);

      expect(result).to.equal(Assessment.results.REACHED);
    });
  });

  context('When the dare is undefined', function () {
    context('when last step is reached', function () {
      it(`should return ${Assessment.results.REACHED}`, function () {
        const stepResults = [Assessment.results.REACHED];
        const dareResult = undefined;

        const result = computeGlobalResult(stepResults, dareResult);

        expect(result).to.equal(Assessment.results.REACHED);
      });
    });

    context('when last step is not reached', function () {
      context('with only one step', function () {
        it(`should return ${Assessment.results.NOT_REACHED}`, function () {
          const stepResults = [Assessment.results.NOT_REACHED];
          const dareResult = undefined;

          const result = computeGlobalResult(stepResults, dareResult);

          expect(result).to.equal(Assessment.results.NOT_REACHED);
        });
      });

      context('with multiple step (first should be reached by design)', function () {
        it(`should return ${Assessment.results.PARTIALLY_REACHED}`, function () {
          const stepResults = [Assessment.results.REACHED, Assessment.results.NOT_REACHED];
          const dareResult = undefined;

          const result = computeGlobalResult(stepResults, dareResult);

          expect(result).to.equal(Assessment.results.PARTIALLY_REACHED);
        });
      });
    });
  });
});
