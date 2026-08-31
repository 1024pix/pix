import { expect } from 'chai';

import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCase | create-user', function () {
  it('returns the saved user', async function () {
    // given
    const pixAppTos = databaseBuilder.factory.buildPixAppTos();
    await databaseBuilder.commit();

    const userData = { firstName: 'First', lastName: 'Last', email: 'first.last@example.net', cgu: true };
    const user = new User(userData);
    const password = 'P@ssW0rd';

    // when
    const savedUser = await usecases.createUser({ password, user, i18n: getI18n() });

    // then
    expect(savedUser).to.be.instanceOf(User);
    expect(savedUser).to.include(userData);
    expect(savedUser.cgu).to.be.true;
    expect(savedUser.lastTermsOfServiceValidatedAt).to.be.instanceOf(Date);

    const legalDocumentAcceptation = await knex('legal-document-version-user-acceptances')
      .where({ userId: savedUser.id })
      .first();
    expect(legalDocumentAcceptation.legalDocumentVersionId).to.equal(pixAppTos.id);
  });
});
