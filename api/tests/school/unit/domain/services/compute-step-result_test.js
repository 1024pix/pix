import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { computeStepResult } from '../../../../../src/school/domain/services/compute-step-result.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Domain | Pix Junior | compute step result', function () {
  context('When the last activity is a succeeded VALIDATION', function () {
    it(`should return ${Assessment.results.REACHED}`, async function () {
      const lastActivity = domainBuilder.buildActivity({
        level: Activity.levels.VALIDATION,
        status: Activity.status.SUCCEEDED,
        stepIndex: 1,
      });

      const result = await computeStepResult(lastActivity);

      expect(result).to.equal(Assessment.results.REACHED);
    });
  });
  context('When the last activity is a failed VALIDATION', function () {
    it(`should return ${Assessment.results.PARTIALLY_REACHED}`, async function () {
      const lastActivity = domainBuilder.buildActivity({
        level: Activity.levels.VALIDATION,
        status: Activity.status.FAILED,
        stepIndex: 1,
      });

      const result = await computeStepResult(lastActivity);

      expect(result).to.equal(Assessment.results.PARTIALLY_REACHED);
    });
  });
  context('When the last activity is a failed TRAINING', function () {
    it(`should return ${Assessment.results.NOT_REACHED}`, async function () {
      const lastActivity = domainBuilder.buildActivity({
        level: Activity.levels.TRAINING,
        status: Activity.status.FAILED,
        stepIndex: 1,
      });

      const result = await computeStepResult(lastActivity);

      expect(result).to.equal(Assessment.results.NOT_REACHED);
    });
  });
  context('When the last activity is not in a step', function () {
    it('should return undefined', async function () {
      const lastActivity = domainBuilder.buildActivity({
        level: Activity.levels.CHALLENGE,
      });

      const result = await computeStepResult(lastActivity);

      expect(result).to.equal(undefined);
    });
  });
});
