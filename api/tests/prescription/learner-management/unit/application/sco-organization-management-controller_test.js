import fs from 'node:fs/promises';

import { FileValidationError } from '../../../../../lib/domain/errors.js';
import { eventBus } from '../../../../../lib/domain/events/index.js';
import { scoOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sco-organization-management-controller.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { ApplicationTransaction } from '../../../../../src/prescription/shared/infrastructure/ApplicationTransaction.js';
import { catchErr, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Organizations | organization-controller', function () {
  describe('#importorganizationLearnersFromSIECLE', function () {
    const connectedUserId = 1;
    const organizationId = 145;
    const payload = { path: 'path-to-file' };
    const format = 'xml';
    let dependencies;
    let domainTransaction;

    const request = {
      auth: { credentials: { userId: connectedUserId } },
      params: { id: organizationId },
      query: { format },
      payload,
    };

    beforeEach(function () {
      sinon.stub(fs, 'unlink').resolves();
      sinon.stub(usecases, 'uploadSiecleFile');
      sinon.stub(usecases, 'importOrganizationLearnersFromSIECLECSVFormat');
      sinon.stub(eventBus, 'publish');
      sinon.stub(ApplicationTransaction, 'execute');
      sinon.stub(ApplicationTransaction, 'getTransactionAsDomainTransaction');

      domainTransaction = Symbol('domainTransaction');
      ApplicationTransaction.execute.callsFake((callback) => callback());
      ApplicationTransaction.getTransactionAsDomainTransaction.returns(domainTransaction);

      usecases.uploadSiecleFile.resolves();
      dependencies = { logErrorWithCorrelationIds: sinon.stub() };
    });

    it('should delete uploaded file', async function () {
      // given
      hFake.request = {
        path: '/api/organizations/145/sco-organization-learners/import-siecle',
      };

      // when
      await scoOrganizationManagementController.importOrganizationLearnersFromSIECLE(request, hFake, dependencies);

      // then
      expect(fs.unlink).to.have.been.calledWithExactly(request.payload.path);
    });

    it('should not throw if delete uploaded file fails', async function () {
      // given
      const error = new Error();
      fs.unlink.rejects(error);
      hFake.request = {
        path: '/api/organizations/145/sco-organization-learners/import-siecle',
      };

      // when
      await scoOrganizationManagementController.importOrganizationLearnersFromSIECLE(request, hFake, dependencies);

      // then
      expect(fs.unlink).to.have.been.calledWithExactly(request.payload.path);
      expect(dependencies.logErrorWithCorrelationIds).to.have.been.calledWith(error);
    });

    it('should call usecases to import organizationLearners xml', async function () {
      // given
      const uploadedFileEvent = Symbol('uploadedFileEvent');
      usecases.uploadSiecleFile.resolves(uploadedFileEvent);
      const userId = 1;
      request.auth = { credentials: { userId } };
      hFake.request = {
        path: '/api/organizations/145/sco-organization-learners/import-siecle',
      };

      // when
      await scoOrganizationManagementController.importOrganizationLearnersFromSIECLE(request, hFake, dependencies);

      // then
      expect(usecases.uploadSiecleFile).to.have.been.calledWithExactly({
        userId,
        organizationId,
        payload,
      });
      expect(eventBus.publish).to.have.been.calledWithExactly(uploadedFileEvent, domainTransaction);
    });

    it('should call the usecase to import organizationLearners csv', async function () {
      // given
      const userId = 1;
      request.auth = { credentials: { userId } };
      request.query.format = 'csv';
      const i18n = Symbol('i18n');
      request.i18n = i18n;
      hFake.request = {
        path: '/api/organizations/145/sco-organization-learners/import-siecle',
      };

      // when
      await scoOrganizationManagementController.importOrganizationLearnersFromSIECLE(request, hFake, dependencies);

      // then
      expect(usecases.importOrganizationLearnersFromSIECLECSVFormat).to.have.been.calledWithExactly({
        userId,
        organizationId,
        payload,
        i18n,
      });
    });
    context('when file format is not supported', function () {
      it('should throw a FileValidationError', async function () {
        // given
        request.query.format = 'txt';
        // when
        const error = await catchErr(scoOrganizationManagementController.importOrganizationLearnersFromSIECLE)(
          request,
          hFake,
        );
        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.code).to.equal('INVALID_FILE_EXTENSION');
        expect(error.meta.fileExtension).to.equal('txt');
      });
    });
  });
});
