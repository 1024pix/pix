import * as userRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/user-repository.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | certification | enrolment | User', function () {
  describe('#get', function () {
    const userId = 123;
    const lang = 'MaLangueTropBien';

    beforeEach(async function () {
      databaseBuilder.factory.buildUser({
        id: userId,
        lang,
      });
      await databaseBuilder.commit();
    });

    it('should return user if found', async function () {
      // when
      const foundUser = await userRepository.get({ id: userId });

      // then
      expect(foundUser).to.deepEqualInstance(
        domainBuilder.certification.enrolment.buildUser({
          id: userId,
          lang,
        }),
      );
    });

    it('should return null if user not found', async function () {
      // when
      const notFoundUser = await userRepository.get({ id: userId + 1 });

      // then
      expect(notFoundUser).to.be.null;
    });
  });
});
