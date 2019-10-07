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

    afterEach(() => databaseBuilder.clean());

    context('when user has no access to session resources', () => {

      beforeEach(() => {
        userId = databaseBuilder.factory.buildUser().id;
        return databaseBuilder.commit();
      });

      it('should return 403 HTTP status code', async () => {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/sessions/${sessionId}/certification-candidates`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(403);
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
          // TODO : Handle date type correctly
          //'birthdate': certificationCandidate.birthdate,
          'birth-city': certificationCandidate.birthCity,
          'birth-province-code': certificationCandidate.birthProvinceCode,
          'birth-country': certificationCandidate.birthCountry,
          'external-id': certificationCandidate.externalId,
          'extra-time-percentage': certificationCandidate.extraTimePercentage,
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
        expect(_.omit(response.result.data[0].attributes, 'birthdate')).to.deep.equal(expectedCertificationCandidateAttributes);
      });

    });

  });

});
