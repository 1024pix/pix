const { expect, databaseBuilder } = require('../../../test-helper');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');
const parseCertificationCandidatesFromAttendanceSheet = require('../../../../lib/domain/usecases/parse-certification-candidates-from-attendance-sheet');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');
const { InvalidCertificationCandidateData } = require('../../../../lib/domain/errors');
const fs = require('fs');

const _ = require('lodash');

describe('Integration | UseCases | parseCertificationCandidatesFromAttendanceSheet', () => {
  let userId;
  let sessionId;

  beforeEach(async () => {
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
    sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  it('should throw a InvalidCertificationCandidateData if any of the candidate data is missing a mandatory field', async () => {
    // given
    const odsFilePath = `${__dirname}/attendance_sheet_parsing_mandatory_ko_test.ods`;
    const odsBuffer = fs.readFileSync(odsFilePath);

    // when
    try {
      await parseCertificationCandidatesFromAttendanceSheet({ userId, sessionId, odsBuffer, sessionRepository });
    } catch (error) {
      // then
      expect(error).to.be.instanceOf(InvalidCertificationCandidateData);
    }
  });

  it('should throw a InvalidCertificationCandidateData if any of the candidate data is invalid and cannot be casted', async () => {
    // given
    const odsFilePath = `${__dirname}/attendance_sheet_parsing_wrongvalue_ko_test.ods`;
    const odsBuffer = fs.readFileSync(odsFilePath);

    // when
    try {
      await parseCertificationCandidatesFromAttendanceSheet({ userId, sessionId, odsBuffer, sessionRepository });
    } catch (error) {
      // then
      expect(error).to.be.instanceOf(InvalidCertificationCandidateData);
    }
  });

  it('should return parsed and validated certification candidates', async () => {
    // given
    const odsFilePath = `${__dirname}/attendance_sheet_parsing_ok_test.ods`;
    const odsBuffer = fs.readFileSync(odsFilePath);
    const expectedCertificationCandidates = _.map([
      {
        lastName: 'Gallagher', firstName: 'Jack',
        birthdate: new Date('1980-08-10T00:00:00Z'), birthCity: 'Londres',
        externalId: 'JKL123', extraTimePercentage: 125,
      },
      {
        lastName: 'Jackson', firstName: 'Janet',
        birthdate: new Date('2005-12-05T00:00:00Z'), birthCity: 'Milan',
        externalId: 'DEF456', extraTimePercentage: 0,
      },
    ], (candidate) => new CertificationCandidate(candidate));

    // when
    const certificationCandidates = await parseCertificationCandidatesFromAttendanceSheet({ userId, sessionId, odsBuffer, sessionRepository });

    // then
    expect(certificationCandidates).to.deep.equal(expectedCertificationCandidates);
  });
});
