import iconv from 'iconv-lite';
import { Readable } from 'stream';

import { replaceSupOrganizationLearners } from '../../../../../../src/prescription/learner-management/domain/usecases/replace-sup-organization-learner.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { expect, sinon } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

describe('Unit | UseCase | ReplaceSupOrganizationLearner', function () {
  let filename,
    payload,
    importStorageStub,
    supOrganizationLearnerRepositoryStub,
    csvStream,
    expectedLearners,
    expectedWarnings,
    userId,
    organizationId;

  beforeEach(function () {
    supOrganizationLearnerRepositoryStub = { replaceStudents: sinon.stub() };
    supOrganizationLearnerRepositoryStub.replaceStudents.resolves();
    csvStream = new Readable({
      read() {
        const supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(getI18n()).columns
          .map((column) => column.name)
          .join(';');

        const csvData = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
          O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
          `.trim();
        this.push(iconv.encode(csvData, 'utf8'));
        this.push(null);
      },
    });
    expectedLearners = [
      {
        firstName: 'Beatrix',
        middleName: 'The',
        thirdName: 'Bride',
        lastName: 'Kiddo',
        preferredLastName: 'Black Mamba',
        studentNumber: '12346',
        email: 'thebride@example.net',
        birthdate: '1970-01-01',
        diploma: 'Non reconnu',
        department: 'Assassination Squad',
        educationalTeam: 'Hattori Hanzo',
        group: 'Deadly Viper Assassination Squad',
        studyScheme: 'Non reconnu',
        organizationId: 1,
      },
      {
        firstName: 'O-Ren',
        middleName: undefined,
        thirdName: undefined,
        lastName: 'Ishii',
        preferredLastName: 'Cottonmouth',
        studentNumber: '789',
        email: 'ishii@example.net',
        birthdate: '1980-01-01',
        diploma: 'Non reconnu',
        department: 'Assassination Squad',
        educationalTeam: 'Bill',
        group: 'Deadly Viper Assassination Squad',
        studyScheme: 'Non reconnu',
        organizationId: 1,
      },
    ];
    expectedWarnings = [
      {
        studentNumber: '12346',
        field: 'study-scheme',
        value: 'hello darkness my old friend',
        code: 'unknown',
      },
      {
        studentNumber: '12346',
        field: 'diploma',
        value: 'Master',
        code: 'unknown',
      },
      {
        studentNumber: '789',
        field: 'study-scheme',
        value: undefined,
        code: 'unknown',
      },
      {
        studentNumber: '789',
        field: 'diploma',
        value: 'DUT',
        code: 'unknown',
      },
    ];

    userId = Symbol('userId');
    organizationId = 1;

    filename = Symbol('FILE_NAME');

    payload = { path: filename };

    importStorageStub = {
      sendFile: sinon.stub(),
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };
    importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(filename);
    importStorageStub.readFile.withArgs({ filename }).resolves(csvStream);
  });

  it('parses the csv received and replace the SupOrganizationLearner', async function () {
    await replaceSupOrganizationLearners({
      payload,
      organizationId,
      userId,
      i18n: getI18n(),
      supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
      importStorage: importStorageStub,
    });

    expect(supOrganizationLearnerRepositoryStub.replaceStudents).to.have.been.calledWithExactly(
      organizationId,
      expectedLearners,
      userId,
    );
  });

  it('should return warnings about the import', async function () {
    const warnings = await replaceSupOrganizationLearners({
      payload,
      organizationId,
      userId,
      i18n: getI18n(),
      supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
      importStorage: importStorageStub,
    });
    expect(warnings).to.deep.equals(expectedWarnings);
  });

  it('should delete file on s3', async function () {
    await replaceSupOrganizationLearners({
      payload,
      organizationId,
      userId,
      i18n: getI18n(),
      supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
      importStorage: importStorageStub,
    });
    expect(importStorageStub.deleteFile).to.have.been.calledWithExactly({ filename: payload.path });
  });
});
