const { omit } = require('lodash');
const { expect, databaseBuilder, mockLearningContent, domainBuilder, catchErr } = require('../../../test-helper');
const TargetProfileWithLearningContent = require('../../../../lib/domain/models/TargetProfileWithLearningContent');
const targetProfileWithLearningContentRepository = require('../../../../lib/infrastructure/repositories/target-profile-with-learning-content-repository');
const { ENGLISH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;
const { NotFoundError, TargetProfileInvalidError } = require('../../../../lib/domain/errors');
const TargetProfileTube = require('../../../../lib/domain/models/TargetProfileTube');

async function _buildDomainAndDatabaseBadge(key, targetProfileId) {
  const badgeCriterion1 = domainBuilder.buildBadgeCriterion();
  badgeCriterion1.id = undefined;
  const badgeCriterion2 = domainBuilder.buildBadgeCriterion();
  badgeCriterion2.id = undefined;
  const skillSet1 = domainBuilder.buildSkillSet();
  skillSet1.id = undefined;
  const skillSet2 = domainBuilder.buildSkillSet();
  skillSet2.id = undefined;
  const badge = domainBuilder.buildBadge({ key, targetProfileId });
  badge.id = undefined;
  badge.badgeCriteria = [badgeCriterion1, badgeCriterion2];
  badge.skillSets = [skillSet1, skillSet2];

  badge.id = databaseBuilder.factory.buildBadge({ ...badge }).id;
  badgeCriterion1.badgeId = badge.id;
  badgeCriterion2.badgeId = badge.id;
  badgeCriterion1.id = databaseBuilder.factory.buildBadgeCriterion({ ...badgeCriterion1 }).id;
  badgeCriterion2.id = databaseBuilder.factory.buildBadgeCriterion({ ...badgeCriterion2 }).id;
  skillSet1.id = databaseBuilder.factory.buildSkillSet({
    ...skillSet1,
    badgeId: badge.id,
  }).id;
  skillSet2.id = databaseBuilder.factory.buildSkillSet({
    ...skillSet2,
    badgeId: badge.id,
  }).id;
  skillSet1.badgeId = badge.id;
  skillSet2.badgeId = badge.id;
  await databaseBuilder.commit();

  return badge;
}

async function buildDomainAndDatabaseStage(targetProfileId) {
  const stage = domainBuilder.buildStage();
  stage.id = undefined;

  stage.id = databaseBuilder.factory.buildStage({ ...stage, targetProfileId }).id;
  await databaseBuilder.commit();

  return stage;
}

const checkBadge = (actual, expected) => {
  expect(omit(actual, ['badgeCriteria', 'skillSets'])).to.deep.include(omit(expected, ['badgeCriteria', 'skillSets']));
  expect(actual.badgeCriteria).to.have.deep.members(expected.badgeCriteria);
  expect(actual.skillSets).to.have.deep.members(expected.skillSets);
};

describe('Integration | Repository | Target-profile-with-learning-content', function () {
  describe('#get', function () {
    it('return target profile category', async function () {
      // given
      const skillId = 'skillId';
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({ category: 'COMPETENCES' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId });

      const learningContent = {
        areas: [{ id: 'area1', competenceIds: ['competence1'] }],
        competences: [{ id: 'competence1', skillIds: [skillId], origin: 'Pix' }],
        tubes: [{ id: 'tube1', competenceId: 'competence1' }],
        skills: [{ id: skillId, tubeId: 'tube1', status: 'actif' }],
        thematics: [],
        challenges: [],
      };

      mockLearningContent(learningContent);
      await databaseBuilder.commit();

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.get({ id: targetProfileId });

      // then
      expect(targetProfile.category).to.equal('COMPETENCES');
    });

    it('should return target profile with learning content', async function () {
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
        description: 'tube1_1_1_practicalDescription',
        competenceId: 'recArea1_Competence1',
        skills: [skill1_1_1_2],
      });
      const tube1_2_1 = domainBuilder.buildTargetedTube({
        id: 'recArea1_Competence2_Tube1',
        practicalTitle: 'tube1_2_1_practicalTitle',
        description: 'tube1_2_1_practicalDescriptionFrFr',
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
        color: 'area1_color',
        code: 'area1_code',
        frameworkId: 'fmk1',
        competences: [competence1_1, competence1_2],
      });
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile({
        outdated: false,
        isPublic: true,
        imageUrl: 'data:,',
        description: 'Super profil cible.',
        comment: 'Red Notice',
        isSimplifiedAccess: false,
      });
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfileDB.id,
        skillId: 'recArea1_Competence1_Tube1_Skill2',
      });
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfileDB.id,
        skillId: 'recArea1_Competence2_Tube1_Skill1',
      });
      const expectedTargetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        id: targetProfileDB.id,
        name: targetProfileDB.name,
        createdAt: targetProfileDB.createdAt,
        outdated: targetProfileDB.outdated,
        isPublic: targetProfileDB.isPublic,
        ownerOrganizationId: targetProfileDB.ownerOrganizationId,
        description: targetProfileDB.description,
        comment: targetProfileDB.comment,
        imageUrl: targetProfileDB.imageUrl,
        skills: [skill1_1_1_2, skill1_2_1_1],
        tubes: [tube1_1_1, tube1_2_1],
        competences: [competence1_1, competence1_2],
        areas: [area1],
        isSimplifiedAccess: targetProfileDB.isSimplifiedAccess,
      });

      const learningContent = {
        areas: [
          {
            id: 'recArea1',
            titleFrFr: 'area1_Title',
            color: 'area1_color',
            code: 'area1_code',
            frameworkId: 'fmk1',
            competenceIds: ['recArea1_Competence1', 'recArea1_Competence2'],
          },
        ],
        competences: [
          {
            id: 'recArea1_Competence1',
            nameFrFr: 'competence1_1_name',
            index: 'competence1_1_index',
            areaId: 'recArea1',
            skillIds: ['recArea1_Competence1_Tube1_Skill2'],
            origin: 'Pix',
          },
          {
            id: 'recArea1_Competence2',
            nameFrFr: 'competence1_2_name',
            index: 'competence1_2_index',
            areaId: 'recArea1',
            skillIds: ['recArea1_Competence2_Tube1_Skill1'],
            origin: 'Pix',
          },
        ],
        tubes: [
          {
            id: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
            practicalTitleFrFr: 'tube1_1_1_practicalTitle',
            practicalDescriptionFrFr: 'tube1_1_1_practicalDescription',
          },
          {
            id: 'recArea1_Competence2_Tube1',
            competenceId: 'recArea1_Competence2',
            practicalTitleFrFr: 'tube1_2_1_practicalTitle',
            practicalDescriptionFrFr: 'tube1_2_1_practicalDescriptionFrFr',
          },
        ],
        skills: [
          {
            id: 'recArea1_Competence1_Tube1_Skill2',
            name: 'skill1_1_1_2_name',
            status: 'actif',
            tubeId: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
            tutorialIds: [],
          },
          {
            id: 'recArea1_Competence2_Tube1_Skill1',
            name: 'skill1_2_1_1_name',
            status: 'actif',
            tubeId: 'recArea1_Competence2_Tube1',
            competenceId: 'recArea1_Competence2',
            tutorialIds: [],
          },
        ],
        thematics: [],
        challenges: [],
      };

      mockLearningContent(learningContent);
      await databaseBuilder.commit();

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.get({ id: targetProfileDB.id });

      // then
      expect(targetProfile).to.be.instanceOf(TargetProfileWithLearningContent);
      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

    it('should return target profile badges without imageUrl', async function () {
      // given
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfileDB.id,
        skillId: 'recArea1_Competence1_Tube1_Skill1',
      });
      const learningContent = {
        areas: [
          {
            id: 'recArea1',
            titleFrFr: 'someTitle',
            color: 'someColor',
            competenceIds: ['recArea1_Competence1'],
          },
        ],
        competences: [
          {
            id: 'recArea1_Competence1',
            nameFrFr: 'someName',
            index: 'someIndex',
            areaId: 'recArea1',
            skillIds: ['recArea1_Competence1_Tube1_Skill1'],
            origin: 'Pix',
          },
        ],
        tubes: [
          {
            id: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
            practicalTitleFrFr: 'somePracticalTitle',
          },
        ],
        skills: [
          {
            id: 'recArea1_Competence1_Tube1_Skill1',
            name: 'someSkillName5',
            status: 'actif',
            tubeId: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
            tutorialIds: [],
          },
        ],
        thematics: [],
        challenges: [],
      };

      mockLearningContent(learningContent);
      await databaseBuilder.commit();

      const badge1 = await _buildDomainAndDatabaseBadge('badge1', targetProfileDB.id);
      const badge2 = await _buildDomainAndDatabaseBadge('badge2', targetProfileDB.id);

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.get({ id: targetProfileDB.id });

      // then
      const actualBadge1 = targetProfile.badges.find((badge) => badge.id === badge1.id);
      checkBadge(actualBadge1, {
        ...badge1,
        imageUrl: null,
      });
      const actualBadge2 = targetProfile.badges.find((badge) => badge.id === badge2.id);
      checkBadge(actualBadge2, {
        ...badge2,
        imageUrl: null,
      });
    });

    it('should return target profile stages', async function () {
      // given
      const basicTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfileDB.id,
        skillId: basicTargetProfile.skills[0].id,
      });
      const learningContent = {
        areas: [
          {
            id: 'recArea1',
            titleFrFr: 'someTitle',
            color: 'someColor',
            competenceIds: ['recArea1_Competence1'],
          },
        ],
        competences: [
          {
            id: 'recArea1_Competence1',
            nameFrFr: 'someName',
            index: 'someIndex',
            areaId: 'recArea1',
            skillIds: [basicTargetProfile.skills[0].id],
            origin: 'Pix',
          },
        ],
        tubes: [
          {
            id: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
            practicalTitleFrFr: 'somePracticalTitle',
          },
        ],
        skills: [
          {
            id: basicTargetProfile.skills[0].id,
            name: 'someSkillName5',
            status: 'actif',
            tubeId: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
            tutorialIds: [],
          },
        ],
        thematics: [],
        challenges: [],
      };

      mockLearningContent(learningContent);
      await databaseBuilder.commit();

      const stage1 = await buildDomainAndDatabaseStage(targetProfileDB.id);
      const stage2 = await buildDomainAndDatabaseStage(targetProfileDB.id);

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.get({ id: targetProfileDB.id });

      // then
      expect(targetProfile.stages).to.have.deep.members([stage1, stage2]);
    });

    it('should return target profile filled with objects with appropriate translation', async function () {
      // given
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      const expectedTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent({
        id: targetProfileDB.id,
        name: targetProfileDB.name,
        outdated: targetProfileDB.outdated,
        isPublic: targetProfileDB.isPublic,
        createdAt: targetProfileDB.createdAt,
        ownerOrganizationId: targetProfileDB.ownerOrganizationId,
        imageUrl: targetProfileDB.imageUrl,
      });
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfileDB.id,
        skillId: expectedTargetProfile.skills[0].id,
      });

      const learningContent = {
        areas: [
          {
            id: 'areaId',
            titleEnUs: 'someTitle',
            color: 'someColor',
            code: 'someCode',
            frameworkId: 'someFmkId',
            competenceIds: ['competenceId'],
          },
        ],
        competences: [
          {
            id: 'competenceId',
            nameEnUs: 'someName',
            index: 'someIndex',
            areaId: 'areaId',
            skillIds: ['skillId'],
            origin: 'Pix',
          },
        ],
        tubes: [
          {
            id: 'tubeId',
            competenceId: 'competenceId',
            practicalTitleEnUs: 'somePracticalTitle',
            practicalDescriptionEnUs: 'someDescription',
          },
        ],
        skills: [
          {
            id: 'skillId',
            name: 'someSkillName5',
            status: 'actif',
            tubeId: 'tubeId',
            competenceId: 'competenceId',
            tutorialIds: [],
          },
        ],
        thematics: [],
        challenges: [],
      };
      mockLearningContent(learningContent);
      await databaseBuilder.commit();

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.get({
        id: targetProfileDB.id,
        locale: ENGLISH_SPOKEN,
      });

      // then
      expect(targetProfile).to.be.instanceOf(TargetProfileWithLearningContent);
      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

    it('should return target profile with tubes selection', async function () {
      const basicTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      const expectedTubesSelection = [
        new TargetProfileTube({ id: 'tubeId123', level: 6 }),
        new TargetProfileTube({ id: 'tubeId456', level: 2 }),
      ];
      domainBuilder.buildTargetProfileWithLearningContent({
        id: targetProfileDB.id,
        tubesSelection: expectedTubesSelection,
      });
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: targetProfileDB.id,
        tubeId: expectedTubesSelection[0].id,
        level: expectedTubesSelection[0].level,
      });
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: targetProfileDB.id,
        tubeId: expectedTubesSelection[1].id,
        level: expectedTubesSelection[1].level,
      });
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfileDB.id,
        skillId: basicTargetProfile.skills[0].id,
      });

      const expectedTubesSelectionAreas = [
        domainBuilder.buildTargetedArea({
          id: 'recArea1',
          competences: [
            {
              id: 'recArea1_Competence1',
              name: 'someName',
              index: 'someIndex',
              areaId: 'recArea1',
              origin: 'Pix',
              thematics: [],
              tubes: [],
            },
          ],
        }),
      ];

      const learningContent = {
        areas: [
          {
            id: 'recArea1',
            titleFrFr: 'someTitle',
            code: 'someCode',
            color: 'someColor',
            frameworkId: 'someFmkId',
            competenceIds: ['recArea1_Competence1'],
          },
        ],
        competences: [
          {
            id: 'recArea1_Competence1',
            nameFrFr: 'someName',
            index: 'someIndex',
            areaId: 'recArea1',
            skillIds: [basicTargetProfile.skills[0].id],
            origin: 'Pix',
          },
        ],
        tubes: [
          {
            id: 'tubeId123',
            competenceId: 'recArea1_Competence1',
            practicalTitleFrFr: 'somePracticalTitle',
          },
          {
            id: 'tubeId456',
            competenceId: 'recArea1_Competence1',
            practicalTitleFrFr: 'somePracticalTitle',
          },
        ],
        skills: [
          {
            id: basicTargetProfile.skills[0].id,
            name: 'someSkillName5',
            status: 'actif',
            tubeId: 'tubeId123',
            competenceId: 'recArea1_Competence1',
            tutorialIds: [],
          },
        ],
        thematics: [],
        challenges: [],
      };

      mockLearningContent(learningContent);
      await databaseBuilder.commit();

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.get({ id: targetProfileDB.id });

      // then
      expect(targetProfile.tubesSelection).to.deep.eq(expectedTubesSelection);
      expect(targetProfile.tubesSelectionAreas).to.deep.eq(expectedTubesSelectionAreas);
    });

    it('should throw a NotFoundError when targetProfile does not exists', async function () {
      // when
      const error = await catchErr(targetProfileWithLearningContentRepository.get)({ id: 123 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should throw a TargetProfileInvalidError when targetProfile has no skills', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      await databaseBuilder.commit();

      const learningContent = {
        areas: [
          {
            id: 'areaId',
            titleEnUs: 'someTitle',
            color: 'someColor',
            competenceIds: ['competenceId'],
          },
        ],
        competences: [
          {
            id: 'competenceId',
            nameEnUs: 'someName',
            index: 'someIndex',
            areaId: 'areaId',
            skillIds: ['skillId'],
            origin: 'Pix',
          },
        ],
        tubes: [
          {
            id: 'tubeId',
            competenceId: 'competenceId',
            practicalTitleEnUs: 'somePracticalTitle',
          },
        ],
        skills: [
          {
            id: 'skillId',
            name: 'someSkillName5',
            status: 'actif',
            tubeId: 'tubeId',
            competenceId: 'competenceId',
            tutorialIds: [],
          },
        ],
        thematics: [],
        challenges: [],
      };
      mockLearningContent(learningContent);

      // when
      const error = await catchErr(targetProfileWithLearningContentRepository.get)({ id: targetProfileId });

      // then
      expect(error).to.be.instanceOf(TargetProfileInvalidError);
    });
  });

  describe('#getByCampaignId', function () {
    it('should return target profile with learning content', async function () {
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
        description: 'tube1_1_1_description',
        competenceId: 'recArea1_Competence1',
        skills: [skill1_1_1_2],
      });
      const tube1_2_1 = domainBuilder.buildTargetedTube({
        id: 'recArea1_Competence2_Tube1',
        practicalTitle: 'tube1_2_1_practicalTitle',
        description: 'tube1_2_1_description',
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
        code: 'area1_code',
        color: 'area1_color',
        frameworkId: 'area1_fmkId',
        competences: [competence1_1, competence1_2],
      });
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfileDB.id,
        skillId: 'recArea1_Competence1_Tube1_Skill2',
      });
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfileDB.id,
        skillId: 'recArea1_Competence2_Tube1_Skill1',
      });
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileDB.id }).id;
      const expectedTargetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        id: targetProfileDB.id,
        name: targetProfileDB.name,
        outdated: targetProfileDB.outdated,
        isPublic: targetProfileDB.isPublic,
        createdAt: targetProfileDB.createdAt,
        description: targetProfileDB.description,
        comment: targetProfileDB.comment,
        ownerOrganizationId: targetProfileDB.ownerOrganizationId,
        imageUrl: targetProfileDB.imageUrl,
        skills: [skill1_1_1_2, skill1_2_1_1],
        tubes: [tube1_1_1, tube1_2_1],
        competences: [competence1_1, competence1_2],
        areas: [area1],
      });
      const learningContent = {
        areas: [
          {
            id: 'recArea1',
            titleFrFr: 'area1_Title',
            code: 'area1_code',
            color: 'area1_color',
            frameworkId: 'area1_fmkId',
            competenceIds: ['recArea1_Competence1', 'recArea1_Competence2'],
          },
        ],
        competences: [
          {
            id: 'recArea1_Competence1',
            nameFrFr: 'competence1_1_name',
            index: 'competence1_1_index',
            areaId: 'recArea1',
            skillIds: ['recArea1_Competence1_Tube1_Skill2'],
            origin: 'Pix',
          },
          {
            id: 'recArea1_Competence2',
            nameFrFr: 'competence1_2_name',
            index: 'competence1_2_index',
            areaId: 'recArea1',
            skillIds: ['recArea1_Competence2_Tube1_Skill1'],
            origin: 'Pix',
          },
        ],
        tubes: [
          {
            id: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
            practicalTitleFrFr: 'tube1_1_1_practicalTitle',
            practicalDescriptionFrFr: 'tube1_1_1_description',
          },
          {
            id: 'recArea1_Competence2_Tube1',
            competenceId: 'recArea1_Competence2',
            practicalTitleFrFr: 'tube1_2_1_practicalTitle',
            practicalDescriptionFrFr: 'tube1_2_1_description',
          },
        ],
        skills: [
          {
            id: 'recArea1_Competence1_Tube1_Skill2',
            name: 'skill1_1_1_2_name',
            status: 'actif',
            tubeId: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
            tutorialIds: [],
          },
          {
            id: 'recArea1_Competence2_Tube1_Skill1',
            name: 'skill1_2_1_1_name',
            status: 'actif',
            tubeId: 'recArea1_Competence2_Tube1',
            competenceId: 'recArea1_Competence2',
            tutorialIds: [],
          },
        ],
        thematics: [],
        challenges: [],
      };

      mockLearningContent(learningContent);
      await databaseBuilder.commit();

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });

      // then
      expect(targetProfile).to.be.instanceOf(TargetProfileWithLearningContent);
      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

    it('should return target profile stages', async function () {
      // given
      const basicTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfileDB.id,
        skillId: basicTargetProfile.skills[0].id,
      });
      const learningContent = {
        areas: [
          {
            id: 'areaId',
            titleEnUs: 'someTitle',
            color: 'someColor',
            competenceIds: ['competenceId'],
          },
        ],
        competences: [
          {
            id: 'competenceId',
            nameEnUs: 'someName',
            index: 'someIndex',
            areaId: 'areaId',
            skillIds: [basicTargetProfile.skills[0].id],
            origin: 'Pix',
          },
        ],
        tubes: [
          {
            id: 'tubeId',
            competenceId: 'competenceId',
            practicalTitleEnUs: 'somePracticalTitle',
          },
        ],
        skills: [
          {
            id: basicTargetProfile.skills[0].id,
            name: 'someSkillName5',
            status: 'actif',
            tubeId: 'tubeId',
            competenceId: 'competenceId',
            tutorialIds: [],
          },
        ],
        thematics: [],
        challenges: [],
      };
      mockLearningContent(learningContent);
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileDB.id }).id;
      await databaseBuilder.commit();

      const stage1 = await buildDomainAndDatabaseStage(targetProfileDB.id);
      const stage2 = await buildDomainAndDatabaseStage(targetProfileDB.id);

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });

      // then
      expect(targetProfile.stages).to.have.deep.members([stage1, stage2]);
    });

    it('should return target profile badges without imageUrl', async function () {
      // given
      const basicTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfileDB.id,
        skillId: basicTargetProfile.skills[0].id,
      });

      const learningContent = {
        areas: [
          {
            id: 'areaId',
            titleEnUs: 'someTitle',
            color: 'someColor',
            competenceIds: ['competenceId'],
          },
        ],
        competences: [
          {
            id: 'competenceId',
            nameEnUs: 'someName',
            index: 'someIndex',
            areaId: 'areaId',
            skillIds: [basicTargetProfile.skills[0].id],
            origin: 'Pix',
          },
        ],
        tubes: [
          {
            id: 'tubeId',
            competenceId: 'competenceId',
            practicalTitleEnUs: 'somePracticalTitle',
          },
        ],
        skills: [
          {
            id: basicTargetProfile.skills[0].id,
            name: 'someSkillName5',
            status: 'actif',
            tubeId: 'tubeId',
            competenceId: 'competenceId',
            tutorialIds: [],
          },
        ],
        thematics: [],
        challenges: [],
      };
      mockLearningContent(learningContent);
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileDB.id }).id;
      await databaseBuilder.commit();

      const badge1 = await _buildDomainAndDatabaseBadge('badge1', targetProfileDB.id);
      const badge2 = await _buildDomainAndDatabaseBadge('badge2', targetProfileDB.id);

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });

      // then
      const actualBadge1 = targetProfile.badges.find((badge) => badge.id === badge1.id);
      checkBadge(actualBadge1, {
        ...badge1,
        imageUrl: null,
      });
      const actualBadge2 = targetProfile.badges.find((badge) => badge.id === badge2.id);
      checkBadge(actualBadge2, {
        ...badge2,
        imageUrl: null,
      });
    });

    it('should return target profile filled with objects with appropriate translation', async function () {
      // given
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      const expectedTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent({
        id: targetProfileDB.id,
        name: targetProfileDB.name,
        outdated: targetProfileDB.outdated,
        isPublic: targetProfileDB.isPublic,
        createdAt: targetProfileDB.createdAt,
        ownerOrganizationId: targetProfileDB.ownerOrganizationId,
        imageUrl: targetProfileDB.imageUrl,
      });
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: targetProfileDB.id,
        skillId: expectedTargetProfile.skills[0].id,
      });
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileDB.id }).id;
      const learningContent = {
        areas: [
          {
            id: 'areaId',
            titleEnUs: 'someTitle',
            color: 'someColor',
            code: 'someCode',
            frameworkId: 'someFmkId',
            competenceIds: ['competenceId'],
          },
        ],
        competences: [
          {
            id: 'competenceId',
            nameEnUs: 'someName',
            index: 'someIndex',
            areaId: 'areaId',
            skillIds: ['skillId'],
            origin: 'Pix',
          },
        ],
        tubes: [
          {
            id: 'tubeId',
            competenceId: 'competenceId',
            practicalTitleEnUs: 'somePracticalTitle',
            practicalDescriptionEnUs: 'someDescription',
          },
        ],
        skills: [
          {
            id: 'skillId',
            name: 'someSkillName5',
            status: 'actif',
            tubeId: 'tubeId',
            competenceId: 'competenceId',
            tutorialIds: [],
          },
        ],
        thematics: [],
        challenges: [],
      };
      mockLearningContent(learningContent);
      await databaseBuilder.commit();

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({
        campaignId,
        locale: ENGLISH_SPOKEN,
      });

      // then
      expect(targetProfile).to.be.instanceOf(TargetProfileWithLearningContent);
      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

    it('should throw a NotFoundError when targetProfile cannot be found', async function () {
      // when
      const error = await catchErr(targetProfileWithLearningContentRepository.getByCampaignId)({ campaignId: 123 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should throw a TargetProfileInvalidError when targetProfile has no skills', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      await databaseBuilder.commit();

      const learningContent = {
        areas: [
          {
            id: 'areaId',
            titleEnUs: 'someTitle',
            color: 'someColor',
            competenceIds: ['competenceId'],
          },
        ],
        competences: [
          {
            id: 'competenceId',
            nameEnUs: 'someName',
            index: 'someIndex',
            areaId: 'areaId',
            skillIds: ['skillId'],
            origin: 'Pix',
          },
        ],
        tubes: [
          {
            id: 'tubeId',
            competenceId: 'competenceId',
            practicalTitleEnUs: 'somePracticalTitle',
          },
        ],
        skills: [
          {
            id: 'skillId',
            name: 'someSkillName5',
            status: 'actif',
            tubeId: 'tubeId',
            competenceId: 'competenceId',
            tutorialIds: [],
          },
        ],
        thematics: [],
        challenges: [],
      };
      mockLearningContent(learningContent);

      // when
      const error = await catchErr(targetProfileWithLearningContentRepository.getByCampaignId)({ campaignId });

      // then
      expect(error).to.be.instanceOf(TargetProfileInvalidError);
    });
  });
});
