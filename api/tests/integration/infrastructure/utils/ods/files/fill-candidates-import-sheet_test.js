import fs from 'fs';

const { promises } = fs;

const { unlink, writeFile } = promises;

import _ from 'lodash';
import { expect, databaseBuilder } from '../../../../../test-helper.js';
import * as readOdsUtils from '../../../../../../lib/infrastructure/utils/ods/read-ods-utils.js';
import { fillCandidatesImportSheet } from '../../../../../../lib/infrastructure/files/candidates-import/fill-candidates-import-sheet.js';
import { usecases } from '../../../../../../lib/domain/usecases/index.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

import * as url from 'url';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
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
      expectedOdsFilePath = `${__dirname}/1.5/candidates_import_template-sco.ods`;
      actualOdsFilePath = `${__dirname}/1.5/candidates_import_template-sco.tmp.ods`;

      const certificationCenterName = 'Centre de certification';
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: certificationCenterName,
      }).id;

      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

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
      const { session } = await usecases.getCandidateImportSheetData({ sessionId, userId });
      const updatedOdsFileBuffer = await fillCandidatesImportSheet({ session, isScoCertificationCenter: true, i18n });
      await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
      const actualResult = await readOdsUtils.getContentXml({ odsFilePath: actualOdsFilePath });
      const expectedResult = await readOdsUtils.getContentXml({ odsFilePath: expectedOdsFilePath });

      // then
      expect(actualResult).to.deep.equal(expectedResult);
    });

    it('should return a candidate import sheet with session data, certification candidates data prefilled with one complementary certification', async function () {
      // given
      expectedOdsFilePath = `${__dirname}/1.5/candidates_import_template-with-one-complementary-certification-sco.ods`;
      actualOdsFilePath = `${__dirname}/1.5/candidates_import_template-with-one-complementary-certification-sco.tmp.ods`;

      const cleaNumerique = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.CLEA,
        label: 'CléA Numérique',
      });

      const certificationCenterName = 'Centre de certification';
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: certificationCenterName,
      }).id;

      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaNumerique.id,
      });

      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

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

      const cleaNumeriqueCandidate = databaseBuilder.factory.buildCertificationCandidate({
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
        complementaryCertification: null,
      });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: cleaNumeriqueCandidate.id,
        complementaryCertificationId: cleaNumerique.id,
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
        complementaryCertification: null,
      });

      await databaseBuilder.commit();
      // when
      const { session, certificationCenterHabilitations } = await usecases.getCandidateImportSheetData({
        sessionId,
        userId,
        i18n,
      });
      const updatedOdsFileBuffer = await fillCandidatesImportSheet({
        session,
        certificationCenterHabilitations,
        isScoCertificationCenter: true,
        i18n,
      });
      await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
      const actualResult = await readOdsUtils.getContentXml({ odsFilePath: actualOdsFilePath });
      const expectedResult = await readOdsUtils.getContentXml({ odsFilePath: expectedOdsFilePath });

      // then
      expect(actualResult).to.deep.equal(expectedResult);
    });

    it('should return a candidate import sheet with session data, certification candidates data prefilled with all complementary certifications', async function () {
      // given
      expectedOdsFilePath = `${__dirname}/1.5/candidates_import_template-with-all-complementary-certifications-sco.ods`;
      actualOdsFilePath = `${__dirname}/1.5/candidates_import_template-with-all-complementary-certifications-sco.tmp.ods`;

      const cleaNumerique = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.CLEA,
        label: 'CléA Numérique',
      });
      const pixPlusDroit = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
        label: 'Pix+ Droit',
      });
      const pixPlusEdu1erDegre = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
        label: 'Pix+ Édu 1er degré',
      });
      const pixPlusEdu2ndDegre = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.PIX_PLUS_EDU_2ND_DEGRE,
        label: 'Pix+ Édu 2nd degré',
      });

      const certificationCenterName = 'Centre de certification';
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: certificationCenterName,
        type: 'SCO',
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
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

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

      const onlyPixPlusEdu2ndDegreCandidate = databaseBuilder.factory.buildCertificationCandidate({
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
        complementaryCertification: pixPlusEdu2ndDegre,
      });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: onlyPixPlusEdu2ndDegreCandidate.id,
        complementaryCertificationId: pixPlusEdu2ndDegre.id,
      });

      const onlyPixPlusDroitCandidate = databaseBuilder.factory.buildCertificationCandidate({
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
        complementaryCertification: pixPlusDroit,
      });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: onlyPixPlusDroitCandidate.id,
        complementaryCertificationId: pixPlusDroit.id,
      });

      const onlyCleaNumeriqueCandidate = databaseBuilder.factory.buildCertificationCandidate({
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
        complementaryCertification: cleaNumerique,
      });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: onlyCleaNumeriqueCandidate.id,
        complementaryCertificationId: cleaNumerique.id,
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
        complementaryCertification: null,
      });

      await databaseBuilder.commit();
      // when
      const { session, certificationCenterHabilitations } = await usecases.getCandidateImportSheetData({
        sessionId,
        userId,
      });
      const updatedOdsFileBuffer = await fillCandidatesImportSheet({
        session,
        certificationCenterHabilitations,
        isScoCertificationCenter: true,
        i18n,
      });
      await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
      const actualResult = await readOdsUtils.getContentXml({ odsFilePath: actualOdsFilePath });
      const expectedResult = await readOdsUtils.getContentXml({ odsFilePath: expectedOdsFilePath });

      // then
      expect(actualResult).to.deep.equal(expectedResult);
    });
  });

  context('when certification center is not of type SCO', function () {
    it('should return a candidate import sheet with session data, candidates data prefilled', async function () {
      // given
      expectedOdsFilePath = `${__dirname}/1.5/candidates_import_template-with-billing-columns.ods`;
      actualOdsFilePath = `${__dirname}/1.5/candidates_import_template-with-billing-columns.tmp.ods`;

      const certificationCenterName = 'Centre de certification';
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: certificationCenterName,
        type: 'SUP',
      }).id;

      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

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
      const { session } = await usecases.getCandidateImportSheetData({ sessionId, userId });

      // when
      const updatedOdsFileBuffer = await fillCandidatesImportSheet({ session, i18n });

      // then
      await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
      const actualResult = await readOdsUtils.getContentXml({ odsFilePath: actualOdsFilePath });
      const expectedResult = await readOdsUtils.getContentXml({ odsFilePath: expectedOdsFilePath });
      expect(actualResult).to.deep.equal(expectedResult);
    });
    context('when some candidate have complementary certification', function () {
      it('should return a candidate import sheet with session data, candidates data prefilled', async function () {
        // given
        expectedOdsFilePath = `${__dirname}/1.5/candidates_import_template-with-billing-columns-complementary.ods`;
        actualOdsFilePath = `${__dirname}/1.5/candidates_import_template-with-billing-columns-complementary.tmp.ods`;

        const cleaNumerique = databaseBuilder.factory.buildComplementaryCertification({
          key: ComplementaryCertificationKeys.CLEA,
          label: 'CléA Numérique',
        });

        const certificationCenterName = 'Centre de certification';
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          name: certificationCenterName,
          type: 'SUP',
        }).id;

        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: cleaNumerique.id,
        });

        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

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

        const cleaNumeriqueCandidate = databaseBuilder.factory.buildCertificationCandidate({
          firstName: 'Yo',
          lastName: 'Lo',
          billingMode: null,
          prepaymentCode: null,
          sessionId,
        });

        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          certificationCandidateId: cleaNumeriqueCandidate.id,
          complementaryCertificationId: cleaNumerique.id,
        });

        await databaseBuilder.commit();
        const { session, certificationCenterHabilitations } = await usecases.getCandidateImportSheetData({
          sessionId,
          userId,
        });

        // when
        const updatedOdsFileBuffer = await fillCandidatesImportSheet({
          session,
          certificationCenterHabilitations,
          i18n,
        });

        // then
        await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
        const actualResult = await readOdsUtils.getContentXml({ odsFilePath: actualOdsFilePath });
        const expectedResult = await readOdsUtils.getContentXml({ odsFilePath: expectedOdsFilePath });
        expect(actualResult).to.deep.equal(expectedResult);
      });
    });
  });
});
