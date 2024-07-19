import { supOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sup-organization-management-controller.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { catchErr, expect, hFake, sinon } from '../../../../test-helper.js';
import { getI18n } from '../../../../tooling/i18n/i18n.js';

describe('Unit | Controller | sup-organization-management-controller', function () {
  let organizationId;
  let path;
  let i18n;
  let warnings;
  let serializedResponse;
  let userId;

  let supOrganizationLearnerWarningSerializerStub;
  let logErrorWithCorrelationIdsStub;
  let unlinkStub;

  beforeEach(function () {
    organizationId = Symbol('organizationId');
    path = Symbol('path');
    i18n = Symbol('i18n');
    userId = Symbol('userId');

    sinon.stub(usecases, 'uploadCsvFile');
    sinon.stub(usecases, 'validateCsvFile');
    sinon.stub(usecases, 'importSupOrganizationLearners');
    sinon.stub(usecases, 'replaceSupOrganizationLearners');
    supOrganizationLearnerWarningSerializerStub = { serialize: sinon.stub() };
    logErrorWithCorrelationIdsStub = sinon.stub();
    unlinkStub = sinon.stub();
  });

  context('#importSupOrganizationLearners', function () {
    it('should call uploadCsvFile, validateCsvFile and importSupOrganizationLearners usecase and return 200', async function () {
      const params = { id: organizationId };
      const request = {
        auth: { credentials: { userId } },
        payload: { path },
        params,
        i18n,
      };
      usecases.uploadCsvFile.withArgs({ userId, organizationId, payload: request.payload, i18n }).resolves();
      usecases.validateCsvFile.withArgs({ organizationId, i18n }).resolves();
      usecases.importSupOrganizationLearners
        .withArgs({
          organizationId,
          i18n,
        })
        .resolves();

      supOrganizationLearnerWarningSerializerStub.serialize
        .withArgs({ id: organizationId, warnings })
        .returns(serializedResponse);

      // when
      const response = await supOrganizationManagementController.importSupOrganizationLearners(request, hFake, {
        supOrganizationLearnerWarningSerializer: supOrganizationLearnerWarningSerializerStub,
        logErrorWithCorrelationIds: logErrorWithCorrelationIdsStub,
        unlink: unlinkStub,
      });

      // then
      expect(
        sinon.assert.callOrder(
          usecases.uploadCsvFile,
          usecases.validateCsvFile,
          usecases.importSupOrganizationLearners,
        ),
      ).to.not.throws;
      expect(response.statusCode).to.be.equal(204);

      expect(unlinkStub).to.have.been.calledWith(path);
    });

    it('should cleanup files on error', async function () {
      const params = { id: organizationId };
      const request = {
        auth: { credentials: { userId } },
        payload: { path },
        params,
        i18n,
      };
      usecases.uploadCsvFile.rejects();

      // when
      await catchErr(supOrganizationManagementController.importSupOrganizationLearners)(request, hFake, {
        supOrganizationLearnerWarningSerializer: supOrganizationLearnerWarningSerializerStub,
        logErrorWithCorrelationIds: logErrorWithCorrelationIdsStub,
        unlink: unlinkStub,
      });

      expect(unlinkStub).to.have.been.calledWith(path);
    });

    it('should log an error if unlink fails', async function () {
      const params = { id: organizationId };
      const request = {
        auth: { credentials: { userId } },
        payload: { path },
        params,
        i18n,
      };

      const error = new Error();
      unlinkStub.throws(error);

      // when
      const response = await supOrganizationManagementController.importSupOrganizationLearners(request, hFake, {
        logErrorWithCorrelationIds: logErrorWithCorrelationIdsStub,
        unlink: unlinkStub,
      });

      // then
      expect(response.statusCode).to.be.equal(204);

      expect(logErrorWithCorrelationIdsStub).to.have.been.calledWith(error);
    });
  });
  context('#replaceSupOrganizationLearner', function () {
    it('should call replaceSupOrganizationLearner usecase and return 200', async function () {
      const params = { id: organizationId };
      const request = {
        auth: { credentials: { userId } },
        payload: { path },
        params,
        i18n,
      };
      usecases.uploadCsvFile.withArgs({ userId, organizationId, payload: request.payload, i18n }).resolves();
      usecases.validateCsvFile.withArgs({ organizationId, i18n }).resolves();
      usecases.replaceSupOrganizationLearners
        .withArgs({
          organizationId,
          i18n,
        })
        .resolves();

      supOrganizationLearnerWarningSerializerStub.serialize
        .withArgs({ id: organizationId, warnings })
        .returns(serializedResponse);

      // when
      const response = await supOrganizationManagementController.replaceSupOrganizationLearners(request, hFake, {
        supOrganizationLearnerWarningSerializer: supOrganizationLearnerWarningSerializerStub,
        logErrorWithCorrelationIds: logErrorWithCorrelationIdsStub,
        unlink: unlinkStub,
      });

      // then
      // then
      expect(
        sinon.assert.callOrder(
          usecases.uploadCsvFile,
          usecases.validateCsvFile,
          usecases.replaceSupOrganizationLearners,
        ),
      ).to.not.throws;
      expect(response.statusCode).to.be.equal(204);

      expect(unlinkStub).to.have.been.calledWith(path);
    });

    it('should cleanup files on error', async function () {
      const params = { id: organizationId };
      const request = {
        auth: { credentials: { userId } },
        payload: { path },
        params,
        i18n,
      };
      usecases.uploadCsvFile.rejects();

      // when
      await catchErr(supOrganizationManagementController.replaceSupOrganizationLearners)(request, hFake, {
        logErrorWithCorrelationIds: logErrorWithCorrelationIdsStub,
        unlink: unlinkStub,
      });

      expect(unlinkStub).to.have.been.calledWith(path);
    });

    it('should log an error if unlink fails', async function () {
      const params = { id: organizationId };
      const request = {
        auth: { credentials: { userId } },
        payload: { path },
        params,
        i18n,
      };

      const error = new Error();
      unlinkStub.throws(error);

      // when
      const response = await supOrganizationManagementController.replaceSupOrganizationLearners(request, hFake, {
        supOrganizationLearnerWarningSerializer: supOrganizationLearnerWarningSerializerStub,
        logErrorWithCorrelationIds: logErrorWithCorrelationIdsStub,
        unlink: unlinkStub,
      });

      // then
      expect(response.statusCode).to.be.equal(204);

      expect(logErrorWithCorrelationIdsStub).to.have.been.calledWith(error);
    });
  });

  describe('#getOrganizationLearnersCsvTemplate', function () {
    const userId = 1;
    const organizationId = 2;
    const request = {
      query: {
        accessToken: 'token',
      },
      params: {
        id: organizationId,
      },
    };
    let dependencies;

    beforeEach(function () {
      sinon.stub(usecases, 'getOrganizationLearnersCsvTemplate').resolves('template');

      const tokenServiceStub = {
        extractUserId: sinon.stub(),
      };
      tokenServiceStub.extractUserId.returns(userId);

      dependencies = {
        tokenService: tokenServiceStub,
      };
    });

    it('should return a response with correct headers', async function () {
      // when
      request.i18n = getI18n();
      hFake.request = {
        path: '/api/organizations/2/sup-organization-learners/csv-template',
      };
      const response = await supOrganizationManagementController.getOrganizationLearnersCsvTemplate(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(response.headers['Content-Type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['Content-Disposition']).to.equal('attachment; filename=modele-import.csv');
    });
  });
});
