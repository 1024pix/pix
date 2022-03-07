const { expect, databaseBuilder, catchErr, domainBuilder, sinon } = require('../../../../test-helper');
const certificationCandidatesOdsService = require('../../../../../lib/domain/services/certification-candidates-ods-service');
const certificationCpfService = require('../../../../../lib/domain/services/certification-cpf-service');
const certificationCpfCountryRepository = require('../../../../../lib/infrastructure/repositories/certification-cpf-country-repository');
const certificationCpfCityRepository = require('../../../../../lib/infrastructure/repositories/certification-cpf-city-repository');
const certificationCenterRepository = require('../../../../../lib/infrastructure/repositories/certification-center-repository');
const complementaryCertificationRepository = require('../../../../../lib/infrastructure/repositories/complementary-certification-repository');
const CertificationCandidate = require('../../../../../lib/domain/models/CertificationCandidate');
const { CertificationCandidatesImportError } = require('../../../../../lib/domain/errors');
const { featureToggles } = require('../../../../../lib/config');
const { readFile } = require('fs').promises;
const _ = require('lodash');

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
      ],
      (candidate) => new CertificationCandidate(candidate)
    );
    expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
  });

  context('when certification center has habilitations', function () {
    context('when isComplementaryCertificationSubscriptionEnabled feature toggle is on', function () {
      it('should return extracted and validated certification candidates with complementary certifications', async function () {
        // given
        sinon.stub(featureToggles, 'isComplementaryCertificationSubscriptionEnabled').value(true);
        const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          name: 'CléA Numérique',
        });
        const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          name: 'Pix+ Droit',
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
              complementaryCertifications: [
                domainBuilder.buildComplementaryCertification(cleaComplementaryCertification),
                domainBuilder.buildComplementaryCertification(pixPlusDroitComplementaryCertification),
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
              complementaryCertifications: [
                domainBuilder.buildComplementaryCertification(cleaComplementaryCertification),
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
              complementaryCertifications: [
                domainBuilder.buildComplementaryCertification(pixPlusDroitComplementaryCertification),
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
              complementaryCertifications: [],
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
          });

        // then
        expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
      });
    });

    context('when isComplementaryCertificationSubscriptionEnabled feature toggle is off', function () {
      it('should return extracted and validated certification candidates without complementary certifications', async function () {
        // given
        sinon.stub(featureToggles, 'isComplementaryCertificationSubscriptionEnabled').value(false);
        const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          name: 'CléA Numérique',
        });
        const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          name: 'Pix+ Droit',
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

        const odsFilePath = `${__dirname}/attendance_sheet_extract_ok_test.ods`;
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
              complementaryCertifications: [],
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
              complementaryCertifications: [],
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
              complementaryCertifications: [],
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
              complementaryCertifications: [],
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
          });

        // then
        expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
      });
    });
  });

  context('when billing feature toggle is enabled', function () {
    it('should return extracted and validated certification candidates with billing information', async function () {
      // given
      const isSco = false;
      sinon.stub(featureToggles, 'isComplementaryCertificationSubscriptionEnabled').value(false);
      sinon.stub(featureToggles, 'isCertificationBillingEnabled').value(true);

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
      sinon.stub(featureToggles, 'isCertificationBillingEnabled').value(true);
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
        ],
        (candidate) => new CertificationCandidate(candidate)
      );
      expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
    });
  });
});
