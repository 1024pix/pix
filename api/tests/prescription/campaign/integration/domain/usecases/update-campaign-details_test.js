import { expect, databaseBuilder, mockLearningContent, knex, catchErr } from '../../../../../test-helper.js';

import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import {
  MultipleSendingsUpdateError,
  IsForAbsoluteNoviceUpdateError,
} from '../../../../../../src/prescription/campaign/domain/errors.js';

const { SHARED } = CampaignParticipationStatuses;

describe('Integration | UseCases | update-campaign-details', function () {
  let userId;
  let organizationId;
  let targetProfileId;
  let campaign, campaignId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    targetProfileId = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId }).id;
    databaseBuilder.factory.buildMembership({ organizationId, userId });

    campaign = databaseBuilder.factory.buildCampaign({
      name: 'old Name',
      title: 'old title',
      customLandingPageText: 'old landing text',
      customResultPageText: 'old result text',
      customResultPageButtonText: 'old result button text',
      customResultPageButtonUrl: 'http://some.url.com',
      targetProfileId,
      creatorId: userId,
      organizationId,
      multipleSendings: false,
      isForAbsoluteNovice: false,
    });

    campaignId = campaign.id;

    await databaseBuilder.commit();

    const learningContent = {
      skills: [{ id: 'recSkill1' }],
    };

    mockLearningContent(learningContent);
  });

  it('should update campaign', async function () {
    const campaignAttributes = {
      name: 'new Name',
      title: 'new title',
      customLandingPageText: 'new landing text',
      customResultPageText: 'new result text',
      customResultPageButtonText: 'new result button text',
      customResultPageButtonUrl: 'http://some.url.com',
    };
    const expectedCampaign = { ...campaign, ...campaignAttributes };

    await usecases.updateCampaignDetails({
      campaignId,
      ...campaignAttributes,
    });

    const actualCampaign = await knex.select('*').from('campaigns').first();
    expect(actualCampaign).to.deep.equal(expectedCampaign);
  });

  describe('#multipleSendings', function () {
    it('should update multipleSendings', async function () {
      const campaignAttributes = {
        multipleSendings: true,
      };

      await usecases.updateCampaignDetails({
        campaignId,
        ...campaignAttributes,
      });

      const { multipleSendings } = await knex.select('*').from('campaigns').first();
      expect(multipleSendings).to.be.true;
    });

    it('should throw an error on updating multipleSendings whereas campaign has participations', async function () {
      //given
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        status: SHARED,
      });

      await databaseBuilder.commit();

      //when
      const campaignAttributes = {
        multipleSendings: true,
      };

      const error = await catchErr(usecases.updateCampaignDetails)({
        campaignId,
        ...campaignAttributes,
      });

      //then
      const { multipleSendings: actualMultipleSendings } = await knex
        .select('multipleSendings')
        .from('campaigns')
        .where({ id: campaignId })
        .first();

      expect(error).to.be.an.instanceOf(MultipleSendingsUpdateError);
      expect(actualMultipleSendings).to.be.false;
    });
  });

  describe('#isForAbsoluteNovice', function () {
    it('should update isForAbsoluteNovice', async function () {
      const campaignAttributes = {
        isForAbsoluteNovice: true,
      };

      await usecases.updateCampaignDetails({
        campaignId,
        isAuthorizedToUpdateIsForAbsoluteNovice: true,
        ...campaignAttributes,
      });

      const { isForAbsoluteNovice } = await knex.select('*').from('campaigns').first();
      expect(isForAbsoluteNovice).to.be.true;
    });
  });

  it('should throw an error on updating isAbsoluteNovice when user not super admin', async function () {
    //given
    await databaseBuilder.commit();

    //when
    const campaignAttributes = {
      isForAbsoluteNovice: true,
    };

    const error = await catchErr(usecases.updateCampaignDetails)({
      campaignId,
      isAuthorizedToUpdateIsForAbsoluteNovice: false,
      ...campaignAttributes,
    });

    //then
    const { isForAbsoluteNovice: actualIsForAbsoluteNovice } = await knex
      .select('isForAbsoluteNovice')
      .from('campaigns')
      .where({ id: campaignId })
      .first();

    expect(error).to.be.an.instanceOf(IsForAbsoluteNoviceUpdateError);
    expect(actualIsForAbsoluteNovice).to.be.false;
  });
});
