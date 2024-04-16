import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { pix1dService } from '../../../../../src/school/domain/services/algorithm-method.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

//attention : l'ordre de la liste d'activités passée en paramètre à getNextActivityInfo doit être antéchronologique
describe('Unit | Domain | Algorithm-methods | Pix1d', function () {
  context('when user has just started a mission', function () {
    it('should return validation level activity and first step', function () {
      const result = pix1dService.getNextActivityInfo([]);
      expect(result).to.equal(Activity.levels.VALIDATION);
    });
  });
  context('when user has just succeeded the activity', function () {
    context('when user never did the tutorial activity', function () {
      context('when user has just succeeded the training activity', function () {
        it('should return the validation activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.TRAINING,
            status: Activity.status.SUCCEEDED,
          });
          const result = pix1dService.getNextActivity([activity]);
          expect(result).to.equal(Activity.levels.VALIDATION);
        });
      });
      context('when user has just succeeded the validation activity', function () {
        it('should return the challenge activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.VALIDATION,
            status: Activity.status.SUCCEEDED,
          });
          const result = pix1dService.getNextActivityInfo([activity]);
          expect(result).to.equal(Activity.levels.CHALLENGE);
        });
      });
      context('when user has just succeeded the challenge activity', function () {
        it('should end the mission', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.CHALLENGE,
            status: Activity.status.SUCCEEDED,
          });
          const result = pix1dService.getNextActivityInfo([activity]);
          expect(result).to.equal(undefined);
        });
      });
    });
    context('when user did the tutorial activity', function () {
      context('when user has just succeeded the tutorial activity', function () {
        it('should return the training activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.TUTORIAL,
            status: Activity.status.SUCCEEDED,
          });
          const result = pix1dService.getNextActivityInfo([activity]);
          expect(result).to.equal(Activity.levels.TRAINING);
        });
      });
      context('when user has just succeeded the training activity', function () {
        it('should return the validation activity', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TUTORIAL });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.TRAINING,
            status: Activity.status.SUCCEEDED,
          });
          const result = pix1dService.getNextActivityInfo([activity2, activity1]);
          expect(result).to.equal(Activity.levels.VALIDATION);
        });
      });
      context('when user has just succeeded the validation activity', function () {
        it('should end the mission', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TUTORIAL });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.VALIDATION,
            status: Activity.status.SUCCEEDED,
          });
          const result = pix1dService.getNextActivityInfo([activity2, activity1]);
          expect(result).to.equal(undefined);
        });
      });
    });
  });
  context('when user has just failed the activity', function () {
    context('when user never did the training activity', function () {
      context('when user has just failed the validation activity', function () {
        it('should return the training activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.VALIDATION,
            status: Activity.status.FAILED,
          });
          const result = pix1dService.getNextActivityInfo([activity]);
          expect(result).to.equal(Activity.levels.TRAINING);
        });
      });
      context('when user has just failed the challenge activity', function () {
        it('should end the mission', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.CHALLENGE,
            status: Activity.status.FAILED,
          });
          const result = pix1dService.getNextActivityInfo([activity]);
          expect(result).to.equal(undefined);
        });
      });
    });
    context('when user did the training activity', function () {
      context('when user has just failed the tutorial activity', function () {
        it('should return the tutorial activity', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.TUTORIAL,
            status: Activity.status.FAILED,
          });
          const result = pix1dService.getNextActivityInfo([activity2, activity1]);
          expect(result).to.equal(Activity.levels.TUTORIAL);
        });
      });
      context('when user has just failed the training activity', function () {
        it('should return the tutorial activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.TRAINING,
            status: Activity.status.FAILED,
          });
          const result = pix1dService.getNextActivityInfo([activity]);
          expect(result).to.equal(Activity.levels.TUTORIAL);
        });
      });
      context('when user has just failed the validation activity', function () {
        it('should return the tutorial activity', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.VALIDATION,
            status: Activity.status.FAILED,
          });
          const result = pix1dService.getNextActivityInfo([activity2, activity1]);
          expect(result).to.equal(Activity.levels.TUTORIAL);
        });
      });
      context('when user has just failed the challenge activity', function () {
        it('should end the mission', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.CHALLENGE,
            status: Activity.status.FAILED,
          });
          const result = pix1dService.getNextActivityInfo([activity2, activity1]);
          expect(result).to.equal(undefined);
        });
      });
    });
  });
  context('when user has just skipped the activity', function () {
    context('when user never did the training activity', function () {
      context('when user has just skipped the validation activity', function () {
        it('should return the training activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.VALIDATION,
            status: Activity.status.SKIPPED,
          });
          const result = pix1dService.getNextActivityInfo([activity]);
          expect(result).to.equal(Activity.levels.TRAINING);
        });
      });
      context('when user has just skipped the challenge activity', function () {
        it('should end the mission', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.CHALLENGE,
            status: Activity.status.SKIPPED,
          });
          const result = pix1dService.getNextActivityInfo([activity]);
          expect(result).to.equal(undefined);
        });
      });
    });
    context('when user did the training activity', function () {
      context('when user has just skipped the tutorial activity', function () {
        it('should return the tutorial activity', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.TUTORIAL,
            status: Activity.status.SKIPPED,
          });
          const result = pix1dService.getNextActivityInfo([activity2, activity1]);
          expect(result).to.equal(Activity.levels.TUTORIAL);
        });
      });
      context('when user has just skipped the training activity', function () {
        it('should return the tutorial activity', function () {
          const activity = domainBuilder.buildActivity({
            level: Activity.levels.TRAINING,
            status: Activity.status.SKIPPED,
          });
          const result = pix1dService.getNextActivityInfo([activity]);
          expect(result).to.equal(Activity.levels.TUTORIAL);
        });
      });
      context('when user has just skipped the validation activity', function () {
        it('should return the tutorial activity', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.VALIDATION,
            status: Activity.status.SKIPPED,
          });
          const result = pix1dService.getNextActivityInfo([activity2, activity1]);
          expect(result).to.equal(Activity.levels.TUTORIAL);
        });
      });
      context('when user has just skipped the challenge activity', function () {
        it('should end the mission', function () {
          const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
          const activity2 = domainBuilder.buildActivity({
            level: Activity.levels.CHALLENGE,
            status: Activity.status.SKIPPED,
          });
          const result = pix1dService.getNextActivityInfo([activity2, activity1]);
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
        const result = pix1dService.getNextActivityInfo([activity5, activity4, activity3, activity2, activity1]);
        expect(result).to.equal(undefined);
      });
    });
    context('when the user has just finished validation activity for the third time', function () {
      it('should end the mission', function () {
        const activity1 = domainBuilder.buildActivity({ level: Activity.levels.VALIDATION });
        const activity2 = domainBuilder.buildActivity({ level: Activity.levels.VALIDATION });
        const activity3 = domainBuilder.buildActivity({ level: Activity.levels.VALIDATION });
        const result = pix1dService.getNextActivityInfo([activity3, activity2, activity1]);
        expect(result).to.equal(undefined);
      });
    });
    context('when the user has failed their third training activity', function () {
      it('should end the mission', function () {
        const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
        const activity2 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
        const activity3 = domainBuilder.buildActivity({
          level: Activity.levels.TRAINING,
          status: Activity.status.FAILED,
        });
        const result = pix1dService.getNextActivityInfo([activity3, activity2, activity1]);
        expect(result).to.equal(undefined);
      });
    });
    context('when the user has skipped their third training activity', function () {
      it('should end the mission', function () {
        const activity1 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
        const activity2 = domainBuilder.buildActivity({ level: Activity.levels.TRAINING });
        const activity3 = domainBuilder.buildActivity({
          level: Activity.levels.TRAINING,
          status: Activity.status.SKIPPED,
        });
        const result = pix1dService.getNextActivityInfo([activity3, activity2, activity1]);
        expect(result).to.equal(undefined);
      });
    });
  });
});
