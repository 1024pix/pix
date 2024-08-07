import fs from 'node:fs';
import * as url from 'node:url';

import * as complementaryCertificationRepository from '../../../../../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-repository.js';
import * as certificationCandidatesOdsService from '../../../../../../../src/certification/enrolment/domain/services/certification-candidates-ods-service.js';
import * as certificationCpfCityRepository from '../../../../../../../src/certification/enrolment/infrastructure/repositories/certification-cpf-city-repository.js';
import * as certificationCpfCountryRepository from '../../../../../../../src/certification/enrolment/infrastructure/repositories/certification-cpf-country-repository.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../../src/certification/shared/domain/constants/certification-candidates-errors.js';
import { ComplementaryCertificationKeys } from '../../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import * as certificationCpfService from '../../../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import * as certificationCenterRepository from '../../../../../../../src/certification/shared/infrastructure/repositories/certification-center-repository.js';
import { CertificationCandidatesError } from '../../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect, sinon } from '../../../../../../test-helper.js';
import { getI18n } from '../../../../../../tooling/i18n/i18n.js';
import { BILLING_MODES } from '../../../../../../../src/certification/shared/domain/constants.js';

const { promises } = fs;

const { readFile } = promises;

const i18n = getI18n();

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Services | extractCertificationCandidatesFromCandidatesImportSheet', function () {
  let userId;
  let sessionId;
  let mailCheck;
  let candidateList;

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

    candidateList = _buildCandidateList({ sessionId });
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
    const actualCandidates =
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
    candidateList = _buildCandidateList({ sessionId });
    const expectedCandidates = candidateList.map(domainBuilder.certification.enrolment.buildCandidate);
    expect(actualCandidates).to.deep.equal(expectedCandidates);
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
      const PixPlusProSanteComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Pix+ Pro Santé',
        key: ComplementaryCertificationKeys.PIX_PLUS_PRO_SANTE,
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
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: PixPlusProSanteComplementaryCertification.id,
      });

      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

      await databaseBuilder.commit();

      const odsFilePath = `${__dirname}/attendance_sheet_extract_with_complementary_certifications_ok_test.ods`;
      const odsBuffer = await readFile(odsFilePath);
      candidateList = _buildCandidateList({
        sessionId,
        complementaryCertifications: [
          pixPlusEdu1erDegreComplementaryCertification,
          pixPlusDroitComplementaryCertification,
          cleaComplementaryCertification,
          pixPlusEdu2ndDegreComplementaryCertification,
          PixPlusProSanteComplementaryCertification,
        ],
      });
      const expectedCandidates = candidateList.map(domainBuilder.certification.enrolment.buildCandidate);

      // when
      const actualCandidates =
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
      expect(actualCandidates).to.deep.equal(expectedCandidates);
    });
  });

  it('should return extracted and validated certification candidates with billing information', async function () {
    // given
    mailCheck.checkDomainIsValid.resolves();
    const isSco = false;

    const odsFilePath = `${__dirname}/attendance_sheet_extract_with_billing_ok_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    candidateList = _buildCandidateList({ hasBillingMode: true, sessionId });
    const expectedCandidates = candidateList.map(domainBuilder.certification.enrolment.buildCandidate);

    // when
    const actualCandidates =
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
    expect(actualCandidates).to.deep.equal(expectedCandidates);
  });

  it('should return extracted and validated certification candidates without billing information when certification center is AEFE', async function () {
    // given
    const isSco = true;
    const odsFilePath = `${__dirname}/attendance_sheet_extract_ok_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    mailCheck.checkDomainIsValid.resolves();

    // when
    const actualCandidates =
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
    const expectedCandidates = candidateList.map(domainBuilder.certification.enrolment.buildCandidate);
    expect(actualCandidates).to.deep.equal(expectedCandidates);
  });
});

function _buildCandidateList({ hasBillingMode = false, sessionId, complementaryCertifications = [] }) {
  const firstCandidate = {
    id: null,
    sessionId,
    createdAt: null,
    lastName: 'Gallagher',
    firstName: 'Jack',
    birthdate: '1980-08-10',
    sex: 'M',
    birthCity: 'Londres',
    birthCountry: 'ANGLETERRE',
    birthINSEECode: '99132',
    birthPostalCode: null,
    birthProvinceCode: null,
    resultRecipientEmail: 'destinataire@gmail.com',
    email: 'jack@d.it',
    externalId: null,
    extraTimePercentage: 0.15,
    billingMode: hasBillingMode ? BILLING_MODES.PAID : null,
    prepaymentCode: null,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
    organizationLearnerId: null,
    userId: null,
  };
  const secondCandidate = {
    id: null,
    sessionId,
    createdAt: null,
    lastName: 'Jackson',
    firstName: 'Janet',
    birthdate: '2005-12-05',
    sex: 'F',
    birthCity: 'AJACCIO',
    birthCountry: 'FRANCE',
    birthINSEECode: '2A004',
    birthPostalCode: null,
    birthProvinceCode: null,
    resultRecipientEmail: 'destinataire@gmail.com',
    email: 'jaja@hotmail.fr',
    externalId: 'DEF456',
    extraTimePercentage: null,
    billingMode: hasBillingMode ? BILLING_MODES.FREE : null,
    prepaymentCode: null,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
    organizationLearnerId: null,
    userId: null,
  };
  const thirdCandidate = {
    id: null,
    sessionId,
    createdAt: null,
    lastName: 'Jackson',
    firstName: 'Michael',
    birthdate: '2004-04-04',
    sex: 'M',
    birthCity: 'PARIS 18',
    birthCountry: 'FRANCE',
    birthINSEECode: null,
    birthPostalCode: '75018',
    birthProvinceCode: null,
    resultRecipientEmail: 'destinataire@gmail.com',
    email: 'jackson@gmail.com',
    externalId: 'ABC123',
    extraTimePercentage: 0.6,
    billingMode: hasBillingMode ? BILLING_MODES.FREE : null,
    prepaymentCode: null,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
    organizationLearnerId: null,
    userId: null,
  };
  const fourthCandidate = {
    id: null,
    sessionId,
    createdAt: null,
    lastName: 'Mercury',
    firstName: 'Freddy',
    birthdate: '1925-06-28',
    sex: 'M',
    birthCity: 'SAINT-ANNE',
    birthCountry: 'FRANCE',
    birthINSEECode: null,
    birthPostalCode: '97180',
    birthProvinceCode: null,
    resultRecipientEmail: null,
    email: null,
    externalId: 'GHI789',
    extraTimePercentage: 1.5,
    billingMode: hasBillingMode ? BILLING_MODES.PREPAID : null,
    prepaymentCode: hasBillingMode ? 'CODE1' : null,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
    organizationLearnerId: null,
    userId: null,
  };
  const fifthCandidate = {
    id: null,
    sessionId,
    createdAt: null,
    firstName: 'Annie',
    lastName: 'Cordy',
    birthCity: 'BUELLAS',
    birthCountry: 'FRANCE',
    birthPostalCode: '01310',
    birthINSEECode: null,
    birthProvinceCode: null,
    sex: 'M',
    email: null,
    resultRecipientEmail: null,
    externalId: 'GHI769',
    birthdate: '1928-06-16',
    extraTimePercentage: 1.5,
    billingMode: null,
    prepaymentCode: null,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
    organizationLearnerId: null,
    userId: null,
  };
  const sixthCandidate = {
    id: null,
    sessionId,
    createdAt: null,
    firstName: 'Demis',
    lastName: 'Roussos',
    birthCity: 'BUELLAS',
    birthCountry: 'FRANCE',
    birthPostalCode: null,
    birthINSEECode: '01065',
    birthProvinceCode: null,
    sex: 'M',
    email: null,
    resultRecipientEmail: null,
    externalId: 'GHI799',
    birthdate: '1946-06-15',
    extraTimePercentage: 1.5,
    billingMode: null,
    prepaymentCode: null,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
    organizationLearnerId: null,
    userId: null,
  };
  if (hasBillingMode) {
    return [firstCandidate, secondCandidate, thirdCandidate, fourthCandidate];
  }
  if (complementaryCertifications.length > 0) {
    firstCandidate.subscriptions.push(
      domainBuilder.buildComplementarySubscription({
        certificationCandidateId: null,
        complementaryCertificationId: complementaryCertifications[0].id,
      }),
    );
    firstCandidate.billingMode = BILLING_MODES.FREE;
    secondCandidate.subscriptions.push(
      domainBuilder.buildComplementarySubscription({
        certificationCandidateId: null,
        complementaryCertificationId: complementaryCertifications[1].id,
      }),
    );
    secondCandidate.billingMode = BILLING_MODES.FREE;
    thirdCandidate.subscriptions.push(
      domainBuilder.buildComplementarySubscription({
        certificationCandidateId: null,
        complementaryCertificationId: complementaryCertifications[2].id,
      }),
    );
    thirdCandidate.billingMode = BILLING_MODES.FREE;
    fourthCandidate.subscriptions.push(
      domainBuilder.buildComplementarySubscription({
        certificationCandidateId: null,
        complementaryCertificationId: complementaryCertifications[3].id,
      }),
    );
    fourthCandidate.billingMode = BILLING_MODES.FREE;
    const seventhCandidate = {
      sessionId,
      id: null,
      createdAt: null,
      lastName: 'Cendy',
      firstName: 'Alain',
      birthdate: '1988-06-28',
      sex: 'M',
      birthCity: 'SAINT-ANNE',
      birthCountry: 'FRANCE',
      birthINSEECode: null,
      birthPostalCode: '97180',
      birthProvinceCode: null,
      resultRecipientEmail: null,
      email: null,
      externalId: 'SDQ987',
      extraTimePercentage: null,
      organizationLearnerId: null,
      userId: null,
      billingMode: BILLING_MODES.FREE,
      subscriptions: [
        domainBuilder.buildCoreSubscription({ certificationCandidateId: null }),
        domainBuilder.buildComplementarySubscription({
          certificationCandidateId: null,
          complementaryCertificationId: complementaryCertifications[4].id,
        }),
      ],
      prepaymentCode: null,
    };
    return [firstCandidate, secondCandidate, thirdCandidate, fourthCandidate, seventhCandidate];
  }
  return [firstCandidate, secondCandidate, thirdCandidate, fourthCandidate, fifthCandidate, sixthCandidate];
}
