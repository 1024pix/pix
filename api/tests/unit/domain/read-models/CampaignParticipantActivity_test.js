const { expect } = require('../../../test-helper');
const CampaignParticipantActivity = require('../../../../lib/domain/read-models/CampaignParticipantActivity');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');

const { SHARED, TO_SHARED, STARTED } = CampaignParticipation.statuses;

describe('Unit | Domain | Models | CampaignParticipantActivity', function() {

  describe('#status', function() {
    context('when isShared is true', function() {
      it('returns SHARED as status', function() {
        const campaignParticipantActivity = new CampaignParticipantActivity({
          status: SHARED,
        });

        expect(campaignParticipantActivity.status).equal(CampaignParticipantActivity.statuses.SHARED);
      });
    });

    context('when isShared is false', function() {
      context('when assessment is completed', function() {
        it('returns COMPLETED as status', function() {
          const campaignParticipantActivity = new CampaignParticipantActivity({
            status: TO_SHARED,
            assessmentState: Assessment.states.COMPLETED,
          });

          expect(campaignParticipantActivity.status).equal(CampaignParticipantActivity.statuses.COMPLETED);
        });

        context('when assessment is started', function() {
          it('returns STARTED as status', function() {
            const campaignParticipantActivity = new CampaignParticipantActivity({
              status: STARTED,
              assessmentState: Assessment.states.STARTED,
            });

            expect(campaignParticipantActivity.status).equal(CampaignParticipantActivity.statuses.STARTED);
          });
        });
      });
    });
  });

});
