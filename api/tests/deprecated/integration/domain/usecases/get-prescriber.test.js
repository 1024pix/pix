import { expect } from 'chai';

import { usecases } from '../../../../../src/deprecated/domain/usecases/index.js';
import { UserHasNoOrganizationMembershipError } from '../../../../../src/team/domain/errors.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Deprecated | Integration | Domain | UseCases | get-prescriber', function () {
  context('When prescriber does not have a userOrgaSettings', function () {
    it("should create it with the first membership's organization", async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const firstMembership = databaseBuilder.factory.buildMembership({ userId });
      databaseBuilder.factory.buildMembership({ userId });
      await databaseBuilder.commit();

      // when
      const prescriber = await usecases.getPrescriber({ userId });

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
      const prescriber = await usecases.getPrescriber({ userId });

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
        const prescriber = await usecases.getPrescriber({ userId });

        // then
        const userOrgaSettingsInDB = await knex('user-orga-settings')
          .where({ userId, currentOrganizationId: firstMembership.organizationId })
          .select('*');
        expect(userOrgaSettingsInDB).to.exist;
        expect(prescriber.userOrgaSettings).to.exist;
        expect(prescriber.userOrgaSettings.currentOrganization.id).to.equal(firstMembership.organizationId);
      });
    });

    context('When the membership on the currentOrganization has been disabled', function () {
      it("should update the prescriber's userOrgaSettings with the organization of the first active membership", async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const disabledMembership = databaseBuilder.factory.buildMembership({ userId, disabledAt: new Date() });
        const activeMembership = databaseBuilder.factory.buildMembership({ userId });
        databaseBuilder.factory.buildUserOrgaSettings({
          userId,
          currentOrganizationId: disabledMembership.organizationId,
        });
        await databaseBuilder.commit();

        // when
        const prescriber = await usecases.getPrescriber({ userId });

        // then
        const userOrgaSettingsInDB = await knex('user-orga-settings').where({ userId }).first();
        expect(userOrgaSettingsInDB.currentOrganizationId).to.equal(activeMembership.organizationId);
        expect(prescriber.userOrgaSettings.currentOrganization.id).to.equal(activeMembership.organizationId);
      });
    });

    context('When all the prescriber memberships have been disabled', function () {
      it('should throw a UserHasNoOrganizationMembershipError', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const disabledMembership = databaseBuilder.factory.buildMembership({ userId, disabledAt: new Date() });
        databaseBuilder.factory.buildUserOrgaSettings({
          userId,
          currentOrganizationId: disabledMembership.organizationId,
        });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(usecases.getPrescriber)({ userId });

        // then
        expect(error).to.be.instanceOf(UserHasNoOrganizationMembershipError);
      });
    });
  });
});
