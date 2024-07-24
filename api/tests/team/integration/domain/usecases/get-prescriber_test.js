import * as sharedMembershipRepository from '../../../../../src/shared/infrastructure/repositories/membership-repository.js';
import { getPrescriber } from '../../../../../src/team/domain/usecases/get-prescriber.js';
import { prescriberRepository } from '../../../../../src/team/infrastructure/repositories/prescriber-repository.js';
import { userOrgaSettingsRepository } from '../../../../../src/team/infrastructure/repositories/user-orga-settings-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Team | Domain | UseCases | get-prescriber', function () {
  context('When prescriber does not have a userOrgaSettings', function () {
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
        sharedMembershipRepository,
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
        sharedMembershipRepository,
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
          sharedMembershipRepository,
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
