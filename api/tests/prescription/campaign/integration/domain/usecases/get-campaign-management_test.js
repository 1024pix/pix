import { CampaignManagement } from '../../../../../../src/prescription/campaign/domain/models/CampaignManagement.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { NotFoundError } from '../../../../../../src/shared/application/http-errors.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Prescription | Domain | usecase | Get Campaign Management', function () {
  it('should return campaign', async function () {
    // given
    const campaignId = databaseBuilder.factory.buildCampaign().id;
    await databaseBuilder.commit();

    // when
    const result = await usecases.getCampaignManagement({ campaignId });

    // then
    expect(result).to.be.instanceOf(CampaignManagement);
  });

  it('should throw an error if campaign is not found', async function () {
    // given
    const campaignId = 123;

    // when
    const result = await catchErr(usecases.getCampaignManagement)({ campaignId });

    // then
    expect(result).to.be.instanceOf(NotFoundError);
  });
});
