import { expect, databaseBuilder, catchErr, domainBuilder } from '../../../../test-helper';
import {
  CLEA,
  PIX_PLUS_DROIT,
  PIX_PLUS_EDU_1ER_DEGRE,
  PIX_PLUS_EDU_2ND_DEGRE,
} from '../../../../../lib/domain/models/ComplementaryCertification';
import certificationCandidatesOdsService from '../../../../../lib/domain/services/certification-candidates-ods-service';
import certificationCpfService from '../../../../../lib/domain/services/certification-cpf-service';
import certificationCpfCountryRepository from '../../../../../lib/infrastructure/repositories/certification-cpf-country-repository';
import certificationCpfCityRepository from '../../../../../lib/infrastructure/repositories/certification-cpf-city-repository';
import certificationCenterRepository from '../../../../../lib/infrastructure/repositories/certification-center-repository';
import complementaryCertificationRepository from '../../../../../lib/infrastructure/repositories/complementary-certification-repository';
import CertificationCandidate from '../../../../../lib/domain/models/CertificationCandidate';
import { CertificationCandidatesImportError } from '../../../../../lib/domain/errors';
import { promises } from 'fs';

const { readFile: readFile } = promises;

import _ from 'lodash';

describe('Integration | Services | extractCertificationCandidatesFromCandidatesImportSheet', function () {
  let userId;
  let sessionId;

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
  });

  it('should throw a CertificationCandidatesImportError if there is an error in the file', async function () {
    // given
    const odsFilePath = `${__dirname}/attendance_sheet_extract_mandatory_ko_test.ods`;
    const odsBuffer = await readFile(odsFilePath);

    // when
    const error = await catchErr(
      certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet
    )({
      sessionId,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      certificationCenterRepository,
      complementaryCertificationRepository,
      isSco: true,
    });

    // then
    expect(error).to.be.instanceOf(CertificationCandidatesImportError);
    expect(error.message).to.equal('Ligne 13 : Le champ “Prénom” est obligatoire.');
    expect(error.code).to.be.null;
  });

  it('should throw a CertificationCandidatesImportError if there is an error in the birth information', async function () {
    // given
    const odsFilePath = `${__dirname}/attendance_sheet_extract_birth_ko_test.ods`;
    const odsBuffer = await readFile(odsFilePath);

    // when
    const error = await catchErr(
      certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet
    )({
      sessionId,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      certificationCenterRepository,
      complementaryCertificationRepository,
      isSco: true,
    });

    // then
    expect(error).to.be.instanceOf(CertificationCandidatesImportError);
    expect(error.message).to.equal('Ligne 13 : La valeur du code INSEE doit être "99" pour un pays étranger.');
    expect(error.code).to.be.null;
  });

  it('should return extracted and validated certification candidates', async function () {
    // given
    const isSco = true;
    const odsFilePath = `${__dirname}/attendance_sheet_extract_ok_test.ods`;
    const odsBuffer = await readFile(odsFilePath);

    // when
    const actualCertificationCandidates =
      await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
        sessionId,
        isSco,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        certificationCenterRepository,
        complementaryCertificationRepository,
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
          complementaryCertifications: [],
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
          complementaryCertifications: [],
          billingMode: null,
          prepaymentCode: null,
          sessionId,
        },
      ],
      (candidate) => new CertificationCandidate(candidate)
    );
    expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
  });

  context('when certification center has habilitations', function () {
    context('when a candidate is imported with more than one complementary certification', function () {
      it('should throw un error', async function () {
        // given
        const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'CléA Numérique',
          key: CLEA,
        });
        const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Droit',
          key: PIX_PLUS_DROIT,
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
          certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet
        )({
          sessionId,
          odsBuffer,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          certificationCenterRepository,
          complementaryCertificationRepository,
          isSco: false,
        });

        // then
        expect(error).to.be.instanceOf(CertificationCandidatesImportError);

        expect(error.message).to.equal(
          "Ligne 13 : Vous ne pouvez pas inscrire un candidat à plus d'une certification complémentaire."
        );
      });
    });

    it('should return extracted and validated certification candidates with complementary certification', async function () {
      // given
      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        label: 'CléA Numérique',
        key: CLEA,
      });
      const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Pix+ Droit',
        key: PIX_PLUS_DROIT,
      });
      const pixPlusEdu1erDegreComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Pix+ Édu 1er degré',
        key: PIX_PLUS_EDU_1ER_DEGRE,
      });
      const pixPlusEdu2ndDegreComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Pix+ Édu 2nd degré',
        key: PIX_PLUS_EDU_2ND_DEGRE,
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
            complementaryCertifications: [
              domainBuilder.buildComplementaryCertification(pixPlusEdu1erDegreComplementaryCertification),
            ],
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
            complementaryCertifications: [
              domainBuilder.buildComplementaryCertification(pixPlusDroitComplementaryCertification),
            ],
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
            complementaryCertifications: [
              domainBuilder.buildComplementaryCertification(cleaComplementaryCertification),
            ],
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
            complementaryCertifications: [
              domainBuilder.buildComplementaryCertification(pixPlusEdu2ndDegreComplementaryCertification),
            ],
          },
        ],
        (candidate) => new CertificationCandidate(candidate)
      );

      // when
      const actualCertificationCandidates =
        await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
          sessionId,
          odsBuffer,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          certificationCenterRepository,
          complementaryCertificationRepository,
          isSco: false,
        });

      // then
      expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
    });
  });

  it('should return extracted and validated certification candidates with billing information', async function () {
    // given
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
      (candidate) => new CertificationCandidate(candidate)
    );

    // when
    const actualCertificationCandidates =
      await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
        sessionId,
        isSco,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        certificationCenterRepository,
        complementaryCertificationRepository,
      });

    // then
    expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
  });
  it('should return extracted and validated certification candidates without billing information when certification center is AEFE', async function () {
    // given
    const isSco = true;
    const odsFilePath = `${__dirname}/attendance_sheet_extract_ok_test.ods`;
    const odsBuffer = await readFile(odsFilePath);

    // when
    const actualCertificationCandidates =
      await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
        sessionId,
        isSco,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        certificationCenterRepository,
        complementaryCertificationRepository,
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
          complementaryCertifications: [],
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
          complementaryCertifications: [],
          billingMode: null,
          prepaymentCode: null,
          sessionId,
        },
      ],
      (candidate) => new CertificationCandidate(candidate)
    );
    expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
  });
});
