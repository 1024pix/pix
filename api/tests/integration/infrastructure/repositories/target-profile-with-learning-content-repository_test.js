const { expect, databaseBuilder, airtableBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const TargetProfileWithLearningContent = require('../../../../lib/domain/models/TargetProfileWithLearningContent');
const targetProfileWithLearningContentRepository = require('../../../../lib/infrastructure/repositories/target-profile-with-learning-content-repository');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const { ENGLISH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;
const { NotFoundError, TargetProfileInvalidError } = require('../../../../lib/domain/errors');

async function _buildDomainAndDatabaseBadge(key, targetProfileId) {
  const badgeCriterion1 = domainBuilder.buildBadgeCriterion();
  const badgeCriterion2 = domainBuilder.buildBadgeCriterion();
  const badgePartnerCompetence1 = domainBuilder.buildBadgePartnerCompetence({ color: 'someColor' });
  const badgePartnerCompetence2 = domainBuilder.buildBadgePartnerCompetence();
  const badge = domainBuilder.buildBadge({ key, targetProfileId });
  badge.badgeCriteria = [badgeCriterion1, badgeCriterion2];
  badge.badgePartnerCompetences = [badgePartnerCompetence1, badgePartnerCompetence2];

  badge.id = databaseBuilder.factory.buildBadge({ ...badge, id: null }).id;
  badgeCriterion1.id = databaseBuilder.factory.buildBadgeCriterion({ ...badgeCriterion1, badgeId: badge.id, id: null }).id;
  badgeCriterion2.id = databaseBuilder.factory.buildBadgeCriterion({ ...badgeCriterion2, badgeId: badge.id, id: null }).id;
  badgePartnerCompetence1.id = databaseBuilder.factory.buildBadgePartnerCompetence({ ...badgePartnerCompetence1, badgeId: badge.id, id: null }).id;
  badgePartnerCompetence2.id = databaseBuilder.factory.buildBadgePartnerCompetence({ ...badgePartnerCompetence2, badgeId: badge.id, id: null }).id;
  await databaseBuilder.commit();

  return badge;
}

async function buildDomainAndDatabaseStage(targetProfileId) {
  const stage = domainBuilder.buildStage();

  stage.id = databaseBuilder.factory.buildStage({ ...stage, id: null, targetProfileId }).id;
  await databaseBuilder.commit();

  return stage;
}

describe('Integration | Repository | Target-profile-with-learning-content', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#get', () => {

    it('should return target profile with learning content', async () => {
      // given
      const skill1_1_1_2 = domainBuilder.buildTargetedSkill({
        id: 'recArea1_Competence1_Tube1_Skill2',
        name: 'skill1_1_1_2_name',
        tubeId: 'recArea1_Competence1_Tube1',
      });
      const skill1_2_1_1 = domainBuilder.buildTargetedSkill({
        id: 'recArea1_Competence2_Tube1_Skill1',
        name: 'skill1_2_1_1_name',
        tubeId: 'recArea1_Competence2_Tube1',
      });
      const tube1_1_1 = domainBuilder.buildTargetedTube({
        id: 'recArea1_Competence1_Tube1',
        practicalTitle: 'tube1_1_1_practicalTitle',
        competenceId: 'recArea1_Competence1',
        skills: [skill1_1_1_2],
      });
      const tube1_2_1 = domainBuilder.buildTargetedTube({
        id: 'recArea1_Competence2_Tube1',
        practicalTitle: 'tube1_2_1_practicalTitle',
        competenceId: 'recArea1_Competence2',
        skills: [skill1_2_1_1],
      });
      const competence1_1 = domainBuilder.buildTargetedCompetence({
        id: 'recArea1_Competence1',
        name: 'competence1_1_name',
        index: 'competence1_1_index',
        areaId: 'recArea1',
        tubes: [tube1_1_1],
      });
      const competence1_2 = domainBuilder.buildTargetedCompetence({
        id: 'recArea1_Competence2',
        name: 'competence1_2_name',
        index: 'competence1_2_index',
        areaId: 'recArea1',
        tubes: [tube1_2_1],
      });
      const area1 = domainBuilder.buildTargetedArea({
        id: 'recArea1',
        title: 'area1_Title',
        competences: [competence1_1, competence1_2],
      });
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile({ outdated: false, isPublic: true });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileDB.id, skillId: 'recArea1_Competence1_Tube1_Skill2' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileDB.id, skillId: 'recArea1_Competence2_Tube1_Skill1' });
      const expectedTargetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        id: targetProfileDB.id,
        name: targetProfileDB.name,
        outdated: targetProfileDB.outdated,
        isPublic: targetProfileDB.isPublic,
        skills: [skill1_1_1_2, skill1_2_1_1],
        tubes: [tube1_1_1, tube1_2_1],
        competences: [competence1_1, competence1_2],
        areas: [area1],
      });
      const airtableObjects = airtableBuilder.factory.buildLearningContent.fromTargetProfileWithLearningContent({ targetProfile: expectedTargetProfile });
      airtableBuilder.mockLists(airtableObjects);
      await databaseBuilder.commit();

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.get({ id: targetProfileDB.id });

      // then
      expect(targetProfile).to.be.instanceOf(TargetProfileWithLearningContent);
      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

    it('should return target profile badges without imageUrl', async () => {
      // given
      const basicTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileDB.id, skillId: basicTargetProfile.skills[0].id });
      const airtableObjects = airtableBuilder.factory.buildLearningContent.fromTargetProfileWithLearningContent({ targetProfile: basicTargetProfile });
      airtableBuilder.mockLists(airtableObjects);
      await databaseBuilder.commit();

      const badge1 = await _buildDomainAndDatabaseBadge('badge1', targetProfileDB.id);
      const badge2 = await _buildDomainAndDatabaseBadge('badge2', targetProfileDB.id);

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.get({ id: targetProfileDB.id });

      // then
      expect(targetProfile.badges).to.deep.equal([ { ...badge1, imageUrl: null }, { ...badge2, imageUrl: null } ]);
    });

    it('should return target profile stages', async () => {
      // given
      const basicTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileDB.id, skillId: basicTargetProfile.skills[0].id });
      const airtableObjects = airtableBuilder.factory.buildLearningContent.fromTargetProfileWithLearningContent({ targetProfile: basicTargetProfile });
      airtableBuilder.mockLists(airtableObjects);
      await databaseBuilder.commit();

      const stage1 = await buildDomainAndDatabaseStage(targetProfileDB.id);
      const stage2 = await buildDomainAndDatabaseStage(targetProfileDB.id);

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.get({ id: targetProfileDB.id });

      // then
      expect(targetProfile.stages).to.deep.equal([ stage1, stage2 ]);
    });

    it('should return target profile filled with objects with appropriate translation', async () => {
      // given
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      const expectedTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent({
        id: targetProfileDB.id,
        name: targetProfileDB.name,
        outdated: targetProfileDB.outdated,
        isPublic: targetProfileDB.isPublic,
      });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileDB.id, skillId: expectedTargetProfile.skills[0].id });
      const airtableObjects = airtableBuilder.factory.buildLearningContent.fromTargetProfileWithLearningContent({
        targetProfile: expectedTargetProfile,
        locale: ENGLISH_SPOKEN,
      });
      airtableBuilder.mockLists(airtableObjects);
      await databaseBuilder.commit();

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.get({ id: targetProfileDB.id, locale: ENGLISH_SPOKEN });

      // then
      expect(targetProfile).to.be.instanceOf(TargetProfileWithLearningContent);
      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

    it('should throw a NotFoundError when targetProfile does not exists', async () => {
      // when
      const error = await catchErr(targetProfileWithLearningContentRepository.get)({ id: 123 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should throw a TargetProfileInvalidError when targetProfile has no skills', async () => {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      await databaseBuilder.commit();

      // trick to setup learning content
      const someDummyTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const airtableObjects = airtableBuilder.factory.buildLearningContent.fromTargetProfileWithLearningContent({ targetProfile: someDummyTargetProfile });
      airtableBuilder.mockLists(airtableObjects);

      // when
      const error = await catchErr(targetProfileWithLearningContentRepository.get)({ id: targetProfileId });

      // then
      expect(error).to.be.instanceOf(TargetProfileInvalidError);
    });
  });

  describe('#getByCampaignId', () => {

    it('should return target profile with learning content', async () => {
      // given
      const skill1_1_1_2 = domainBuilder.buildTargetedSkill({
        id: 'recArea1_Competence1_Tube1_Skill2',
        name: 'skill1_1_1_2_name',
        tubeId: 'recArea1_Competence1_Tube1',
      });
      const skill1_2_1_1 = domainBuilder.buildTargetedSkill({
        id: 'recArea1_Competence2_Tube1_Skill1',
        name: 'skill1_2_1_1_name',
        tubeId: 'recArea1_Competence2_Tube1',
      });
      const tube1_1_1 = domainBuilder.buildTargetedTube({
        id: 'recArea1_Competence1_Tube1',
        practicalTitle: 'tube1_1_1_practicalTitle',
        competenceId: 'recArea1_Competence1',
        skills: [skill1_1_1_2],
      });
      const tube1_2_1 = domainBuilder.buildTargetedTube({
        id: 'recArea1_Competence2_Tube1',
        practicalTitle: 'tube1_2_1_practicalTitle',
        competenceId: 'recArea1_Competence2',
        skills: [skill1_2_1_1],
      });
      const competence1_1 = domainBuilder.buildTargetedCompetence({
        id: 'recArea1_Competence1',
        name: 'competence1_1_name',
        index: 'competence1_1_index',
        areaId: 'recArea1',
        tubes: [tube1_1_1],
      });
      const competence1_2 = domainBuilder.buildTargetedCompetence({
        id: 'recArea1_Competence2',
        name: 'competence1_2_name',
        index: 'competence1_2_index',
        areaId: 'recArea1',
        tubes: [tube1_2_1],
      });
      const area1 = domainBuilder.buildTargetedArea({
        id: 'recArea1',
        title: 'area1_Title',
        competences: [competence1_1, competence1_2],
      });
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileDB.id, skillId: 'recArea1_Competence1_Tube1_Skill2' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileDB.id, skillId: 'recArea1_Competence2_Tube1_Skill1' });
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileDB.id }).id;
      const expectedTargetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        id: targetProfileDB.id,
        name: targetProfileDB.name,
        outdated: targetProfileDB.outdated,
        isPublic: targetProfileDB.isPublic,
        skills: [skill1_1_1_2, skill1_2_1_1],
        tubes: [tube1_1_1, tube1_2_1],
        competences: [competence1_1, competence1_2],
        areas: [area1],
      });
      const airtableObjects = airtableBuilder.factory.buildLearningContent.fromTargetProfileWithLearningContent({ targetProfile: expectedTargetProfile });
      airtableBuilder.mockLists(airtableObjects);
      await databaseBuilder.commit();

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });

      // then
      expect(targetProfile).to.be.instanceOf(TargetProfileWithLearningContent);
      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

    it('should return target profile stages', async () => {
      // given
      const basicTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileDB.id, skillId: basicTargetProfile.skills[0].id });
      const airtableObjects = airtableBuilder.factory.buildLearningContent.fromTargetProfileWithLearningContent({ targetProfile: basicTargetProfile });
      airtableBuilder.mockLists(airtableObjects);
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileDB.id }).id;
      await databaseBuilder.commit();

      const stage1 = await buildDomainAndDatabaseStage(targetProfileDB.id);
      const stage2 = await buildDomainAndDatabaseStage(targetProfileDB.id);

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });

      // then
      expect(targetProfile.stages).to.deep.equal([ stage1, stage2 ]);
    });

    it('should return target profile badges without imageUrl', async () => {
      // given
      const basicTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileDB.id, skillId: basicTargetProfile.skills[0].id });
      const airtableObjects = airtableBuilder.factory.buildLearningContent.fromTargetProfileWithLearningContent({ targetProfile: basicTargetProfile });
      airtableBuilder.mockLists(airtableObjects);
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileDB.id }).id;
      await databaseBuilder.commit();

      const badge1 = await _buildDomainAndDatabaseBadge('badge1', targetProfileDB.id);
      const badge2 = await _buildDomainAndDatabaseBadge('badge2', targetProfileDB.id);

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });

      // then
      expect(targetProfile.badges).to.deep.equal([ { ...badge1, imageUrl: null }, { ...badge2, imageUrl: null } ]);
    });

    it('should return target profile filled with objects with appropriate translation', async () => {
      // given
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      const expectedTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent({
        id: targetProfileDB.id,
        name: targetProfileDB.name,
        outdated: targetProfileDB.outdated,
        isPublic: targetProfileDB.isPublic,
      });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileDB.id, skillId: expectedTargetProfile.skills[0].id });
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileDB.id }).id;
      const airtableObjects = airtableBuilder.factory.buildLearningContent.fromTargetProfileWithLearningContent({
        targetProfile: expectedTargetProfile,
        locale: ENGLISH_SPOKEN,
      });
      airtableBuilder.mockLists(airtableObjects);
      await databaseBuilder.commit();

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId, locale: ENGLISH_SPOKEN });

      // then
      expect(targetProfile).to.be.instanceOf(TargetProfileWithLearningContent);
      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

    it('should throw a NotFoundError when targetProfile cannot be found', async () => {
      // when
      const error = await catchErr(targetProfileWithLearningContentRepository.getByCampaignId)({ campaignId: 123 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should throw a TargetProfileInvalidError when targetProfile has no skills', async () => {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      await databaseBuilder.commit();

      // trick to setup learning content
      const someDummyTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const airtableObjects = airtableBuilder.factory.buildLearningContent.fromTargetProfileWithLearningContent({ targetProfile: someDummyTargetProfile });
      airtableBuilder.mockLists(airtableObjects);

      // when
      const error = await catchErr(targetProfileWithLearningContentRepository.getByCampaignId)({ campaignId });

      // then
      expect(error).to.be.instanceOf(TargetProfileInvalidError);
    });
  });
});
