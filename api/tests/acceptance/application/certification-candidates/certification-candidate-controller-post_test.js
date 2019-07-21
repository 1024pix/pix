const { expect, knex, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | certification-candidate-controller-post', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/certification-candidates', () => {
    let options;

    beforeEach(() => {
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      options = {
        method: 'POST',
        url: '/api/certification-candidates',
        payload: {
          data: {
            type: 'certificationCandidates',
            attributes: {
              'first-name': 'Joel',
              'last-name': 'Robuchon',
              'birth-city': 'Lyon',
              'birth-province': '69',
              'birth-country': 'France',
              'birthdate': '05/05/2005',
              'external-id': 'ABC123PUREE',
              'extra-time-percentage': 20,
              'created-at': null,
            },
            relationships: {
              session: {
                data: {
                  id: sessionId,
                  type: 'sessions',
                }
              }
            }
          }
        },
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
      };
      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
      return knex('certification-candidates').delete();
    });

    it('should return an OK status after saving certification candidate in database', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const certificationCandidates = await knex('certification-candidates').select();
      expect(certificationCandidates).to.have.lengthOf(1);
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
