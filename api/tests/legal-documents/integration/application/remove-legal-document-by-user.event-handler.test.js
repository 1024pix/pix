import { expect } from 'chai';

import { RemoveLegalDocumentByUserEventHandler } from '../../../../src/legal-documents/application/remove-legal-document-by-user.event-handler.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | Legal Documents | Application | remove-legal-document-by-user-event-handler', function () {
  describe('#handle', function () {
    it('should remove all legal document acceptances of the user', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const legalDocumentVersion = databaseBuilder.factory.buildPixAppTos();
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user.id,
        legalDocumentVersionId: legalDocumentVersion.id,
      });
      await databaseBuilder.commit();

      // when
      const handler = new RemoveLegalDocumentByUserEventHandler();
      await handler.handle({ data: { userId: user.id } });

      // then
      const userAcceptances = await knex('legal-document-version-user-acceptances').where({ userId: user.id });
      expect(userAcceptances).to.have.lengthOf(0);
    });
  });
});
