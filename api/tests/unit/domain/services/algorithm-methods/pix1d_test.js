import { expect, domainBuilder } from '../../../../test-helper.js';
import * as pix1d from '../../../../../lib/domain/services/algorithm-methods/pix1d.js';
import { Activity } from '../../../../../lib/domain/models/Activity.js';

//attention : l'ordre de la liste d'activités passée en paramètre à getNextActivityLevel doit être antéchronologique
describe('Unit | Domain | Algorithm-methods | Pix1d', function () {
  context('when user start a mission', function () {
    it('should return validation level activity', function () {
      const result = pix1d.getNextActivityLevel([]);
      expect(result).to.equal(Activity.levels.VALIDATION);
    });
  });
  context('when user succeed the activity', function () {
    context('when user never did the tutorial activity', function () {
      context('when user succceded the training activity', function () {
        it('should return the validation activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.TRAINING,
            status: Activity.status.SUCCEEDED,
          });
          const result = pix1d.getNextActivityLevel([activity]);
          expect(result).to.equal(Activity.levels.VALIDATION);
        });
      });
      context('when user succceded the validation activity', function () {
        it('should return the challenge activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.VALIDATION,
            status: Activity.status.SUCCEEDED,
          });
          const result = pix1d.getNextActivityLevel([activity]);
          expect(result).to.equal(Activity.levels.CHALLENGE);
        });
      });
      context('when user succceded the challenge activity', function () {
        it('should end the mission', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.CHALLENGE,
            status: Activity.status.SUCCEEDED,
          });
          const result = pix1d.getNextActivityLevel([activity]);
          expect(result).to.equal(undefined);
        });
      });
    });
    context('when user did the tutorial activity', function () {
      context('when user succceded the tutorial activity', function () {
        it('should return the training activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.TUTORIAL,
            status: Activity.status.SUCCEEDED,
          });
          const result = pix1d.getNextActivityLevel([activity]);
          expect(result).to.equal(Activity.levels.TRAINING);
        });
      });
      context('when user succceded the training activity', function () {
        it('should return the validation activity', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TUTORIAL });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.TRAINING,
            status: Activity.status.SUCCEEDED,
          });
          const result = pix1d.getNextActivityLevel([activity2, activity1]);
          expect(result).to.equal(Activity.levels.VALIDATION);
        });
      });
      context('when user succceded the validation activity', function () {
        it('should end the mission', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TUTORIAL });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.VALIDATION,
            status: Activity.status.SUCCEEDED,
          });
          const result = pix1d.getNextActivityLevel([activity2, activity1]);
          expect(result).to.equal(undefined);
        });
      });
    });
  });
  context('when user fail the activity', function () {
    context('when user never did the training activity', function () {
      context('when user failed the validation activity', function () {
        it('should return the training activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.VALIDATION,
            status: Activity.status.FAILED,
          });
          const result = pix1d.getNextActivityLevel([activity]);
          expect(result).to.equal(Activity.levels.TRAINING);
        });
      });
      context('when user failed the challenge activity', function () {
        it('should end the mission', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.CHALLENGE,
            status: Activity.status.FAILED,
          });
          const result = pix1d.getNextActivityLevel([activity]);
          expect(result).to.equal(undefined);
        });
      });
    });
    context('when user did the training activity', function () {
      context('when user fail the training activity', function () {
        it('should return the tutorial activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.TRAINING,
            status: Activity.status.FAILED,
          });
          const result = pix1d.getNextActivityLevel([activity]);
          expect(result).to.equal(Activity.levels.TUTORIAL);
        });
      });
      context('when user fail the validation activity', function () {
        it('should return the tutorial activity', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.VALIDATION,
            status: Activity.status.FAILED,
          });
          const result = pix1d.getNextActivityLevel([activity2, activity1]);
          expect(result).to.equal(Activity.levels.TUTORIAL);
        });
      });
      context('when user fail the challenge activity', function () {
        it('should end the mission', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.CHALLENGE,
            status: Activity.status.FAILED,
          });
          const result = pix1d.getNextActivityLevel([activity2, activity1]);
          expect(result).to.equal(undefined);
        });
      });
    });
  });
  context('when user skip the activity', function () {
    context('when user never did the training activity', function () {
      context('when user skip the validation activity', function () {
        it('should return the training activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.VALIDATION,
            status: Activity.status.SKIPPED,
          });
          const result = pix1d.getNextActivityLevel([activity]);
          expect(result).to.equal(Activity.levels.TRAINING);
        });
      });
      context('when user skip the challenge activity', function () {
        it('should end the mission', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.CHALLENGE,
            status: Activity.status.SKIPPED,
          });
          const result = pix1d.getNextActivityLevel([activity]);
          expect(result).to.equal(undefined);
        });
      });
    });
    context('when user did the training activity', function () {
      context('when user skip the training activity', function () {
        it('should return the tutorial activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.TRAINING,
            status: Activity.status.SKIPPED,
          });
          const result = pix1d.getNextActivityLevel([activity]);
          expect(result).to.equal(Activity.levels.TUTORIAL);
        });
      });
      context('when user skip the validation activity', function () {
        it('should return the tutorial activity', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.VALIDATION,
            status: Activity.status.SKIPPED,
          });
          const result = pix1d.getNextActivityLevel([activity2, activity1]);
          expect(result).to.equal(Activity.levels.TUTORIAL);
        });
      });
      context('when user skip the challenge activity', function () {
        it('should end the mission', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.CHALLENGE,
            status: Activity.status.SKIPPED,
          });
          const result = pix1d.getNextActivityLevel([activity2, activity1]);
          expect(result).to.equal(undefined);
        });
      });
    });
  });
  context('when user has done too many time the same activity', function () {
    context('when the user should go to the tutorial but has already done the tutorial twice', function () {
      it('should end the mission', function () {
        const activity1 = domainBuilder.buildActivity({
          level: Activity.levels.TRAINING,
          status: Activity.status.FAILED,
        });
        const activity2 = domainBuilder.buildActivity({ level: Activity.levels.TUTORIAL });
        const activity3 = domainBuilder.buildActivity({
          level: Activity.levels.TRAINING,
          status: Activity.status.FAILED,
        });
        const activity4 = domainBuilder.buildActivity({ level: Activity.levels.TUTORIAL });
        const activity5 = domainBuilder.buildActivity({
          level: Activity.levels.TRAINING,
          status: Activity.status.FAILED,
        });
        const result = pix1d.getNextActivityLevel([activity5, activity4, activity3, activity2, activity1]);
        expect(result).to.equal(undefined);
      });
    });
    context(
      'when the user should go to the validation activity but has already done the validation three times',
      function () {
        it('should end the mission', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.VALIDATION });
          const activity2 = domainBuilder.buildActivity({ level: Activity.levels.VALIDATION });
          const activity3 = domainBuilder.buildActivity({ level: Activity.levels.VALIDATION });
          const result = pix1d.getNextActivityLevel([activity3, activity2, activity1]);
          expect(result).to.equal(undefined);
        });
      }
    );
    context(
      'when the user should go to the training activity but has already done the training three times',
      function () {
        it('should end the mission', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
          const activity2 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
          const activity3 = domainBuilder.buildActivity({
            level: Activity.levels.TRAINING,
            status: Activity.status.FAILED,
          });
          const result = pix1d.getNextActivityLevel([activity3, activity2, activity1]);
          expect(result).to.equal(undefined);
        });
      }
    );
  });
});
