const { expect, factory } = require('../../../test-helper');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');

describe('Unit | Domain | Models | SmartPlacementKnowledgeElement', () => {

  describe('#isValidated', () => {

    it('should be true if status validated', () => {
      // given
      const knowledgeElement = factory.buildSmartPlacementKnowledgeElement({
        status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
      });

      // when
      const isValidated = knowledgeElement.isValidated;

      // then
      expect(isValidated).to.be.true;
    });

    it('should be false if status not validated', () => {
      // given
      const knowledgeElement = factory.buildSmartPlacementKnowledgeElement({
        status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
      });

      // when
      const isValidated = knowledgeElement.isValidated;

      // then
      expect(isValidated).to.be.false;
    });
  });

  describe('#isInValidated', () => {

    it('should be true if status invalidated', () => {
      // given
      const knowledgeElement = factory.buildSmartPlacementKnowledgeElement({
        status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
      });

      // when
      const isInvalidated = knowledgeElement.isInvalidated;

      // then
      expect(isInvalidated).to.be.true;
    });

    it('should be false if status not invalidated', () => {
      // given
      const knowledgeElement = factory.buildSmartPlacementKnowledgeElement({
        status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
      });

      // when
      const isInvalidated = knowledgeElement.isInvalidated;

      // then
      expect(isInvalidated).to.be.false;
    });
  });

  describe('#createKnowledgeElementsForAnswer', () => {

    context('when challenge skill is not in target profile', () => {

      it('should return an empty array', () => {
        // given
        const skill = factory.buildSkill();
        const otherSkill = factory.buildSkill();
        const challenge = factory.buildChallenge({ skills: [skill] });
        const answer = factory.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });

        // when
        const createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
          answer,
          associatedChallenge: challenge,
          previouslyValidatedSkills: [],
          previouslyFailedSkills: [],
          targetSkills: [otherSkill],
        });

        // then
        expect(createdKnowledgeElements).to.deep.equal([]);
      });
    });

    context('when some of the challenge skills are already assessed', () => {

      it('should return knowledge elements only for the unknown skills', () => {
        // given
        const skillCollection = factory.buildSkillCollection();
        const [skill1, skill2, skill3] = skillCollection;
        const challenge = factory.buildChallenge({ skills: [skill1, skill2, skill3] });
        const answer = factory.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });

        // when
        const createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
          answer,
          associatedChallenge: challenge,
          previouslyValidatedSkills: [skill1],
          previouslyFailedSkills: [skill3],
          targetSkills: skillCollection,
        });

        // then
        const directKnowledgeElement = factory.buildSmartPlacementKnowledgeElement({
          source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
          status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          pixScore: 0,
          answerId: answer.id,
          skillId: skill2.name,
        });
        directKnowledgeElement.id = undefined;

        expect(createdKnowledgeElements).to.deep.equal([directKnowledgeElement]);
      });
    });

    context('with right answer and no previous answers', () => {

      it('should return one validated direct knowledge element and the inferred ones', () => {
        // given
        const skillCollection = factory.buildSkillCollection();
        const [skill1, skill2] = skillCollection;
        const challenge = factory.buildChallenge({ skills: [skill2] });
        const answer = factory.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });

        // when
        const createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
          answer,
          associatedChallenge: challenge,
          previouslyValidatedSkills: [],
          previouslyFailedSkills: [],
          targetSkills: skillCollection,
        });

        // then
        const directKnowledgeElement = factory.buildSmartPlacementKnowledgeElement({
          source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
          status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          pixScore: 0,
          answerId: answer.id,
          skillId: skill2.name,
        });
        directKnowledgeElement.id = undefined;
        const inferredKnowledgeElement = factory.buildSmartPlacementKnowledgeElement({
          source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
          status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          pixScore: 0,
          answerId: answer.id,
          skillId: skill1.name,
        });
        inferredKnowledgeElement.id = undefined;
        const expectedKnowledgeElements = [directKnowledgeElement, inferredKnowledgeElement];

        expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
      });
    });

    context('with wrong answer and no previous answers', () => {

      it('should return one invalidated direct knowledge element and the inferred one', () => {
        // given
        const skillCollection = factory.buildSkillCollection();
        const [, skill2, skill3] = skillCollection;
        const challenge = factory.buildChallenge({ skills: [skill2] });
        const answer = factory.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.KO });

        // when
        const createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
          answer,
          associatedChallenge: challenge,
          previouslyValidatedSkills: [],
          previouslyFailedSkills: [],
          targetSkills: skillCollection,
        });

        // then
        const directKnowledgeElement = factory.buildSmartPlacementKnowledgeElement({
          source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
          status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
          pixScore: 0,
          answerId: answer.id,
          skillId: skill2.name,
        });
        directKnowledgeElement.id = undefined;
        const inferredKnowledgeElement = factory.buildSmartPlacementKnowledgeElement({
          source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
          status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
          pixScore: 0,
          answerId: answer.id,
          skillId: skill3.name,
        });
        inferredKnowledgeElement.id = undefined;
        const expectedKnowledgeElements = [directKnowledgeElement, inferredKnowledgeElement];

        expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
      });
    });

    context('with multi skills challenge', () => {

      it('should return multiple validated direct knowledge elements', () => {
        // given
        const skill = factory.buildSkill();
        const challenge = factory.buildChallenge({ skills: [skill] });
        const answer = factory.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.KO });

        // when
        const createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
          answer,
          associatedChallenge: challenge,
          previouslyValidatedSkills: [],
          previouslyFailedSkills: [],
          targetSkills: [skill],
        });

        // then
        const expectedKnowledgeElement = factory.buildSmartPlacementKnowledgeElement({
          source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
          status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
          pixScore: 0,
          answerId: answer.id,
          skillId: skill.name,
        });
        expectedKnowledgeElement.id = undefined;

        expect(createdKnowledgeElements).to.deep.equal([expectedKnowledgeElement]);
      });
    });

    context('with previous answers', () => {

      it('should return not return inferred knowledge elements on already assessed skills', () => {
        // given
        const skillCollection = factory.buildSkillCollection();
        const [skill1, skill2, skill3] = skillCollection;
        const challenge = factory.buildChallenge({ skills: [skill1] });
        const answer = factory.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.KO });

        // when
        const createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
          answer,
          associatedChallenge: challenge,
          previouslyValidatedSkills: [],
          previouslyFailedSkills: [skill2, skill3],
          targetSkills: skillCollection,
        });

        // then
        const directKnowledgeElement = factory.buildSmartPlacementKnowledgeElement({
          source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
          status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
          pixScore: 0,
          answerId: answer.id,
          skillId: skill1.name,
        });
        directKnowledgeElement.id = undefined;
        const expectedKnowledgeElements = [directKnowledgeElement];

        expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
      });
    });
  });
});
