import fs from 'node:fs/promises';

import sinon from 'sinon';

import { scoOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sco-organization-management-controller.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { FregataParser } from '../../../../../src/prescription/learner-management/infrastructure/serializers/csv/parsers/fregata-parser.js';
import { FileValidationError } from '../../../../../src/shared/domain/errors.js';
import { getI18nFromRequest } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

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
      sinon.stub(usecases, 'uploadSiecleFile');
      sinon.stub(usecases, 'uploadCsvFile');

      usecases.uploadSiecleFile.resolves();
      dependencies = { logger: { error: sinon.stub(), warn: sinon.stub() } };
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
      expect(dependencies.logger.error).to.have.been.calledWith(error);
    });

    it('should call usecases to import organizationLearners xml', async function () {
      // given
      const uploadedFileEvent = Symbol('uploadedFileEvent');
      usecases.uploadSiecleFile.resolves(uploadedFileEvent);
      const userId = 1;
      request.auth = { credentials: { userId } };
      request.query.format = 'xml';
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
    });

    it('should log error on failed usecases to import organizationLearners xml', async function () {
      // given
      const uploadedError = Symbol('uploadedError');
      usecases.uploadSiecleFile.rejects(uploadedError);
      const userId = 1;
      request.auth = { credentials: { userId } };
      request.query.format = 'xml';
      hFake.request = {
        path: '/api/organizations/145/sco-organization-learners/import-siecle',
      };

      // when
      const error = await catchErr(scoOrganizationManagementController.importOrganizationLearnersFromSIECLE)(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(dependencies.logger.warn).to.have.been.calledWithExactly(uploadedError);
      expect(error).to.be.deep.equal(uploadedError);
    });

    it('should call the usecase uploadCsvFile to import organizationLearners csv', async function () {
      // given
      const userId = 1;
      request.auth = { credentials: { userId } };
      request.query.format = 'csv';
      const i18n = getI18nFromRequest(request);

      hFake.request = {
        path: '/api/organizations/145/sco-organization-learners/import-siecle',
      };
      // when
      await scoOrganizationManagementController.importOrganizationLearnersFromSIECLE(request, hFake, dependencies);

      // then
      expect(usecases.uploadCsvFile).to.have.been.calledWithExactly({
        Parser: FregataParser,
        userId,
        organizationId,
        type: 'FREGATA',
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
