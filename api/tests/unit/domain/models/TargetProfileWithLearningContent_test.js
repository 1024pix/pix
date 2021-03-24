const { expect, domainBuilder } = require('../../../test-helper');
const TargetProfileWithLearningContent = require('../../../../lib/domain/models/TargetProfileWithLearningContent');

describe('Unit | Domain | Models | TargetProfileWithLearningContent', function() {

  describe('constructor', function() {

    it('should order stages by threshold', function() {
      // given
      const stage1 = domainBuilder.buildStage({ threshold: 50 });
      const stage2 = domainBuilder.buildStage({ threshold: 0 });
      const stage3 = domainBuilder.buildStage({ threshold: 10 });

      // when
      const targetProfile = new TargetProfileWithLearningContent({
        stages: [stage1, stage2, stage3],
      });

      // then
      expect(targetProfile.stages).to.exactlyContainInOrder([stage2, stage3, stage1]);
    });
  });

  describe('get#skillNames', function() {

    it('should return an array with targeted skill names', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ name: '@acquis1' });
      const skill2 = domainBuilder.buildTargetedSkill({ name: '@acquis2' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [skill1, skill2] });

      // when
      const targetedSkillNames = targetProfile.skillNames;

      // then
      expect(targetedSkillNames).to.exactlyContainInOrder(['@acquis1', '@acquis2']);
    });
  });

  describe('get#skillIds', function() {

    it('should return an array with targeted skill ids', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'acquis1' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'acquis2' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [skill1, skill2] });

      // when
      const targetedSkillIds = targetProfile.skillIds;

      // then
      expect(targetedSkillIds).to.exactlyContain(['acquis1', 'acquis2']);
    });
  });

  describe('get#tubeIds', function() {

    it('should return an array with targeted tubes ids order by id', function() {
      // given
      const tube1 = domainBuilder.buildTargetedTube({ id: 'tubeId1' });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'tubeId2' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ tubes: [tube1, tube2] });

      // when
      const targetedTubeIds = targetProfile.tubeIds;

      // then
      expect(targetedTubeIds).to.exactlyContainInOrder(['tubeId1', 'tubeId2']);
    });
  });

  describe('get#competenceIds', function() {

    it('should return an array with targeted competence ids order by id', function() {
      // given
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'compId1' });
      const competence2 = domainBuilder.buildTargetedCompetence({ id: 'compId2' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ competences: [competence1, competence2] });

      // when
      const targetedCompetenceIds = targetProfile.competenceIds;

      // then
      expect(targetedCompetenceIds).to.exactlyContainInOrder(['compId1', 'compId2']);
    });
  });

  describe('get#reachableStages', function() {

    it('should return reachable stages ordered by threshold', function() {
      // given
      const stage1 = domainBuilder.buildStage({ threshold: 0 });
      const stage2 = domainBuilder.buildStage({ threshold: 50 });
      const stage3 = domainBuilder.buildStage({ threshold: 10 });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent({
        stages: [stage1, stage2, stage3],
      });

      // when
      const reachableStages = targetProfile.reachableStages;

      // then
      expect(reachableStages).to.exactlyContainInOrder([stage3, stage2]);
    });
  });

  describe('hasSkill', function() {

    it('should return true when the skill is in target profile', function() {
      // given
      const skill = domainBuilder.buildTargetedSkill();
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [skill] });

      // when
      const isIncluded = targetProfile.hasSkill(skill.id);

      // then
      expect(isIncluded).to.be.true;
    });

    it('should return false when the skill is not in target profile', function() {
      // given
      const skill = domainBuilder.buildTargetedSkill({ id: 'someId' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [skill] });

      // when
      const isIncluded = targetProfile.hasSkill('someOtherId');

      // then
      expect(isIncluded).to.be.false;
    });
  });

  describe('hasBadges', function() {

    it('should return true when target profile has badges', function() {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const badge = domainBuilder.buildBadge();
      targetProfile.badges = [badge];

      // when / then
      expect(targetProfile.hasBadges()).to.be.true;
    });

    it('should return false when target profile has no badges', function() {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      targetProfile.badges = [];

      // when / then
      expect(targetProfile.hasBadges()).to.be.false;
    });
  });

  describe('hasReachableStages', function() {

    it('should return true when target profile has reachable stages', function() {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const stage1 = domainBuilder.buildStage({ threshold: 0 });
      const stage2 = domainBuilder.buildStage({ threshold: 50 });
      const stage3 = domainBuilder.buildStage({ threshold: 10 });
      targetProfile.stages = [stage1, stage2, stage3];

      // when / then
      expect(targetProfile.hasReachableStages()).to.be.true;
    });

    it('should return false when target profile has no reachable stages', function() {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const stage = domainBuilder.buildStage({ threshold: 0 });
      targetProfile.stages = [stage];

      // when / then
      expect(targetProfile.hasReachableStages()).to.be.false;
    });

    it('should return false when target profile has no stages at all', function() {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      targetProfile.stages = [];

      // when / then
      expect(targetProfile.hasReachableStages()).to.be.false;
    });
  });

  describe('getCompetence', function() {

    it('should return the competence when its in the target profile', function() {
      // given
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'comp1' });
      const competence2 = domainBuilder.buildTargetedCompetence({ id: 'comp2' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ competences: [competence1, competence2] });

      // when
      const actualCompetence = targetProfile.getCompetence('comp2');

      // then
      expect(actualCompetence).to.deep.equal(competence2);
    });

    it('should return null if competence not in target profile', function() {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ competences: [] });

      // when
      const actualCompetence = targetProfile.getCompetence('comp2');

      // then
      expect(actualCompetence).to.be.null;
    });
  });

  describe('getArea', function() {

    it('should return the area when its in the target profile', function() {
      // given
      const area1 = domainBuilder.buildTargetedArea({ id: 'area1' });
      const area2 = domainBuilder.buildTargetedArea({ id: 'area2' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ areas: [area1, area2] });

      // when
      const actualArea = targetProfile.getArea('area2');

      // then
      expect(actualArea).to.deep.equal(area2);
    });

    it('should return null if area not in target profile', function() {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ areas: [] });

      // when
      const actualArea = targetProfile.getArea('area2');

      // then
      expect(actualArea).to.be.null;
    });
  });

  describe('getTubeIdOfSkill()', function() {

    const expectedTubeId = 'tubeId';
    const skillId = 'skillId';
    let targetProfile;

    beforeEach(function() {
      const skillNotInTube = domainBuilder.buildTargetedSkill({ id: 'otherSkillId', tubeId: expectedTubeId });
      const skillInTube = domainBuilder.buildTargetedSkill({ id: skillId, tubeId: 'anotherTubeId' });
      const tube1 = domainBuilder.buildTargetedTube({ id: expectedTubeId, skills: [skillInTube] });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'anotherTubeId', skills: [skillNotInTube] });
      targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [skillNotInTube, skillInTube], tubes: [tube1, tube2] });
    });

    it('should return tubeId of skill', function() {
      // when
      const tubeId = targetProfile.getTubeIdOfSkill(skillId);

      // then
      expect(tubeId).to.equal(expectedTubeId);
    });

    it('should return null when tubeId of skill is not found', function() {
      // when
      const expectedTubeId = targetProfile.getTubeIdOfSkill('@mamèreenslip');

      // then
      expect(expectedTubeId).to.be.null;
    });
  });

  describe('getCompetenceIdOfSkill()', function() {

    const expectedCompetenceId = 'compId';
    const skillId = 'skillId';
    let targetProfile;

    beforeEach(function() {
      const skillNotInCompetence = domainBuilder.buildTargetedSkill({ id: 'otherSkillId', tubeId: 'tube1' });
      const skillInCompetence = domainBuilder.buildTargetedSkill({ id: skillId, tubeId: 'tube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'tube1', skills: [skillNotInCompetence], competenceId: 'otherCompId' });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'tube2', skills: [skillInCompetence], competenceId: expectedCompetenceId });
      targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [skillNotInCompetence, skillInCompetence], tubes: [tube1, tube2] });
    });

    it('should return competenceId of skill', function() {
      // when
      const competenceId = targetProfile.getCompetenceIdOfSkill(skillId);

      // then
      expect(competenceId).to.equal(expectedCompetenceId);
    });

    it('should return null when competenceId of skill is not found', function() {
      // when
      const competenceId = targetProfile.getCompetenceIdOfSkill('@mamèreenslip');

      // then
      expect(competenceId).to.be.null;
    });
  });

  describe('getAreaOfCompetence()', function() {

    const competenceId = 'competenceId';
    let expectedArea;
    let targetProfile;

    beforeEach(function() {
      const competenceNotInArea = domainBuilder.buildTargetedCompetence({ id: 'otherCompetenceId', areaId: 'area1' });
      const competenceInArea = domainBuilder.buildTargetedCompetence({ id: competenceId, areaId: 'area2' });
      const area1 = domainBuilder.buildTargetedArea({ id: 'area1', competences: [competenceNotInArea] });
      expectedArea = domainBuilder.buildTargetedArea({ id: 'area2', competences: [competenceInArea] });
      targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ competences: [competenceNotInArea, competenceInArea], areas: [expectedArea, area1] });
    });

    it('should return area of competence', function() {
      // when
      const area = targetProfile.getAreaOfCompetence(competenceId);

      // then
      expect(area).to.deep.equal(expectedArea);
    });

    it('should return null when area of competence is not found', function() {
      // when
      const area = targetProfile.getAreaOfCompetence('recPépite');

      // then
      expect(area).to.be.null;
    });
  });

  describe('getKnowledgeElementsGroupedByCompetence()', function() {

    it('should return knowledge elements of targeted skill by targeted competence id', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const skill2_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill2_1', tubeId: 'recTube2' });
      const skill2_2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2_2', tubeId: 'recTube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', skills: [skill2_1, skill2_2], competenceId: 'recCompetence2' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const competence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', tubes: [tube2] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2_1, skill2_2],
        tubes: [tube1, tube2],
        competences: [competence1, competence2],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence1', skillId: 'recSkill1' });
      const knowledgeElement2_1 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence2', skillId: 'recSkill2_1' });
      const knowledgeElement2_2 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence2', skillId: 'recSkill2_2' });
      const knowledgeElements = [knowledgeElement1, knowledgeElement2_1, knowledgeElement2_2];

      // when
      const knowledgeElementsByCompetence = targetProfile.getKnowledgeElementsGroupedByCompetence(knowledgeElements);

      // then
      expect(knowledgeElementsByCompetence).to.deep.equal({
        'recCompetence1': [knowledgeElement1],
        'recCompetence2': [knowledgeElement2_1, knowledgeElement2_2],
      });
    });

    it('should categorize knowledgeElement to actual competenceId and not based on the declared one', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1],
        tubes: [tube1],
        competences: [competence1],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ competenceId: 'recOldCompetence', skillId: 'recSkill1' });
      const knowledgeElements = [knowledgeElement1];

      // when
      const knowledgeElementsByCompetence = targetProfile.getKnowledgeElementsGroupedByCompetence(knowledgeElements);

      // then
      expect(knowledgeElementsByCompetence).to.deep.equal({
        'recCompetence1': [knowledgeElement1],
      });
    });

    it('should set an empty array to a targeted competence id when no knowledge element belongs to it', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1],
        tubes: [tube1],
        competences: [competence1],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence1', skillId: 'recOtherSkill' });
      const knowledgeElements = [knowledgeElement1];

      // when
      const knowledgeElementsByCompetence = targetProfile.getKnowledgeElementsGroupedByCompetence(knowledgeElements);

      // then
      expect(knowledgeElementsByCompetence).to.deep.equal({
        'recCompetence1': [],
      });
    });

    it('should filter out non targeted knowledge element', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1],
        tubes: [tube1],
        competences: [competence1],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence1', skillId: 'recOtherSkill' });
      const knowledgeElement2 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence1', skillId: skill1.id });
      const knowledgeElements = [knowledgeElement1, knowledgeElement2];

      // when
      const knowledgeElementsByCompetence = targetProfile.getKnowledgeElementsGroupedByCompetence(knowledgeElements);

      // then
      expect(knowledgeElementsByCompetence).to.deep.equal({
        'recCompetence1': [knowledgeElement2],
      });
    });
  });

  describe('getValidatedKnowledgeElementsGroupedByTube()', function() {

    it('should return knowledge elements of targeted skill by targeted tube id', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const skill2_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill2_1', tubeId: 'recTube2' });
      const skill2_2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2_2', tubeId: 'recTube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', skills: [skill2_1, skill2_2], competenceId: 'recCompetence2' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const competence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', tubes: [tube2] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2_1, skill2_2],
        tubes: [tube1, tube2],
        competences: [competence1, competence2],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ skillId: 'recSkill1' });
      const knowledgeElement2_1 = domainBuilder.buildKnowledgeElement({ skillId: 'recSkill2_1' });
      const knowledgeElement2_2 = domainBuilder.buildKnowledgeElement({ skillId: 'recSkill2_2' });
      const knowledgeElements = [knowledgeElement1, knowledgeElement2_1, knowledgeElement2_2];

      // when
      const knowledgeElementsByTube = targetProfile.getValidatedKnowledgeElementsGroupedByTube(knowledgeElements);

      // then
      expect(knowledgeElementsByTube).to.deep.equal({
        'recTube1': [knowledgeElement1],
        'recTube2': [knowledgeElement2_1, knowledgeElement2_2],
      });
    });

    it('should set an empty array to a targeted tube id when no knowledge element belongs to it', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1],
        tubes: [tube1],
        competences: [competence1],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ skillId: 'recOtherSkill' });
      const knowledgeElements = [knowledgeElement1];

      // when
      const knowledgeElementsByTube = targetProfile.getValidatedKnowledgeElementsGroupedByTube(knowledgeElements);

      // then
      expect(knowledgeElementsByTube).to.deep.equal({
        'recTube1': [],
      });
    });

    it('should filter out non targeted knowledge element', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1],
        tubes: [tube1],
        competences: [competence1],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ skillId: 'recOtherSkill' });
      const knowledgeElement2 = domainBuilder.buildKnowledgeElement({ skillId: skill1.id });
      const knowledgeElements = [knowledgeElement1, knowledgeElement2];

      // when
      const knowledgeElementsByTube = targetProfile.getValidatedKnowledgeElementsGroupedByTube(knowledgeElements);

      // then
      expect(knowledgeElementsByTube).to.deep.equal({
        'recTube1': [knowledgeElement2],
      });
    });

    it('should filter out non validated knowledge element', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1],
        tubes: [tube1],
        competences: [competence1],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ skillId: skill1.id, status: 'not_validated' });
      const knowledgeElement2 = domainBuilder.buildKnowledgeElement({ skillId: skill1.id });
      const knowledgeElements = [knowledgeElement1, knowledgeElement2];

      // when
      const knowledgeElementsByTube = targetProfile.getValidatedKnowledgeElementsGroupedByTube(knowledgeElements);

      // then
      expect(knowledgeElementsByTube).to.deep.equal({
        'recTube1': [knowledgeElement2],
      });
    });
  });

  describe('countValidatedTargetedKnowledgeElementsByCompetence()', function() {

    it('should return validated knowledge elements count by targeted competences', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const skill2_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill2_1', tubeId: 'recTube2' });
      const skill2_2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2_2', tubeId: 'recTube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', skills: [skill2_1, skill2_2], competenceId: 'recCompetence2' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const competence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', tubes: [tube2] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2_1, skill2_2],
        tubes: [tube1, tube2],
        competences: [competence1, competence2],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence1', skillId: 'recSkill1' });
      const knowledgeElement2_1 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence2', skillId: 'recSkill2_1' });
      const knowledgeElement2_2 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence2', skillId: 'recSkill2_2' });
      const knowledgeElements = [knowledgeElement1, knowledgeElement2_1, knowledgeElement2_2];

      // when
      const validatedCountByCompetence = targetProfile.countValidatedTargetedKnowledgeElementsByCompetence(knowledgeElements);

      // then
      expect(validatedCountByCompetence).to.deep.equal({
        'recCompetence1': 1,
        'recCompetence2': 2,
      });
    });

    it('should proceed counting knowledgeElement within actual competenceId and not based on the declared one', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1],
        tubes: [tube1],
        competences: [competence1],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ competenceId: 'recOldCompetence', skillId: 'recSkill1' });
      const knowledgeElements = [knowledgeElement1];

      // when
      const knowledgeElementsByCompetence = targetProfile.countValidatedTargetedKnowledgeElementsByCompetence(knowledgeElements);

      // then
      expect(knowledgeElementsByCompetence).to.deep.equal({
        'recCompetence1': 1,
      });
    });

    it('should set 0 to a targeted competence id when no validated knowledge element belongs to it', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1],
        tubes: [tube1],
        competences: [competence1],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence1', skillId: 'recOtherSkill' });
      const knowledgeElements = [knowledgeElement1];

      // when
      const knowledgeElementsByCompetence = targetProfile.countValidatedTargetedKnowledgeElementsByCompetence(knowledgeElements);

      // then
      expect(knowledgeElementsByCompetence).to.deep.equal({
        'recCompetence1': 0,
      });
    });

    it('should filter out non targeted knowledge element from the counting', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1],
        tubes: [tube1],
        competences: [competence1],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence1', skillId: 'recOtherSkill' });
      const knowledgeElement2 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence1', skillId: skill1.id });
      const knowledgeElements = [knowledgeElement1, knowledgeElement2];

      // when
      const knowledgeElementsByCompetence = targetProfile.countValidatedTargetedKnowledgeElementsByCompetence(knowledgeElements);

      // then
      expect(knowledgeElementsByCompetence).to.deep.equal({
        'recCompetence1': 1,
      });
    });

    it('should filter out non validated knowledge element from the counting', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1], competenceId: 'recCompetence1' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1],
        tubes: [tube1],
        competences: [competence1],
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence1', skillId: skill1.id, status: 'not_validated' });
      const knowledgeElement2 = domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetence1', skillId: skill1.id });
      const knowledgeElements = [knowledgeElement1, knowledgeElement2];

      // when
      const knowledgeElementsByCompetence = targetProfile.countValidatedTargetedKnowledgeElementsByCompetence(knowledgeElements);

      // then
      expect(knowledgeElementsByCompetence).to.deep.equal({
        'recCompetence1': 1,
      });
    });
  });

  describe('get#maxSkillDifficulty', function() {

    it('should highest difficulty of target profile skills', function() {
      // given
      const mostDifficultSkill = domainBuilder.buildTargetedSkill({ id: '@rechercheNucléaire5' });
      const lessDifficultSkill = domainBuilder.buildTargetedSkill({ id: '@faireSesLacets1' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [mostDifficultSkill, lessDifficultSkill] });

      // when
      const maxDifficulty = targetProfile.maxSkillDifficulty;

      // then
      expect(maxDifficulty).to.equal(5);
    });

    it('should return null when target profile has no skills', function() {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [] });

      // when
      const maxDifficulty = targetProfile.maxSkillDifficulty;

      // then
      expect(maxDifficulty).to.be.null;
    });
  });

  describe('getSkillsCountBoundariesFromStages()', function() {

    it('should return skill count boundary for the given stage id', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill();
      const skill2 = domainBuilder.buildTargetedSkill();
      const skill3 = domainBuilder.buildTargetedSkill();
      const skill4 = domainBuilder.buildTargetedSkill();
      const skill5 = domainBuilder.buildTargetedSkill();
      const skill6 = domainBuilder.buildTargetedSkill();

      const stage1 = domainBuilder.buildStage({ id: 'stage1', threshold: 0 });
      const stage2 = domainBuilder.buildStage({ id: 'stage2', threshold: 40 });
      const stage3 = domainBuilder.buildStage({ id: 'stage3', threshold: 80 });

      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2, skill3, skill4, skill5, skill6],
        stages: [stage1, stage2, stage3],
      });

      // when
      const skillCountBoundaries = targetProfile.getSkillsCountBoundariesFromStages(['stage2']);

      // then
      expect(skillCountBoundaries).to.deep.equal([
        { from: 3, to: 4 },
      ]);
    });

    it('should return skill count boundaries for the given stage id list', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill();
      const skill2 = domainBuilder.buildTargetedSkill();
      const skill3 = domainBuilder.buildTargetedSkill();
      const skill4 = domainBuilder.buildTargetedSkill();
      const skill5 = domainBuilder.buildTargetedSkill();
      const skill6 = domainBuilder.buildTargetedSkill();

      const stage1 = domainBuilder.buildStage({ id: 'stage1', threshold: 0 });
      const stage2 = domainBuilder.buildStage({ id: 'stage2', threshold: 40 });
      const stage3 = domainBuilder.buildStage({ id: 'stage3', threshold: 80 });

      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2, skill3, skill4, skill5, skill6],
        stages: [stage1, stage2, stage3],
      });

      // when
      const skillCountBoundaries = targetProfile.getSkillsCountBoundariesFromStages(['stage1', 'stage2']);

      // then
      expect(skillCountBoundaries).to.deep.equal([
        { from: 0, to: 2 },
        { from: 3, to: 4 },
      ]);
    });

    it('should return total skills count in "to" if it’s the last stage', function() {
      // given
      const skill1 = domainBuilder.buildTargetedSkill();
      const skill2 = domainBuilder.buildTargetedSkill();
      const skill3 = domainBuilder.buildTargetedSkill();
      const skill4 = domainBuilder.buildTargetedSkill();
      const skill5 = domainBuilder.buildTargetedSkill();
      const skill6 = domainBuilder.buildTargetedSkill();

      const stage1 = domainBuilder.buildStage({ id: 'stage1', threshold: 0 });
      const stage2 = domainBuilder.buildStage({ id: 'stage2', threshold: 40 });
      const stage3 = domainBuilder.buildStage({ id: 'stage3', threshold: 80 });

      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2, skill3, skill4, skill5, skill6],
        stages: [stage1, stage2, stage3],
      });

      // when
      const skillCountBoundaries = targetProfile.getSkillsCountBoundariesFromStages(['stage3']);

      // then
      expect(skillCountBoundaries).to.deep.equal([
        { from: 5, to: 6 },
      ]);
    });

  });
});
