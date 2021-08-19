const { expect, sinon } = require('../../../test-helper');
const constants = require('../../../../lib/domain/constants');
const SharedProfileForCampaign = require('../../../../lib/domain/models/SharedProfileForCampaign');

describe('Unit | Domain | Models | SharedProfileForCampaign', function() {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const originalConstantValue = constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
  let clock;

  beforeEach(function() {
    constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING = 5;
  });

  afterEach(function() {
    clock.restore();
    constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING = originalConstantValue;
  });

  describe('#canRetry', function() {
    context('when the campaign allows retry', function() {
      context('when the profile has been shared MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING days ago', function() {
        beforeEach(function() {
          const now = new Date('2020-01-06');
          clock = sinon.useFakeTimers(now);
        });

        it('return true', function() {
          const sharedProfileForCampaign = new SharedProfileForCampaign({ campaignAllowsRetry: true, scorecards: [], sharedAt: new Date('2020-01-01') });

          expect(sharedProfileForCampaign.canRetry).to.equal(true);
        });
      });

      context('when the profile has been shared less than MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING days ago', function() {
        beforeEach(function() {
          const now = new Date('2020-01-06');
          clock = sinon.useFakeTimers(now);
        });

        it('return false', function() {
          const sharedProfileForCampaign = new SharedProfileForCampaign({ campaignAllowsRetry: true, scorecards: [], sharedAt: new Date('2020-01-04') });

          expect(sharedProfileForCampaign.canRetry).to.equal(false);
        });
      });

      context('when the profile has been shared more than MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING days ago', function() {
        beforeEach(function() {
          const now = new Date('2020-01-09');
          clock = sinon.useFakeTimers(now);
        });

        it('return true', function() {
          const sharedProfileForCampaign = new SharedProfileForCampaign({ campaignAllowsRetry: true, scorecards: [], sharedAt: new Date('2020-01-02') });

          expect(sharedProfileForCampaign.canRetry).to.equal(true);
        });
      });
    });

    context('when the campaign does not allow retry', function() {
      beforeEach(function() {
        const now = new Date('2020-01-06');
        clock = sinon.useFakeTimers(now);
      });

      it('return false', function() {
        const sharedProfileForCampaign = new SharedProfileForCampaign({ campaignAllowsRetry: false, scorecards: [], sharedAt: new Date('2020-01-01') });

        expect(sharedProfileForCampaign.canRetry).to.equal(false);
      });
    });
  });
});
