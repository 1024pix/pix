const { expect, sinon, catchErr } = require('../../../test-helper');
const certificationCandidatesOdsService = require('../../../../lib/domain/services/certification-candidates-ods-service');
const readOdsUtils = require('../../../../lib/infrastructure/utils/ods/read-ods-utils');
const { CertificationCandidatesImportError } = require('../../../../lib/domain/errors');

describe('Unit | Services | extractCertificationCandidatesFromAttendanceSheet', () => {
  let sessionId;
  let sandbox;
  const odsBuffer = 'someBuffer';
  const validCertificationCandidateData = {
    lastName: 'Brassens',
    firstName: 'Georges',
    birthCity: 'Sète',
    birthProvinceCode: '34',
    birthCountry: 'France',
    birthdate: '1921-10-22',
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('When attendance sheet is of version 1.3', () => {
    const expectedVersion = '1.3';

    context('error handling', () => {
      context('line number', () => {
        it('it should display the appropriate line number in the error', async () => {
          // given
          sessionId = 123;
          const lineNumber = 80;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            firstName: null,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ [lineNumber] : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.equal(`Ligne ${lineNumber + 1} : Le champ “Prénom” est obligatoire.`);
        });
      });
      context('first name', () => {
        it('it should throw error when missing', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            firstName: null,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Prénom” est obligatoire.');
        });
        it('it should throw error when not valid', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            firstName: 456,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Prénom” doit être une chaîne de caractères.');
        });

      });
      context('last name', () => {
        it('it should throw error when missing', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            lastName: null,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Nom de naissance” est obligatoire.');
        });
        it('it should throw error when not valid', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            lastName: 456,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Nom de naissance” doit être une chaîne de caractères.');
        });

      });
      context('birth city', () => {
        it('it should throw error when missing', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            birthCity: null,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Commune de naissance” est obligatoire.');
        });
        it('it should throw error when not valid', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            birthCity: 456,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Commune de naissance” doit être une chaîne de caractères.');
        });

      });
      context('birth province code', () => {
        it('it should throw error when missing', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            birthProvinceCode: null,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Code du département de naissance” est obligatoire.');
        });
        it('it should throw error when not valid', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            birthProvinceCode: 456,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Code du département de naissance” doit être une chaîne de caractères.');
        });
      });

      context('birth country', () => {
        it('it should throw error when missing', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            birthCountry: null,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Pays de naissance” est obligatoire.');
        });

        it('it should throw error when not valid', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            birthCountry: 456,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Pays de naissance” doit être une chaîne de caractères.');
        });
      });

      context('birthdate', () => {
        it('it should throw error when missing', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            birthdate: null,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Date de naissance (format : jj/mm/aaaa)” est obligatoire.');
        });

        it('it should throw error when not valid', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            birthdate: 'salut',
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Date de naissance” doit être au format jj/mm/aaaa.');
        });
      });

      context('email', () => {
        it('it should throw error when not valid', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            email: 456,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Adresse e-mail de convocation” doit être une chaîne de caractères.');
        });
      });

      context('externalId', () => {
        it('it should throw error when not valid', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            externalId: 456,
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Identifiant local” doit être une chaîne de caractères.');
        });
      });

      context('extraTimePercentage', () => {
        it('it should throw error when not valid', async () => {
          // given
          sessionId = 123;
          const certificationCandidateData = {
            ...validCertificationCandidateData,
            extraTimePercentage: 'salut',
          };
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').resolves({ '1' : certificationCandidateData });

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.contain('Le champ “Temps majoré ?” doit être un nombre.');
        });
      });

      context('version', () => {
        it('it should throw error when version is unknown', async () => {
          // given
          sessionId = 123;
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').rejects();

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.equal('La version du document est inconnue.');
        });
      });

      context('other', () => {
        it('it should throw generic error when something unknown goes wrong', async () => {
          // given
          sessionId = 123;
          sandbox.stub(readOdsUtils, 'getOdsVersionByHeaders').resolves(expectedVersion);
          sandbox.stub(readOdsUtils, 'extractTableDataFromOdsFile').rejects();

          // when
          const err = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet)({ sessionId, odsBuffer });

          // then
          expect(err).to.be.instanceOf(CertificationCandidatesImportError);
          expect(err.message).to.equal('Quelque chose s’est mal passé. Veuillez réessayer.');
        });
      });
    });
  });
});
