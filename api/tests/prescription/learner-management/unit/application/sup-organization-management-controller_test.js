import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { supOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sup-organization-management-controller.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | sup-organization-management-controller', function () {
  context('#importSupOrganizationLearners', function () {
    it('should call importSupOrganizationLearners usecase and return 200', async function () {
      const organizationId = Symbol('organizationId');
      const supOrganizationLearnerParser = Symbol('supOrgnaizationLearnerParser');
      const path = Symbol('path');
      const filename = Symbol('filename');
      const readableStream = Symbol('readableStream');
      const params = { id: organizationId };
      const i18n = Symbol('i18n');
      const warnings = Symbol('warnings');
      const serializedResponse = Symbol('serializedResponse');
      const request = {
        payload: { path },
        params,
        i18n,
      };

      const supOrganizationLearnerWarningSerializerStub = { serialize: sinon.stub() };
      supOrganizationLearnerWarningSerializerStub.serialize
        .withArgs({ id: organizationId, warnings })
        .returns(serializedResponse);

      sinon.stub(usecases, 'importSupOrganizationLearners');
      usecases.importSupOrganizationLearners
        .withArgs({
          supOrganizationLearnerParser,
        })
        .resolves(warnings);

      const importStorageStub = {
        sendFile: sinon.stub(),
        readFile: sinon.stub(),
        deleteFile: sinon.stub(),
      };
      importStorageStub.sendFile.withArgs({ filepath: path }).resolves(filename);
      importStorageStub.readFile.withArgs({ filename }).resolves(readableStream);

      const makeOrganizationLearnerParserStub = sinon.stub();
      makeOrganizationLearnerParserStub
        .withArgs(readableStream, organizationId, i18n)
        .returns(supOrganizationLearnerParser);

      // when
      const dependencies = {
        makeOrganizationLearnerParser: makeOrganizationLearnerParserStub,
        supOrganizationLearnerWarningSerializer: supOrganizationLearnerWarningSerializerStub,
        importStorage: importStorageStub,
      };

      const response = await supOrganizationManagementController.importSupOrganizationLearners(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(response.statusCode).to.be.equal(200);
      expect(response.source).to.be.equal(serializedResponse);
      expect(importStorageStub.deleteFile).to.have.been.calledWith({ filename });
    });
  });
  context('#replaceSupOrganizationLearner', function () {
    it('should call replaceSupOrganizationLearner usecase and return 200', async function () {
      const organizationId = Symbol('organizationId');
      const userId = Symbol('userId');
      const supOrganizationLearnerParser = Symbol('supOrgnaizationLearnerParser');
      const path = Symbol('path');
      const readableStream = Symbol('readableStream');
      const params = { id: organizationId };
      const i18n = Symbol('i18n');
      const warnings = Symbol('warnings');
      const serializedResponse = Symbol('serializedResponse');
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
