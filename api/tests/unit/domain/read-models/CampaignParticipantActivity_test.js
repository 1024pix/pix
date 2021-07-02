const { expect } = require('../../../test-helper');
const CampaignParticipantActivity = require('../../../../lib/domain/read-models/CampaignParticipantActivity');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Domain | Models | CampaignParticipantActivity', () => {

  describe('#status', () => {
    context('when isShared is true', () => {
      it('returns SHARED as status', () => {
        const campaignParticipantActivity = new CampaignParticipantActivity({
          isShared: true,
        });

        expect(campaignParticipantActivity.status).equal(CampaignParticipantActivity.statuses.SHARED);
      });
    });

    context('when isShared is false', () => {
      context('when assessment is completed', () => {
        it('returns COMPLETED as status', () => {
          const campaignParticipantActivity = new CampaignParticipantActivity({
            isShared: false,
            assessmentState: Assessment.states.COMPLETED,
          });

          expect(campaignParticipantActivity.status).equal(CampaignParticipantActivity.statuses.COMPLETED);
        });

        context('when assessment is started', () => {
          it('returns STARTED as status', () => {
            const campaignParticipantActivity = new CampaignParticipantActivity({
              isShared: false,
              assessmentState: Assessment.states.STARTED,
            });

            expect(campaignParticipantActivity.status).equal(CampaignParticipantActivity.statuses.STARTED);
          });
        });
      });
    });
  });

});
