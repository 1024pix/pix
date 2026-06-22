import sinon from 'sinon';

import { legalDocumentApiRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/legal-document-api.repository.js';
import { expect } from '../../../../test-helper.js';

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

  describe('#acceptPixAppTos', function () {
    it('accepts terms of service', async function () {
      // given
      const dependencies = {
        legalDocumentApi: {
          acceptLegalDocumentByUserId: sinon.stub().resolves(),
        },
      };

      const userId = Symbol('userId');

      // when
      await legalDocumentApiRepository.acceptPixAppTos({ userId, dependencies });

      // then
      expect(dependencies.legalDocumentApi.acceptLegalDocumentByUserId).to.have.been.calledWithExactly({
        userId,
        service: 'pix-app',
        type: 'TOS',
      });
    });
  });

  describe('#getPixAppTosStatus', function () {
    it('returns the TOS status', async function () {
      // given
      const dependencies = {
        legalDocumentApi: {
          getLegalDocumentStatusByUserId: sinon.stub().resolves(),
        },
      };

      const userId = Symbol('userId');

      // when
      await legalDocumentApiRepository.getPixAppTosStatus({ userId, dependencies });

      // then
      expect(dependencies.legalDocumentApi.getLegalDocumentStatusByUserId).to.have.been.calledWithExactly({
        userId,
        service: 'pix-app',
        type: 'TOS',
      });
    });
  });

  describe('#getPixOrgaTosStatus', function () {
    it('returns the Pix Orga TOS status', async function () {
      // given
      const dependencies = {
        legalDocumentApi: {
          getLegalDocumentStatusByUserId: sinon.stub().resolves(),
        },
      };

      const userId = Symbol('userId');

      // when
      await legalDocumentApiRepository.getPixOrgaTosStatus({ userId, dependencies });

      // then
      expect(dependencies.legalDocumentApi.getLegalDocumentStatusByUserId).to.have.been.calledWithExactly({
        userId,
        service: 'pix-orga',
        type: 'TOS',
      });
    });
  });
});
