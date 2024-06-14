import fs from 'node:fs';
import * as url from 'node:url';

import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../../lib/domain/constants/certification-candidates-errors.js';
import { CertificationCandidatesError } from '../../../../../../../lib/domain/errors.js';
import { CertificationCandidate } from '../../../../../../../lib/domain/models/index.js';
import * as certificationCandidatesOdsService from '../../../../../../../lib/domain/services/certification-candidates-ods-service.js';
import * as complementaryCertificationRepository from '../../../../../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-repository.js';
import * as certificationCpfService from '../../../../../../../src/certification/enrolment/domain/services/certification-cpf-service.js';
import * as certificationCpfCityRepository from '../../../../../../../src/certification/enrolment/infrastructure/repositories/certification-cpf-city-repository.js';
import * as certificationCpfCountryRepository from '../../../../../../../src/certification/enrolment/infrastructure/repositories/certification-cpf-country-repository.js';
import * as certificationCenterRepository from '../../../../../../../src/certification/shared/infrastructure/repositories/certification-center-repository.js';
import { catchErr, databaseBuilder, domainBuilder, expect, sinon } from '../../../../../../test-helper.js';
import { CertificationCandidateBuilder } from '../../../../../../tooling/domain-builder/factory/build-certification-candidate.js';
import { getI18n } from '../../../../../../tooling/i18n/i18n.js';
import {
  candidateEvy,
  candidateJean,
  candidateLara,
  candidateLena,
  candidateOtto,
  candidatePat,
  candidateSarah,
} from '../../../../../shared/fixtures/data/candidates-data.js';
import * as complementaryData from '../../../../../shared/fixtures/data/complementary-data.js';
import {
  cityBordeaux,
  cityLyon,
  cityMarseille,
  cityNice,
  citySainteAnne,
} from '../../../../../shared/fixtures/data/cpf-cities-data.js';
import { countryAngleterre, countryFrance } from '../../../../../shared/fixtures/data/cpf-countries-data.js';

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

    databaseBuilder.factory.buildCertificationCpfCountry(countryFrance);
    databaseBuilder.factory.buildCertificationCpfCountry(countryAngleterre);

    databaseBuilder.factory.buildCertificationCpfCity(cityLyon);
    databaseBuilder.factory.buildCertificationCpfCity(citySainteAnne);
    databaseBuilder.factory.buildCertificationCpfCity(cityMarseille);
    databaseBuilder.factory.buildCertificationCpfCity(cityNice);
    databaseBuilder.factory.buildCertificationCpfCity(cityBordeaux);

    await databaseBuilder.commit();

    mailCheck = { checkDomainIsValid: sinon.stub() };

    const lena = new CertificationCandidateBuilder({
      ...candidateLena,
      sessionId,
      subscriptions: [domainBuilder.buildCoreSubscription()],
    }).build();
    const lara = new CertificationCandidateBuilder({
      ...candidateLara,
      sessionId,
      subscriptions: [domainBuilder.buildCoreSubscription()],
    }).build();
    const otto = new CertificationCandidateBuilder({
      ...candidateOtto,
      sessionId,
      subscriptions: [domainBuilder.buildCoreSubscription()],
    }).build();
    const pat = new CertificationCandidateBuilder({
      ...candidatePat,
      sessionId,
      subscriptions: [domainBuilder.buildCoreSubscription()],
    }).build();
    const jean = new CertificationCandidateBuilder({
      ...candidateJean,
      sessionId,
      subscriptions: [domainBuilder.buildCoreSubscription()],
    }).build();
    const evy = new CertificationCandidateBuilder({
      ...candidateEvy,
      sessionId,
      subscriptions: [domainBuilder.buildCoreSubscription()],
    }).build();
    const sarah = new CertificationCandidateBuilder({
      ...candidateSarah,
      sessionId,
      subscriptions: [domainBuilder.buildCoreSubscription()],
    }).build();

    candidateList = [lena, lara, otto, pat, jean, evy, sarah];
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
    expect(actualCertificationCandidates).to.deep.equal(candidateList);
  });

  context('when certification center has habilitations', function () {
    context('when a candidate is imported with more than one complementary certification', function () {
      it('should throw an error', async function () {
        // given
        const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification(
          complementaryData.Clea,
        );
        const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification(
          complementaryData.PixDroit,
        );

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
      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification(
        complementaryData.Clea,
      );
      const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification(
        complementaryData.PixDroit,
      );
      const pixPlusEdu1erDegreComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification(
        complementaryData.PixEdu1,
      );
      const pixPlusEdu2ndDegreComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification(
        complementaryData.PixEdu2,
      );
      const PixPlusProSanteComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification(
        complementaryData.PixProSante,
      );

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
      const complementaryCertification = {
        cleaComplementaryCertification,
        pixPlusDroitComplementaryCertification,
        pixPlusEdu1erDegreComplementaryCertification,
        pixPlusEdu2ndDegreComplementaryCertification,
        PixPlusProSanteComplementaryCertification,
      };
      const candidateListWithComplementary = candidateList.map(
        (candidate) => (candidate.complementaryCertification = complementaryCertification),
      );
      const expectedCertificationCandidates = candidateListWithComplementary.map((candidate) =>
        new CertificationCandidateBuilder({
          ...candidate,
          sessionId,
          subscriptions: [domainBuilder.buildCoreSubscription()],
        }).build(),
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

    const odsFilePath = `${__dirname}/attendance_sheet_extract_with_billing_ok_test.ods`;
    const odsBuffer = await readFile(odsFilePath);

    candidateList = generateCertificationCandidatesWithBillingModes(4);
    candidateList.push(generateCertificationCandidatesWithBillingModes(1, { sessionId }));
    candidateList.push(generateCertificationCandidateList(2));

    const expectedCertificationCandidates = candidateList.map((candidate) => new CertificationCandidate(candidate));

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
    const expectedCertificationCandidates = candidateList.map((candidate) => new CertificationCandidate(candidate));
    expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
  });
});
