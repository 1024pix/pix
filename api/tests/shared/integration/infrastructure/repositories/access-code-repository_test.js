import * as accessCodeRepository from '../../../../../src/shared/infrastructure/repositories/access-code-repository.js';

import { databaseBuilder } from '../../../../tooling/databases.js';

describe('#isCodeAvailable', function () {
  it('should return true if code does not already exist for campaign or combinedCourse', async function () {
    const isCodeAvailable = await accessCodeRepository.isCodeAvailable('LONELYCODE');
    expect(isCodeAvailable).to.be.true;
  });

  it('should return false if code is already used in a campaign', async function () {
    databaseBuilder.factory.buildCampaign({ code: 'USEDCODE1' });
    await databaseBuilder.commit();

    const isCodeAvailable = await accessCodeRepository.isCodeAvailable('USEDCODE1');

    expect(isCodeAvailable).to.be.false;
  });

  it('should return false if code is already used in a combined course', async function () {
    databaseBuilder.factory.buildCombinedCourse({ code: 'USEDCODE1' });
    await databaseBuilder.commit();

    const isCodeAvailable = await accessCodeRepository.isCodeAvailable('USEDCODE1');

    expect(isCodeAvailable).to.be.false;
  });
});
