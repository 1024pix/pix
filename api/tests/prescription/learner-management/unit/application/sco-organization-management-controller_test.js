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

    const request = {
      auth: { credentials: { userId: connectedUserId } },
      params: { id: organizationId },
      query: { format },
      payload,
    };

    beforeEach(function () {
      sinon.stub(fs, 'access').resolves();
      sinon.stub(fs, 'unlink');
      sinon.stub(usecases, 'importOrganizationLearnersFromSIECLEFormat');
      usecases.importOrganizationLearnersFromSIECLEFormat.resolves();
    });

    it('should delete uploaded file', async function () {
      // given
      request.i18n = getI18n();
      request.server = {
        events: {
          on: sinon.stub().callsFake((_, callback) => {
            callback();
          }),
        },
      };
      hFake.request = {
        path: '/api/organizations/145/sco-organization-learners/import-siecle',
      };

      // when
      await scoOrganizationManagementController.importOrganizationLearnersFromSIECLE(request, hFake);

      // then
      expect(fs.unlink).to.have.been.calledWithExactly(request.payload.path);
    });

    it('should call the usecase to import organizationLearners', async function () {
      // given
      request.i18n = getI18n();
      hFake.request = {
        path: '/api/organizations/145/sco-organization-learners/import-siecle',
      };

      // when
      await scoOrganizationManagementController.importOrganizationLearnersFromSIECLE(request, hFake);

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
