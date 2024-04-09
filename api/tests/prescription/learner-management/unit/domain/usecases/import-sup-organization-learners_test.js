import { Readable } from 'node:stream';

import iconv from 'iconv-lite';

import { OrganizationImport } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { importSupOrganizationLearners } from '../../../../../../src/prescription/learner-management/domain/usecases/import-sup-organization-learners.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';
const i18n = getI18n();

const supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

describe('Unit | UseCase | ImportSupOrganizationLearner', function () {
  const organizationId = 1234;
  let organizationImportRepositoryStub, supOrganizationLearnerRepositoryStub, importStorageStub, payload, filename;

  beforeEach(function () {
    filename = Symbol('file.csv');
    payload = { path: filename };

    supOrganizationLearnerRepositoryStub = { addStudents: sinon.stub() };
    supOrganizationLearnerRepositoryStub.addStudents.resolves();

    importStorageStub = {
      sendFile: sinon.stub(),
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    organizationImportRepositoryStub = {
      getLastByOrganizationId: sinon.stub(),
      save: sinon.stub(),
    };

    organizationImportRepositoryStub.getLastByOrganizationId.callsFake(
      () => new OrganizationImport({ organizationId, createdBy: 2, encoding: 'utf-8' }),
    );
  });

  context('when there is no errors', function () {
    beforeEach(function () {
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(filename);
    });

    it('parses the csv received and creates the SupOrganizationLearner', async function () {
      const input = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
          O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
      `.trim();

      importStorageStub.readFile.withArgs({ filename }).resolves(
        new Readable({
          read() {
            this.push(iconv.encode(input, 'utf8'));
            this.push(null);
          },
        }),
      );

      await importSupOrganizationLearners({
        payload,
        organizationId: 2,
        i18n,
        importStorage: importStorageStub,
        supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        dependencies: {
          createReadStream: sinon.stub().returns(
            new Readable({
              read() {
                this.push(iconv.encode(input, 'utf8'));
                this.push(null);
              },
            }),
          ),
        },
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

    it('should return warnings about the import', async function () {
      const input = `${supOrganizationLearnerImportHeader}
              Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          `.trim();

      importStorageStub.readFile.withArgs({ filename }).resolves(
        new Readable({
          read() {
            this.push(iconv.encode(input, 'utf8'));
            this.push(null);
          },
        }),
      );

      const warnings = await importSupOrganizationLearners({
        payload,
        importStorage: importStorageStub,
        organizationId: 2,
        i18n,
        supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        dependencies: {
          createReadStream: sinon.stub().returns(
            new Readable({
              read() {
                this.push(iconv.encode(input, 'utf8'));
                this.push(null);
              },
            }),
          ),
        },
      });

      expect(warnings).to.deep.equal([
        { studentNumber: '123456', field: 'study-scheme', value: 'BAD', code: 'unknown' },
        { studentNumber: '123456', field: 'diploma', value: 'BAD', code: 'unknown' },
      ]);
    });

    it('should delete file on s3', async function () {
      const input = `${supOrganizationLearnerImportHeader}
              Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;
          `.trim();

      importStorageStub.readFile.withArgs({ filename }).resolves(
        new Readable({
          read() {
            this.push(iconv.encode(input, 'utf8'));
            this.push(null);
          },
        }),
      );

      await importSupOrganizationLearners({
        payload,
        importStorage: importStorageStub,
        organizationId: 2,
        i18n,
        supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        dependencies: {
          createReadStream: sinon.stub().returns(
            new Readable({
              read() {
                this.push(iconv.encode(input, 'utf8'));
                this.push(null);
              },
            }),
          ),
        },
      });

      expect(importStorageStub.deleteFile).to.have.been.calledWithExactly({ filename: payload.path });
    });
  });

  context('save import state in database', function () {
    describe('success case', function () {
      it('should save uploaded, validated and imported state each after each', async function () {
        // given
        importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(filename);

        const csv = `${supOrganizationLearnerImportHeader}
        Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
        `.trim();

        importStorageStub.readFile.withArgs({ filename }).resolves(
          new Readable({
            read() {
              this.push(iconv.encode(csv, 'utf8'));
              this.push(null);
            },
          }),
        );

        // when
        await importSupOrganizationLearners({
          organizationId,
          payload,
          supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
          importStorage: importStorageStub,
          organizationImportRepository: organizationImportRepositoryStub,
          dependencies: {
            createReadStream: sinon.stub().returns(
              new Readable({
                read() {
                  this.push(iconv.encode(csv, 'utf8'));
                  this.push(null);
                },
              }),
            ),
          },
          i18n,
        });

        // then

        const firstSaveCall = organizationImportRepositoryStub.save.getCall(0).args[0];
        const secondSaveCall = organizationImportRepositoryStub.save.getCall(1).args[0];
        const thirdSaveCall = organizationImportRepositoryStub.save.getCall(2).args[0];

        expect(firstSaveCall.status).to.equal('UPLOADED');
        expect(secondSaveCall.status).to.equal('VALIDATED');
        expect(thirdSaveCall.status).to.equal('IMPORTED');
      });
    });

    describe('errors case', function () {
      describe('when there is an upload error', function () {
        it('should save UPLOAD_ERROR status', async function () {
          // given
          const csv = `${supOrganizationLearnerImportHeader}`;
          importStorageStub.sendFile.withArgs({ filepath: filename }).rejects();

          // when
          await catchErr(importSupOrganizationLearners)({
            organizationId,
            payload,
            supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
            importStorage: importStorageStub,
            organizationImportRepository: organizationImportRepositoryStub,
            dependencies: {
              createReadStream: sinon.stub().returns(
                new Readable({
                  read() {
                    this.push(iconv.encode(csv, 'utf8'));
                    this.push(null);
                  },
                }),
              ),
            },
            i18n,
          });

          // then

          expect(organizationImportRepositoryStub.save.getCall(0).args[0].status).to.equal('UPLOAD_ERROR');
        });
      });

      describe('when there is an validation error', function () {
        it('should save VALIDATION_ERROR status', async function () {
          // given
          importStorageStub.sendFile.withArgs({ filepath: filename }).resolves(filename);
          const csv = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          `.trim();

          importStorageStub.readFile.withArgs({ filename }).resolves(
            new Readable({
              read() {
                this.push(iconv.encode(csv, 'utf8'));
                this.push(null);
              },
            }),
          );
          // when
          await catchErr(importSupOrganizationLearners)({
            organizationId,
            payload,
            supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
            importStorage: importStorageStub,
            organizationImportRepository: organizationImportRepositoryStub,
            dependencies: {
              createReadStream: sinon.stub().returns(
                new Readable({
                  read() {
                    this.push(iconv.encode(csv, 'utf8'));
                    this.push(null);
                  },
                }),
              ),
            },
            i18n,
          });

          // then
          expect(organizationImportRepositoryStub.save.getCall(1).args[0].status).to.equal('VALIDATION_ERROR');
        });
      });

      describe('when there is an import error', function () {
        it('should save IMPORT_ERROR status', async function () {
          // given
          importStorageStub.sendFile.withArgs({ filepath: filename }).resolves(filename);

          const csv = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
          `.trim();

          importStorageStub.readFile.withArgs({ filename }).resolves(
            new Readable({
              read() {
                this.push(iconv.encode(csv, 'utf8'));
                this.push(null);
              },
            }),
          );
          supOrganizationLearnerRepositoryStub.addStudents.rejects('errors');

          // when
          await catchErr(importSupOrganizationLearners)({
            organizationId,
            payload,
            supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
            importStorage: importStorageStub,
            organizationImportRepository: organizationImportRepositoryStub,
            dependencies: {
              createReadStream: sinon.stub().returns(
                new Readable({
                  read() {
                    this.push(iconv.encode(csv, 'utf8'));
                    this.push(null);
                  },
                }),
              ),
            },
            i18n,
          });

          // then

          expect(organizationImportRepositoryStub.save.getCall(2).args[0].status).to.equal('IMPORT_ERROR');
        });
      });
    });
  });
});
