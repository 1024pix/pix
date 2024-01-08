import { catchErr, databaseBuilder, domainBuilder, expect, sinon } from '../../../../test-helper.js';
import * as certificationCandidatesOdsService from '../../../../../lib/domain/services/certification-candidates-ods-service.js';
import * as certificationCpfService from '../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import * as certificationCpfCountryRepository from '../../../../../src/certification/shared/infrastructure/repositories/certification-cpf-country-repository.js';
import * as certificationCpfCityRepository from '../../../../../src/certification/shared/infrastructure/repositories/certification-cpf-city-repository.js';
import * as certificationCenterRepository from '../../../../../src/certification/shared/infrastructure/repositories/certification-center-repository.js';
import * as complementaryCertificationRepository from '../../../../../lib/infrastructure/repositories/complementary-certification-repository.js';
import { CertificationCandidate } from '../../../../../lib/domain/models/index.js';
import { CertificationCandidatesError } from '../../../../../lib/domain/errors.js';
import fs from 'fs';
import _ from 'lodash';
import { getI18n } from '../../../../tooling/i18n/i18n.js';
import * as url from 'url';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../lib/domain/constants/certification-candidates-errors.js';
import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';

const { promises } = fs;

const { readFile } = promises;

const i18n = getI18n();

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Services | extractCertificationCandidatesFromCandidatesImportSheet', function () {
  let userId;
  let sessionId;
  let mailCheck;

  beforeEach(async function () {
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
    sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

    databaseBuilder.factory.buildCertificationCpfCountry({
      code: '99100',
      commonName: 'FRANCE',
      originalName: 'FRANCE',
      matcher: 'ACEFNR',
    });
    databaseBuilder.factory.buildCertificationCpfCountry({
      code: '99132',
      commonName: 'ANGLETERRE',
      originalName: 'ANGLETERRE',
      matcher: 'AEEEGLNRRT',
    });

    databaseBuilder.factory.buildCertificationCpfCity({ name: 'AJACCIO', INSEECode: '2A004', isActualName: true });
    databaseBuilder.factory.buildCertificationCpfCity({ name: 'PARIS 18', postalCode: '75018', isActualName: true });
    databaseBuilder.factory.buildCertificationCpfCity({
      name: 'SAINT-ANNE',
      postalCode: '97180',
      isActualName: true,
    });

    databaseBuilder.factory.buildCertificationCpfCity({
      name: 'BUELLAS',
      postalCode: '01310',
      INSEECode: '01065',
    });
    await databaseBuilder.commit();

    mailCheck = { checkDomainIsValid: sinon.stub() };
  });

  it('should throw a CertificationCandidatesError if there is an error in the file', async function () {
    // given
    const odsFilePath = `${__dirname}/attendance_sheet_extract_mandatory_ko_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    mailCheck.checkDomainIsValid.resolves();

    // when
    const error = await catchErr(
      certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
    )({
      i18n,
      sessionId,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      certificationCenterRepository,
      complementaryCertificationRepository,
      isSco: true,
      mailCheck,
    });

    // then
    expect(error).to.be.instanceOf(CertificationCandidatesError);
    expect(error.code).to.equal('CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID');
    expect(error.meta).to.deep.equal({ line: 13, value: 'destinataire@gmail.com, destinataire@gmail.com' });
  });

  it('should throw a CertificationCandidatesError if there is an error in the birth information', async function () {
    // given
    const odsFilePath = `${__dirname}/attendance_sheet_extract_birth_ko_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    mailCheck.checkDomainIsValid.resolves();

    // when
    const error = await catchErr(
      certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
    )({
      i18n,
      sessionId,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      certificationCenterRepository,
      complementaryCertificationRepository,
      isSco: true,
      mailCheck,
    });

    // then
    expect(error).to.be.instanceOf(CertificationCandidatesError);
    expect(error.code).to.equal(CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FOREIGN_INSEE_CODE_NOT_VALID.code);
  });

  it('should throw a CertificationCandidatesError if there are email errors', async function () {
    // given
    const odsFilePath = `${__dirname}/attendance_sheet_extract_recipient_email_ko_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    mailCheck.checkDomainIsValid.withArgs('jack@d.it').throws();

    // when
    const error = await catchErr(
      certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
    )({
      i18n,
      sessionId,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      certificationCenterRepository,
      complementaryCertificationRepository,
      isSco: true,
      mailCheck,
    });

    // then
    const certificationCandidatesError = new CertificationCandidatesError({
      code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
      meta: { email: 'jack@d.it', line: 1 },
    });

    expect(error).to.deepEqualInstance(certificationCandidatesError);
  });

  context('when there is duplicate certification candidate', function () {
    it('should throw a CertificationCandidatesError', async function () {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_extract_duplicate_candidate_ko_test.ods`;
      const odsBuffer = await readFile(odsFilePath);

      // when
      const error = await catchErr(
        certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
      )({
        i18n,
        sessionId,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        certificationCenterRepository,
        complementaryCertificationRepository,
        isSco: true,
        mailCheck,
      });

      // then
      const certificationCandidatesError = new CertificationCandidatesError({
        code: CERTIFICATION_CANDIDATES_ERRORS.DUPLICATE_CANDIDATE.code,
        meta: { line: 14 },
      });

      expect(error).to.deepEqualInstance(certificationCandidatesError);
    });
  });

  it('should return extracted and validated certification candidates', async function () {
    // given
    const isSco = true;
    const odsFilePath = `${__dirname}/attendance_sheet_extract_ok_test.ods`;
    const odsBuffer = await readFile(odsFilePath);

    // when
    const actualCertificationCandidates =
      await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
        i18n,
        sessionId,
        isSco,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        certificationCenterRepository,
        complementaryCertificationRepository,
        mailCheck,
      });

    // then
    const expectedCertificationCandidates = _.map(
      [
        {
          lastName: 'Gallagher',
          firstName: 'Jack',
          birthdate: '1980-08-10',
          sex: 'M',
          birthCity: 'Londres',
          birthCountry: 'ANGLETERRE',
          birthINSEECode: '99132',
          birthPostalCode: null,
          resultRecipientEmail: 'destinataire@gmail.com',
          email: 'jack@d.it',
          externalId: null,
          extraTimePercentage: 0.15,
          sessionId,
        },
        {
          lastName: 'Jackson',
          firstName: 'Janet',
          birthdate: '2005-12-05',
          sex: 'F',
          birthCity: 'AJACCIO',
          birthCountry: 'FRANCE',
          birthINSEECode: '2A004',
          birthPostalCode: null,
          resultRecipientEmail: 'destinataire@gmail.com',
          email: 'jaja@hotmail.fr',
          externalId: 'DEF456',
          extraTimePercentage: null,
          sessionId,
        },
        {
          lastName: 'Jackson',
          firstName: 'Michael',
          birthdate: '2004-04-04',
          sex: 'M',
          birthCity: 'PARIS 18',
          birthCountry: 'FRANCE',
          birthINSEECode: null,
          birthPostalCode: '75018',
          resultRecipientEmail: 'destinataire@gmail.com',
          email: 'jackson@gmail.com',
          externalId: 'ABC123',
          extraTimePercentage: 0.6,
          sessionId,
        },
        {
          lastName: 'Mercury',
          firstName: 'Freddy',
          birthdate: '1925-06-28',
          sex: 'M',
          birthCity: 'SAINT-ANNE',
          birthCountry: 'FRANCE',
          birthINSEECode: null,
          birthPostalCode: '97180',
          resultRecipientEmail: null,
          email: null,
          externalId: 'GHI789',
          extraTimePercentage: 1.5,
          sessionId,
        },
        {
          firstName: 'Annie',
          lastName: 'Cordy',
          birthCity: 'BUELLAS',
          birthProvinceCode: undefined,
          birthCountry: 'FRANCE',
          birthPostalCode: '01310',
          birthINSEECode: null,
          sex: 'M',
          email: null,
          resultRecipientEmail: null,
          externalId: 'GHI769',
          birthdate: '1928-06-16',
          extraTimePercentage: 1.5,
          createdAt: undefined,
          authorizedToStart: undefined,
          userId: undefined,
          organizationLearnerId: null,
          complementaryCertification: null,
          billingMode: null,
          prepaymentCode: null,
          sessionId,
        },
        {
          firstName: 'Demis',
          lastName: 'Roussos',
          birthCity: 'BUELLAS',
          birthProvinceCode: undefined,
          birthCountry: 'FRANCE',
          birthPostalCode: null,
          birthINSEECode: '01065',
          sex: 'M',
          email: null,
          resultRecipientEmail: null,
          externalId: 'GHI799',
          birthdate: '1946-06-15',
          extraTimePercentage: 1.5,
          createdAt: undefined,
          authorizedToStart: undefined,
          userId: undefined,
          organizationLearnerId: null,
          complementaryCertification: null,
          billingMode: null,
          prepaymentCode: null,
          sessionId,
        },
      ],
      (candidate) => new CertificationCandidate(candidate),
    );
    expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
  });

  context('when certification center has habilitations', function () {
    context('when a candidate is imported with more than one complementary certification', function () {
      it('should throw an error', async function () {
        // given
        const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'CléA Numérique',
          key: ComplementaryCertificationKeys.CLEA,
        });
        const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Droit',
          key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
        });

        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: cleaComplementaryCertification.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: pixPlusDroitComplementaryCertification.id,
        });

        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

        await databaseBuilder.commit();

        const odsFilePath = `${__dirname}/attendance_sheet_extract_with_complementary_certifications_ko_test.ods`;
        const odsBuffer = await readFile(odsFilePath);

        // when
        const error = await catchErr(
          certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
        )({
          i18n,
          sessionId,
          odsBuffer,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          certificationCenterRepository,
          complementaryCertificationRepository,
          isSco: false,
          mailCheck,
        });

        // then
        expect(error).to.deepEqualInstance(
          new CertificationCandidatesError({
            code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION.code,
            message: 'A candidate cannot have more than one complementary certification',
            meta: {
              line: 13,
            },
          }),
        );
      });
    });

    it('should return extracted and validated certification candidates with complementary certification', async function () {
      // given
      mailCheck.checkDomainIsValid.resolves();
      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        label: 'CléA Numérique',
        key: ComplementaryCertificationKeys.CLEA,
      });
      const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Pix+ Droit',
        key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
      });
      const pixPlusEdu1erDegreComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Pix+ Édu 1er degré',
        key: ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
      });
      const pixPlusEdu2ndDegreComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Pix+ Édu 2nd degré',
        key: ComplementaryCertificationKeys.PIX_PLUS_EDU_2ND_DEGRE,
      });

      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: pixPlusDroitComplementaryCertification.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: pixPlusEdu1erDegreComplementaryCertification.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: pixPlusEdu2ndDegreComplementaryCertification.id,
      });

      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

      await databaseBuilder.commit();

      const odsFilePath = `${__dirname}/attendance_sheet_extract_with_complementary_certifications_ok_test.ods`;
      const odsBuffer = await readFile(odsFilePath);
      const expectedCertificationCandidates = _.map(
        [
          {
            lastName: 'Gallagher',
            firstName: 'Jack',
            birthdate: '1980-08-10',
            sex: 'M',
            birthCity: 'Londres',
            birthCountry: 'ANGLETERRE',
            birthINSEECode: '99132',
            birthPostalCode: null,
            resultRecipientEmail: 'destinataire@gmail.com',
            email: 'jack@d.it',
            externalId: null,
            extraTimePercentage: 0.15,
            sessionId,
            billingMode: 'FREE',
            complementaryCertification: domainBuilder.buildComplementaryCertification(
              pixPlusEdu1erDegreComplementaryCertification,
            ),
          },
          {
            lastName: 'Jackson',
            firstName: 'Janet',
            birthdate: '2005-12-05',
            sex: 'F',
            birthCity: 'AJACCIO',
            birthCountry: 'FRANCE',
            birthINSEECode: '2A004',
            birthPostalCode: null,
            resultRecipientEmail: 'destinataire@gmail.com',
            email: 'jaja@hotmail.fr',
            externalId: 'DEF456',
            extraTimePercentage: null,
            sessionId,
            billingMode: 'FREE',
            complementaryCertification: domainBuilder.buildComplementaryCertification(
              pixPlusDroitComplementaryCertification,
            ),
          },
          {
            lastName: 'Jackson',
            firstName: 'Michael',
            birthdate: '2004-04-04',
            sex: 'M',
            birthCity: 'PARIS 18',
            birthCountry: 'FRANCE',
            birthINSEECode: null,
            birthPostalCode: '75018',
            resultRecipientEmail: 'destinataire@gmail.com',
            email: 'jackson@gmail.com',
            externalId: 'ABC123',
            extraTimePercentage: 0.6,
            sessionId,
            billingMode: 'FREE',
            complementaryCertification: domainBuilder.buildComplementaryCertification(cleaComplementaryCertification),
          },
          {
            lastName: 'Mercury',
            firstName: 'Freddy',
            birthdate: '1925-06-28',
            sex: 'M',
            birthCity: 'SAINT-ANNE',
            birthCountry: 'FRANCE',
            birthINSEECode: null,
            birthPostalCode: '97180',
            resultRecipientEmail: null,
            email: null,
            externalId: 'GHI789',
            extraTimePercentage: 1.5,
            sessionId,
            billingMode: 'FREE',
            complementaryCertification: domainBuilder.buildComplementaryCertification(
              pixPlusEdu2ndDegreComplementaryCertification,
            ),
          },
        ],
        (candidate) => new CertificationCandidate(candidate),
      );

      // when
      const actualCertificationCandidates =
        await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
          i18n,
          sessionId,
          odsBuffer,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          certificationCenterRepository,
          complementaryCertificationRepository,
          isSco: false,
          mailCheck,
        });

      // then
      expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
    });
  });

  it('should return extracted and validated certification candidates with billing information', async function () {
    // given
    mailCheck.checkDomainIsValid.resolves();
    const isSco = false;

    const userId = databaseBuilder.factory.buildUser().id;
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
    const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

    await databaseBuilder.commit();

    const odsFilePath = `${__dirname}/attendance_sheet_extract_with_billing_ok_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    const expectedCertificationCandidates = _.map(
      [
        {
          lastName: 'Gallagher',
          firstName: 'Jack',
          birthdate: '1980-08-10',
          sex: 'M',
          birthCity: 'Londres',
          birthCountry: 'ANGLETERRE',
          birthINSEECode: '99132',
          birthPostalCode: null,
          resultRecipientEmail: 'destinataire@gmail.com',
          email: 'jack@d.it',
          externalId: null,
          extraTimePercentage: 0.15,
          sessionId,
          billingMode: 'PAID',
        },
        {
          lastName: 'Jackson',
          firstName: 'Janet',
          birthdate: '2005-12-05',
          sex: 'F',
          birthCity: 'AJACCIO',
          birthCountry: 'FRANCE',
          birthINSEECode: '2A004',
          birthPostalCode: null,
          resultRecipientEmail: 'destinataire@gmail.com',
          email: 'jaja@hotmail.fr',
          externalId: 'DEF456',
          extraTimePercentage: null,
          sessionId,
          billingMode: 'FREE',
        },
        {
          lastName: 'Jackson',
          firstName: 'Michael',
          birthdate: '2004-04-04',
          sex: 'M',
          birthCity: 'PARIS 18',
          birthCountry: 'FRANCE',
          birthINSEECode: null,
          birthPostalCode: '75018',
          resultRecipientEmail: 'destinataire@gmail.com',
          email: 'jackson@gmail.com',
          externalId: 'ABC123',
          extraTimePercentage: 0.6,
          sessionId,
          billingMode: 'FREE',
        },
        {
          lastName: 'Mercury',
          firstName: 'Freddy',
          birthdate: '1925-06-28',
          sex: 'M',
          birthCity: 'SAINT-ANNE',
          birthCountry: 'FRANCE',
          birthINSEECode: null,
          birthPostalCode: '97180',
          resultRecipientEmail: null,
          email: null,
          externalId: 'GHI789',
          extraTimePercentage: 1.5,
          sessionId,
          billingMode: 'PREPAID',
          prepaymentCode: 'CODE1',
        },
      ],
      (candidate) => new CertificationCandidate(candidate),
    );

    // when
    const actualCertificationCandidates =
      await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
        i18n,
        sessionId,
        isSco,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        certificationCenterRepository,
        complementaryCertificationRepository,
        mailCheck,
      });

    // then
    expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
  });

  it('should return extracted and validated certification candidates without billing information when certification center is AEFE', async function () {
    // given
    const isSco = true;
    const odsFilePath = `${__dirname}/attendance_sheet_extract_ok_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    mailCheck.checkDomainIsValid.resolves();

    // when
    const actualCertificationCandidates =
      await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
        i18n,
        sessionId,
        isSco,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        certificationCenterRepository,
        complementaryCertificationRepository,
        mailCheck,
      });

    // then
    const expectedCertificationCandidates = _.map(
      [
        {
          lastName: 'Gallagher',
          firstName: 'Jack',
          birthdate: '1980-08-10',
          sex: 'M',
          birthCity: 'Londres',
          birthCountry: 'ANGLETERRE',
          birthINSEECode: '99132',
          birthPostalCode: null,
          resultRecipientEmail: 'destinataire@gmail.com',
          email: 'jack@d.it',
          externalId: null,
          extraTimePercentage: 0.15,
          sessionId,
        },
        {
          lastName: 'Jackson',
          firstName: 'Janet',
          birthdate: '2005-12-05',
          sex: 'F',
          birthCity: 'AJACCIO',
          birthCountry: 'FRANCE',
          birthINSEECode: '2A004',
          birthPostalCode: null,
          resultRecipientEmail: 'destinataire@gmail.com',
          email: 'jaja@hotmail.fr',
          externalId: 'DEF456',
          extraTimePercentage: null,
          sessionId,
        },
        {
          lastName: 'Jackson',
          firstName: 'Michael',
          birthdate: '2004-04-04',
          sex: 'M',
          birthCity: 'PARIS 18',
          birthCountry: 'FRANCE',
          birthINSEECode: null,
          birthPostalCode: '75018',
          resultRecipientEmail: 'destinataire@gmail.com',
          email: 'jackson@gmail.com',
          externalId: 'ABC123',
          extraTimePercentage: 0.6,
          sessionId,
        },
        {
          lastName: 'Mercury',
          firstName: 'Freddy',
          birthdate: '1925-06-28',
          sex: 'M',
          birthCity: 'SAINT-ANNE',
          birthCountry: 'FRANCE',
          birthINSEECode: null,
          birthPostalCode: '97180',
          resultRecipientEmail: null,
          email: null,
          externalId: 'GHI789',
          extraTimePercentage: 1.5,
          sessionId,
        },
        {
          firstName: 'Annie',
          lastName: 'Cordy',
          birthCity: 'BUELLAS',
          birthProvinceCode: undefined,
          birthCountry: 'FRANCE',
          birthPostalCode: '01310',
          birthINSEECode: null,
          sex: 'M',
          email: null,
          resultRecipientEmail: null,
          externalId: 'GHI769',
          birthdate: '1928-06-16',
          extraTimePercentage: 1.5,
          createdAt: undefined,
          authorizedToStart: undefined,
          userId: undefined,
          organizationLearnerId: null,
          complementaryCertification: null,
          billingMode: null,
          prepaymentCode: null,
          sessionId,
        },
        {
          firstName: 'Demis',
          lastName: 'Roussos',
          birthCity: 'BUELLAS',
          birthProvinceCode: undefined,
          birthCountry: 'FRANCE',
          birthPostalCode: null,
          birthINSEECode: '01065',
          sex: 'M',
          email: null,
          resultRecipientEmail: null,
          externalId: 'GHI799',
          birthdate: '1946-06-15',
          extraTimePercentage: 1.5,
          createdAt: undefined,
          authorizedToStart: undefined,
          userId: undefined,
          organizationLearnerId: null,
          complementaryCertification: null,
          billingMode: null,
          prepaymentCode: null,
          sessionId,
        },
      ],
      (candidate) => new CertificationCandidate(candidate),
    );
    expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
  });
});
