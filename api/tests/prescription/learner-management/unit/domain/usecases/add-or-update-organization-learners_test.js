import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { addOrUpdateOrganizationLearners } from '../../../../../../src/prescription/learner-management/domain/usecases/add-or-update-organization-learners.js';
import { SiecleParser } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/xml/siecle-parser.js';
import { SiecleFileStreamer } from '../../../../../../src/prescription/learner-management/infrastructure/utils/xml/siecle-file-streamer.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | add-or-update-organization-learners', function () {
  const organizationImportId = 1234;
  let organizationId;
  let organizationLearnerRepositoryStub;
  let organizationImportRepositoryStub;
  let importStorageStub;
  let readableSymbol;
  let parserStub;
  let streamerSymbol;
  let organizationImportStub;

  beforeEach(function () {
    organizationId = Symbol('organizationId');
    organizationImportStub = {
      organizationId,
      filename: Symbol('filename'),
      encoding: Symbol('encoding'),
      process: sinon.stub(),
    };
    organizationImportRepositoryStub = {
      get: sinon.stub().withArgs(organizationImportId).resolves(organizationImportStub),
      save: sinon.stub(),
    };

    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
    readableSymbol = Symbol('readable');
    importStorageStub = {
      readFile: sinon.stub().withArgs({ filename: organizationImportStub.filename }).resolves(readableSymbol),
      deleteFile: sinon.stub(),
    };
    streamerSymbol = Symbol('streamer');
    sinon
      .stub(SiecleFileStreamer, 'create')
      .withArgs(readableSymbol, organizationImportStub.encoding)
      .resolves(streamerSymbol);
    parserStub = {
      parse: sinon.stub().resolves([
        { lastName: 'Student1', nationalStudentId: 'INE1' },
        { lastName: 'Student2', nationalStudentId: 'INE2' },
        { lastName: 'Student3', nationalStudentId: 'INE3' },
      ]),
    };
    sinon.stub(SiecleParser, 'create').withArgs(streamerSymbol).returns(parserStub);

    organizationLearnerRepositoryStub = {
      addOrUpdateOrganizationOfOrganizationLearners: sinon.stub(),
      disableAllOrganizationLearnersInOrganization: sinon.stub().resolves(),
    };
  });

  it('should save learners', async function () {
    organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners.resolves();

    await addOrUpdateOrganizationLearners({
      organizationImportId,
      importStorage: importStorageStub,
      organizationImportRepository: organizationImportRepositoryStub,
      organizationLearnerRepository: organizationLearnerRepositoryStub,
      chunkSize: 2,
    });

    expect(organizationLearnerRepositoryStub.disableAllOrganizationLearnersInOrganization).to.have.been.calledWith({
      organizationId,
      nationalStudentIds: ['INE1', 'INE2', 'INE3'],
    });
    expect(organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners).to.have.been.calledTwice;
    expect(
      organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners.getCall(0).args,
    ).to.deep.equal([
      [
        { lastName: 'Student1', nationalStudentId: 'INE1' },
        { lastName: 'Student2', nationalStudentId: 'INE2' },
      ],
      organizationId,
    ]);
    expect(
      organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners.getCall(1).args,
    ).to.deep.equal([[{ lastName: 'Student3', nationalStudentId: 'INE3' }], organizationId]);

    expect(organizationImportStub.process).to.have.been.calledWith({ errors: [] });
    expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportStub);

    expect(importStorageStub.deleteFile).to.have.been.calledWithExactly({ filename: organizationImportStub.filename });
  });

  it('should handle errors', async function () {
    const s3Error = new Error('s3 error');
    importStorageStub.readFile.rejects(s3Error);
    const error = await catchErr(addOrUpdateOrganizationLearners)({
      organizationImportId,
      importStorage: importStorageStub,
      organizationImportRepository: organizationImportRepositoryStub,
      organizationLearnerRepository: organizationLearnerRepositoryStub,
      chunkSize: 2,
    });
    expect(error).to.equal(s3Error);
    expect(organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners).to.have.been.not.called;
    expect(organizationLearnerRepositoryStub.disableAllOrganizationLearnersInOrganization).to.have.been.not.called;
    expect(organizationImportStub.process).to.have.been.called;
    expect(organizationImportRepositoryStub.save).to.have.been.called;
  });
});
