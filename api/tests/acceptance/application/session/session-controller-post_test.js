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
      const pixMaster = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: 'Tour Gamma' }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: pixMaster.id, certificationCenterId });
      options = {
        method: 'POST',
        url: '/api/sessions',
        payload: {
          data: {
            type: 'sessions',
            attributes: {
              'certification-center': 'Tour Gamma',
              'certification-center-id': certificationCenterId,
              address: 'Nice',
              room: '28D',
              examiner: 'Michel Essentiel',
              date: '2017-12-08',
              time: '14:30',
              description: ''
            }
          }
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(pixMaster.id) },
      };
      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
      return knex('sessions').delete();
    });

    it('should return an OK status after saving in database', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => {
          expect(response.statusCode).to.equal(200);
        })
        .then(() => knex('sessions').select())
        .then((sessions) => {
          expect(sessions).to.have.lengthOf(1);
        });
    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

    });

  });

});
