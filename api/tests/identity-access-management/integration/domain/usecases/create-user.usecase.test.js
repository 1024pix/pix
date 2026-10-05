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

    const expectedUserData = {
      firstName: 'First',
      lastName: 'Last',
      email: 'first.last@example.net',
    };
    const userData = {
      ...expectedUserData,
      hasAcceptedLegalDocuments: true,
    };
    const user = new User(userData);
    const password = 'P@ssW0rd';

    // when
    const savedUser = await usecases.createUser({ password, user, i18n: getI18n() });

    // then
    expect(savedUser).to.be.instanceOf(User);
    expect(savedUser).to.include(expectedUserData);
    expect(savedUser).to.have.property('lastDataProtectionPolicySeenAt').that.is.instanceOf(Date);

    const legalDocumentAcceptance = await knex('legal-document-version-user-acceptances')
      .where({ userId: savedUser.id })
      .first();
    expect(legalDocumentAcceptance.legalDocumentVersionId).to.equal(pixAppTos.id);
  });
});
