const fs = require('fs');
const _ = require('lodash');

const { expect, databaseBuilder } = require('../../../../test-helper');

const readOdsUtils  = require('../../../../../lib/infrastructure/utils/ods/read-ods-utils');

const sessionRepository = require('../../../../../lib/infrastructure/repositories/session-repository');
const getAttendanceSheet = require('../../../../../lib/domain/usecases/get-attendance-sheet');

describe('Integration | UseCases | getAttendanceSheet', () => {

  const expectedOdsFilePath = `${__dirname}/attendance_sheet_template_target.ods`;
  const actualOdsFilePath = `${__dirname}/attendance_sheet_template_actual.tmp.ods`;

  let userId;
  let sessionId;

  beforeEach(async () => {
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
      { lastName: 'Jackson', firstName: 'Michael', birthCity: 'Paris', birthProvinceCode: '75', birthCountry: 'France', email: 'jackson@gmail.com', birthdate: '2004-04-04', sessionId, externalId: 'ABC123', extraTimePercentage: 0.6 },
      { lastName: 'Jackson', firstName: 'Janet', birthCity: 'Ajaccio', birthProvinceCode: '2A', birthCountry: 'France', email: 'jaja@hotmail.fr', birthdate: '2005-12-05', sessionId, externalId: 'DEF456', extraTimePercentage: null },
      { lastName: 'Mercury', firstName: 'Freddy', birthCity: 'Sainte-Anne', birthProvinceCode: '971', birthCountry: 'France', email: null, birthdate: '1925-06-28', sessionId, externalId: 'GHI789', extraTimePercentage: 1.5 },
      { lastName: 'Gallagher', firstName: 'Jack', birthCity: 'Londres', birthProvinceCode: '99', birthCountry: 'Angleterre', email: 'jack@d.it', birthdate: '1980-08-10', sessionId, externalId: null, extraTimePercentage: 0.15 },
    ], (candidate) => {
      databaseBuilder.factory.buildCertificationCandidate(candidate);
    });

    await databaseBuilder.commit();
  });

  afterEach(() => {
    fs.unlinkSync(actualOdsFilePath);
  });

  it('should return an attendance sheet with session data, certification candidates data prefilled', async () => {
    // when
    const updatedOdsFileBuffer = await getAttendanceSheet({ userId, sessionId, sessionRepository });
    fs.writeFileSync(actualOdsFilePath, updatedOdsFileBuffer);
    const actualResult = await readOdsUtils.getContentXml({ odsFilePath: actualOdsFilePath });
    const expectResult = await readOdsUtils.getContentXml({ odsFilePath: expectedOdsFilePath });

    // then
    expect(actualResult).to.deep.equal(expectResult);
  });

});
