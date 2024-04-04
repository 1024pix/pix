import {
  AggregateImportError,
  SiecleXmlImportError,
} from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { validateSiecleXmlFile } from '../../../../../../src/prescription/learner-management/domain/usecases/validate-siecle-xml-file.js';
import { SiecleParser } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/xml/siecle-parser.js';
import { SiecleFileStreamer } from '../../../../../../src/prescription/learner-management/infrastructure/utils/xml/siecle-file-streamer.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | import-organization-learners-from-siecle-xml', function () {
  const organizationId = 1234;
  let parserStub;
  let organizationImportRepositoryStub;
  let organizationRepositoryStub;
  let streamerSymbol;
  let importStorageStub;
  let organizationImportStub;
  let readableSymbol;
  let dataStub;
  let externalIdSymbol;

  beforeEach(function () {
    organizationImportRepositoryStub = {
      getLastByOrganizationId: sinon.stub(),
      save: sinon.stub(),
    };
    organizationImportStub = { filename: Symbol('filename'), encoding: Symbol('encoding'), validate: sinon.stub() };
    organizationImportRepositoryStub.getLastByOrganizationId.returns(organizationImportStub);
    externalIdSymbol = Symbol('externalId');
    organizationRepositoryStub = {
      get: sinon.stub().withArgs(organizationId).returns({ externalId: externalIdSymbol }),
    };

    importStorageStub = {
      deleteFile: sinon.stub(),
      readFile: sinon.stub().withArgs({ filename: organizationImportStub.filename }).resolves(readableSymbol),
    };
    streamerSymbol = Symbol('streamer');
    sinon
      .stub(SiecleFileStreamer, 'create')
      .withArgs(readableSymbol, organizationImportStub.encoding)
      .resolves(streamerSymbol);

    dataStub = [{ id: 1 }];
    parserStub = {
      parse: sinon.stub().resolves(dataStub),
      parseUAJ: sinon.stub().resolves(),
    };
    sinon.stub(SiecleParser, 'create').withArgs(streamerSymbol).returns(parserStub);
  });

  it('should validate the xml file', async function () {
    await validateSiecleXmlFile({
      organizationId,
      organizationImportRepository: organizationImportRepositoryStub,
      organizationRepository: organizationRepositoryStub,
      importStorage: importStorageStub,
    });
    expect(parserStub.parseUAJ).to.have.been.calledWithExactly(externalIdSymbol);
    expect(parserStub.parse).to.have.been.calledWithExactly();
    expect(organizationImportStub.validate).to.have.been.calledWith({ errors: [] });
    expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportStub);
  });

  context('error cases', function () {
    it('should save error when there is error', async function () {
      const s3Error = new Error('s3 error');
      importStorageStub.readFile.rejects(s3Error);
      const error = await catchErr(validateSiecleXmlFile)({
        organizationId,
        organizationImportRepository: organizationImportRepositoryStub,
        organizationRepository: organizationRepositoryStub,
        importStorage: importStorageStub,
      });
      expect(error).to.eq(s3Error);
      expect(organizationImportStub.validate).to.have.been.calledWith({ errors: [s3Error] });
      expect(importStorageStub.deleteFile).to.have.been.calledWithExactly({
        filename: organizationImportStub.filename,
      });
      expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportStub);
    });

    context('when there is validation errors', function () {
      it('should save parsing errors', async function () {
        const parsingErrors = [new Error('parsing'), new Error('parsing2')];
        parserStub.parse.rejects(new AggregateImportError(parsingErrors));
        const error = await catchErr(validateSiecleXmlFile)({
          organizationId,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationRepository: organizationRepositoryStub,
          importStorage: importStorageStub,
        });
        expect(importStorageStub.deleteFile).to.have.been.calledWithExactly({
          filename: organizationImportStub.filename,
        });
        expect(error).to.be.an.instanceOf(AggregateImportError);
        expect(organizationImportStub.validate).to.have.been.calledWith({ errors: parsingErrors });
        expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportStub);
      });

      it('should save empty learner error', async function () {
        parserStub.parse.resolves([]);
        const error = await catchErr(validateSiecleXmlFile)({
          organizationId,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationRepository: organizationRepositoryStub,
          importStorage: importStorageStub,
        });
        expect(importStorageStub.deleteFile).to.have.been.calledWithExactly({
          filename: organizationImportStub.filename,
        });
        expect(error).to.be.an.instanceOf(SiecleXmlImportError);
        expect(organizationImportStub.validate).to.have.been.calledWith({ errors: [error] });
        expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportStub);
      });
    });
  });
});
