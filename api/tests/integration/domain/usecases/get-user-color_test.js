import { expect, databaseBuilder, knex, catchErr } from '../../../test-helper.js';

import { getUserSettings } from '../../../../lib/domain/usecases/get-user-settings.js';
import * as userSettingsRepository from '../../../../lib/infrastructure/repositories/user-settings-repository.js';

import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Integration | UseCases | getUserSettings', function () {
  afterEach(async function () {
    await knex('user-settings').delete();
  });

  describe('when user settings does not exist', function () {
    it('should return undefined', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(getUserSettings)({ userId, userSettingsRepository });

      // then
      expect(error).to.be.an.instanceof(NotFoundError);
    });
  });

  describe('when user settings exist', function () {
    it('should return user settings', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserSettings({ userId, color: 'green' });
      await databaseBuilder.commit();

      // when
      const userSettings = await getUserSettings({ userId, userSettingsRepository });

      // then
      expect(userSettings.color).to.equal('green');
      expect(userSettings.userId).to.equal(userId);
      expect(userSettings.createdAt).to.be.a('date');
      expect(userSettings.updatedAt).to.be.a('date');
    });
  });
});
