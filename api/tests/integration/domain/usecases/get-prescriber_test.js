import { expect, databaseBuilder, knex } from '../../../test-helper';
import prescriberRepository from '../../../../lib/infrastructure/repositories/prescriber-repository';
import membershipRepository from '../../../../lib/infrastructure/repositories/membership-repository';
import userOrgaSettingsRepository from '../../../../lib/infrastructure/repositories/user-orga-settings-repository';
import getPrescriber from '../../../../lib/domain/usecases/get-prescriber';

describe('Integration | UseCases | get-prescriber', function () {
  context('When prescriber does not have a userOrgaSettings', function () {
    afterEach(function () {
      return knex('user-orga-settings').delete();
    });

    it("should create it with the first membership's organization", async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const firstMembership = databaseBuilder.factory.buildMembership({ userId });
      databaseBuilder.factory.buildMembership({ userId });
      await databaseBuilder.commit();

      // when
      const prescriber = await getPrescriber({
        userId,
        prescriberRepository,
        membershipRepository,
        userOrgaSettingsRepository,
      });

      // then
      const userOrgaSettingsInDB = await knex('user-orga-settings')
        .where({ userId, currentOrganizationId: firstMembership.organizationId })
        .select('*');
      expect(userOrgaSettingsInDB).to.exist;
      expect(prescriber.userOrgaSettings).to.exist;
      expect(prescriber.userOrgaSettings.currentOrganization.id).to.equal(firstMembership.organizationId);
    });
  });

  context('When prescriber has a userOrgaSettings', function () {
    it("should return the prescriber's userOrgaSettings", async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const membership = databaseBuilder.factory.buildMembership({ userId });
      const userOrgaSettings = databaseBuilder.factory.buildUserOrgaSettings({
        userId,
        currentOrganizationId: membership.organizationId,
      });
      await databaseBuilder.commit();

      // when
      const prescriber = await getPrescriber({
        userId,
        prescriberRepository,
        membershipRepository,
        userOrgaSettingsRepository,
      });

      // then
      expect(prescriber.userOrgaSettings).to.exist;
      expect(prescriber.userOrgaSettings.id).to.equal(userOrgaSettings.id);
    });

    context("When the currentOrganization does not belong to prescriber's memberships anymore", function () {
      it("should update the prescriber's userOrgaSettings with the organization of the first membership", async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const firstMembership = databaseBuilder.factory.buildMembership({ userId });
        databaseBuilder.factory.buildMembership({ userId });
        databaseBuilder.factory.buildUserOrgaSettings({ userId });
        await databaseBuilder.commit();

        // when
        const prescriber = await getPrescriber({
          userId,
          prescriberRepository,
          membershipRepository,
          userOrgaSettingsRepository,
        });

        // then
        const userOrgaSettingsInDB = await knex('user-orga-settings')
          .where({ userId, currentOrganizationId: firstMembership.organizationId })
          .select('*');
        expect(userOrgaSettingsInDB).to.exist;
        expect(prescriber.userOrgaSettings).to.exist;
        expect(prescriber.userOrgaSettings.currentOrganization.id).to.equal(firstMembership.organizationId);
      });
    });
  });
});
