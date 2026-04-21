import sinon from 'sinon';

import { legalDocumentApiRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/legal-document-api.repository.js';

describe('Unit | Identity Access Management | Infrastructure | Repositories | legal-document-api', function () {
  describe('#acceptPixOrgaTos', function () {
    it('accepts terms of service', async function () {
      // given
      const dependencies = {
        legalDocumentApi: {
          acceptLegalDocumentByUserId: sinon.stub().resolves(),
        },
      };

      const userId = Symbol('userId');

      // when
      await legalDocumentApiRepository.acceptPixOrgaTos({ userId, dependencies });

      // then
      expect(dependencies.legalDocumentApi.acceptLegalDocumentByUserId).to.have.been.calledWithExactly({
        userId,
        service: 'pix-orga',
        type: 'TOS',
      });
    });
  });
});
