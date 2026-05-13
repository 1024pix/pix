import sinon from 'sinon';

import { supOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sup-organization-management-controller.js';
import { SUP_IMPORT_TYPES } from '../../../../../src/prescription/learner-management/domain/constants.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Controller | sup-organization-management-controller', function () {
  let organizationId;
  let path;
  let i18n;
  let userId;

  let loggerStub;
  let unlinkStub;

  beforeEach(function () {
    organizationId = Symbol('organizationId');
    path = Symbol('path');
    i18n = Symbol('i18n');
    userId = Symbol('userId');

    sinon.stub(usecases, 'uploadSupFile');
    loggerStub = { error: sinon.stub() };
    unlinkStub = sinon.stub();
  });

  context('#importLearnersFromSupFile', function () {
    it('should call uploadSupFile usecase and return 200', async function () {
      const params = { id: organizationId };
      const request = {
        auth: { credentials: { userId } },
        payload: { path },
        params,
        i18n,
      };
      usecases.uploadSupFile
        .withArgs({ userId, organizationId, payload: request.payload, i18n, type: SUP_IMPORT_TYPES.ADDITIONAL_STUDENT })
        .resolves();

      // when
      const response = await supOrganizationManagementController.importSupOrganizationLearners(request, hFake, {
        logger: loggerStub,
        unlink: unlinkStub,
      });

      // then
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
      usecases.uploadSupFile.rejects();

      // when
      await catchErr(supOrganizationManagementController.importSupOrganizationLearners)(request, hFake, {
        logger: loggerStub,
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
        logger: loggerStub,
        unlink: unlinkStub,
      });

      // then
      expect(response.statusCode).to.be.equal(204);

      expect(loggerStub.error).to.have.been.calledWith(error);
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
      usecases.uploadSupFile
        .withArgs({ userId, organizationId, payload: request.payload, i18n, type: SUP_IMPORT_TYPES.REPLACE_STUDENT })
        .resolves();

      // when
      const response = await supOrganizationManagementController.replaceSupOrganizationLearners(request, hFake, {
        logger: loggerStub,
        unlink: unlinkStub,
      });

      // then
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
      usecases.uploadSupFile.rejects();

      // when
      await catchErr(supOrganizationManagementController.replaceSupOrganizationLearners)(request, hFake, {
        logger: loggerStub,
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
        logger: loggerStub,
        unlink: unlinkStub,
      });

      // then
      expect(response.statusCode).to.be.equal(204);

      expect(loggerStub.error).to.have.been.calledWith(error);
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
