const { expect, databaseBuilder } = require('../../../../test-helper');
const certificationCandidatesOdsService = require('../../../../../lib/domain/services/certification-candidates-ods-service');
const CertificationCandidate = require('../../../../../lib/domain/models/CertificationCandidate');
const { InvalidCertificationCandidate } = require('../../../../../lib/domain/errors');
const fs = require('fs');
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

  context('When attendance sheet is of version 1.1', () => {

    it('should throw a InvalidCertificationCandidate if any of the candidate data is missing a mandatory field', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-1_extract_mandatory_ko_test.ods`;
      const odsBuffer = fs.readFileSync(odsFilePath);

      // when
      try {
        await certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer });
      } catch (error) {
        // then
        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      }
    });

    it('should throw a InvalidCertificationCandidate if any of the candidate data is invalid and cannot be casted', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-1_extract_wrongvalue_ko_test.ods`;
      const odsBuffer = fs.readFileSync(odsFilePath);

      // when
      try {
        await certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer });
      } catch (error) {
        // then
        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      }
    });

    it('should return extracted and validated certification candidates', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-1_extract_ok_test.ods`;
      const odsBuffer = fs.readFileSync(odsFilePath);
      const expectedCertificationCandidates = _.map([
        {
          lastName: 'Gallagher', firstName: 'Jack',
          birthdate: '2010-10-01', birthCity: 'Londres',
          birthCountry: 'France', birthProvinceCode: '66',
          externalId: null, extraTimePercentage: 0.15, sessionId,
        },
        {
          lastName: 'Jackson', firstName: 'Janet',
          birthdate: '2018-09-25', birthCity: 'Milan',
          birthCountry: 'France', birthProvinceCode: '971',
          externalId: 'DEF456', extraTimePercentage: null, sessionId,
        },
        {
          lastName: 'Jackson', firstName: 'Michael',
          birthdate: '1995-01-15', birthCity: 'Paris',
          birthCountry: 'Cameroun', birthProvinceCode: '99',
          externalId: 'ABC123', extraTimePercentage: 0.6, sessionId,
        },
        {
          lastName: 'Mercury', firstName: 'Freddy',
          birthdate: '1925-06-14', birthCity: 'Barcelone',
          birthCountry: 'Planète Mars', birthProvinceCode: '2A',
          externalId: 'GHI789', extraTimePercentage: 1.5, sessionId,
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
  context('When attendance sheet is of version 1.2', () => {

    it('should throw a InvalidCertificationCandidate if any of the candidate data is missing a mandatory field', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-2_extract_mandatory_ko_test.ods`;
      const odsBuffer = fs.readFileSync(odsFilePath);

      // when
      try {
        await certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer });
      } catch (error) {
        // then
        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      }
    });

    it('should throw a InvalidCertificationCandidate if any of the candidate data is invalid and cannot be casted', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-2_extract_wrongvalue_ko_test.ods`;
      const odsBuffer = fs.readFileSync(odsFilePath);

      // when
      try {
        await certificationCandidatesOdsService.extractCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer });
      } catch (error) {
        // then
        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      }
    });

    it('should return extracted and validated certification candidates', async () => {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_1-2_extract_ok_test.ods`;
      const odsBuffer = fs.readFileSync(odsFilePath);
      const expectedCertificationCandidates = _.map([
        {
          lastName: 'Gallagher', firstName: 'Jack',
          birthdate: '2010-10-01', birthCity: 'Londres',
          birthCountry: 'France', birthProvinceCode: '66',
          externalId: null, extraTimePercentage: 0.15, sessionId,
        },
        {
          lastName: 'Jackson', firstName: 'Janet',
          birthdate: '2018-09-25', birthCity: 'Milan',
          birthCountry: 'France', birthProvinceCode: '971',
          externalId: 'DEF456', extraTimePercentage: null, sessionId,
        },
        {
          lastName: 'Jackson', firstName: 'Michael',
          birthdate: '1995-01-15', birthCity: 'Paris',
          birthCountry: 'Cameroun', birthProvinceCode: '99',
          externalId: 'ABC123', extraTimePercentage: 0.6, sessionId,
        },
        {
          lastName: 'Mercury', firstName: 'Freddy',
          birthdate: '1925-06-14', birthCity: 'Barcelone',
          birthCountry: 'Planète Mars', birthProvinceCode: '2A',
          externalId: 'GHI789', extraTimePercentage: 1.5, sessionId,
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
