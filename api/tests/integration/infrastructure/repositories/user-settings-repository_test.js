import { expect, databaseBuilder, domainBuilder, knex, catchErr } from '../../../test-helper.js';
import * as userSettingsRepository from '../../../../lib/infrastructure/repositories/user-settings-repository.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Integration | Repository | user-settings-repository', function () {
  afterEach(function () {
    return knex('user-settings').delete();
  });

  describe('#get', function () {
    it('should return the user settings related to userId', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const expectedUserSettingsId = databaseBuilder.factory.buildUserSettings({ userId, color: 'blue' }).id;
      await databaseBuilder.commit();

      // when
      const userSettings = await userSettingsRepository.get(userId);

      // then
      expect(userSettings.id).to.equal(expectedUserSettingsId);
    });

    it('should return null if user does not have user settings', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserSettings({ userId, color: 'blue' }).id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(userSettingsRepository.get)(otherUserId);

      // then
      expect(error).to.be.an.instanceof(NotFoundError);
    });
  });

  describe('#save', function () {
    describe('when user settings does not exists yet', function () {
      it('should save user settings', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        const userSettings = domainBuilder.buildUserSettings({ userId, color: 'blue' });

        // when
        await userSettingsRepository.save(userSettings);

        // then
        const savedUserSettings = await knex('user-settings').where({ userId }).first();
        expect(savedUserSettings.color).to.equal('blue');
      });
    });
  });

  describe('when user settings does exists', function () {
    it('should update user settings', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const userSettingsId = databaseBuilder.factory.buildUserSettings({ userId, color: 'blue' }).id;
      await databaseBuilder.commit();
      const userSettings = domainBuilder.buildUserSettings({ userSettingsId, userId, color: 'green' });

      // when
      await userSettingsRepository.save(userSettings);

      // then
      const savedUserSettings = await knex('user-settings').where({ userId }).first();
      expect(savedUserSettings.color).to.equal('green');
    });
  });
});
