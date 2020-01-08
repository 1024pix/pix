const { expect, knex, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-post', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /sessions', () => {
    let options;

    beforeEach(() => {
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: 'Tour Gamma' }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      options = {
        method: 'POST',
        url: '/api/sessions',
        payload: {
          data: {
            type: 'sessions',
            attributes: {
              address: 'Nice',
              date: '2017-12-08',
              description: '',
              examiner: 'Michel Essentiel',
              room: '28D',
              time: '14:30',
            },
            relationships: {
              'certification-center': {
                data: {
                  type: 'certification-centers',
                  id: certificationCenterId,
                },
              },
            },
          }
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('sessions').delete();
    });

    it('should return an OK status after saving in database', async () => {
      // when
      const response = await server.inject(options);

      // then
      const sessions = await knex('sessions').select();
      expect(response.statusCode).to.equal(200);
      expect(sessions).to.have.lengthOf(1);
    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
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
