const server = require('../../../server');
const Assessment = require('../../../lib/domain/models/Assessment');
const { expect, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../test-helper');

describe('Acceptance | API | Campaign Participations', () => {

  let user;
  let options;
  let assessment;
  let campaignParticipation;

  beforeEach(() => {
    user = databaseBuilder.factory.buildUser();
    assessment = databaseBuilder.factory.buildAssessment({ userId: user.id, type: Assessment.types.SMARTPLACEMENT });
  });

  describe('GET /api/campaign-participations?filter[assessmentId]={id}', () => {

    beforeEach(() => {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        assessmentId: assessment.id,
      });
      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('when the user own the campaign participation', () => {

      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/api/campaign-participations?filter[assessmentId]=${assessment.id}`,
          headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        };
      });

      it('should return the campaign-participation of the given assessmentId', () => {
        // given
        const expectedCampaignPart = [
          {
            'attributes': {
              'assessment-id': campaignParticipation.assessmentId,
              'is-shared': campaignParticipation.isShared,
              'shared-at': campaignParticipation.sharedAt,
            },
            'id': campaignParticipation.id,
            'type': 'campaign-participations'
          }
        ];

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.be.deep.equal(expectedCampaignPart);
        });
      });

    });

    context('when the user doesnt own the campaign participation', () => {

      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/api/campaign-participations?filter[assessmentId]=${assessment.id}`,
          headers: { authorization: 'USER_UNATHORIZED' },
        };
      });

      it('it should reply an unauthorized error', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((error) => {
          expect(error.statusCode).to.equal(401);
        });
      });
    });
  });

  describe('PATCH /api/campaign-participations/{id}', () => {

    beforeEach(() => {
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
        expect(response.result).to.be.null;
      });
    });
  });
});
