import { expect, databaseBuilder, knex } from '../../../test-helper.js';

import { updateUserColor } from '../../../../lib/domain/usecases/update-user-color.js';
import * as userSettingsRepository from '../../../../lib/infrastructure/repositories/user-settings-repository.js';

describe('Integration | UseCases | updateUserColor', function () {
  afterEach(async function () {
    await knex('user-settings').delete();
  });

  describe('when user settings does not exist', function () {
    it('should set the user color', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      await updateUserColor({ userId, color: 'blue', userSettingsRepository });

      // then
      const userSettings = await knex('user-settings').where({ userId }).first();
      expect(userSettings.color).to.equal('blue');
    });

    it('returns newly created userSettings', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const userSettings = await updateUserColor({ userId, color: 'blue', userSettingsRepository });

      // then
      expect(userSettings.color).to.equal('blue');
    });
  });

  describe('when user settings exist', function () {
    it('should set the user color', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserSettings({ userId, color: 'green' });
      await databaseBuilder.commit();

      // when
      await updateUserColor({ userId, color: 'red', userSettingsRepository });

      // then
      const userSettings = await knex('user-settings').where({ userId }).first();
      expect(userSettings.color).to.equal('red');
    });
  });
});
