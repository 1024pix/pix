const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');
const _ = require('lodash');

describe('Acceptance | Controller | session-controller-get-certification-candidates', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /sessions/{id}/certification-candidates', function() {
    let sessionId;
    let userId;
    let certificationCenterId;

    beforeEach(() => {
      ({ id: sessionId, certificationCenterId } = databaseBuilder.factory.buildSession());

      return databaseBuilder.commit();
    });

    context('when user has no access to session resources', () => {

      beforeEach(() => {
        userId = databaseBuilder.factory.buildUser().id;
        return databaseBuilder.commit();
      });

      it('should return 404 HTTP status code (to keep opacity on whether forbidden or not found)', async () => {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/sessions/${sessionId}/certification-candidates`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(404);
      });

    });

    context('when user has access to session resources', () => {
      let expectedCertificationCandidateAttributes;

      beforeEach(() => {
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId });
        _.times(5, databaseBuilder.factory.buildCertificationCandidate());
        expectedCertificationCandidateAttributes = {
          'first-name': certificationCandidate.firstName,
          'last-name': certificationCandidate.lastName,
          'birthdate': certificationCandidate.birthdate,
          'birth-city': certificationCandidate.birthCity,
          'birth-province-code': certificationCandidate.birthProvinceCode,
          'birth-country': certificationCandidate.birthCountry,
          'email': certificationCandidate.email,
          'external-id': certificationCandidate.externalId,
          'extra-time-percentage': certificationCandidate.extraTimePercentage,
          'is-linked': true,
        };
        userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

        return databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/sessions/${sessionId}/certification-candidates`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return the expected data', async () => {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/sessions/${sessionId}/certification-candidates`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.result.data[0].attributes).to.deep.equal(expectedCertificationCandidateAttributes);
      });

    });

  });

});
