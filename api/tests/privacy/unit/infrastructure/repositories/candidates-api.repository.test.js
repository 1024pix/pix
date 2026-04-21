import { hasBeenCandidate } from '../../../../../src/privacy/infrastructure/repositories/candidates-api.repository.js';

describe('Unit | Privacy | Infrastructure | Repositories | candidates-api', function () {
  describe('#hasBeenCandidate', function () {
    it('indicates if user has been a candidate to certification', async function () {
      // given
      const dependencies = {
        candidatesApi: {
          hasBeenCandidate: async () => true,
        },
      };

      // when
      const result = await hasBeenCandidate({ userId: '123', dependencies });

      // then
      expect(result).to.be.true;
    });
  });
});
