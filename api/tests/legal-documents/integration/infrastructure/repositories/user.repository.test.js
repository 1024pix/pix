import * as userRepository from '../../../../../src/legal-documents/infrastructure/repositories/user.repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Legal document | Infrastructure | Repository | user', function () {
  describe('#setPixOrgaCguByUserId', function () {
    it('sets the Pix Orga CGU for a user id', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({
        pixOrgaTermsOfServiceAccepted: false,
        lastPixOrgaTermsOfServiceValidatedAt: null,
      });
      await databaseBuilder.commit();

      // when
      await userRepository.setPixOrgaCguByUserId(user.id);

      // then
      const updatedUser = await knex('users').where('id', user.id).first();
      expect(updatedUser.pixOrgaTermsOfServiceAccepted).to.equal(true);
      expect(updatedUser.lastPixOrgaTermsOfServiceValidatedAt).to.be.a('date');
    });
  });

  describe('#findPixOrgaCgusByUserId', function () {
    it('returns the Pix Orga CGU for a user id', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({
        pixOrgaTermsOfServiceAccepted: true,
        lastPixOrgaTermsOfServiceValidatedAt: new Date('2024-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const userPixOrgaCgu = await userRepository.findPixOrgaCgusByUserId(user.id);

      // then
      expect(userPixOrgaCgu.pixOrgaTermsOfServiceAccepted).to.equal(true);
      expect(userPixOrgaCgu.lastPixOrgaTermsOfServiceValidatedAt).to.deep.equal(new Date('2024-01-01'));
    });

    context('when the user does not exist', function () {
      it('returns null', async function () {
        // when
        const userPixOrgaCgu = await userRepository.findPixOrgaCgusByUserId(123);

        // then
        expect(userPixOrgaCgu).to.be.null;
      });
    });
  });
});
