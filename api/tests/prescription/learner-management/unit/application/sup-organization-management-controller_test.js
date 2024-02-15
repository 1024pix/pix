import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { supOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sup-organization-management-controller.js';
import { expect, hFake, sinon, catchErr } from '../../../../test-helper.js';

describe('Unit | Controller | sup-organization-management-controller', function () {
  let organizationId;
  let supOrganizationLearnerParser;
  let path;
  let filename;
  let readableStream;
  let i18n;
  let warnings;
  let serializedResponse;

  let importStorageStub;
  let supOrganizationLearnerWarningSerializerStub;
  let logErrorWithCorrelationIdsStub;
  let unlinkStub;
  let makeOrganizationLearnerParserStub;

  beforeEach(function () {
    organizationId = Symbol('organizationId');
    supOrganizationLearnerParser = Symbol('supOrgnaizationLearnerParser');
    path = Symbol('path');
    filename = Symbol('filename');
    readableStream = Symbol('readableStream');
    i18n = Symbol('i18n');
    warnings = Symbol('warnings');
    serializedResponse = Symbol('serializedResponse');

    importStorageStub = {
      sendFile: sinon.stub(),
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };
    sinon.stub(usecases, 'importSupOrganizationLearners');
    supOrganizationLearnerWarningSerializerStub = { serialize: sinon.stub() };
    logErrorWithCorrelationIdsStub = sinon.stub();
    unlinkStub = sinon.stub();
    makeOrganizationLearnerParserStub = sinon.stub();
  });

  context('#importSupOrganizationLearners', function () {
    it('should call importSupOrganizationLearners usecase and return 200', async function () {
      const params = { id: organizationId };
      const request = {
        payload: { path },
        params,
        i18n,
      };
      importStorageStub.sendFile.withArgs({ filepath: path }).resolves(filename);

      usecases.importSupOrganizationLearners
        .withArgs({
          supOrganizationLearnerParser,
        })
        .resolves(warnings);

      importStorageStub.readFile.withArgs({ filename }).resolves(readableStream);

      makeOrganizationLearnerParserStub
        .withArgs(readableStream, organizationId, i18n)
        .returns(supOrganizationLearnerParser);

      supOrganizationLearnerWarningSerializerStub.serialize
        .withArgs({ id: organizationId, warnings })
        .returns(serializedResponse);

      // when
      const response = await supOrganizationManagementController.importSupOrganizationLearners(request, hFake, {
        makeOrganizationLearnerParser: makeOrganizationLearnerParserStub,
        supOrganizationLearnerWarningSerializer: supOrganizationLearnerWarningSerializerStub,
        importStorage: importStorageStub,
        logErrorWithCorrelationIds: logErrorWithCorrelationIdsStub,
        unlink: unlinkStub,
      });

      // then
      expect(response.statusCode).to.be.equal(200);
      expect(response.source).to.be.equal(serializedResponse);

      expect(importStorageStub.deleteFile).to.have.been.calledWith({ filename });
      expect(unlinkStub).to.have.been.calledWith(path);
    });

    it('should cleanup files on error', async function () {
      const params = { id: organizationId };
      const request = {
        payload: { path },
        params,
        i18n,
      };
      importStorageStub.sendFile.withArgs({ filepath: path }).resolves(filename);

      importStorageStub.readFile.withArgs({ filename }).resolves(readableStream);

      makeOrganizationLearnerParserStub.rejects();

      // when
      await catchErr(supOrganizationManagementController.importSupOrganizationLearners)(request, hFake, {
        makeOrganizationLearnerParser: makeOrganizationLearnerParserStub,
        supOrganizationLearnerWarningSerializer: supOrganizationLearnerWarningSerializerStub,
        importStorage: importStorageStub,
        logErrorWithCorrelationIds: logErrorWithCorrelationIdsStub,
        unlink: unlinkStub,
      });

      expect(importStorageStub.deleteFile).to.have.been.calledWith({ filename });
      expect(unlinkStub).to.have.been.calledWith(path);
    });

    it('should log an error if unlink fails', async function () {
      const params = { id: organizationId };
      const request = {
        payload: { path },
        params,
        i18n,
      };
      importStorageStub.sendFile.withArgs({ filepath: path }).resolves(filename);

      importStorageStub.readFile.withArgs({ filename }).resolves(readableStream);

      makeOrganizationLearnerParserStub
        .withArgs(readableStream, organizationId, i18n)
        .returns(supOrganizationLearnerParser);

      supOrganizationLearnerWarningSerializerStub.serialize
        .withArgs({ id: organizationId, warnings })
        .returns(serializedResponse);

      const error = new Error();
      unlinkStub.throws(error);

      // when
      const response = await supOrganizationManagementController.importSupOrganizationLearners(request, hFake, {
        makeOrganizationLearnerParser: makeOrganizationLearnerParserStub,
        supOrganizationLearnerWarningSerializer: supOrganizationLearnerWarningSerializerStub,
        importStorage: importStorageStub,
        logErrorWithCorrelationIds: logErrorWithCorrelationIdsStub,
        unlink: unlinkStub,
      });

      // then
      expect(response.statusCode).to.be.equal(200);

      expect(importStorageStub.deleteFile).to.have.been.calledWith({ filename });
      expect(logErrorWithCorrelationIdsStub).to.have.been.calledWith(error);
    });
  });
  context('#replaceSupOrganizationLearner', function () {
    it('should call replaceSupOrganizationLearner usecase and return 200', async function () {
      const userId = Symbol('userId');
      const params = { id: organizationId };
      const request = {
        payload: { path },
        params,
        i18n,
      };

      const requestResponseUtilsStub = { extractUserIdFromRequest: sinon.stub() };
      requestResponseUtilsStub.extractUserIdFromRequest.withArgs(request).returns(userId);

      const supOrganizationLearnerWarningSerializerStub = { serialize: sinon.stub() };
      supOrganizationLearnerWarningSerializerStub.serialize
        .withArgs({ id: organizationId, warnings })
        .returns(serializedResponse);

      sinon.stub(usecases, 'replaceSupOrganizationLearners');
      usecases.replaceSupOrganizationLearners
        .withArgs({
          organizationId,
          userId,
          supOrganizationLearnerParser,
        })
        .resolves(warnings);

      const createReadStreamStub = sinon.stub();
      createReadStreamStub.withArgs(path).returns(readableStream);

      const makeOrganizationLearnerParserStub = sinon.stub();
      makeOrganizationLearnerParserStub
        .withArgs(readableStream, organizationId, i18n)
        .returns(supOrganizationLearnerParser);

      // when
      const dependencies = {
        requestResponseUtils: requestResponseUtilsStub,
        makeOrganizationLearnerParser: makeOrganizationLearnerParserStub,
        supOrganizationLearnerWarningSerializer: supOrganizationLearnerWarningSerializerStub,
        createReadStream: createReadStreamStub,
      };

      const response = await supOrganizationManagementController.replaceSupOrganizationLearners(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(response.statusCode).to.be.equal(200);
      expect(response.source).to.be.equal(serializedResponse);
    });
  });
});
