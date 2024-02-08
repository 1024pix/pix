import { expect, hFake, sinon } from '../../../../test-helper.js';
import fs from 'fs/promises';

import { scoOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sco-organization-management-controller.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { getI18n } from '../../../../tooling/i18n/i18n.js';

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
      sinon.stub(usecases, 'importOrganizationLearnersFromSIECLEFormat');
      usecases.importOrganizationLearnersFromSIECLEFormat.resolves();
      dependencies = { logErrorWithCorrelationIds: sinon.stub() };
    });

    it('should delete uploaded file', async function () {
      // given
      request.i18n = getI18n();
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
      request.i18n = getI18n();
      hFake.request = {
        path: '/api/organizations/145/sco-organization-learners/import-siecle',
      };

      // when
      await scoOrganizationManagementController.importOrganizationLearnersFromSIECLE(request, hFake, dependencies);

      // then
      expect(fs.unlink).to.have.been.calledWithExactly(request.payload.path);
      expect(dependencies.logErrorWithCorrelationIds).to.have.been.calledWith(error);
    });

    it('should call the usecase to import organizationLearners', async function () {
      // given
      request.i18n = getI18n();
      hFake.request = {
        path: '/api/organizations/145/sco-organization-learners/import-siecle',
      };

      // when
      await scoOrganizationManagementController.importOrganizationLearnersFromSIECLE(request, hFake, dependencies);

      // then
      expect(usecases.importOrganizationLearnersFromSIECLEFormat).to.have.been.calledWithExactly({
        organizationId,
        payload,
        format,
        i18n: request.i18n,
      });
    });
  });
});
