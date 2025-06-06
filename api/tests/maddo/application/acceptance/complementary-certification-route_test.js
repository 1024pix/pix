import { createMaddoServer, databaseBuilder, expect } from '../../../test-helper.js';

describe('Acceptance | Maddo | Route | Complementary Certification', function () {
  let server;

  beforeEach(async function () {
    server = await createMaddoServer();
  });

  describe('GET /api/complementary-certification/{scope}', function () {
    it('returns all challenges of the given scope with calibration', async function () {
      // given
      // sur datawharehouse
      const challengePremier = databaseBuilder.factory.buildChallenge({ alpha: 12, delta: 13 });
      const challengeSecond = databaseBuilder.factory.buildChallenge({ alpha: 11, delta: 14 });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/complementary-certification/droit',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal([
        new Challenge({ id: challengePremier.id, alpha: 12, delta: 13 }),
        new Challenge({ id: challengeSecond.id, alpha: 11, delta: 14 }),
      ]);
    });
  });
});
