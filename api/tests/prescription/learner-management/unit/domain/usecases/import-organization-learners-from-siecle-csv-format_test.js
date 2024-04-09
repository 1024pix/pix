import { Readable } from 'node:stream';

import iconv from 'iconv-lite';

import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { OrganizationImport } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { importOrganizationLearnersFromSIECLECSVFormat } from '../../../../../../src/prescription/learner-management/domain/usecases/import-organization-learners-from-siecle-csv-format.js';
import { OrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/organization-learner-import-header.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

describe('Unit | UseCase | import-organization-learners-from-siecle-csv', function () {
  const organizationId = 1234;
  let organizationLearnerRepositoryStub;
  let organizationRepositoryStub;
  let organizationImportRepositoryStub;
  let importStorageStub;
  let payload;
  let filename;
  let domainTransaction;
  let i18n;
  let csvHeaders;
  let csv;

  beforeEach(function () {
    domainTransaction = Symbol();
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback(domainTransaction);
    });
    payload = { path: 'file' };
    filename = Symbol('file.csv');

    i18n = getI18n();
    csvHeaders = new OrganizationLearnerImportHeader(i18n).columns.map((column) => column.name).join(';');

    importStorageStub = {
      sendFile: sinon.stub(),
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    organizationLearnerRepositoryStub = {
      addOrUpdateOrganizationOfOrganizationLearners: sinon.stub(),
      addOrUpdateOrganizationAgriOrganizationLearners: sinon.stub(),
      findByOrganizationId: sinon.stub(),
      disableAllOrganizationLearnersInOrganization: sinon.stub().resolves(),
    };
    organizationImportRepositoryStub = {
      getLastByOrganizationId: sinon.stub(),
      save: sinon.stub(),
    };

    organizationImportRepositoryStub.getLastByOrganizationId.callsFake(
      () => new OrganizationImport({ organizationId, createdBy: 2, encoding: 'utf-8' }),
    );
    organizationRepositoryStub = { get: sinon.stub().resolves({ id: 123 }) };
  });

  context('when extracted organizationLearners informations can be imported', function () {
    beforeEach(function () {
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(filename);
      organizationRepositoryStub.get.withArgs(organizationId).resolves({ id: 123 });

      csv = `${csvHeaders}
      4581234567F;Léa;Jeannette;Klervi;Corse;Cottonmouth;Féminin;01/01/1990;2A214;;2A;99100;AP;MEF1;Division 2
      4581234567G;Léo;;;Corse;;Féminin;01/01/1990;;Plymouth;99;99132;ST;MEF1;Division 1
      `.trim();

      importStorageStub.readFile.withArgs({ filename }).resolves(
        new Readable({
          read() {
            this.push(iconv.encode(csv, 'utf8'));
            this.push(null);
          },
        }),
      );
    });

    it('should save these informations', async function () {
      await importOrganizationLearnersFromSIECLECSVFormat({
        organizationId,
        payload,
        organizationRepository: organizationRepositoryStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
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

      expect(organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners).to.have.been.called;
    });

    it('should delete file on s3', async function () {
      await importOrganizationLearnersFromSIECLECSVFormat({
        organizationId,
        payload,
        organizationRepository: organizationRepositoryStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
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
      expect(importStorageStub.deleteFile).to.have.been.called;
    });
  });
  context('save import state in database', function () {
    describe('success case', function () {
      it('should save uploaded, validated and imported state each after each', async function () {
        // given
        importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(filename);
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ id: 123 });

        csv = `${csvHeaders}
      4581234567F;Léa;Jeannette;Klervi;Corse;Cottonmouth;Féminin;01/01/1990;2A214;;2A;99100;AP;MEF1;Division 2
      4581234567G;Léo;;;Corse;;Féminin;01/01/1990;;Plymouth;99;99132;ST;MEF1;Division 1
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
        await importOrganizationLearnersFromSIECLECSVFormat({
          organizationId,
          payload,
          organizationRepository: organizationRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
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
          importStorageStub.sendFile.rejects();

          // when
          await catchErr(importOrganizationLearnersFromSIECLECSVFormat)({
            organizationId,
            payload,
            organizationRepository: organizationRepositoryStub,
            organizationLearnerRepository: organizationLearnerRepositoryStub,
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
          importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(filename);
          csv = `${csvHeaders}`.trim();

          importStorageStub.readFile.withArgs({ filename }).resolves(
            new Readable({
              read() {
                this.push(iconv.encode(csv, 'utf8'));
                this.push(null);
              },
            }),
          );
          // when
          await catchErr(importOrganizationLearnersFromSIECLECSVFormat)({
            organizationId,
            payload,
            organizationRepository: organizationRepositoryStub,
            organizationLearnerRepository: organizationLearnerRepositoryStub,
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
          importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(filename);
          organizationRepositoryStub.get.withArgs(organizationId).resolves({ id: 123 });

          csv = `${csvHeaders}
      4581234567F;Léa;Jeannette;Klervi;Corse;Cottonmouth;Féminin;01/01/1990;2A214;;2A;99100;AP;MEF1;Division 2
      4581234567G;Léo;;;Corse;;Féminin;01/01/1990;;Plymouth;99;99132;ST;MEF1;Division 1
      `.trim();

          importStorageStub.readFile.withArgs({ filename }).resolves(
            new Readable({
              read() {
                this.push(iconv.encode(csv, 'utf8'));
                this.push(null);
              },
            }),
          );
          organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners.rejects();

          // when
          await catchErr(importOrganizationLearnersFromSIECLECSVFormat)({
            organizationId,
            payload,
            organizationRepository: organizationRepositoryStub,
            organizationLearnerRepository: organizationLearnerRepositoryStub,
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
