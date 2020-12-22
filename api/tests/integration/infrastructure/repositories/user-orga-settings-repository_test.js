const _ = require('lodash');

const { catchErr, expect, knex, databaseBuilder } = require('../../../test-helper');

const UserOrgaSettings = require('../../../../lib/domain/models/UserOrgaSettings');
const BookshelfUserOrgaSettings = require('../../../../lib/infrastructure/data/user-orga-settings');
const { UserOrgaSettingsCreationError } = require('../../../../lib/domain/errors');

const userOrgaSettingsRepository = require('../../../../lib/infrastructure/repositories/user-orga-settings-repository');

describe('Integration | Repository | UserOrgaSettings', function() {

  const USER_PICKED_PROPERTIES = ['id', 'firstName', 'lastName', 'email', 'username', 'cgu',
    'pixOrgaTermsOfServiceAccepted', 'pixCertifTermsOfServiceAccepted'];

  const ORGANIZATION_OMITTED_PROPERTIES = ['memberships', 'organizationInvitations', 'students', 'targetProfileShares', 'email', 'tags',
    'createdAt', 'updatedAt'];

  let user;
  let organization;

  beforeEach(async () => {
    user = databaseBuilder.factory.buildUser();
    organization = databaseBuilder.factory.buildOrganization();
    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await knex('user-orga-settings').delete();
  });

  describe('#create', () => {

    it('should return an UserOrgaSettings domain object', async () => {
      // when
      const userOrgaSettingsSaved = await userOrgaSettingsRepository.create(user.id, organization.id);

      // then
      expect(userOrgaSettingsSaved).to.be.an.instanceof(UserOrgaSettings);
    });

    it('should add a row in the table "user-orga-settings"', async () => {
      // given
      const nbBeforeCreation = await BookshelfUserOrgaSettings.count();

      // when
      await userOrgaSettingsRepository.create(user.id, organization.id);

      // then
      const nbAfterCreation = await BookshelfUserOrgaSettings.count();
      expect(nbAfterCreation).to.equal(nbBeforeCreation + 1);
    });

    it('should save model properties', async () => {
      // when
      const userOrgaSettingsSaved = await userOrgaSettingsRepository.create(user.id, organization.id);

      // then
      expect(userOrgaSettingsSaved.id).to.not.be.undefined;
      expect(_.pick(userOrgaSettingsSaved.user, USER_PICKED_PROPERTIES)).to.deep.equal(_.pick(user, USER_PICKED_PROPERTIES));
      expect(_.omit(userOrgaSettingsSaved.currentOrganization, ORGANIZATION_OMITTED_PROPERTIES)).to.deep.equal(_.omit(organization, ORGANIZATION_OMITTED_PROPERTIES));
    });

    it('should throw a UserOrgaSettingsCreationError when userOrgaSettings already exist', async () => {
      // given
      databaseBuilder.factory.buildUserOrgaSettings({ userId: user.id, currentOrganizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(userOrgaSettingsRepository.create)(user.id, organization.id);

      // then
      expect(error).to.be.instanceOf(UserOrgaSettingsCreationError);
    });
  });

  describe('#update', () => {

    let userOrgaSettingsId;
    let expectedOrganization;

    beforeEach(async () => {
      userOrgaSettingsId = databaseBuilder.factory.buildUserOrgaSettings({ userId: user.id, currentOrganizationId: organization.id }).id;
      expectedOrganization = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();
    });

    it('should return the updated userOrgaSettings', async () => {
      // when
      const updatedUserOrgaSettings = await userOrgaSettingsRepository.update(user.id, expectedOrganization.id);

      // then
      expect(updatedUserOrgaSettings.id).to.deep.equal(userOrgaSettingsId);
      expect(_.pick(updatedUserOrgaSettings.user, USER_PICKED_PROPERTIES)).to.deep.equal(_.pick(user, USER_PICKED_PROPERTIES));
      expect(_.omit(updatedUserOrgaSettings.currentOrganization, ORGANIZATION_OMITTED_PROPERTIES)).to.deep.equal(_.omit(expectedOrganization, ORGANIZATION_OMITTED_PROPERTIES));
    });
  });

  describe('#findOneByUserId', () => {

    let userOrgaSettingsId;

    beforeEach(async () => {
      userOrgaSettingsId = databaseBuilder.factory.buildUserOrgaSettings({ userId: user.id, currentOrganizationId: organization.id }).id;
      await databaseBuilder.commit();
    });

    it('should return an UserOrgaSettings domain object', async () => {
      // when
      const foundUserOrgaSettings = await userOrgaSettingsRepository.findOneByUserId(user.id);

      // then
      expect(foundUserOrgaSettings).to.be.an.instanceof(UserOrgaSettings);
    });

    it('should return the userOrgaSettings belonging to user', async () => {
      // when
      const foundUserOrgaSettings = await userOrgaSettingsRepository.findOneByUserId(user.id);

      // then
      expect(foundUserOrgaSettings.id).to.deep.equal(userOrgaSettingsId);
      expect(_.pick(foundUserOrgaSettings.user, USER_PICKED_PROPERTIES)).to.deep.equal(_.pick(user, USER_PICKED_PROPERTIES));
      expect(_.omit(foundUserOrgaSettings.currentOrganization, ORGANIZATION_OMITTED_PROPERTIES)).to.deep.equal(_.omit(organization, ORGANIZATION_OMITTED_PROPERTIES));
    });

    it('should return empty object when user-orga-settings doesn\'t exists', async () => {
      // when
      const foundUserOrgaSettings = await userOrgaSettingsRepository.findOneByUserId(user.id + 1);

      // then
      expect(foundUserOrgaSettings).to.deep.equal({});
    });
  });
});
