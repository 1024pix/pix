const { expect, factory } = require('../../../test-helper');
const SmartPlacementAnswer = require('../../../../lib/domain/models/SmartPlacementAnswer');
const SmartPlacementAssessment = require('../../../../lib/domain/models/SmartPlacementAssessment');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');
const SkillReview = require('../../../../lib/domain/models/SkillReview');

function generateSmartPlacementAssessmentWithNoKnowledgeElement() {
  const skills = factory.buildSkillCollection();
  const targetProfile = factory.buildTargetProfile({ skills });

  return factory.buildSmartPlacementAssessment({
    skills,
    answers: [],
    knowledgeElements: [],
    targetProfile,
  });
}

function generateSmartPlacementAssessmentDataWithThreeKnowledgeElements({
  knowledgeElement1Status,
  knowledgeElement2Status,
  knowledgeElement3Status,
}) {
  function answerStatusForKnowledgeElementStatus(knowledgeElementStatus) {
    return knowledgeElementStatus === SmartPlacementKnowledgeElement.StatusType.VALIDATED ?
      SmartPlacementAnswer.ResultType.OK : SmartPlacementAnswer.ResultType.KO;
  }

  const skillsFromOneTube = factory.buildSkillCollection();
  const skillsFromAnotherTube = factory.buildSkillCollection();
  const skills = skillsFromOneTube.concat(skillsFromAnotherTube);

  const [skill1, skill2] = skillsFromOneTube;
  const [, skill3] = skillsFromOneTube;

  const targetProfile = factory.buildTargetProfile({ skills });

  const answer1 = factory.buildSmartPlacementAnswer({
    result: answerStatusForKnowledgeElementStatus(knowledgeElement1Status),
  });
  const knowledgeElement1 = factory.buildSmartPlacementKnowledgeElement({
    answerId: answer1.id,
    skillId: skill1.name,
    status: knowledgeElement1Status,
  });

  const answer2 = factory.buildSmartPlacementAnswer({
    result: answerStatusForKnowledgeElementStatus(knowledgeElement2Status),
  });

  const knowledgeElement2 = factory.buildSmartPlacementKnowledgeElement({
    answerId: answer2.id,
    skillId: skill2.name,
    status: knowledgeElement2Status,
  });

  const answer3 = factory.buildSmartPlacementAnswer({
    result: answerStatusForKnowledgeElementStatus(knowledgeElement3Status),
  });
  const knowledgeElement3 = factory.buildSmartPlacementKnowledgeElement({
    answerId: answer3.id,
    skillId: skill3.name,
    status: knowledgeElement3Status,
  });

  return {
    assessment: factory.buildSmartPlacementAssessment({
      skills,
      answers: [answer1, answer2, answer3],
      knowledgeElements: [knowledgeElement1, knowledgeElement2, knowledgeElement3],
      targetProfile,
    }),
    knowledgeElement1Skill: skill1,
    knowledgeElement2Skill: skill2,
    knowledgeElement3Skill: skill3,
  };
}

describe('Unit | Domain | Models | SmartPlacementAssessment', () => {

  describe('#isCompleted', () => {

    it('should be true if state is completed', () => {
      // given
      const assessment = factory.buildSmartPlacementAssessment({
        state: SmartPlacementAssessment.State.COMPLETED,
      });

      // when
      const isCompleted = assessment.isCompleted;

      // then
      expect(isCompleted).to.be.true;
    });

    it('should be false if state not completed', () => {
      // given
      const assessment = factory.buildSmartPlacementAssessment({
        state: SmartPlacementAssessment.State.STARTED,
      });

      // when
      const isCompleted = assessment.isCompleted;

      // then
      expect(isCompleted).to.be.false;
    });
  });

  describe('#isStarted', () => {

    it('should be true if state is started', () => {
      // given
      const assessment = factory.buildSmartPlacementAssessment({
        state: SmartPlacementAssessment.State.STARTED,
      });

      // when
      const isStarted = assessment.isStarted;

      // then
      expect(isStarted).to.be.true;
    });

    it('should be false if state not started', () => {
      // given
      const assessment = factory.buildSmartPlacementAssessment({
        state: SmartPlacementAssessment.State.COMPLETED,
      });

      // when
      const isStarted = assessment.isStarted;

      // then
      expect(isStarted).to.be.false;
    });
  });

  describe('#getValidatedSkills', () => {

    it('should return no skill if no knowledge elements', () => {
      // given
      const assessment = generateSmartPlacementAssessmentWithNoKnowledgeElement();

      const expectedValidatedSkills = [];

      // when
      const validatedSkills = assessment.getValidatedSkills();

      // then
      expect(validatedSkills).to.deep.equal(expectedValidatedSkills);
    });

    it('should sum all skills validated in knowledge elements', () => {
      // given
      const { assessment, knowledgeElement1Skill, knowledgeElement2Skill } =
        generateSmartPlacementAssessmentDataWithThreeKnowledgeElements({
          knowledgeElement1Status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          knowledgeElement2Status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          knowledgeElement3Status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
        });

      const expectedValidatedSkills = [knowledgeElement1Skill, knowledgeElement2Skill];

      // when
      const validatedSkills = assessment.getValidatedSkills();

      // then
      expect(validatedSkills).to.deep.equal(expectedValidatedSkills);
    });
  });

  describe('#getFailedSkills', () => {

    it('should return no skill if no knowledge elements', () => {
      // given
      const assessment = generateSmartPlacementAssessmentWithNoKnowledgeElement();

      const expectedFailedSkills = [];

      // when
      const failedSkills = assessment.getFailedSkills();

      // then
      expect(failedSkills).to.deep.equal(expectedFailedSkills);
    });

    it('should sum all skills failed in knowledge elements', () => {
      // given
      const { assessment, knowledgeElement1Skill, knowledgeElement2Skill } =
        generateSmartPlacementAssessmentDataWithThreeKnowledgeElements({
          knowledgeElement1Status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
          knowledgeElement2Status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
          knowledgeElement3Status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
        });

      const expectedFailedSkills = [knowledgeElement1Skill, knowledgeElement2Skill];

      // when
      const failedSkills = assessment.getFailedSkills();

      // then
      expect(failedSkills).to.deep.equal(expectedFailedSkills);
    });
  });

  describe('#getUnratableSkills', () => {

    context('when the assessment is STARTED', () => {
      it('should return an empty array', () => {
        // given
        const { assessment } =
          generateSmartPlacementAssessmentDataWithThreeKnowledgeElements({
            knowledgeElement1Status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
            knowledgeElement2Status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          });

        assessment.state = SmartPlacementAssessment.State.STARTED;

        // when
        const unratableSkills = assessment.getUnratableSkills();

        // then
        expect(unratableSkills).to.deep.equal([]);
      });

    });

    context('when the assessment is COMPLETED', () => {
      it('should return a list of unratable skills', () => {
        // given
        const validatedSkill = factory.buildSkill({ name: '@good2' });
        const unratableSkill = factory.buildSkill({ name: '@ignored5' });

        const targetProfile = factory.buildTargetProfile({ skills: [validatedSkill, unratableSkill] });

        const knowledgeElementForGood2 = factory.buildSmartPlacementKnowledgeElement({
          answerId: -1,
          skillId: validatedSkill.name,
          status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
        });

        const assessment = factory.buildSmartPlacementAssessment({
          answers: [],
          knowledgeElements: [ knowledgeElementForGood2 ],
          targetProfile,
        });

        // when
        const unratableSkills = assessment.getUnratableSkills();

        // then
        expect(unratableSkills).to.deep.equal([
          unratableSkill,
        ]);
      });
    });
  });

  describe('#generateSkillReview', () => {

    it('should return a skill review with the right skills', () => {
      // given
      const { assessment } =
        generateSmartPlacementAssessmentDataWithThreeKnowledgeElements({
          knowledgeElement1Status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
          knowledgeElement2Status: SmartPlacementKnowledgeElement.StatusType.UNRATABLE,
          knowledgeElement3Status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
        });

      // when
      const skillReview = assessment.generateSkillReview();

      // then
      expect(skillReview).to.be.an.instanceof(SkillReview);
      expect(skillReview.id).to.be.equal(`skill-review-${assessment.id}`);
      expect(skillReview.targetedSkills).to.be.deep.equal(assessment.targetProfile.skills);
      expect(skillReview.validatedSkills).to.be.deep.equal(assessment.getValidatedSkills());
      expect(skillReview.failedSkills).to.be.deep.equal(assessment.getFailedSkills());
      expect(skillReview.unratableSkills).to.be.deep.equal(assessment.getUnratableSkills());
    });
  });
});
