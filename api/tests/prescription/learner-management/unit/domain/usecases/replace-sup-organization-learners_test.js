import { Readable } from 'node:stream';

import iconv from 'iconv-lite';

import { OrganizationImport } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { replaceSupOrganizationLearners } from '../../../../../../src/prescription/learner-management/domain/usecases/replace-sup-organization-learner.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

const i18n = getI18n();

describe('Unit | UseCase | ReplaceSupOrganizationLearner', function () {
  let filename,
    payload,
    importStorageStub,
    supOrganizationLearnerImportHeader,
    supOrganizationLearnerRepositoryStub,
    organizationImportRepositoryStub,
    csvStream,
    expectedLearners,
    expectedWarnings,
    userId,
    organizationId;

  beforeEach(function () {
    supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(i18n).columns
      .map((column) => column.name)
      .join(';');

    userId = Symbol('userId');
    organizationId = 1;

    filename = Symbol('FILE_NAME');

    payload = { path: filename };

    organizationImportRepositoryStub = {
      getLastByOrganizationId: sinon.stub(),
      save: sinon.stub(),
    };

    importStorageStub = {
      sendFile: sinon.stub(),
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    organizationImportRepositoryStub.getLastByOrganizationId.callsFake(
      () => new OrganizationImport({ organizationId, createdBy: 2, encoding: 'utf-8' }),
    );
  });

  describe('when there is no errors', function () {
    beforeEach(function () {
      supOrganizationLearnerRepositoryStub = { replaceStudents: sinon.stub() };
      supOrganizationLearnerRepositoryStub.replaceStudents.resolves();

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

      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(filename);
      importStorageStub.readFile.withArgs({ filename }).resolves(csvStream);
    });

    it('parses the csv received and replace the SupOrganizationLearner', async function () {
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

      await replaceSupOrganizationLearners({
        payload,
        organizationId,
        userId,
        i18n,
        supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
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

      expect(supOrganizationLearnerRepositoryStub.replaceStudents).to.have.been.calledWithExactly(
        organizationId,
        expectedLearners,
        userId,
      );
    });

    it('should return warnings about the import', async function () {
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

      const warnings = await replaceSupOrganizationLearners({
        payload,
        organizationId,
        userId,
        i18n,
        supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
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
      expect(warnings).to.deep.equals(expectedWarnings);
    });

    it('should delete file on s3', async function () {
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

      await replaceSupOrganizationLearners({
        payload,
        organizationId,
        userId,
        i18n,
        supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        importStorage: importStorageStub,
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
        await replaceSupOrganizationLearners({
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
          await catchErr(replaceSupOrganizationLearners)({
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
          await catchErr(replaceSupOrganizationLearners)({
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
          supOrganizationLearnerRepositoryStub.replaceStudents.rejects('errors');

          // when
          await catchErr(replaceSupOrganizationLearners)({
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
