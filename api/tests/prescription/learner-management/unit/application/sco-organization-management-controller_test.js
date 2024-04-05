import fs from 'fs/promises';

import { FileValidationError } from '../../../../../lib/domain/errors.js';
import { scoOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sco-organization-management-controller.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { catchErr, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Organizations | organization-controller', function () {
  describe('#importorganizationLearnersFromSIECLE', function () {
    const connectedUserId = 1;
    const organizationId = 145;
    const payload = { path: 'path-to-file' };
    const format = 'xml';
    let dependencies;

    const request = {
      auth: { credentials: { userId: connectedUserId } },
      params: { id: organizationId },
      query: { format },
      payload,
    };

    beforeEach(function () {
      sinon.stub(fs, 'unlink').resolves();
      sinon.stub(usecases, 'importOrganizationLearnersFromSIECLEXMLFormat');
      sinon.stub(usecases, 'validateSiecleXmlFile');
      sinon.stub(usecases, 'addOrUpdateOrganizationLearners');
      sinon.stub(usecases, 'importOrganizationLearnersFromSIECLECSVFormat');
      usecases.importOrganizationLearnersFromSIECLEXMLFormat.resolves();
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
      const userId = 1;
      request.auth = { credentials: { userId } };
      hFake.request = {
        path: '/api/organizations/145/sco-organization-learners/import-siecle',
      };

      // when
      await scoOrganizationManagementController.importOrganizationLearnersFromSIECLE(request, hFake, dependencies);

      // then
      expect(usecases.importOrganizationLearnersFromSIECLEXMLFormat).to.have.been.calledWithExactly({
        userId,
        organizationId,
        payload,
      });
      expect(usecases.validateSiecleXmlFile).to.have.been.calledWithExactly({ organizationId });
      expect(usecases.addOrUpdateOrganizationLearners).to.have.been.calledWithExactly({
        organizationId,
      });
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
