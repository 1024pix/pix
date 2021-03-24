const { expect, mockLearningContent, databaseBuilder, domainBuilder, learningContentBuilder, knex, sinon } = require('../../../test-helper');
const computeValidatedSkillsCount = require('../../../../scripts/prod/compute-validated-skills-count-for-assessment-campaign-participation');
const Campaign = require('../../../../lib/domain/models/Campaign');

function setLearningContent(learningContent) {
  const learningObjects = learningContentBuilder.buildLearningContent(learningContent);
  mockLearningContent(learningObjects);
}

describe('computeValidatedSkillsCount', function() {
  let competence1;
  let skill1;
  let skill2;
  let competence2;
  let skill3;
  let skill4;
  let skill5;

  beforeEach(async function() {
    skill1 = domainBuilder.buildSkill({ id: 'skill1Id' });
    skill2 = domainBuilder.buildSkill({ id: 'skill2Id' });
    skill3 = domainBuilder.buildSkill({ id: 'skill3Id' });
    skill4 = domainBuilder.buildSkill({ id: 'skill4Id' });
    skill5 = domainBuilder.buildSkill({ id: 'skill5Id' });
    competence1 = domainBuilder.buildCompetence({ id: 'competence1Id', skillIds: [skill1.id, skill2.id] });
    competence2 = domainBuilder.buildCompetence({ id: 'competence2Id', skillIds: [skill3.id, skill4.id] });
    const learningContent = [{
      id: 'areaId',
      competences: [
        {
          id: competence1.id,
          tubes: [{
            id: 'tube1Id',
            skills: [
              { id: skill1.id, nom: '@web1' },
              { id: skill2.id, nom: '@web2' },
            ],
          }],
        },
        {
          id: competence2.id,
          tubes: [{
            id: 'tube2Id',
            skills: [
              { id: skill3.id, nom: '@file1' },
              { id: skill4.id, nom: '@file2' },
              { id: skill5.id, nom: '@file3' },
            ],
          }],
        },
      ],
    }];
    setLearningContent(learningContent);
    sinon.stub(console, 'log');
  });

  afterEach(async function() {

    await knex('knowledge-element-snapshots').delete();
  });

  context('when there are campaign participation on assessment campaign', function() {
    context('when there is only one campaign participation', function() {
      it('computes validated skills count for targeted skills', async function() {
        const user = databaseBuilder.factory.buildUser();
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill1.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill2.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill3.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill4.id });
        const campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT, targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user.id,
          validatedSkillsCount: null,
          sharedAt: new Date('2020-01-02'),
          isShared: true,
        });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: user.id, createdAt: new Date('2020-01-01'), skillId: skill1.id, status: 'validated' });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: user.id, createdAt: new Date('2020-01-01'), skillId: skill2.id, status: 'invalidated' });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence2.id, userId: user.id, createdAt: new Date('2020-01-01'), skillId: skill3.id, status: 'reset' });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence2.id, userId: user.id, createdAt: new Date('2021-01-01'), skillId: skill4.id, status: 'validated' });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence2.id, userId: user.id, createdAt: new Date('2020-01-01'), skillId: skill5.id, status: 'validated' });

        await databaseBuilder.commit();

        await computeValidatedSkillsCount(1);
        const campaignParticipation = await knex('campaign-participations').first();

        expect(campaignParticipation.validatedSkillsCount).to.equals(1);
      });
    });

    context('when there are several campaign participation', function() {
      it('computes validated skills count for each participation', async function() {
        const user1 = databaseBuilder.factory.buildUser({ id: 1 });
        const user2 = databaseBuilder.factory.buildUser({ id: 2 });
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill1.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill2.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill3.id });
        const campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT, targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user1.id,
          validatedSkillsCount: null,
          sharedAt: new Date('2021-01-02'),
          isShared: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user2.id,
          validatedSkillsCount: null,
          sharedAt: new Date('2021-01-03'),
          isShared: true,
        });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: user1.id, createdAt: new Date('2020-01-01'), skillId: skill1.id });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence2.id, userId: user2.id, createdAt: new Date('2020-01-01'), skillId: skill2.id });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence2.id, userId: user2.id, createdAt: new Date('2020-01-01'), skillId: skill3.id });

        await databaseBuilder.commit();

        await computeValidatedSkillsCount(1);
        const campaignParticipations = await knex('campaign-participations').select(['userId', 'validatedSkillsCount']).orderBy('sharedAt');

        expect(campaignParticipations).to.deep.equals([{ userId: user1.id, validatedSkillsCount: 1 }, { userId: user2.id, validatedSkillsCount: 2 }]);
      });
    });

    context('when there are campaign participation for the several campaigns', function() {
      it('computes validated skills count for each participation', async function() {
        const user1 = databaseBuilder.factory.buildUser({ id: 1 });
        const user2 = databaseBuilder.factory.buildUser({ id: 2 });
        const targetProfile1 = databaseBuilder.factory.buildTargetProfile();
        const targetProfile2 = databaseBuilder.factory.buildTargetProfile();
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile1.id, skillId: skill1.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile1.id, skillId: skill2.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile2.id, skillId: skill3.id });
        const campaign1 = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT, targetProfileId: targetProfile1.id });
        const campaign2 = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT, targetProfileId: targetProfile2.id });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign1.id,
          userId: user1.id,
          validatedSkillsCount: null,
          sharedAt: new Date('2021-01-02'),
          isShared: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign2.id,
          userId: user2.id,
          validatedSkillsCount: null,
          sharedAt: new Date('2021-01-03'),
          isShared: true,
        });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: user1.id, createdAt: new Date('2020-01-01'), skillId: skill1.id });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: user1.id, createdAt: new Date('2020-01-01'), skillId: skill2.id });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence2.id, userId: user2.id, createdAt: new Date('2020-01-01'), skillId: skill3.id });

        await databaseBuilder.commit();

        await computeValidatedSkillsCount(1);
        const campaignParticipations = await knex('campaign-participations').select(['userId', 'validatedSkillsCount']).orderBy('sharedAt');

        expect(campaignParticipations).to.deep.equals([{ userId: user1.id, validatedSkillsCount: 2 }, { userId: user2.id, validatedSkillsCount: 1 }]);
      });
    });

    context('when there are campaign participation with already validated skill count computed', function() {
      it('does not compute validated skills count', async function() {
        const user = databaseBuilder.factory.buildUser({ id: 1 });
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill1.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill2.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill3.id });
        const campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT, targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user.id,
          validatedSkillsCount: 1,
          sharedAt: new Date('2021-01-02'),
          isShared: true,
        });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: user.id, createdAt: new Date('2020-01-01'), skillId: skill1.id });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence2.id, userId: user.id, createdAt: new Date('2020-01-01'), skillId: skill2.id });

        await databaseBuilder.commit();

        await computeValidatedSkillsCount(1);
        const campaignParticipation = await knex('campaign-participations').select(['userId', 'validatedSkillsCount']).first();

        expect(campaignParticipation).to.deep.equals({ userId: user.id, validatedSkillsCount: 1 });
      });
    });

    context('when there are campaign participation not shared', function() {
      it('does not compute validated skills count', async function() {
        const user = databaseBuilder.factory.buildUser({ id: 1 });
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill1.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill2.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill3.id });
        const campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT, targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user.id,
          validatedSkillsCount: null,
          sharedAt: null,
          isShared: false,
        });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: user.id, createdAt: new Date('2020-01-01'), skillId: skill1.id });
        databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence2.id, userId: user.id, createdAt: new Date('2020-01-01'), skillId: skill2.id });

        await databaseBuilder.commit();

        await computeValidatedSkillsCount(1);
        const campaignParticipation = await knex('campaign-participations').select(['userId', 'validatedSkillsCount']).first();

        expect(campaignParticipation).to.deep.equals({ userId: user.id, validatedSkillsCount: null });
      });
    });

  });

  context('when there are campaign participation on profiles collection campaigns', function() {
    it('does not compute validated skills count', async function() {
      const user = databaseBuilder.factory.buildUser({ id: 1 });
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill1.id });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill2.id });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: skill3.id });
      const campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION, targetProfileId: targetProfile.id });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId: user.id,
        validatedSkillsCount: null,
        sharedAt: new Date('2021-01-02'),
        isShared: true,
      });
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: user.id, createdAt: new Date('2020-01-01'), skillId: skill1.id });
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence2.id, userId: user.id, createdAt: new Date('2020-01-01'), skillId: skill2.id });

      await databaseBuilder.commit();

      await computeValidatedSkillsCount(1);
      const campaignParticipation = await knex('campaign-participations').select(['userId', 'validatedSkillsCount']).first();

      expect(campaignParticipation).to.deep.equals({ userId: user.id, validatedSkillsCount: null });
    });
  });
});
