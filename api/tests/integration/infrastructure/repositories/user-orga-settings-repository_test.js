const { catchErr, expect, knex, databaseBuilder } = require('../../../test-helper');
const UserOrgaSettings = require('../../../../lib/domain/models/UserOrgaSettings');
const BookshelfUserOrgaSettings = require('../../../../lib/infrastructure/data/user-orga-settings');
const userOrgaSettingsRepository = require('../../../../lib/infrastructure/repositories/user-orga-settings-repository');
const { UserOrgaSettingsCreationError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | UserOrgaSettings', function() {

  let userId;
  let organizationId;

  beforeEach(async () => {
    userId = databaseBuilder.factory.buildUser().id;
    organizationId = databaseBuilder.factory.buildOrganization().id;
    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await knex('user-orga-settings').delete();
  });

  describe('#create', () => {

    it('should return an UserOrgaSettings domain object', async () => {
      // when
      const userOrgaSettingsSaved = await userOrgaSettingsRepository.create(userId, organizationId);

      // then
      expect(userOrgaSettingsSaved).to.be.an.instanceof(UserOrgaSettings);
    });

    it('should add a row in the table "user-orga-settings"', async () => {
      // given
      const nbBeforeCreation = await BookshelfUserOrgaSettings.count();

      // when
      await userOrgaSettingsRepository.create(userId, organizationId);

      // then
      const nbAfterCreation = await BookshelfUserOrgaSettings.count();
      expect(nbAfterCreation).to.equal(nbBeforeCreation + 1);
    });

    it('should save model properties', async () => {
      // when
      const userOrgaSettingsSaved = await userOrgaSettingsRepository.create(userId, organizationId);

      // then
      expect(userOrgaSettingsSaved.id).to.not.be.undefined;
      expect(userOrgaSettingsSaved.user.id).to.equal(userId);
      expect(userOrgaSettingsSaved.currentOrganization.id).to.equal(organizationId);
    });

    it('should throw a UserOrgaSettingsCreationError when userOrgaSettings already exist', async () => {
      // given
      databaseBuilder.factory.buildUserOrgaSettings({ userId, currentOrganizationId: organizationId });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(userOrgaSettingsRepository.create)(userId, organizationId);

      // then
      expect(error).to.be.instanceOf(UserOrgaSettingsCreationError);
    });
  });

});
