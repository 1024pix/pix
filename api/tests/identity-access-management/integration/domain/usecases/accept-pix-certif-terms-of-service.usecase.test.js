import { expect } from 'chai';

import { knex } from '../../../../../db/knex-database-connection.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

const { PIX_CERTIF } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Integration | Identity Access Management | Domain | UseCase | accept-pix-certif-terms-of-service', function () {
  it('accepts Pix Certif terms of service and writes information at 2 places, legacy and new', async function () {
    // given
    const legalDocumentVersionId = databaseBuilder.factory.buildLegalDocumentVersion({
      service: PIX_CERTIF,
      type: TOS,
    }).id;
    const userId = databaseBuilder.factory.buildUser({ pixCertifTermsOfServiceAccepted: false }).id;
    await databaseBuilder.commit();

    // when
    await usecases.acceptPixCertifTermsOfService({ userId });

    // then

    // Legacy information writing
    const user = await knex('users').select().where({ id: userId }).first();
    expect(user.pixCertifTermsOfServiceAccepted).to.be.true;

    // New information writing
    const legalDocumentVersionUserAcceptance = await knex('legal-document-version-user-acceptances')
      .select()
      .where({ legalDocumentVersionId, userId })
      .first();
    expect(legalDocumentVersionUserAcceptance).to.exist;
  });
});
