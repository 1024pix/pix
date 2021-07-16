const { unlink, writeFile } = require('fs').promises;
const _ = require('lodash');
const { expect, databaseBuilder, sinon } = require('../../../../../test-helper');
const readOdsUtils = require('../../../../../../lib/infrastructure/utils/ods/read-ods-utils');
const fillCandidatesImportSheet = require('../../../../../../lib/infrastructure/files/candidates-import/fill-candidates-import-sheet');
const usecases = require('../../../../../../lib/domain/usecases');
const { featureToggles } = require('../../../../../../lib/config');

describe('Integration | Infrastructure | Utils | Ods | fillCandidatesImportSheet', () => {

  let userId;
  let sessionId;

  let expectedOdsFilePath;
  let actualOdsFilePath;

  context('Version 1.5', () => {

    beforeEach(async () => {
      sinon.stub(featureToggles, 'isNewCPFDataEnabled').value(true);
      expectedOdsFilePath = `${__dirname}/1.5/candidates_import_template.ods`;
      actualOdsFilePath = `${__dirname}/1.5/candidates_import_template.tmp.ods`;

      const certificationCenterName = 'Centre de certification';
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: certificationCenterName }).id;

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

      _.each([
        { lastName: 'Jackson', firstName: 'Michael', sex: 'M', birthPostalCode: '75018', birthINSEECode: null, birthCity: 'Paris', birthCountry: 'France', email: 'jackson@gmail.com', resultRecipientEmail: 'destinataire@gmail.com', birthdate: '2004-04-04', sessionId, externalId: 'ABC123', extraTimePercentage: 0.6 },
        { lastName: 'Jackson', firstName: 'Janet', sex: 'F', birthPostalCode: null, birthINSEECode: '2A004', birthCity: 'Ajaccio', birthCountry: 'France', email: 'jaja@hotmail.fr', resultRecipientEmail: 'destinataire@gmail.com', birthdate: '2005-12-05', sessionId, externalId: 'DEF456', extraTimePercentage: null },
        { lastName: 'Mercury', firstName: 'Freddy', sex: 'M', birthPostalCode: '97180', birthINSEECode: null, birthCity: 'Sainte-Anne', birthCountry: 'France', email: null, resultRecipientEmail: null, birthdate: '1925-06-28', sessionId, externalId: 'GHI789', extraTimePercentage: 1.5 },
        { lastName: 'Gallagher', firstName: 'Jack', sex: 'M', birthPostalCode: null, birthINSEECode: '99132', birthCity: null, birthCountry: 'Angleterre', email: 'jack@d.it', resultRecipientEmail: 'destinataire@gmail.com', birthdate: '1980-08-10', sessionId, externalId: null, extraTimePercentage: 0.15 },
      ], (candidate) => {
        databaseBuilder.factory.buildCertificationCandidate(candidate);
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await unlink(actualOdsFilePath);
    });

    it('should return an attendance sheet with session data, certification candidates data prefilled', async () => {
      // when
      const session = await usecases.getSessionWithCandidates({ sessionId, userId });
      const updatedOdsFileBuffer = await fillCandidatesImportSheet(session);
      await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
      const actualResult = await readOdsUtils.getContentXml({ odsFilePath: actualOdsFilePath });
      const expectResult = await readOdsUtils.getContentXml({ odsFilePath: expectedOdsFilePath });

      // then
      expect(actualResult).to.deep.equal(expectResult);
    });
  });

  context('Version 1.4', () => {

    beforeEach(async () => {
      sinon.stub(featureToggles, 'isNewCPFDataEnabled').value(false);
      expectedOdsFilePath = `${__dirname}/1.4/candidates_import_template.ods`;
      actualOdsFilePath = `${__dirname}/1.4/candidates_import_template.tmp.ods`;

      const certificationCenterName = 'Centre de certification';
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: certificationCenterName }).id;

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

      _.each([
        { lastName: 'Jackson', firstName: 'Michael', birthCity: 'Paris', birthProvinceCode: '75', birthCountry: 'France', email: 'jackson@gmail.com', resultRecipientEmail: 'destinataire@gmail.com', birthdate: '2004-04-04', sessionId, externalId: 'ABC123', extraTimePercentage: 0.6 },
        { lastName: 'Jackson', firstName: 'Janet', birthCity: 'Ajaccio', birthProvinceCode: '2A', birthCountry: 'France', email: 'jaja@hotmail.fr', resultRecipientEmail: 'destinataire@gmail.com', birthdate: '2005-12-05', sessionId, externalId: 'DEF456', extraTimePercentage: null },
        { lastName: 'Mercury', firstName: 'Freddy', birthCity: 'Sainte-Anne', birthProvinceCode: '971', birthCountry: 'France', email: null, resultRecipientEmail: null, birthdate: '1925-06-28', sessionId, externalId: 'GHI789', extraTimePercentage: 1.5 },
        { lastName: 'Gallagher', firstName: 'Jack', birthCity: 'Londres', birthProvinceCode: '99', birthCountry: 'Angleterre', email: 'jack@d.it', resultRecipientEmail: 'destinataire@gmail.com', birthdate: '1980-08-10', sessionId, externalId: null, extraTimePercentage: 0.15 },
      ], (candidate) => {
        databaseBuilder.factory.buildCertificationCandidate(candidate);
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await unlink(actualOdsFilePath);
    });

    it('should return an attendance sheet with session data, certification candidates data prefilled', async () => {
      // when
      const session = await usecases.getSessionWithCandidates({ sessionId, userId });
      const updatedOdsFileBuffer = await fillCandidatesImportSheet(session);
      await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
      const actualResult = await readOdsUtils.getContentXml({ odsFilePath: actualOdsFilePath });
      const expectResult = await readOdsUtils.getContentXml({ odsFilePath: expectedOdsFilePath });

      // then
      expect(actualResult).to.deep.equal(expectResult);
    });
  });

});
