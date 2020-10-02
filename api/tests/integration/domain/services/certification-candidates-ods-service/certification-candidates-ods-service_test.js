const { expect, databaseBuilder } = require('../../../../test-helper');
const certificationCandidatesOdsService = require('../../../../../lib/domain/services/certification-candidates-ods-service');
const CertificationCandidate = require('../../../../../lib/domain/models/CertificationCandidate');
const { CertificationCandidatesImportError } = require('../../../../../lib/domain/errors');
const { readFile } = require('fs').promises;
const _ = require('lodash');

describe('Integration | Services | extractCertificationCandidatesFromAttendanceSheet', () => {
  let userId;
  let sessionId;

  beforeEach(async () => {
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
    sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

    await databaseBuilder.commit();
  });

  context('When attendance sheet is of version 1.3', () => {

    it('should throw a CertificationCandidatesImportError if there is an error in the file', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-3_extract_mandatory_ko_test.ods`;
      const odsBuffer = await readFile(odsFilePath);

      // when
      try {
        await certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer });
      } catch (error) {
        // then
        expect(error).to.be.instanceOf(CertificationCandidatesImportError);
        expect(error.message).to.contain('Le champ “Prénom” est obligatoire.');
      }
    });

    it('should return extracted and validated certification candidates', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-3_extract_ok_test.ods`;
      const odsBuffer = await readFile(odsFilePath);
      const expectedCertificationCandidates = _.map([
        {
          lastName: 'Gallagher', firstName: 'Jack',
          birthdate: '2010-10-01', birthCity: 'Londres',
          birthCountry: 'Angleterre', birthProvinceCode: '66',
          email: 'jack@d.it', externalId: null,
          extraTimePercentage: 0.15, sessionId,
        },
        {
          lastName: 'Jackson', firstName: 'Janet',
          birthdate: '2018-09-25', birthCity: 'Milan',
          birthCountry: 'France', birthProvinceCode: '971',
          email: 'jaja@hotmail.fr', externalId: 'DEF456',
          extraTimePercentage: null, sessionId,
        },
        {
          lastName: 'Jackson', firstName: 'Michael',
          birthdate: '1995-01-15', birthCity: 'Paris',
          birthCountry: 'France', birthProvinceCode: '99',
          email: 'jackson@gmail.com', externalId: 'ABC123',
          extraTimePercentage: 0.6, sessionId,
        },
        {
          lastName: 'Mercury', firstName: 'Freddy',
          birthdate: '1925-06-14', birthCity: 'Barcelone',
          birthCountry: 'France', birthProvinceCode: '2A',
          email: null, externalId: 'GHI789',
          extraTimePercentage: 1.5, sessionId,
        },
      ], (candidate) => new CertificationCandidate(candidate));

      // when
      const actualCertificationCandidates =
        await certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet({
          sessionId,
          odsBuffer,
        });

      // then
      expect(actualCertificationCandidates).to.deep.equal(expectedCertificationCandidates);
    });

  });
});
