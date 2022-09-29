const { expect, databaseBuilder, knex } = require('../../../test-helper');
const dataProtectionOfficerRepository = require('../../../../lib/infrastructure/repositories/data-protection-officer-repository');

describe('Integration | Repository | data-protection-officer', function () {
  describe('#batchAddDataProtectionOfficerToOrganization', function () {
    afterEach(function () {
      return knex('data-protection-officers').delete();
    });

    it('should add rows in the table "data-protection-officers"', async function () {
      // given
      const firstOrganization = databaseBuilder.factory.buildOrganization();
      const secondOrganization = databaseBuilder.factory.buildOrganization();

      await databaseBuilder.commit();

      const dataProtectionOfficerA = {
        firstName: 'Djamal',
        lastName: 'Dormi',
        email: 'test@example.net',
        organizationId: firstOrganization.id,
      };
      const dataProtectionOfficerB = {
        firstName: 'Alain',
        lastName: 'Terieur',
        email: 'test@example.net',
        organizationId: secondOrganization.id,
      };

      // when
      await dataProtectionOfficerRepository.batchAddDataProtectionOfficerToOrganization([
        dataProtectionOfficerA,
        dataProtectionOfficerB,
      ]);

      // then
      const foundDataProtectionOfficers = await knex('data-protection-officers').select();
      expect(foundDataProtectionOfficers.length).to.equal(2);
      expect(foundDataProtectionOfficers[0]).to.contain({
        ...dataProtectionOfficerA,
        organizationId: firstOrganization.id,
      });
      expect(foundDataProtectionOfficers[1]).to.contain({
        ...dataProtectionOfficerB,
        organizationId: secondOrganization.id,
      });
    });
  });
});
