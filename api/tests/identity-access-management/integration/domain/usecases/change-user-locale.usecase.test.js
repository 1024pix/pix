import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCase | change-user-locale', function () {
  it('updates user "lang" and "locale" attributes', async function () {
    // given
    const userId = databaseBuilder.factory.buildUser({ lang: 'fr', locale: 'fr-FR' }).id;
    await databaseBuilder.commit();

    // when
    const updatedUser = await usecases.changeUserLocale({ userId, locale: 'nl-BE' });

    // then
    expect(updatedUser.locale).to.equals('nl-BE');
    expect(updatedUser.lang).to.equals('nl');
  });
});
