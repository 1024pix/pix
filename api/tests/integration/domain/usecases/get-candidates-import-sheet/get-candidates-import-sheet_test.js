const { unlink, writeFile } = require('fs').promises;

const { expect, databaseBuilder } = require('../../../../test-helper');

const readOdsUtils  = require('../../../../../lib/infrastructure/utils/ods/read-ods-utils');

const sessionRepository = require('../../../../../lib/infrastructure/repositories/session-repository');
const getCandidatesImportSheet = require('../../../../../lib/domain/usecases/get-candidates-import-sheet');

describe('Integration | UseCases | getCandidatesImportSheet', () => {

  const expectedOdsFilePath = `${__dirname}/candidates_import_template.ods`;
  const actualOdsFilePath = `${__dirname}/candidates_import_template.tmp.ods`;

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

    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await unlink(actualOdsFilePath);
  });

  it('should return an attendance sheet with session data, certification candidates data prefilled', async () => {
    // when
    const updatedOdsFileBuffer = await getCandidatesImportSheet({ userId, sessionId, sessionRepository });
    await writeFile(actualOdsFilePath, updatedOdsFileBuffer);
    const actualResult = await readOdsUtils.getContentXml({ odsFilePath: actualOdsFilePath });
    const expectResult = await readOdsUtils.getContentXml({ odsFilePath: expectedOdsFilePath });

    // then
    expect(actualResult).to.deep.equal(expectResult);
  });

});
