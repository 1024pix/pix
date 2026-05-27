import fs from 'node:fs';
import * as url from 'node:url';

import sinon from 'sinon';

import * as certificationCandidatesOdsService from '../../../../../../../src/certification/enrolment/domain/services/certification-candidates-ods-service.js';
import * as centerRepository from '../../../../../../../src/certification/enrolment/infrastructure/repositories/center-repository.js';
import * as certificationCpfCityRepository from '../../../../../../../src/certification/enrolment/infrastructure/repositories/certification-cpf-city-repository.js';
import * as certificationCpfCountryRepository from '../../../../../../../src/certification/enrolment/infrastructure/repositories/certification-cpf-country-repository.js';
import { BILLING_MODES } from '../../../../../../../src/certification/shared/domain/constants.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../../src/certification/shared/domain/constants/certification-candidates-errors.js';
import { ComplementaryCertificationKeys } from '../../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';
import * as certificationCpfService from '../../../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import { CertificationCandidatesError } from '../../../../../../../src/shared/domain/errors.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

const { promises } = fs;

const { readFile } = promises;

const i18n = getI18n();

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Services | extractCertificationCandidatesFromCandidatesImportSheet', function () {
  let userId;
  let sessionId, session;
  let mailCheck;
  let candidateList;
  let cleaComplementaryCertification;
  let eduComplementaryCertification;

  beforeEach(async function () {
    cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
      label: 'CléA Numérique',
      key: ComplementaryCertificationKeys.CLEA,
    });
    eduComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
      label: 'Pix+ Édu 1er degré',
      key: ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
    });
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
    const sessionData = databaseBuilder.factory.buildSession({ certificationCenterId });
    sessionId = sessionData.id;
    session = domainBuilder.certification.enrolment.buildSession(sessionData);

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

    await databaseBuilder.commit();

    mailCheck = { assertEmailDomainHasMx: sinon.stub() };

    candidateList = _buildCandidateList({ sessionId });
  });

  it('should throw a CertificationCandidatesError if there is an error in the file', async function () {
    // given
    const odsFilePath = `${__dirname}/attendance_sheet_extract_mandatory_ko_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    mailCheck.assertEmailDomainHasMx.resolves();

    // when
    const error = await catchErr(
      certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
    )({
      i18n,
      session,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      centerRepository,
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
    mailCheck.assertEmailDomainHasMx.resolves();

    // when
    const error = await catchErr(
      certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
    )({
      i18n,
      session,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      centerRepository,
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
    mailCheck.assertEmailDomainHasMx.withArgs('jack@d.it').throws();

    // when
    const error = await catchErr(
      certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
    )({
      i18n,
      session,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      centerRepository,
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

  context('when the file has valid headers but no extractable candidate data', function () {
    it('should throw a CertificationCandidatesError with EMPTY_CANDIDATES_IMPORT code', async function () {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_extract_no_data_ko_test.ods`;
      const odsBuffer = await readFile(odsFilePath);

      // when
      const error = await catchErr(
        certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
      )({
        i18n,
        session,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        centerRepository,
        isSco: true,
        mailCheck,
      });

      // then
      expect(error).to.be.instanceOf(CertificationCandidatesError);
      expect(error.code).to.equal(CERTIFICATION_CANDIDATES_ERRORS.EMPTY_CANDIDATES_IMPORT.code);
    });
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
        session,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        centerRepository,
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
        session,
        isSco,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        centerRepository,
        mailCheck,
      });

    // then
    candidateList = _buildCandidateList({ sessionId });
    const expectedCandidates = candidateList.map((candidate) => {
      return domainBuilder.certification.enrolment.buildCandidate({
        ...candidate,
        subscription: candidate.subscriptions[0].complementaryCertificationKey || Frameworks.CORE,
        subscriptions: [],
      });
    });
    expect(actualCandidates).to.deep.equal(expectedCandidates);
  });

  context('when certification center has habilitations', function () {
    it('should return extracted and validated certification candidates with complementary certification', async function () {
      // given
      mailCheck.assertEmailDomainHasMx.resolves();

      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });

      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: eduComplementaryCertification.id,
      });

      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      const sessionData = databaseBuilder.factory.buildSession({ certificationCenterId });
      const session = domainBuilder.certification.enrolment.buildSession(sessionData);

      await databaseBuilder.commit();

      const odsFilePath = `${__dirname}/attendance_sheet_extract_with_complementary_certifications_ok_test.ods`;
      const odsBuffer = await readFile(odsFilePath);
      candidateList = _buildCandidateList({
        sessionId: sessionData.id,
        billingModes: [BILLING_MODES.FREE, BILLING_MODES.FREE],
        complementaryCertifications: [
          ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
          ComplementaryCertificationKeys.CLEA,
        ],
      });
      const expectedCandidates = candidateList.map((candidate) => {
        return domainBuilder.certification.enrolment.buildCandidate({
          ...candidate,
          subscription: candidate.subscriptions[0].complementaryCertificationKey || Frameworks.CORE,
          subscriptions: [],
        });
      });

      // when
      const actualCandidates =
        await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
          i18n,
          session,
          odsBuffer,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          centerRepository,
          isSco: false,
          mailCheck,
        });

      // then
      expect(actualCandidates).to.deep.equal(expectedCandidates);
    });

    it('should throw an error if candidate is registered for multiple certifications', async function () {
      // given
      mailCheck.assertEmailDomainHasMx.resolves();

      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });

      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: eduComplementaryCertification.id,
      });

      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      const sessionData = databaseBuilder.factory.buildSession({ certificationCenterId });
      const session = domainBuilder.certification.enrolment.buildSession(sessionData);

      await databaseBuilder.commit();

      const odsFilePath = `${__dirname}/attendance_sheet_extract_with_complementary_certifications_ko_test.ods`;
      const odsBuffer = await readFile(odsFilePath);

      // when
      const error = await catchErr(
        certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
      )({
        i18n,
        session,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        centerRepository,
        isSco: true,
        mailCheck,
      });

      // then
      expect(error).to.be.instanceOf(CertificationCandidatesError);
      expect(error.code).to.equal('CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION');
    });
  });

  it('should return extracted and validated certification candidates with billing information', async function () {
    // given
    mailCheck.assertEmailDomainHasMx.resolves();
    const isSco = false;

    const odsFilePath = `${__dirname}/attendance_sheet_extract_with_billing_ok_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    candidateList = _buildCandidateList({ billingModes: [BILLING_MODES.PAID, BILLING_MODES.FREE], sessionId });
    const expectedCandidates = candidateList.map((candidate) => {
      return domainBuilder.certification.enrolment.buildCandidate({
        ...candidate,
        subscription: candidate.subscriptions[0].complementaryCertificationKey || Frameworks.CORE,
        subscriptions: [],
      });
    });

    // when
    const actualCandidates =
      await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
        i18n,
        session,
        isSco,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        centerRepository,
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
    mailCheck.assertEmailDomainHasMx.resolves();

    // when
    const actualCandidates =
      await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
        i18n,
        session,
        isSco,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        centerRepository,
        mailCheck,
      });

    // then
    const expectedCandidates = candidateList.map((candidate) => {
      return domainBuilder.certification.enrolment.buildCandidate({
        ...candidate,
        subscription: candidate.subscriptions[0].complementaryCertificationKey || Frameworks.CORE,
        subscriptions: [],
      });
    });
    expect(actualCandidates).to.deep.equal(expectedCandidates);
  });
});

function _buildCandidateList({ billingModes = [], sessionId, complementaryCertifications = [] }) {
  const candidates = [];
  candidates.push({
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
    billingMode: billingModes[0] ? billingModes[0] : null,
    prepaymentCode: null,
    subscriptions: _buildSubscriptions(complementaryCertifications[0] ? complementaryCertifications[0] : null),
    organizationLearnerId: null,
    userId: null,
  });
  candidates.push({
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
    billingMode: billingModes[1] ? billingModes[1] : null,
    prepaymentCode: null,
    subscriptions: _buildSubscriptions(complementaryCertifications[1] ? complementaryCertifications[1] : null),
    organizationLearnerId: null,
    userId: null,
  });

  return candidates;
}

function _buildSubscriptions(subscriptionKey) {
  const subscriptions = [];

  if (subscriptionKey) {
    subscriptions.push(
      domainBuilder.certification.enrolment.buildComplementarySubscription({
        certificationCandidateId: null,
        complementaryCertificationKey: subscriptionKey,
      }),
    );
  }

  if (subscriptionKey === ComplementaryCertificationKeys.CLEA || !subscriptionKey) {
    subscriptions.push(domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId: null }));
  }

  return subscriptions;
}
