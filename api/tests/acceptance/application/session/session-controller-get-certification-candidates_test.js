import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import createServer from '../../../../server';
import _ from 'lodash';

describe('Acceptance | Controller | session-controller-get-certification-candidates', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /sessions/{id}/certification-candidates', function () {
    let sessionId;
    let userId;
    let certificationCenterId;

    beforeEach(function () {
      ({ id: sessionId, certificationCenterId } = databaseBuilder.factory.buildSession());

      return databaseBuilder.commit();
    });

    context('when user has no access to session resources', function () {
      beforeEach(function () {
        userId = databaseBuilder.factory.buildUser().id;
        return databaseBuilder.commit();
      });

      it('should return 404 HTTP status code (to keep opacity on whether forbidden or not found)', async function () {
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

    context('when user has access to session resources', function () {
      let expectedCertificationCandidateAAttributes;
      let expectedCertificationCandidateBAttributes;

      beforeEach(function () {
        const certificationCandidateA = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'A',
          sessionId,
        });
        const certificationCandidateB = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'B',
          sessionId,
        });
        _.times(5, databaseBuilder.factory.buildCertificationCandidate());
        expectedCertificationCandidateAAttributes = {
          'first-name': certificationCandidateA.firstName,
          'last-name': certificationCandidateA.lastName,
          'billing-mode': '',
          'prepayment-code': null,
          birthdate: certificationCandidateA.birthdate,
          'birth-city': certificationCandidateA.birthCity,
          'birth-province-code': certificationCandidateA.birthProvinceCode,
          'birth-country': certificationCandidateA.birthCountry,
          email: certificationCandidateA.email,
          'result-recipient-email': certificationCandidateA.resultRecipientEmail,
          'external-id': certificationCandidateA.externalId,
          'extra-time-percentage': certificationCandidateA.extraTimePercentage,
          'is-linked': true,
          'organization-learner-id': null,
          sex: certificationCandidateA.sex,
          'birth-insee-code': certificationCandidateA.birthINSEECode,
          'birth-postal-code': certificationCandidateA.birthPostalCode,
          'complementary-certifications': [],
        };
        expectedCertificationCandidateBAttributes = {
          'first-name': certificationCandidateB.firstName,
          'last-name': certificationCandidateB.lastName,
          'billing-mode': '',
          'prepayment-code': null,
          birthdate: certificationCandidateB.birthdate,
          'birth-city': certificationCandidateB.birthCity,
          'birth-province-code': certificationCandidateB.birthProvinceCode,
          'birth-country': certificationCandidateB.birthCountry,
          email: certificationCandidateB.email,
          'result-recipient-email': certificationCandidateB.resultRecipientEmail,
          'external-id': certificationCandidateB.externalId,
          'extra-time-percentage': certificationCandidateB.extraTimePercentage,
          'is-linked': true,
          'organization-learner-id': null,
          sex: certificationCandidateB.sex,
          'birth-insee-code': certificationCandidateB.birthINSEECode,
          'birth-postal-code': certificationCandidateB.birthPostalCode,
          'complementary-certifications': [],
        };
        userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

        return databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', async function () {
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

      it('should return the expected data', async function () {
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
