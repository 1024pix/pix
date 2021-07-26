const { sinon, expect, databaseBuilder, generateValidRequestAuthorizationHeader, knex } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-enroll-students-to-session', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('#enrollStudentsToSession', () => {
    let options;
    let payload;
    let userId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      options = {
        method: 'POST',
        url: '/api/sessions/1/enroll-students-to-session',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      return databaseBuilder.commit();
    });

    context('when user is not authenticated', () => {

      beforeEach(() => {
        options = {
          method: 'PUT',
          url: '/api/sessions/1/enroll-students-to-session',
          headers: { authorization: 'invalid.access.token' },
        };
      });

      it('should respond with a 401 - unauthorized access', async () => {

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

    });

    context('when session id is not an integer', () => {

      beforeEach(() => {
        options = {
          method: 'PUT',
          url: '/api/sessions/2.1/enroll-students-to-session',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
      });

      it('should respond with a 400 - Bad Request', async () => {

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
        expect(response.result.errors[0].title).to.equal('Bad Request');
      });

    });

    context('when user is authenticated', () => {
      let sessionId;
      let student;
      let country;
      const birthCityCode = 'Detroit313';
      const FRANCE_INSEE_CODE = '99100';
      const FRANCE_SCHOOLING_REGISTRATION_INSEE_CODE = '100';

      afterEach(() => {
        return knex('certification-candidates').delete();
      });

      beforeEach(async () => {
        const { id: certificationCenterId, externalId } = databaseBuilder.factory.buildCertificationCenter();

        sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          externalId,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        country = databaseBuilder.factory.buildCertificationCpfCountry({ code: FRANCE_INSEE_CODE, commonName: 'FRANCE', originalName: 'FRANCE' });

        student = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId,
          birthCityCode,
          birthCountryCode: FRANCE_SCHOOLING_REGISTRATION_INSEE_CODE,
        });

        await databaseBuilder.commit();
        payload = {
          data: {
            attributes: {
              'student-ids': [student.id],
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

      it('should respond with a 201', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        sinon.assert.match(response.result, {
          data: [
            {
              'attributes': {
                'birth-city': student.birthCity,
                'birthdate': student.birthdate,
                'first-name': student.firstName,
                'birth-country': country.commonName,
                'is-linked': false,
                'last-name': student.lastName,
                'birth-province-code': null,
                'birth-insee-code': birthCityCode,
                'birth-postal-code': null,
                'email': null,
                'external-id': null,
                'extra-time-percentage': null,
                'result-recipient-email': null,
                'schooling-registration-id': student.id,
                'sex': 'M',
              },
              'id': sinon.match.string,
              'type': 'certification-candidates',
            }],
        });
      });

    });
  });
});
