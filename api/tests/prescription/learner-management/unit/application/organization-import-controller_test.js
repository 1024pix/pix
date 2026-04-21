import sinon from 'sinon';

import { organizationImportController } from '../../../../../src/prescription/learner-management/application/organization-import-controller.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';

import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Application | Learner Management | organization-import-controller', function () {
  let dependencies, serializeStub, usecaseResultSymbol;

  describe('#getOrganizationImportStatus', function () {
    const organizationId = 123;
    const request = {
      params: { organizationId },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'getOrganizationImportStatus');
      usecaseResultSymbol = Symbol();
      usecases.getOrganizationImportStatus.resolves(usecaseResultSymbol);
      serializeStub = sinon.stub();
      dependencies = { organizationImportDetailSerializer: { serialize: serializeStub } };
    });

    it('should get last organization import', async function () {
      hFake.request = {
        path: `/api/organizations/${organizationId}/import-information`,
      };
      await organizationImportController.getOrganizationImportStatus(request, hFake, dependencies);
      expect(usecases.getOrganizationImportStatus).to.have.been.calledOnceWithExactly({ organizationId });
      expect(serializeStub).to.have.been.calledOnceWithExactly(usecaseResultSymbol);
    });
  });

  describe('#saveOrganizationLearnerImportFormats', function () {
    let request, payload, userId;

    beforeEach(function () {
      payload = Symbol('Payload');
      userId = Symbol('userId');
      request = {
        auth: {
          credentials: { userId },
        },
        payload,
      };

      sinon.stub(usecases, 'saveOrganizationLearnerImportFormats');
      usecases.saveOrganizationLearnerImportFormats.resolves(null);
    });

    it('should update organization import format', async function () {
      await organizationImportController.saveOrganizationLearnerImportFormats(request);
      expect(usecases.saveOrganizationLearnerImportFormats).to.have.been.calledOnceWithExactly({
        userId,
        payload,
      });
    });
  });

  describe('#findAllOrganizationLearnerImportFormats', function () {
    const organizationId = 123;
    const request = {
      params: { organizationId },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'findAllOrganizationLearnerImportFormats');
      usecaseResultSymbol = Symbol();
      usecases.findAllOrganizationLearnerImportFormats.resolves(usecaseResultSymbol);
      serializeStub = sinon.stub();
      dependencies = { organizationLearnerImportFormatSerializer: { serialize: serializeStub } };
    });

    it('should get last organization import', async function () {
      hFake.request = {
        path: `/api/organizations/${organizationId}/import-information`,
      };
      await organizationImportController.findAllOrganizationLearnerImportFormats(request, hFake, dependencies);
      expect(usecases.findAllOrganizationLearnerImportFormats).calledOnce;
      expect(serializeStub).calledOnceWithExactly(usecaseResultSymbol);
    });
  });
});
