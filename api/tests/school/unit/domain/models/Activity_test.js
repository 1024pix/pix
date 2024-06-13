import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | domain | Activity', function () {
  /* eslint-disable mocha/no-setup-in-describe */
  [
    {
      level: Activity.levels.CHALLENGE,
      isDare: true,
      isValidation: false,
      isTraining: false,
      isTutorial: false,
    },
    {
      level: Activity.levels.VALIDATION,
      isDare: false,
      isValidation: true,
      isTraining: false,
      isTutorial: false,
    },
    {
      level: Activity.levels.TUTORIAL,
      isDare: false,
      isValidation: false,
      isTraining: false,
      isTutorial: true,
    },
    {
      level: Activity.levels.TRAINING,
      isDare: false,
      isValidation: false,
      isTraining: true,
      isTutorial: false,
    },
  ].forEach(function ({ level, isDare, isValidation, isTraining, isTutorial }) {
    it(`isDare should return ${isDare} when activity is ${level} level`, function () {
      const activity = new Activity({ level });
      expect(activity.isDare).to.equal(isDare);
    });

    it(`isValidation should return ${isValidation} when activity is ${level} level`, function () {
      const activity = new Activity({ level });
      expect(activity.isValidation).to.equal(isValidation);
    });

    it(`isTraining should return ${isTraining} when activity is ${level} level`, function () {
      const activity = new Activity({ level });
      expect(activity.isTraining).to.equal(isTraining);
    });

    it(`isTutorial should return ${isTutorial} when activity is ${level} level`, function () {
      const activity = new Activity({ level });
      expect(activity.isTutorial).to.equal(isTutorial);
    });
  });
  /* eslint-enable mocha/no-setup-in-describe */

  describe('isLevel', function () {
    context('when level is TUTORIAL', function () {
      it('return true', function () {
        const activity = new Activity({ level: 'TUTORIAL' });
        expect(activity.hasLevel(Activity.levels.TUTORIAL)).to.be.true;
      });
      it('return false', function () {
        const activity = new Activity({ level: 'VALIDATION' });
        expect(activity.hasLevel(Activity.levels.TUTORIAL)).to.be.false;
      });
    });
  });

  describe('higherLevel', function () {
    it('returns TRAINING when activity is TUTORIAL level', function () {
      const activity = new Activity({ level: Activity.levels.TUTORIAL });
      expect(activity.higherLevel).to.equal(Activity.levels.TRAINING);
    });

    it('returns VALIDATION when activity is TRAINING level', function () {
      const activity = new Activity({ level: Activity.levels.TRAINING });
      expect(activity.higherLevel).to.equal(Activity.levels.VALIDATION);
    });

    it('returns END_OF_STEPS when activity is VALIDATION level', function () {
      const activity = new Activity({ level: Activity.levels.VALIDATION });
      expect(activity.higherLevel).to.equal(Activity.END_OF_STEP);
    });
  });

  describe('hasSucceeded', function () {
    it('returns true when the status of activity is SUCCEEDED', function () {
      const activity = new Activity({ status: Activity.status.SUCCEEDED });
      expect(activity.isSucceeded).to.be.true;
    });
  });

  describe('hasFailed', function () {
    it('returns true when the status of activity is FAILED', function () {
      const activity = new Activity({ status: Activity.status.FAILED });
      expect(activity.isFailed).to.be.true;
    });
  });

  describe('hasBeenSkipped', function () {
    it('returns true when the status of activity is SKIPPED', function () {
      const activity = new Activity({ status: Activity.status.SKIPPED });
      expect(activity.isSkipped).to.be.true;
    });
  });

  describe('hasFailedOrBeenSkipped', function () {
    it('returns true when the status of activity is SKIPPED', function () {
      const activity = new Activity({ status: Activity.status.SKIPPED });
      expect(activity.isFailedOrSkipped).to.be.true;
    });

    it('returns true when the status of activity is FAILED', function () {
      const activity = new Activity({ status: Activity.status.FAILED });
      expect(activity.isFailedOrSkipped).to.be.true;
    });

    it('returns false when the status of activity is STARTED', function () {
      const activity = new Activity({ status: Activity.status.STARTED });
      expect(activity.isFailedOrSkipped).to.be.false;
    });

    it('returns false when the status of activity is SUCCEEDED', function () {
      const activity = new Activity({ status: Activity.status.SUCCEEDED });
      expect(activity.isFailedOrSkipped).to.be.false;
    });
  });
});
