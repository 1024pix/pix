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
      let expectedCertificationCandidateAAttributes;
      let expectedCertificationCandidateBAttributes;

      beforeEach(() => {
        const certificationCandidateA = databaseBuilder.factory.buildCertificationCandidate({ lastName: 'A', sessionId });
        const certificationCandidateB = databaseBuilder.factory.buildCertificationCandidate({ lastName: 'B', sessionId });
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ sessionId, userId: certificationCandidateB.userId }).id;
        _.times(5, databaseBuilder.factory.buildCertificationCandidate());
        expectedCertificationCandidateAAttributes = {
          'first-name': certificationCandidateA.firstName,
          'last-name': certificationCandidateA.lastName,
          'birthdate': certificationCandidateA.birthdate,
          'birth-city': certificationCandidateA.birthCity,
          'birth-province-code': certificationCandidateA.birthProvinceCode,
          'birth-country': certificationCandidateA.birthCountry,
          'email': certificationCandidateA.email,
          'external-id': certificationCandidateA.externalId,
          'extra-time-percentage': certificationCandidateA.extraTimePercentage,
          'is-linked': true,
          'certification-course-id': undefined,
        };
        expectedCertificationCandidateBAttributes = {
          'first-name': certificationCandidateB.firstName,
          'last-name': certificationCandidateB.lastName,
          'birthdate': certificationCandidateB.birthdate,
          'birth-city': certificationCandidateB.birthCity,
          'birth-province-code': certificationCandidateB.birthProvinceCode,
          'birth-country': certificationCandidateB.birthCountry,
          'email': certificationCandidateB.email,
          'external-id': certificationCandidateB.externalId,
          'extra-time-percentage': certificationCandidateB.extraTimePercentage,
          'is-linked': true,
          'certification-course-id': certificationCourseId,
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
        expect(response.result.data[0].attributes).to.deep.equal(expectedCertificationCandidateAAttributes);
        expect(response.result.data[1].attributes).to.deep.equal(expectedCertificationCandidateBAttributes);
      });

    });

  });

});
