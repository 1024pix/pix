const { expect, databaseBuilder, knex } = require('../../../test-helper');

const prescriberRepository = require('../../../../lib/infrastructure/repositories/prescriber-repository');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const userOrgaSettingsRepository = require('../../../../lib/infrastructure/repositories/user-orga-settings-repository');

const getPrescriber = require('../../../../lib/domain/usecases/get-prescriber');

describe('Integration | UseCases | get-prescriber', () => {

  context('When prescriber does not have a userOrgaSettings', () => {

    afterEach(() => {
      return knex('user-orga-settings').delete();
    });

    it('should create it with the first membership\'s organization', async() => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const firstMembership = databaseBuilder.factory.buildMembership({ userId });
      databaseBuilder.factory.buildMembership({ userId });
      await databaseBuilder.commit();

      // when
      const prescriber = await getPrescriber({ userId, prescriberRepository, membershipRepository, userOrgaSettingsRepository });

      // then
      const userOrgaSettingsInDB = await knex('user-orga-settings').where({ userId, currentOrganizationId: firstMembership.organizationId }).select('*');
      expect(userOrgaSettingsInDB).to.exist;
      expect(prescriber.userOrgaSettings).to.exist;
      expect(prescriber.userOrgaSettings.currentOrganization.id).to.equal(firstMembership.organizationId);
    });
  });

  context('When prescriber has a userOrgaSettings', () => {

    it('should return the prescriber\'s userOrgaSettings', async() => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const membership = databaseBuilder.factory.buildMembership({ userId });
      const userOrgaSettings = databaseBuilder.factory.buildUserOrgaSettings({ userId, currentOrganizationId: membership.organizationId });
      await databaseBuilder.commit();

      // when
      const prescriber = await getPrescriber({ userId, prescriberRepository, membershipRepository, userOrgaSettingsRepository });

      // then
      expect(prescriber.userOrgaSettings).to.exist;
      expect(prescriber.userOrgaSettings.id).to.equal(userOrgaSettings.id);
    });

    context('When the currentOrganization does not belong to prescriber\'s memberships anymore', () => {

      it('should update the prescriber\'s userOrgaSettings with the organization of the first membership', async() => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const firstMembership = databaseBuilder.factory.buildMembership({ userId });
        databaseBuilder.factory.buildMembership({ userId });
        databaseBuilder.factory.buildUserOrgaSettings({ userId });
        await databaseBuilder.commit();

        // when
        const prescriber = await getPrescriber({ userId, prescriberRepository, membershipRepository, userOrgaSettingsRepository });

        // then
        const userOrgaSettingsInDB = await knex('user-orga-settings').where({ userId, currentOrganizationId: firstMembership.organizationId }).select('*');
        expect(userOrgaSettingsInDB).to.exist;
        expect(prescriber.userOrgaSettings).to.exist;
        expect(prescriber.userOrgaSettings.currentOrganization.id).to.equal(firstMembership.organizationId);
      });
    });
  });

});
