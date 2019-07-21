const { expect, databaseBuilder } = require('../../../test-helper');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const getAttendanceSheet = require('../../../../lib/domain/usecases/get-attendance-sheet');
const odsService = require('../../../../lib/domain/services/ods-service');
const fs = require('fs');
const _ = require('lodash');

describe('Integration | UseCases | getAttendanceSheet', () => {
  let userId;
  let sessionId;
  const expectedOdsFilePath = `${__dirname}/attendance_sheet_template_target.ods`;
  const actualOdsFilePath = `${__dirname}/attendance_sheet_template_actual.tmp.ods`;

  beforeEach(async () => {
    await databaseBuilder.clean();
    const certificationCenterName = 'Centre de certification';
    userId = databaseBuilder.factory.buildUser().id;
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: certificationCenterName }).id;
    databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
    sessionId = databaseBuilder.factory.buildSession({
      id: 10,
      certificationCenter: certificationCenterName,
      certificationCenterId: certificationCenterId,
      accessCode: 'ABC123DEF',
      address: '3 rue des bibiches',
      room: '28D',
      examiner: 'Johnny',
      date: '05/07/2020',
      time: '14:30',
      description: 'La super description',
    }).id;
    _.each([
      { lastName: 'Jackson', firstName: 'Michael', birthCity: 'Paris', birthdate: '04/04/2004', sessionId, externalId: 'ABC123', extraTimePercentage: 10 },
      { lastName: 'Jackson', firstName: 'Janet', birthCity: 'Milan', birthdate: '05/12/2005', sessionId, externalId: 'DEF456', extraTimePercentage: 0 },
      { lastName: 'Mercury', firstName: 'Freddy', birthCity: 'Barcelone', birthdate: '28/06/1925', sessionId, externalId: 'GHI789', extraTimePercentage: 5.5 },
      { lastName: 'Gallagher', firstName: 'Jack', birthCity: 'Londres', birthdate: '10/08/1980', sessionId, externalId: 'JKL123', extraTimePercentage: 125 },
    ], (candidate) => {
      databaseBuilder.factory.buildCertificationCandidate(candidate);
    });

    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await databaseBuilder.clean();
    fs.unlinkSync(actualOdsFilePath);
  });

  it('should return an attendance sheet with session data, certification candidates data prefilled', async () => {
    // when
    const updatedOdsFileBuffer = await getAttendanceSheet({ userId, sessionId, sessionRepository, certificationCandidateRepository });
    fs.writeFileSync(actualOdsFilePath, updatedOdsFileBuffer);
    const actualResult = await odsService.getContentXml({ odsFilePath: actualOdsFilePath });
    const expectResult = await odsService.getContentXml({ odsFilePath: expectedOdsFilePath });

    // then
    expect(actualResult).to.deep.equal(expectResult);
  });

});
