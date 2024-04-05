import fs from 'fs/promises';

import { OrganizationImport } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { importOrganizationLearnersFromSIECLEXMLFormat } from '../../../../../../src/prescription/learner-management/domain/usecases/import-organization-learners-from-siecle-xml-format.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | import-organization-learners-from-siecle-xml', function () {
  const userId = 123;
  const organizationId = 1234;
  let organizationImportRepositoryStub;
  let siecleServiceStub;
  let payload;
  let importStorageStub;
  let organizationImportStub;
  let encoding;
  let s3filename;
  let filename;
  let filepath;

  beforeEach(function () {
    sinon.stub(fs, 'rm');
    sinon.stub(fs, 'readFile');

    filename = Symbol('filename');
    encoding = Symbol('encoding');
    filepath = Symbol('filepath');
    s3filename = Symbol('filename');

    payload = { path: filename };

    importStorageStub = {
      sendFile: sinon.stub(),
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    siecleServiceStub = {
      unzip: sinon.stub(),
      detectEncoding: sinon.stub(),
    };

    organizationImportStub = { upload: sinon.stub() };
    sinon
      .stub(OrganizationImport, 'create')
      .withArgs({ createdBy: userId, organizationId })
      .returns(organizationImportStub);

    organizationImportRepositoryStub = {
      save: sinon.stub(),
    };
    siecleServiceStub.unzip.withArgs(filename).resolves({ file: filepath, directory: null });
    siecleServiceStub.detectEncoding.withArgs(filepath).resolves(encoding);
    importStorageStub.sendFile.withArgs({ filepath }).resolves(s3filename);
  });

  context('when extracted organizationLearners informations can be imported', function () {
    context('when the file is zipped', function () {
      it('should remove temporary directory', async function () {
        // given
        siecleServiceStub.unzip.withArgs(payload.path).resolves({ directory: 'tmp', file: filepath });

        // when
        await importOrganizationLearnersFromSIECLEXMLFormat({
          userId,
          organizationId,
          payload,
          organizationImportRepository: organizationImportRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
        });

        expect(fs.rm).to.have.been.calledWith('tmp', { recursive: true });
      });
    });
  });

  context('save import state in database', function () {
    it('should save import state', async function () {
      // when
      await importOrganizationLearnersFromSIECLEXMLFormat({
        userId,
        organizationId,
        payload,
        organizationImportRepository: organizationImportRepositoryStub,
        siecleService: siecleServiceStub,
        importStorage: importStorageStub,
      });

      // then

      expect(organizationImportStub.upload).to.have.been.calledWithExactly({
        filename: s3filename,
        encoding,
        errors: [],
      });
      expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportStub);
    });

    context('when there is an upload error', function () {
      it('should save organization import with error', async function () {
        //given
        const s3Error = new Error('s3_error');
        importStorageStub.sendFile.withArgs({ filepath }).rejects(s3Error);

        // when
        const error = await catchErr(importOrganizationLearnersFromSIECLEXMLFormat)({
          userId,
          organizationId,
          payload,
          organizationImportRepository: organizationImportRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
        });

        //then
        expect(organizationImportStub.upload).to.have.been.calledWithExactly({
          filename: undefined,
          encoding,
          errors: [error],
        });
        expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportStub);
      });

      it('should save organizationImport if zip is invalid', async function () {
        //given
        const zipError = new Error('unzipError');
        siecleServiceStub.unzip.withArgs(filename).rejects(zipError);

        // when
        await catchErr(importOrganizationLearnersFromSIECLEXMLFormat)({
          userId,
          organizationId,
          payload,
          organizationImportRepository: organizationImportRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
        });

        //then
        expect(organizationImportStub.upload).to.have.been.calledWithExactly({
          filename: undefined,
          encoding: undefined,
          errors: [zipError],
        });
        expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportStub);
      });

      it('should save organizationImport if there is detectEncoding fails', async function () {
        //given
        const encodingError = new Error('encoding');
        siecleServiceStub.detectEncoding.withArgs(filepath).rejects(encodingError);

        // when
        await catchErr(importOrganizationLearnersFromSIECLEXMLFormat)({
          userId,
          organizationId,
          payload,
          organizationImportRepository: organizationImportRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
        });

        //then
        expect(organizationImportStub.upload).to.have.been.calledWithExactly({
          filename: undefined,
          encoding: undefined,
          errors: [encodingError],
        });
        expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportStub);
      });
    });
  });
});
