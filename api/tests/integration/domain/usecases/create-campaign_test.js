const { expect, databaseBuilder, mockLearningContent, knex } = require('../../../test-helper');
const _ = require('lodash');

const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const campaignCreatorRepository = require('../../../../lib/infrastructure/repositories/campaign-creator-repository');

const createCampaign = require('../../../../lib/domain/usecases/create-campaign');

const Campaign = require('../../../../lib/domain/models/Campaign');

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
      type: Campaign.types.ASSESSMENT,
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
    });

    // then
    expect(result).to.be.an.instanceOf(Campaign);

    expect(_.pick(result, expectedAttributes)).to.deep.equal(_.pick(campaign, expectedAttributes));

    expect('code').to.be.ok;
    expect('id').to.be.ok;
  });

  it('should save a new campaign of type PROFILES_COLLECTION', async function () {
    // given
    const campaign = {
      name: 'a name',
      type: Campaign.types.PROFILES_COLLECTION,
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
    });

    // then
    expect(result).to.be.an.instanceOf(Campaign);

    expect(_.pick(result, expectedAttributes)).to.deep.equal(_.pick(campaign, expectedAttributes));

    expect('code').to.be.ok;
    expect('id').to.be.ok;
  });
});
