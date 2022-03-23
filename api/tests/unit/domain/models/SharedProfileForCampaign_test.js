const { expect } = require('../../../test-helper');

const SharedProfileForCampaign = require('../../../../lib/domain/models/SharedProfileForCampaign');

describe('Unit | Domain | Models | SharedProfileForCampaign', function () {
  describe('#canRetry', function () {
    context('when participant is disabled', function () {
      it('cannot retry', function () {
        const sharedProfileForCampaign = new SharedProfileForCampaign({
          campaignParticipation: {
            sharedAt: new Date('2020-01-01'),
          },
        });

        sharedProfileForCampaign.build({
          campaignAllowsRetry: true,
          isRegistrationActive: false,
        });

        expect(sharedProfileForCampaign.canRetry).to.equal(false);
      });
    });

    context('when the campaign does not allow retry', function () {
      it('return false', function () {
        const sharedProfileForCampaign = new SharedProfileForCampaign({
          campaignParticipation: {
            sharedAt: new Date('2020-01-01'),
          },
        });

        sharedProfileForCampaign.build({
          campaignAllowsRetry: false,
          isRegistrationActive: true,
        });

        expect(sharedProfileForCampaign.canRetry).to.equal(false);
      });

      it('returns false if campaign participation is deleted', function () {
        const sharedProfileForCampaign = new SharedProfileForCampaign({
          campaignParticipation: {
            sharedAt: new Date('2020-01-01'),
          },
        });

        sharedProfileForCampaign.build({
          campaignAllowsRetry: true,
          isRegistrationActive: true,
          deletedAt: new Date('2020-01-01'),
        });

        expect(sharedProfileForCampaign.canRetry).to.equal(false);
      });
    });

    context('when participant is  active', function () {
      context('when participation is not shared', function () {
        it('return false', function () {
          const sharedProfileForCampaign = new SharedProfileForCampaign({
            campaignParticipation: {
              sharedAt: null,
            },
          });

          sharedProfileForCampaign.build({
            campaignAllowsRetry: true,
            isRegistrationActive: true,
          });

          expect(sharedProfileForCampaign.canRetry).to.equal(false);
        });
      });

      context('when the profile has been shared', function () {
        it('return true', function () {
          const sharedProfileForCampaign = new SharedProfileForCampaign({
            campaignParticipation: {
              sharedAt: new Date('2020-01-01'),
            },
          });

          sharedProfileForCampaign.build({
            campaignAllowsRetry: true,
            isRegistrationActive: true,
          });

          expect(sharedProfileForCampaign.canRetry).to.equal(true);
        });
      });
    });
  });
});
