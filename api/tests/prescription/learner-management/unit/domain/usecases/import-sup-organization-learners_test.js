import { expect, sinon } from '../../../../../test-helper.js';
import iconv from 'iconv-lite';

import { importSupOrganizationLearners } from '../../../../../../src/prescription/learner-management/domain/usecases/import-sup-organization-learners.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

const i18n = getI18n();

const supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

describe('Unit | UseCase | ImportSupOrganizationLearner', function () {
  let supOrganizationLearnerRepositoryStub, importStorageStub, payload, readableStream, filename;
  beforeEach(function () {
    filename = Symbol('FILE_NAME');
    payload = { path: filename };
    readableStream = Symbol('readableStream');

    supOrganizationLearnerRepositoryStub = { addStudents: sinon.stub() };
    supOrganizationLearnerRepositoryStub.addStudents.resolves();

    importStorageStub = {
      sendFile: sinon.stub(),
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(filename);
    importStorageStub.readFile.withArgs(filename).resolves(readableStream);
  });

  context('when there is no organization learners for the organization', function () {
    it('parses the csv received and creates the SupOrganizationLearner', async function () {
      const input = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
          O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
      `.trim();

      const encodedInput = iconv.encode(input, 'utf8');

      await importSupOrganizationLearners({
        payload,
        organizationId: 2,
        i18n,
        importStorage: importStorageStub,
        dependencies: { getDataBuffer: () => encodedInput },
        supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
      });

      expect(supOrganizationLearnerRepositoryStub.addStudents).to.have.been.calledWithExactly([
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
          organizationId: 2,
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
          organizationId: 2,
        },
      ]);
    });
  });

  it('should return warnings about the import', async function () {
    const input = `${supOrganizationLearnerImportHeader}
            Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
        `.trim();

    const encodedInput = iconv.encode(input, 'utf8');

    const warnings = await importSupOrganizationLearners({
      payload,
      importStorage: importStorageStub,
      organizationId: 2,
      i18n,
      dependencies: { getDataBuffer: () => encodedInput },
      supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
    });

    expect(warnings).to.deep.equal([
      { studentNumber: '123456', field: 'study-scheme', value: 'BAD', code: 'unknown' },
      { studentNumber: '123456', field: 'diploma', value: 'BAD', code: 'unknown' },
    ]);
  });
});
