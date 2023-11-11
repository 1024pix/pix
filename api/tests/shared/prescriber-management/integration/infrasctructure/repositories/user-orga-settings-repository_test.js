import _ from 'lodash';

import { catchErr, expect, databaseBuilder } from '../../../../../test-helper.js';
import { UserOrgaSettings } from '../../../../../../lib/domain/models/UserOrgaSettings.js';
import { BookshelfUserOrgaSettings } from '../../../../../../lib/infrastructure/orm-models/UserOrgaSettings.js';
import { UserOrgaSettingsCreationError } from '../../../../../../lib/domain/errors.js';

import * as userOrgaSettingsRepository from '../../../../../../src/shared/prescriber-management/infrastructure/repositories/user-orga-settings-repository.js';

describe('Integration | Repository | UserOrgaSettings', function () {
  const USER_PICKED_PROPERTIES = [
    'id',
    'firstName',
    'lastName',
    'email',
    'username',
    'cgu',
    'pixOrgaTermsOfServiceAccepted',
    'pixCertifTermsOfServiceAccepted',
  ];

  const ORGANIZATION_OMITTED_PROPERTIES = [
    'memberships',
    'organizationInvitations',
    'students',
    'targetProfileShares',
    'email',
    'tags',
    'createdAt',
    'updatedAt',
    'createdBy',
    'archivedAt',
    'archivedBy',
    'identityProviderForCampaigns',
  ];

  let user;
  let organization;

  beforeEach(async function () {
    user = databaseBuilder.factory.buildUser();
    organization = databaseBuilder.factory.buildOrganization();
    await databaseBuilder.commit();
  });

  describe('#create', function () {
    it('should return an UserOrgaSettings domain object', async function () {
      // when
      const userOrgaSettingsSaved = await userOrgaSettingsRepository.create(user.id, organization.id);

      // then
      expect(userOrgaSettingsSaved).to.be.an.instanceof(UserOrgaSettings);
    });

    it('should add a row in the table "user-orga-settings"', async function () {
      // given
      const nbBeforeCreation = await BookshelfUserOrgaSettings.count();

      // when
      await userOrgaSettingsRepository.create(user.id, organization.id);

      // then
      const nbAfterCreation = await BookshelfUserOrgaSettings.count();
      expect(nbAfterCreation).to.equal(nbBeforeCreation + 1);
    });

    it('should save model properties', async function () {
      // when
      const userOrgaSettingsSaved = await userOrgaSettingsRepository.create(user.id, organization.id);

      // then
      expect(userOrgaSettingsSaved.id).to.not.be.undefined;
      expect(_.pick(userOrgaSettingsSaved.user, USER_PICKED_PROPERTIES)).to.deep.equal(
        _.pick(user, USER_PICKED_PROPERTIES),
      );
      expect(_.omit(userOrgaSettingsSaved.currentOrganization, ORGANIZATION_OMITTED_PROPERTIES)).to.deep.equal(
        _.omit(organization, ORGANIZATION_OMITTED_PROPERTIES),
      );
    });

    it('should throw a UserOrgaSettingsCreationError when userOrgaSettings already exist', async function () {
      // given
      databaseBuilder.factory.buildUserOrgaSettings({ userId: user.id, currentOrganizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(userOrgaSettingsRepository.create)(user.id, organization.id);

      // then
      expect(error).to.be.instanceOf(UserOrgaSettingsCreationError);
    });
  });

  describe('#update', function () {
    let userOrgaSettingsId;
    let expectedOrganization;

    beforeEach(async function () {
      userOrgaSettingsId = databaseBuilder.factory.buildUserOrgaSettings({
        userId: user.id,
        currentOrganizationId: organization.id,
      }).id;
      expectedOrganization = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();
    });

    it('should return the updated userOrgaSettings', async function () {
      // when
      const updatedUserOrgaSettings = await userOrgaSettingsRepository.update(user.id, expectedOrganization.id);

      // then
      expect(updatedUserOrgaSettings.id).to.deep.equal(userOrgaSettingsId);
      expect(_.pick(updatedUserOrgaSettings.user, USER_PICKED_PROPERTIES)).to.deep.equal(
        _.pick(user, USER_PICKED_PROPERTIES),
      );
      expect(_.omit(updatedUserOrgaSettings.currentOrganization, ORGANIZATION_OMITTED_PROPERTIES)).to.deep.equal(
        _.omit(expectedOrganization, ORGANIZATION_OMITTED_PROPERTIES),
      );
    });
  });

  describe('#findOneByUserId', function () {
    let userOrgaSettingsId;

    beforeEach(async function () {
      userOrgaSettingsId = databaseBuilder.factory.buildUserOrgaSettings({
        userId: user.id,
        currentOrganizationId: organization.id,
      }).id;
      await databaseBuilder.commit();
    });

    it('should return an UserOrgaSettings domain object', async function () {
      // when
      const foundUserOrgaSettings = await userOrgaSettingsRepository.findOneByUserId(user.id);

      // then
      expect(foundUserOrgaSettings).to.be.an.instanceof(UserOrgaSettings);
    });

    it('should return the userOrgaSettings belonging to user', async function () {
      // when
      const foundUserOrgaSettings = await userOrgaSettingsRepository.findOneByUserId(user.id);

      // then
      expect(foundUserOrgaSettings.id).to.deep.equal(userOrgaSettingsId);
      expect(_.pick(foundUserOrgaSettings.user, USER_PICKED_PROPERTIES)).to.deep.equal(
        _.pick(user, USER_PICKED_PROPERTIES),
      );
      expect(_.omit(foundUserOrgaSettings.currentOrganization, ORGANIZATION_OMITTED_PROPERTIES)).to.deep.equal(
        _.omit(organization, ORGANIZATION_OMITTED_PROPERTIES),
      );
    });

    it("should return empty object when user-orga-settings doesn't exists", async function () {
      // when
      const foundUserOrgaSettings = await userOrgaSettingsRepository.findOneByUserId(user.id + 1);

      // then
      expect(foundUserOrgaSettings).to.deep.equal({});
    });
  });

  describe('#createOrUpdate', function () {
    describe('when user orga setting does not exist', function () {
      it('should return an UserOrgaSettings domain object', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        // when
        const userOrgaSettingsSaved = await userOrgaSettingsRepository.createOrUpdate({ userId, organizationId });

        // then
        expect(userOrgaSettingsSaved).to.be.an.instanceof(UserOrgaSettings);
        expect(userOrgaSettingsSaved.id).to.not.be.undefined;
        expect(userOrgaSettingsSaved.user.id).to.be.equal(userId);
        expect(userOrgaSettingsSaved.currentOrganization.id).to.be.equal(organizationId);
      });

      it('should add a row in the table "user-orga-settings"', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();
        const nbBeforeCreation = await BookshelfUserOrgaSettings.count();

        // when
        await userOrgaSettingsRepository.createOrUpdate({ userId, organizationId });

        // then
        const nbAfterCreation = await BookshelfUserOrgaSettings.count();
        expect(nbAfterCreation).to.equal(nbBeforeCreation + 1);
      });
    });

    describe('when user orga setting does already exist', function () {
      it('should return the UserOrgaSettings updated', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const newOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildUserOrgaSettings({ userId, currentOrganizationId: otherOrganizationId });
        await databaseBuilder.commit();

        // when
        const userOrgaSettingsSaved = await userOrgaSettingsRepository.createOrUpdate({
          userId,
          organizationId: newOrganizationId,
        });

        // then
        expect(userOrgaSettingsSaved).to.be.an.instanceof(UserOrgaSettings);
        expect(userOrgaSettingsSaved.user.id).to.be.equal(userId);
        expect(userOrgaSettingsSaved.currentOrganization.id).to.be.equal(newOrganizationId);
      });

      it('should not add a row in the table "user-orga-settings"', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildUserOrgaSettings({ userId, currentOrganizationId: organizationId });
        await databaseBuilder.commit();
        const nbBeforeUpdate = await BookshelfUserOrgaSettings.count();

        // when
        await userOrgaSettingsRepository.createOrUpdate({ userId, organizationId });

        // then
        const nbAfterUpdate = await BookshelfUserOrgaSettings.count();
        expect(nbAfterUpdate).to.equal(nbBeforeUpdate);
      });
    });
  });
});
