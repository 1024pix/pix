import fs from 'node:fs';
import * as url from 'node:url';

import _ from 'lodash';

import { usecases } from '../../../../../../src/certification/enrolment/domain/usecases/index.js';
import { fillCandidatesImportSheet } from '../../../../../../src/certification/enrolment/infrastructure/candidates-import/fill-candidates-import-sheet.js';
import * as readOdsUtils from '../../../../../../src/certification/enrolment/infrastructure/utils/ods/read-ods-utils.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/constants.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

const { promises } = fs;

const { unlink, writeFile } = promises;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Infrastructure | Utils | Ods | fillCandidatesImportSheet', function () {
  let i18n;
  let userId;
  let sessionId;

  let expectedOdsFilePath;
  let actualOdsFilePath;

  beforeEach(async function () {
    i18n = getI18n();
  });

  afterEach(async function () {
    await unlink(actualOdsFilePath);
  });

  context('when certification center is of type SCO', function () {
    it('should return a candidate import sheet with session data, certification candidates data prefilled', async function () {
      // given
      expectedOdsFilePath = `${__dirname}/candidates_import_template-sco.ods`;
      actualOdsFilePath = `${__dirname}/candidates_import_template-sco.tmp.ods`;

      const certificationCenterName = 'Centre de certification';
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: certificationCenterName,
        type: CERTIFICATION_CENTER_TYPES.SCO,
      }).id;

      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      });

      sessionId = databaseBuilder.factory.buildSession({
        id: 10,
        certificationCenter: certificationCenterName,
        certificationCenterId: certificationCenterId,
        accessCode: 'ABC123DEF',
        address: '3 rue des bibiches',
        room: '28D',
        examiner: 'Johnny',
        date: '2020-07-05',
        time: '14:30',
        description: 'La super description',
      }).id;

      _.each(
        [
          {
            lastName: 'Jackson',
            firstName: 'Michael',
            sex: 'M',
            birthPostalCode: '75018',
            birthINSEECode: null,
            birthCity: 'Paris',
            birthCountry: 'France',
            email: 'jackson@gmail.com',
            resultRecipientEmail: 'destinataire@gmail.com',
            birthdate: '2004-04-04',
            sessionId,
            externalId: 'ABC123',
            extraTimePercentage: 0.6,
          },
          {
            lastName: 'Jackson',
            firstName: 'Janet',
            sex: 'F',
            birthPostalCode: null,
            birthINSEECode: '2A004',
            birthCity: 'Ajaccio',
            birthCountry: 'France',
            email: 'jaja@hotmail.fr',
            resultRecipientEmail: 'destinataire@gmail.com',
            birthdate: '2005-12-05',
            sessionId,
            externalId: 'DEF456',
            extraTimePercentage: null,
          },
          {
            lastName: 'Mercury',
            firstName: 'Freddy',
            sex: 'M',
            birthPostalCode: '97180',
            birthINSEECode: null,
            birthCity: 'Sainte-Anne',
            birthCountry: 'France',
            email: null,
            resultRecipientEmail: null,
            birthdate: '1925-06-28',
            sessionId,
            externalId: 'GHI789',
            extraTimePercentage: 1.5,
          },
          {
            lastName: 'Gallagher',
            firstName: 'Jack',
            sex: 'M',
            birthPostalCode: null,
            birthINSEECode: '99132',
            birthCity: 'Londres',
            birthCountry: 'Angleterre',
            email: 'jack@d.it',
            resultRecipientEmail: 'destinataire@gmail.com',
            birthdate: '1980-08-10',
            sessionId,
            externalId: null,
            extraTimePercentage: 0.15,
          },
        ],
        (candidate) => {
          databaseBuilder.factory.buildCertificationCandidate(candidate);
        },
      );

      await databaseBuilder.commit();
      // when
      const { session, enrolledCandidates } = await usecases.getCandidateImportSheetData({ sessionId, userId });
      const updatedOdsFileBuffer = await fillCandidatesImportSheet({
        session,
        enrolledCandidates,
        isScoCertificationCenter: true,
        i18n,
      });
      await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
      const actualResult = await readOdsUtils.getContentXml({
        odsFilePath: actualOdsFilePath,
      });
      const expectedResult = await readOdsUtils.getContentXml({
        odsFilePath: expectedOdsFilePath,
      });

      // then
      expect(actualResult).to.deep.equal(expectedResult);
    });

    it('should return a candidate import sheet with session data, certification candidates data prefilled with one complementary certification', async function () {
      // given
      expectedOdsFilePath = `${__dirname}/candidates_import_template-with-one-complementary-certification-sco.ods`;
      actualOdsFilePath = `${__dirname}/candidates_import_template-with-one-complementary-certification-sco.tmp.ods`;

      const cleaNumerique = databaseBuilder.factory.buildComplementaryCertification({
        key: Frameworks.CLEA,
        label: 'CléA Numérique',
      });

      const certificationCenterName = 'Centre de certification';
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: certificationCenterName,
        type: CERTIFICATION_CENTER_TYPES.SCO,
      }).id;

      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaNumerique.id,
      });

      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      });

      sessionId = databaseBuilder.factory.buildSession({
        id: 10,
        certificationCenter: certificationCenterName,
        certificationCenterId: certificationCenterId,
        accessCode: 'ABC123DEF',
        address: '3 rue des bibiches',
        room: '28D',
        examiner: 'Johnny',
        date: '2020-07-05',
        time: '14:30',
        description: 'La super description',
      }).id;

      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Only',
        firstName: 'CléA',
        sex: 'M',
        birthPostalCode: '97180',
        birthINSEECode: null,
        birthCity: 'Sainte-Anne',
        birthCountry: 'France',
        email: null,
        resultRecipientEmail: null,
        birthdate: '1925-06-28',
        sessionId,
        externalId: 'GHI789',
        extraTimePercentage: 1.5,
        subscription: Frameworks.CLEA,
      });

      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'No',
        firstName: 'Complementary certifications',
        sex: 'M',
        birthPostalCode: null,
        birthINSEECode: '99132',
        birthCity: 'Londres',
        birthCountry: 'Angleterre',
        email: 'jack@d.it',
        resultRecipientEmail: 'destinataire@gmail.com',
        birthdate: '1980-08-10',
        sessionId,
        externalId: null,
        extraTimePercentage: 0.15,
        subscription: Frameworks.CORE,
      });

      await databaseBuilder.commit();
      // when
      const { session, enrolledCandidates, certificationCenterHabilitations } =
        await usecases.getCandidateImportSheetData({
          sessionId,
          userId,
          i18n,
        });
      const updatedOdsFileBuffer = await fillCandidatesImportSheet({
        session,
        enrolledCandidates,
        certificationCenterHabilitations,
        isScoCertificationCenter: true,
        i18n,
      });
      await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
      const actualResult = await readOdsUtils.getContentXml({
        odsFilePath: actualOdsFilePath,
      });
      const expectedResult = await readOdsUtils.getContentXml({
        odsFilePath: expectedOdsFilePath,
      });

      // then
      expect(actualResult).to.deep.equal(expectedResult);
    });

    it('should return a candidate import sheet with session data, certification candidates data prefilled with all complementary certifications', async function () {
      // given
      expectedOdsFilePath = `${__dirname}/candidates_import_template-with-all-complementary-certifications-sco.ods`;
      actualOdsFilePath = `${__dirname}/candidates_import_template-with-all-complementary-certifications-sco.tmp.ods`;

      const cleaNumerique = databaseBuilder.factory.buildComplementaryCertification({
        key: Frameworks.CLEA,
        label: 'CléA Numérique',
      });
      const pixPlusDroit = databaseBuilder.factory.buildComplementaryCertification({
        key: Frameworks.DROIT,
        label: 'Pix+ Droit',
      });
      const pixPlusEdu1erDegre = databaseBuilder.factory.buildComplementaryCertification({
        key: Frameworks.EDU_1ER_DEGRE,
        label: 'Pix+ Édu 1er degré',
      });
      const pixPlusEdu2ndDegre = databaseBuilder.factory.buildComplementaryCertification({
        key: Frameworks.EDU_2ND_DEGRE,
        label: 'Pix+ Édu 2nd degré',
      });

      const certificationCenterName = 'Centre de certification';
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: certificationCenterName,
        type: CERTIFICATION_CENTER_TYPES.SCO,
      }).id;

      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaNumerique.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: pixPlusEdu1erDegre.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: pixPlusEdu2ndDegre.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: pixPlusDroit.id,
      });

      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      });

      sessionId = databaseBuilder.factory.buildSession({
        id: 10,
        certificationCenter: certificationCenterName,
        certificationCenterId: certificationCenterId,
        accessCode: 'ABC123DEF',
        address: '3 rue des bibiches',
        room: '28D',
        examiner: 'Johnny',
        date: '2020-07-05',
        time: '14:30',
        description: 'La super description',
      }).id;

      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'All',
        firstName: 'By Myself',
        sex: 'M',
        birthPostalCode: '75018',
        birthINSEECode: null,
        birthCity: 'Paris',
        birthCountry: 'France',
        email: 'jackson@gmail.com',
        resultRecipientEmail: 'destinataire@gmail.com',
        birthdate: '2004-04-04',
        sessionId,
        externalId: 'ABC123',
        extraTimePercentage: 0.6,
        subscription: Frameworks.EDU_2ND_DEGRE,
      });

      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Only',
        firstName: 'Droit',
        sex: 'F',
        birthPostalCode: null,
        birthINSEECode: '2A004',
        birthCity: 'Ajaccio',
        birthCountry: 'France',
        email: 'jaja@hotmail.fr',
        resultRecipientEmail: 'destinataire@gmail.com',
        birthdate: '2005-12-05',
        sessionId,
        externalId: 'DEF456',
        extraTimePercentage: null,
        subscription: Frameworks.DROIT,
      });

      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Only',
        firstName: 'CléA',
        sex: 'M',
        birthPostalCode: '97180',
        birthINSEECode: null,
        birthCity: 'Sainte-Anne',
        birthCountry: 'France',
        email: null,
        resultRecipientEmail: null,
        birthdate: '1925-06-28',
        sessionId,
        externalId: 'GHI789',
        extraTimePercentage: 1.5,
        subscription: Frameworks.CLEA,
      });

      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'No',
        firstName: 'Complementary certifications',
        sex: 'M',
        birthPostalCode: null,
        birthINSEECode: '99132',
        birthCity: 'Londres',
        birthCountry: 'Angleterre',
        email: 'jack@d.it',
        resultRecipientEmail: 'destinataire@gmail.com',
        birthdate: '1980-08-10',
        sessionId,
        externalId: null,
        extraTimePercentage: 0.15,
        subscription: Frameworks.CORE,
      });

      await databaseBuilder.commit();
      // when
      const { session, enrolledCandidates, certificationCenterHabilitations } =
        await usecases.getCandidateImportSheetData({
          sessionId,
          userId,
        });
      const updatedOdsFileBuffer = await fillCandidatesImportSheet({
        session,
        enrolledCandidates,
        certificationCenterHabilitations,
        isScoCertificationCenter: true,
        i18n,
      });
      await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
      const actualResult = await readOdsUtils.getContentXml({
        odsFilePath: actualOdsFilePath,
      });
      const expectedResult = await readOdsUtils.getContentXml({
        odsFilePath: expectedOdsFilePath,
      });

      // then
      expect(actualResult).to.deep.equal(expectedResult);
    });
  });

  context('when certification center is not of type SCO', function () {
    it('should return a candidate import sheet with session data, candidates data prefilled', async function () {
      // given
      expectedOdsFilePath = `${__dirname}/candidates_import_template-with-billing-columns.ods`;
      actualOdsFilePath = `${__dirname}/candidates_import_template-with-billing-columns.tmp.ods`;
      const certificationCenterName = 'Centre de certification';
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: certificationCenterName,
        type: CERTIFICATION_CENTER_TYPES.SUP,
      }).id;

      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      });

      sessionId = databaseBuilder.factory.buildSession({
        id: 10,
        certificationCenter: certificationCenterName,
        certificationCenterId: certificationCenterId,
        accessCode: 'ABC123DEF',
        address: '3 rue des bibiches',
        room: '28D',
        examiner: 'Johnny',
        date: '2020-07-05',
        time: '14:30',
        description: 'La super description',
      }).id;

      databaseBuilder.factory.buildCertificationCandidate({
        firstName: 'Certif',
        lastName: 'Gratos',
        billingMode: 'FREE',
        prepaymentCode: null,
        sessionId,
      });

      databaseBuilder.factory.buildCertificationCandidate({
        firstName: 'Candidat',
        lastName: 'Qui Raque',
        billingMode: 'PAID',
        prepaymentCode: null,
        sessionId,
      });

      databaseBuilder.factory.buildCertificationCandidate({
        firstName: 'A Man',
        lastName: 'With A Code',
        billingMode: 'PREPAID',
        prepaymentCode: 'CODECODECODEC',
        sessionId,
      });

      databaseBuilder.factory.buildCertificationCandidate({
        firstName: 'Yo',
        lastName: 'Lo',
        billingMode: null,
        prepaymentCode: null,
        sessionId,
      });

      await databaseBuilder.commit();
      const { session, enrolledCandidates } = await usecases.getCandidateImportSheetData({ sessionId, userId });

      // when
      const updatedOdsFileBuffer = await fillCandidatesImportSheet({
        session,
        enrolledCandidates,
        i18n,
      });

      // then
      await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
      const actualResult = await readOdsUtils.getContentXml({
        odsFilePath: actualOdsFilePath,
      });
      const expectedResult = await readOdsUtils.getContentXml({
        odsFilePath: expectedOdsFilePath,
      });
      expect(actualResult).to.deep.equal(expectedResult);
    });

    context('when some candidate have complementary certification', function () {
      it('should return a candidate import sheet with session data, candidates data prefilled', async function () {
        // given
        expectedOdsFilePath = `${__dirname}/candidates_import_template-with-billing-columns-complementary.ods`;
        actualOdsFilePath = `${__dirname}/candidates_import_template-with-billing-columns-complementary.tmp.ods`;

        const cleaNumerique = databaseBuilder.factory.buildComplementaryCertification({
          key: Frameworks.CLEA,
          label: 'CléA Numérique',
        });

        const certificationCenterName = 'Centre de certification';
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          name: certificationCenterName,
          type: CERTIFICATION_CENTER_TYPES.SUP,
        }).id;

        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: cleaNumerique.id,
        });

        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId,
        });

        sessionId = databaseBuilder.factory.buildSession({
          id: 10,
          certificationCenter: certificationCenterName,
          certificationCenterId: certificationCenterId,
          accessCode: 'ABC123DEF',
          address: '3 rue des bibiches',
          room: '28D',
          examiner: 'Johnny',
          date: '2020-07-05',
          time: '14:30',
          description: 'La super description',
        }).id;

        databaseBuilder.factory.buildCertificationCandidate({
          firstName: 'Yo',
          lastName: 'Lo',
          billingMode: null,
          prepaymentCode: null,
          sessionId,
          subscription: Frameworks.CLEA,
        });

        await databaseBuilder.commit();
        const { session, enrolledCandidates, certificationCenterHabilitations } =
          await usecases.getCandidateImportSheetData({
            sessionId,
            userId,
          });

        // when
        const updatedOdsFileBuffer = await fillCandidatesImportSheet({
          session,
          enrolledCandidates,
          certificationCenterHabilitations,
          i18n,
        });

        // then
        await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
        const actualResult = await readOdsUtils.getContentXml({
          odsFilePath: actualOdsFilePath,
        });
        const expectedResult = await readOdsUtils.getContentXml({
          odsFilePath: expectedOdsFilePath,
        });
        expect(actualResult).to.deep.equal(expectedResult);
      });
    });
  });
});
