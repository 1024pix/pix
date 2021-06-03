const { expect, sinon } = require('../../../test-helper');
const constants = require('../../../../lib/domain/constants');
const SharedProfileForCampaign = require('../../../../lib/domain/models/SharedProfileForCampaign');

describe('Unit | Domain | Models | SharedProfileForCampaign', () => {
  const originalConstantValue = constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
  let clock;

  beforeEach(() => {
    constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING = 5;
  });

  afterEach(() => {
    clock.restore();
    constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING = originalConstantValue;
  });

  describe('#canRetry', () => {
    context('when the campaign allows retry', () => {
      context('when the profile has been shared MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING days ago', () => {
        beforeEach(() => {
          const now = new Date('2020-01-06');
          clock = sinon.useFakeTimers(now);
        });

        it('return true', () => {
          const sharedProfileForCampaign = new SharedProfileForCampaign({ campaignAllowsRetry: true, scorecards: [], sharedAt: new Date('2020-01-01') });

          expect(sharedProfileForCampaign.canRetry).to.equal(true);
        });
      });

      context('when the profile has been shared less than MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING days ago', () => {
        beforeEach(() => {
          const now = new Date('2020-01-06');
          clock = sinon.useFakeTimers(now);
        });

        it('return false', () => {
          const sharedProfileForCampaign = new SharedProfileForCampaign({ campaignAllowsRetry: true, scorecards: [], sharedAt: new Date('2020-01-04') });

          expect(sharedProfileForCampaign.canRetry).to.equal(false);
        });
      });

      context('when the profile has been shared more than MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING days ago', () => {
        beforeEach(() => {
          const now = new Date('2020-01-09');
          clock = sinon.useFakeTimers(now);
        });

        it('return true', () => {
          const sharedProfileForCampaign = new SharedProfileForCampaign({ campaignAllowsRetry: true, scorecards: [], sharedAt: new Date('2020-01-02') });

          expect(sharedProfileForCampaign.canRetry).to.equal(true);
        });
      });
    });

    context('when the campaign does not allow retry', () => {
      beforeEach(() => {
        const now = new Date('2020-01-06');
        clock = sinon.useFakeTimers(now);
      });

      it('return false', () => {
        const sharedProfileForCampaign = new SharedProfileForCampaign({ campaignAllowsRetry: false, scorecards: [], sharedAt: new Date('2020-01-01') });

        expect(sharedProfileForCampaign.canRetry).to.equal(false);
      });
    });
  });
});
