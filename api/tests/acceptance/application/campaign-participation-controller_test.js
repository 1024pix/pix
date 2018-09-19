const server = require('../../../server');
const Assessment = require('../../../lib/domain/models/Assessment');
const { expect, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../test-helper');

describe('Acceptance | API | Campaign Participations', () => {

  describe('GET /api/campaign-participations?filter[assessmentId]={id}', () => {

    let options;
    let assessment;

    beforeEach(() => {
      assessment = databaseBuilder.factory.buildAssessment({ type: Assessment.types.SMARTPLACEMENT });
      databaseBuilder.factory.buildCampaignParticipation({
        assessmentId: assessment.id,
      });

      options = {
        method: 'GET',
        url: `/api/campaign-participations?filter[assessmentId]=${assessment.id}`,
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };
      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the campaign-participation of the given assessmentId', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('PATCH /api/campaign-participations/{id}', () => {

    let options;
    let assessment;
    let user;
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
        url: `/api/campaign-participations/${campaignParticipation.id}`,
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
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
