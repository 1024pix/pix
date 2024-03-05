import { expect, sinon } from '../../../../../test-helper.js';
import { replaceSupOrganizationLearners } from '../../../../../../src/prescription/learner-management/domain/usecases/replace-sup-organization-learner.js';
import { SupOrganizationLearnerParser } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-parser.js';

describe('Unit | UseCase | ImportSupOrganizationLearner', function () {
  let readableStream,
    filename,
    payload,
    importStorageStub,
    supOrganizationLearnerRepositoryStub,
    supOrganizationLearnerParserCreateStub,
    learners,
    userId,
    buffer,
    i18n,
    organizationId;

  beforeEach(function () {
    readableStream = Symbol('readableStream');
    supOrganizationLearnerRepositoryStub = { replaceStudents: sinon.stub() };
    supOrganizationLearnerRepositoryStub.replaceStudents.resolves();
    supOrganizationLearnerParserCreateStub = sinon.stub(SupOrganizationLearnerParser, 'create');
    learners = Symbol('learners');
    userId = Symbol('userId');
    buffer = Symbol('buffer');
    i18n = Symbol('i81n');
    organizationId = 1;

    filename = Symbol('FILE_NAME');

    payload = { path: filename };

    importStorageStub = {
      sendFile: sinon.stub(),
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };
    importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(filename);
    importStorageStub.readFile.withArgs(filename).resolves(readableStream);
  });

  it('parses the csv received and replace the SupOrganizationLearner', async function () {
    const warnings = Symbol('warnings');

    supOrganizationLearnerParserCreateStub.withArgs(buffer, organizationId, i18n).returns({
      parse: sinon.stub().returns({ learners, warnings }),
    });

    const supOrganizationLearnerRepository = {
      replaceStudents: sinon.stub(),
    };

    await replaceSupOrganizationLearners({
      payload,
      organizationId,
      userId,
      i18n,
      supOrganizationLearnerRepository,
      importStorage: importStorageStub,
      dependencies: { getDataBuffer: sinon.stub().resolves(buffer) },
    });

    expect(supOrganizationLearnerRepository.replaceStudents).to.have.been.calledWithExactly(
      organizationId,
      learners,
      userId,
    );
  });

  it('should return warnings about the import', async function () {
    const expectedWarnings = Symbol('warnings');
    supOrganizationLearnerParserCreateStub.withArgs(buffer, organizationId, i18n).returns({
      parse: sinon.stub().returns({ learners, warnings: expectedWarnings }),
    });

    const supOrganizationLearnerRepository = {
      replaceStudents: sinon.stub(),
    };

    const warnings = await replaceSupOrganizationLearners({
      payload,
      organizationId,
      userId,
      i18n,
      supOrganizationLearnerRepository,
      importStorage: importStorageStub,
      dependencies: { getDataBuffer: sinon.stub().resolves(buffer) },
    });

    expect(warnings).to.equal(expectedWarnings);
  });
  it('should delete file on s3', async function () {
    supOrganizationLearnerParserCreateStub.withArgs(buffer, organizationId, i18n).returns({
      parse: sinon.stub().returns({ learners, warnings: {} }),
    });
    const supOrganizationLearnerRepository = {
      replaceStudents: sinon.stub(),
    };

    await replaceSupOrganizationLearners({
      payload,
      organizationId,
      userId,
      i18n,
      supOrganizationLearnerRepository,
      importStorage: importStorageStub,
      dependencies: { getDataBuffer: sinon.stub().resolves(buffer) },
    });
    expect(importStorageStub.deleteFile).to.have.been.calledWithExactly({ filename: payload.path });
  });
});
