import _ from 'lodash';

import { Campaign } from '../../../../lib/domain/models/Campaign.js';
import { CampaignTypes } from '../../../../lib/domain/models/CampaignTypes.js';
import * as campaignCodeGenerator from '../../../../lib/domain/services/campaigns/campaign-code-generator.js';
import { createCampaign } from '../../../../lib/domain/usecases/create-campaign.js';
import * as campaignCreatorRepository from '../../../../lib/infrastructure/repositories/campaign-creator-repository.js';
import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import { databaseBuilder, expect, knex, mockLearningContent } from '../../../test-helper.js';

describe('Integration | UseCases | create-campaign', function () {
  let userId;
  let organizationId;
  let targetProfileId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;

    targetProfileId = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId }).id;

    databaseBuilder.factory.buildMembership({
      organizationId,
      userId,
    });

    await databaseBuilder.commit();

    const learningContent = {
      skills: [{ id: 'recSkill1' }],
    };

    mockLearningContent(learningContent);
  });

  afterEach(function () {
    return knex('campaigns').delete();
  });

  it('should save a new campaign of type ASSESSMENT', async function () {
    // given
    const campaign = {
      name: 'a name',
      type: CampaignTypes.ASSESSMENT,
      title: 'a title',
      idPixLabel: 'id Pix label',
      customLandingPageText: 'Hello',
      creatorId: userId,
      ownerId: userId,
      organizationId,
      targetProfileId,
    };

    const expectedAttributes = ['type', 'title', 'idPixLabel', 'name', 'customLandingPageText'];

    // when
    const result = await createCampaign({
      campaign,
      campaignRepository,
      campaignCreatorRepository,
      campaignCodeGenerator,
    });

    // then
    expect(result).to.be.an.instanceOf(Campaign);

    expect(_.pick(result, expectedAttributes)).to.deep.equal(_.pick(campaign, expectedAttributes));
  });

  it('should save a new campaign of type PROFILES_COLLECTION', async function () {
    // given
    const campaign = {
      name: 'a name',
      type: CampaignTypes.PROFILES_COLLECTION,
      idPixLabel: 'id Pix label',
      customLandingPageText: 'Hello',
      creatorId: userId,
      ownerId: userId,
      organizationId,
    };

    const expectedAttributes = ['type', 'idPixLabel', 'name', 'customLandingPageText'];

    // when
    const result = await createCampaign({
      campaign,
      campaignRepository,
      campaignCreatorRepository,
      campaignCodeGenerator,
    });

    // then
    expect(result).to.be.an.instanceOf(Campaign);
    expect(_.pick(result, expectedAttributes)).to.deep.equal(_.pick(campaign, expectedAttributes));
    expect(result.code).to.have.lengthOf.above(0);
  });
});
