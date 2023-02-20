import { sinon, expect, databaseBuilder, generateValidRequestAuthorizationHeader, knex } from '../../../test-helper';

import createServer from '../../../../server';

describe('Acceptance | Controller | session-controller-enroll-students-to-session', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('#enrollStudentsToSession', function () {
    let options;
    let payload;
    let userId;

    beforeEach(function () {
      userId = databaseBuilder.factory.buildUser().id;
      options = {
        method: 'POST',
        url: '/api/sessions/1/enroll-students-to-session',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      return databaseBuilder.commit();
    });

    context('when user is not authenticated', function () {
      beforeEach(function () {
        options = {
          method: 'PUT',
          url: '/api/sessions/1/enroll-students-to-session',
          headers: { authorization: 'invalid.access.token' },
        };
      });

      it('should respond with a 401 - unauthorized access', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when session id is not an integer', function () {
      beforeEach(function () {
        options = {
          method: 'PUT',
          url: '/api/sessions/2.1/enroll-students-to-session',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
      });

      it('should respond with a 400 - Bad Request', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
        expect(response.result.errors[0].title).to.equal('Bad Request');
      });
    });

    context('when user is authenticated', function () {
      let sessionId;
      let organizationLearner;
      let country;
      const birthCityCode = 'Detroit313';
      const FRANCE_INSEE_CODE = '99100';
      const FRANCE_ORGANIZATION_LEARNER_INSEE_CODE = '100';

      afterEach(function () {
        return knex('certification-candidates').delete();
      });

      beforeEach(async function () {
        const { id: certificationCenterId, externalId } = databaseBuilder.factory.buildCertificationCenter({
          type: 'SCO',
        });

        sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          externalId,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        country = databaseBuilder.factory.buildCertificationCpfCountry({
          code: FRANCE_INSEE_CODE,
          commonName: 'FRANCE',
          originalName: 'FRANCE',
        });

        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          birthCityCode,
          birthCountryCode: FRANCE_ORGANIZATION_LEARNER_INSEE_CODE,
        });

        await databaseBuilder.commit();
        payload = {
          data: {
            attributes: {
              'organization-learner-ids': [organizationLearner.id],
            },
          },
        };
        options = {
          method: 'PUT',
          url: `/api/sessions/${sessionId}/enroll-students-to-session`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload,
        };
      });

      it('should respond with a 201', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        sinon.assert.match(response.result, {
          data: [
            {
              attributes: {
                'billing-mode': '',
                'prepayment-code': null,
                'birth-city': organizationLearner.birthCity,
                birthdate: organizationLearner.birthdate,
                'first-name': organizationLearner.firstName,
                'birth-country': country.commonName,
                'is-linked': false,
                'last-name': organizationLearner.lastName,
                'birth-province-code': null,
                'birth-insee-code': birthCityCode,
                'birth-postal-code': null,
                email: null,
                'external-id': null,
                'extra-time-percentage': null,
                'result-recipient-email': null,
                'organization-learner-id': organizationLearner.id,
                sex: 'M',
                'complementary-certifications': [],
              },
              id: sinon.match.string,
              type: 'certification-candidates',
            },
          ],
        });
      });
    });
  });
});
