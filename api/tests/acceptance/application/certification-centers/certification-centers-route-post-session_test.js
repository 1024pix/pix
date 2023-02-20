import { expect, knex, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Controller | certification-centers-controller-post-session', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /certification-centers/{certificationCenterId}/session', function () {
    let options;

    beforeEach(function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: 'Tour Gamma' }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      options = {
        method: 'POST',
        url: `/api/certification-centers/${certificationCenterId}/session`,
        payload: {
          data: {
            type: 'sessions',
            attributes: {
              'certification-center-id': certificationCenterId,
              address: 'Nice',
              date: '2017-12-08',
              description: '',
              examiner: 'Michel Essentiel',
              room: '28D',
              time: '14:30',
            },
          },
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      return databaseBuilder.commit();
    });

    afterEach(function () {
      return knex('sessions').delete();
    });

    it('should return an OK status after saving in database', async function () {
      // when
      const response = await server.inject(options);

      // then
      const sessions = await knex('sessions').select();
      expect(response.statusCode).to.equal(200);
      expect(sessions).to.have.lengthOf(1);
    });

    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
