import { supOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sup-organization-management-controller.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { catchErr, expect, hFake, sinon } from '../../../../test-helper.js';

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
  let makeOrganizationLearnerParserStub;

  beforeEach(function () {
    organizationId = Symbol('organizationId');
    path = Symbol('path');
    i18n = Symbol('i18n');
    warnings = Symbol('warnings');
    serializedResponse = Symbol('serializedResponse');
    userId = Symbol('userId');

    sinon.stub(usecases, 'importSupOrganizationLearners');
    sinon.stub(usecases, 'replaceSupOrganizationLearners');
    supOrganizationLearnerWarningSerializerStub = { serialize: sinon.stub() };
    logErrorWithCorrelationIdsStub = sinon.stub();
    unlinkStub = sinon.stub();
  });

  context('#importSupOrganizationLearners', function () {
    it('should call importSupOrganizationLearners usecase and return 200', async function () {
      const params = { id: organizationId };
      const request = {
        auth: { credentials: { userId } },
        payload: { path },
        params,
        i18n,
      };
      usecases.importSupOrganizationLearners
        .withArgs({
          userId,
          payload: request.payload,
          organizationId,
          i18n,
        })
        .resolves(warnings);

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
      expect(response.statusCode).to.be.equal(200);
      expect(response.source).to.be.equal(serializedResponse);

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
      usecases.importSupOrganizationLearners
        .withArgs({
          userId,
          payload: request.payload,
          organizationId,
          i18n,
        })
        .rejects();

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

      supOrganizationLearnerWarningSerializerStub.serialize
        .withArgs({ id: organizationId, warnings })
        .returns(serializedResponse);

      const error = new Error();
      unlinkStub.throws(error);

      // when
      const response = await supOrganizationManagementController.importSupOrganizationLearners(request, hFake, {
        supOrganizationLearnerWarningSerializer: supOrganizationLearnerWarningSerializerStub,
        logErrorWithCorrelationIds: logErrorWithCorrelationIdsStub,
        unlink: unlinkStub,
      });

      // then
      expect(response.statusCode).to.be.equal(200);

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

      usecases.replaceSupOrganizationLearners
        .withArgs({
          payload: request.payload,
          organizationId,
          i18n,
          userId,
        })
        .resolves(warnings);

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
      expect(response.statusCode).to.be.equal(200);
      expect(response.source).to.be.equal(serializedResponse);

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

      usecases.replaceSupOrganizationLearners
        .withArgs({
          payload: request.payload,
          organizationId,
          i18n,
          userId,
        })
        .rejects();

      // when
      await catchErr(supOrganizationManagementController.replaceSupOrganizationLearners)(request, hFake, {
        makeOrganizationLearnerParser: makeOrganizationLearnerParserStub,
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

      usecases.replaceSupOrganizationLearners
        .withArgs({
          payload: request.payload,
          organizationId,
          i18n,
          userId,
        })
        .resolves(warnings);

      supOrganizationLearnerWarningSerializerStub.serialize
        .withArgs({ id: organizationId, warnings })
        .returns(serializedResponse);

      const error = new Error();
      unlinkStub.throws(error);

      // when
      const response = await supOrganizationManagementController.replaceSupOrganizationLearners(request, hFake, {
        supOrganizationLearnerWarningSerializer: supOrganizationLearnerWarningSerializerStub,
        logErrorWithCorrelationIds: logErrorWithCorrelationIdsStub,
        unlink: unlinkStub,
      });

      // then
      expect(response.statusCode).to.be.equal(200);

      expect(logErrorWithCorrelationIdsStub).to.have.been.calledWith(error);
    });
  });
});
