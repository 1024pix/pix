const { expect, databaseBuilder, catchErr } = require('../../../../test-helper');
const certificationCandidatesOdsService = require('../../../../../lib/domain/services/certification-candidates-ods-service');
const certificationCpfService = require('../../../../../lib/domain/services/certification-cpf-service');
const certificationCpfCountryRepository = require('../../../../../lib/infrastructure/repositories/certification-cpf-country-repository');
const certificationCpfCityRepository = require('../../../../../lib/infrastructure/repositories/certification-cpf-city-repository');
const CertificationCandidate = require('../../../../../lib/domain/models/CertificationCandidate');
const { CertificationCandidatesImportError } = require('../../../../../lib/domain/errors');
const { readFile } = require('fs').promises;
const _ = require('lodash');

describe('Integration | Services | extractCertificationCandidatesFromCandidatesImportSheet', () => {
  let userId;
  let sessionId;

  beforeEach(async () => {
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
    sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

    await databaseBuilder.commit();
  });

  context('When attendance sheet is of version different than 1.4', () => {
    it('should throw a CertificationCandidatesImportError', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-3_extract_ok_test.ods`;
      const odsBuffer = await readFile(odsFilePath);

      // when
      const error = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet)({
        sessionId,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
      });

      // then
      expect(error).to.be.instanceOf(CertificationCandidatesImportError);
      expect(error.message).to.equal('La version du document est inconnue.');
      expect(error.code).to.equal('INVALID_DOCUMENT');
    });
  });

  context('When attendance sheet is of version 1.4', () => {

    it('should throw a CertificationCandidatesImportError if there is an error in the file', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-4_extract_mandatory_ko_test.ods`;
      const odsBuffer = await readFile(odsFilePath);

      // when
      const error = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet)({
        sessionId,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
      });

      // then
      expect(error).to.be.instanceOf(CertificationCandidatesImportError);
      expect(error.message).to.contain('Le champ “Prénom” est obligatoire.');
      expect(error.code).to.be.null;
    });

    it('should return extracted and validated certification candidates', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet-1-4_extract_ok_test.ods`;
      const odsBuffer = await readFile(odsFilePath);
      const expectedCertificationCandidates = _.map([
        {
          lastName: 'Gallagher', firstName: 'Jack',
          birthdate: '2010-10-01', birthCity: 'Londres',
          birthCountry: 'Angleterre', birthProvinceCode: '66',
          resultRecipientEmail: 'recipient@example.net',
          email: 'jack@d.it', externalId: null,
          extraTimePercentage: 0.15, sessionId,
        },
        {
          lastName: 'Jackson', firstName: 'Janet',
          birthdate: '2018-09-25', birthCity: 'Milan',
          birthCountry: 'France', birthProvinceCode: '971',
          resultRecipientEmail: 'recipient@example.net',
          email: 'jaja@hotmail.fr', externalId: 'DEF456',
          extraTimePercentage: null, sessionId,
        },
        {
          lastName: 'Jackson', firstName: 'Michael',
          birthdate: '1995-01-15', birthCity: 'Paris',
          birthCountry: 'France', birthProvinceCode: '99',
          resultRecipientEmail: 'recipient@example.net',
          email: 'jackson@gmail.com', externalId: 'ABC123',
          extraTimePercentage: 0.6, sessionId,
        },
        {
          lastName: 'Mercury', firstName: 'Freddy',
          birthdate: '1925-06-14', birthCity: 'Barcelone',
          birthCountry: 'France', birthProvinceCode: '2A',
          resultRecipientEmail: 'other@example.net',
          email: null, externalId: 'GHI789',
          extraTimePercentage: 1.5, sessionId,
        },
      ], (candidate) => new CertificationCandidate(candidate));

      // when
      const actualCertificationCandidates =
        await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
          sessionId,
          odsBuffer,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });

      // then
      expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
    });
  });

  context('When attendance sheet is of version 1.5', () => {

    beforeEach(async () => {
      databaseBuilder.factory.buildCertificationCpfCountry({ code: '99100', commonName: 'FRANCE', originalName: 'FRANCE', matcher: 'ACEFNR' });
      databaseBuilder.factory.buildCertificationCpfCountry({ code: '99132', commonName: 'ANGLETERRE', originalName: 'ANGLETERRE', matcher: 'AEEEGLNRRT' });

      databaseBuilder.factory.buildCertificationCpfCity({ name: 'AJACCIO', INSEECode: '2A004', isActualName: true });
      databaseBuilder.factory.buildCertificationCpfCity({ name: 'PARIS 18', postalCode: '75018', isActualName: true });
      databaseBuilder.factory.buildCertificationCpfCity({ name: 'SAINT-ANNE', postalCode: '97180', isActualName: true });
      await databaseBuilder.commit();
    });

    it('should throw a CertificationCandidatesImportError if there is an error in the file', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-5_extract_mandatory_ko_test.ods`;
      const odsBuffer = await readFile(odsFilePath);

      // when
      const error = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet)({
        sessionId,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
      });

      // then
      expect(error).to.be.instanceOf(CertificationCandidatesImportError);
      expect(error.message).to.equal('Ligne 10 : Le champ “Prénom” est obligatoire.');
      expect(error.code).to.be.null;
    });

    it('should throw a CertificationCandidatesImportError if there is an error in the birth information', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-5_extract_birth_ko_test.ods`;
      const odsBuffer = await readFile(odsFilePath);

      // when
      const error = await catchErr(certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet)({
        sessionId,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
      });

      // then
      expect(error).to.be.instanceOf(CertificationCandidatesImportError);
      expect(error.message).to.equal('Ligne 10 : La valeur du code INSEE doit être "99" pour un pays étranger.');
      expect(error.code).to.be.null;
    });

    it('should return extracted and validated certification candidates', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-5_extract_ok_test.ods`;
      const odsBuffer = await readFile(odsFilePath);
      const expectedCertificationCandidates = _.map([
        {
          lastName: 'Gallagher', firstName: 'Jack',
          birthdate: '1980-08-10', sex: 'M', birthCity: 'Londres',
          birthCountry: 'ANGLETERRE', birthINSEECode: '99132',
          birthPostalCode: null, resultRecipientEmail: 'destinataire@gmail.com',
          email: 'jack@d.it', externalId: null,
          extraTimePercentage: 0.15, sessionId,
        },
        {
          lastName: 'Jackson', firstName: 'Janet',
          birthdate: '2005-12-05', sex: 'F', birthCity: 'AJACCIO',
          birthCountry: 'FRANCE', birthINSEECode: '2A004',
          birthPostalCode: null, resultRecipientEmail: 'destinataire@gmail.com',
          email: 'jaja@hotmail.fr', externalId: 'DEF456',
          extraTimePercentage: null, sessionId,
        },
        {
          lastName: 'Jackson', firstName: 'Michael',
          birthdate: '2004-04-04', sex: 'M', birthCity: 'PARIS 18',
          birthCountry: 'FRANCE', birthINSEECode: null,
          birthPostalCode: '75018', resultRecipientEmail: 'destinataire@gmail.com',
          email: 'jackson@gmail.com', externalId: 'ABC123',
          extraTimePercentage: 0.6, sessionId,
        },
        {
          lastName: 'Mercury', firstName: 'Freddy',
          birthdate: '1925-06-28', sex: 'M', birthCity: 'SAINT-ANNE',
          birthCountry: 'FRANCE', birthINSEECode: null,
          birthPostalCode: '97180', resultRecipientEmail: null,
          email: null, externalId: 'GHI789',
          extraTimePercentage: 1.5, sessionId,
        },
      ], (candidate) => new CertificationCandidate(candidate));

      // when
      const actualCertificationCandidates =
        await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
          sessionId,
          odsBuffer,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });

      // then
      expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
    });
  });
});
