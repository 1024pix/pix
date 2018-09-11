const server = require('../../../server');
const Assessment = require('../../../lib/domain/models/Assessment');
const { expect, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../test-helper');

describe('Acceptance | API | Campaign Participations', () => {

  describe('PATCH /api/campaign-participations/{assessementId}', () => {
    let options;
    let user;
    let assessment;
    let campaignParticipation;

    beforeEach(() => {
      user = databaseBuilder.factory.buildUser();
      assessment = databaseBuilder.factory.buildAssessment({ userId: user.id, type: Assessment.types.SMARTPLACEMENT });
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        isShared: false,
        sharedAt: null,
        assessmentId: assessment.id,
      });

      options = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipation.assessmentId}`,
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        payload: {
          data: {
            isShared: true
          }
        },
      };
      return databaseBuilder.commit();

    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should allow user to share his campaign participation', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result.assessmentId).to.equal(campaignParticipation.assessmentId);
        expect(response.result.isShared).to.equal(true);
      });
    });
  });
});
