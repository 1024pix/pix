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

    context('when the challenge has one skill', () => {

      let challenge;
      let easierSkill;
      let harderSkill;
      let muchEasierSkill;
      let muchHarderSkill;
      let skill;
      let invalidAnswer;
      let validAnswer;

      beforeEach(() => {
        // given
        [muchEasierSkill, easierSkill, skill, harderSkill, muchHarderSkill] = factory.buildSkillCollection({
          minLevel: 1,
          maxLevel: 5,
        });
        challenge = factory.buildChallenge({ skills: [skill] });
        validAnswer = factory.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });
        invalidAnswer = factory.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.KO });
      });

      context('and the skill is not in the target profile', () => {

        let otherSkill;
        let createdKnowledgeElements;

        beforeEach(() => {
          // given
          otherSkill = factory.buildSkill();

          // when
          createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
            answer: validAnswer,
            associatedChallenge: challenge,
            previouslyValidatedSkills: [],
            previouslyFailedSkills: [],
            targetSkills: [otherSkill],
          });
        });

        it('should not create any knowledge elements', () => {
          // then
          expect(createdKnowledgeElements).to.deep.equal([]);
        });
      });

      context('and the skill is in the target profil and is alone in it’s tube', () => {

        let createdKnowledgeElements;
        let targetSkills;

        beforeEach(() => {
          // given
          targetSkills = [skill];

          // when
          createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
            answer: validAnswer,
            associatedChallenge: challenge,
            previouslyValidatedSkills: [],
            previouslyFailedSkills: [],
            targetSkills,
          });
        });

        it('should create a knowledge element', () => {
          // then
          const directKnowledgeElement = factory.buildSmartPlacementKnowledgeElement({
            source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            pixScore: 0,
            answerId: validAnswer.id,
            assessmentId: validAnswer.assessmentId,
            skillId: skill.name,
          });
          directKnowledgeElement.id = undefined;

          expect(createdKnowledgeElements).to.deep.equal([directKnowledgeElement]);
        });
      });

      context('and the skill is in the target profil and has other skills in it’s tube', () => {

        let targetSkills;

        beforeEach(() => {
          // given
          targetSkills = [muchEasierSkill, easierSkill, skill, harderSkill, muchHarderSkill];
        });

        context('and the answer is correct', () => {

          let createdKnowledgeElements;

          beforeEach(() => {
            // when
            createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
              answer: validAnswer,
              associatedChallenge: challenge,
              previouslyValidatedSkills: [],
              previouslyFailedSkills: [],
              targetSkills,
            });
          });

          it('should create one direct knowledge element and two inferred validated for easier skills', () => {
            // then
            const directKnowledgeElement = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              pixScore: 0,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: skill.name,
            });
            directKnowledgeElement.id = undefined;
            const inferredKnowledgeElementForEasierSkill = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              pixScore: 0,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: easierSkill.name,
            });
            inferredKnowledgeElementForEasierSkill.id = undefined;
            const inferredKnowledgeElementForMuchEasierSkill = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              pixScore: 0,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: muchEasierSkill.name,
            });
            inferredKnowledgeElementForMuchEasierSkill.id = undefined;
            const expectedKnowledgeElements = [
              directKnowledgeElement,
              inferredKnowledgeElementForMuchEasierSkill,
              inferredKnowledgeElementForEasierSkill,
            ];

            expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
          });
        });

        context('and the answer is incorrect', () => {

          let createdKnowledgeElements;

          beforeEach(() => {
            // when
            createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
              answer: invalidAnswer,
              associatedChallenge: challenge,
              previouslyValidatedSkills: [],
              previouslyFailedSkills: [],
              targetSkills,
            });
          });

          it('should create one direct knowledge element and two inferred invalidated for harder skills', () => {
            // then
            const directKnowledgeElement = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              pixScore: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: skill.name,
            });
            directKnowledgeElement.id = undefined;
            const inferredKnowledgeElementForHarderSkill = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              pixScore: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: harderSkill.name,
            });
            inferredKnowledgeElementForHarderSkill.id = undefined;
            const inferredKnowledgeElementForMuchHarderSkill = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              pixScore: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: muchHarderSkill.name,
            });
            inferredKnowledgeElementForMuchHarderSkill.id = undefined;
            const expectedKnowledgeElements = [
              directKnowledgeElement,
              inferredKnowledgeElementForHarderSkill,
              inferredKnowledgeElementForMuchHarderSkill,
            ];

            expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
          });
        });
      });
    });

    context('when the challenge has multiple skills', () => {

      let challenge;
      let easierSkillFromTube1;
      let easierSkillFromTube2;
      let easierSkillFromTube3;
      let harderSkillFromTube1;
      let harderSkillFromTube2;
      let harderSkillFromTube3;
      let muchEasierSkillFromTube1;
      let muchEasierSkillFromTube2;
      let muchEasierSkillFromTube3;
      let muchHarderSkillFromTube1;
      let muchHarderSkillFromTube2;
      let muchHarderSkillFromTube3;
      let skillFromTube1;
      let skillFromTube2;
      let skillFromTube3;
      let invalidAnswer;
      let validAnswer;

      beforeEach(() => {
        // given
        [muchEasierSkillFromTube1,
          easierSkillFromTube1,
          skillFromTube1,
          harderSkillFromTube1,
          muchHarderSkillFromTube1,
        ] = factory.buildSkillCollection({
          minLevel: 1,
          maxLevel: 5,
        });
        [muchEasierSkillFromTube2,
          easierSkillFromTube2,
          skillFromTube2,
          harderSkillFromTube2,
          muchHarderSkillFromTube2,
        ] = factory.buildSkillCollection({
          minLevel: 1,
          maxLevel: 5,
        });
        [muchEasierSkillFromTube3,
          easierSkillFromTube3,
          skillFromTube3,
          harderSkillFromTube3,
          muchHarderSkillFromTube3,
        ] = factory.buildSkillCollection({
          minLevel: 1,
          maxLevel: 5,
        });

        challenge = factory.buildChallenge({ skills: [skillFromTube1, skillFromTube2, skillFromTube3] });
        validAnswer = factory.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });
        invalidAnswer = factory.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.KO });
      });

      context('and the skills are alone in their tube but one of those skill is not in the target profile', () => {

        let createdKnowledgeElements;

        beforeEach(() => {
          // when
          createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
            answer: validAnswer,
            associatedChallenge: challenge,
            previouslyValidatedSkills: [],
            previouslyFailedSkills: [],
            targetSkills: [skillFromTube1, skillFromTube3],
          });
        });

        it('should create knowledge elements for the other skills that are in the target profile', () => {
          // then
          const directKnowledgeElementFromTube1 = factory.buildSmartPlacementKnowledgeElement({
            source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            pixScore: 0,
            answerId: validAnswer.id,
            assessmentId: validAnswer.assessmentId,
            skillId: skillFromTube1.name,
          });
          directKnowledgeElementFromTube1.id = undefined;
          const directKnowledgeElementFromTube3 = factory.buildSmartPlacementKnowledgeElement({
            source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            pixScore: 0,
            answerId: validAnswer.id,
            assessmentId: validAnswer.assessmentId,
            skillId: skillFromTube3.name,
          });
          directKnowledgeElementFromTube3.id = undefined;
          const expectedKnowledgeElements = [directKnowledgeElementFromTube1, directKnowledgeElementFromTube3];

          expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
        });
      });

      context('and the skills has other skills in their tube', () => {

        let targetSkills;

        beforeEach(() => {
          targetSkills = [
            easierSkillFromTube1,
            easierSkillFromTube2,
            easierSkillFromTube3,
            harderSkillFromTube1,
            harderSkillFromTube2,
            harderSkillFromTube3,
            muchEasierSkillFromTube1,
            muchEasierSkillFromTube2,
            muchEasierSkillFromTube3,
            muchHarderSkillFromTube1,
            muchHarderSkillFromTube2,
            muchHarderSkillFromTube3,
            skillFromTube1,
            skillFromTube2,
            skillFromTube3,
          ];
        });

        context('and the answer is correct', () => {

          let createdKnowledgeElements;

          beforeEach(() => {
            // when
            createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
              answer: validAnswer,
              associatedChallenge: challenge,
              previouslyValidatedSkills: [],
              previouslyFailedSkills: [],
              targetSkills,
            });
          });

          it('should create the three direct knowledge elements' +
            ' and the six inferred validated for easier skills', () => {
            const directKnowledgeElementFromTube1 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              pixScore: 0,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: skillFromTube1.name,
            });
            directKnowledgeElementFromTube1.id = undefined;
            const inferredKnowledgeElementForEasierSkillFromTube1 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              pixScore: 0,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: easierSkillFromTube1.name,
            });
            inferredKnowledgeElementForEasierSkillFromTube1.id = undefined;
            const inferredKnowledgeElementForMuchEasierSkillFromTube1 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              pixScore: 0,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: muchEasierSkillFromTube1.name,
            });
            inferredKnowledgeElementForMuchEasierSkillFromTube1.id = undefined;

            const directKnowledgeElementFromTube2 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              pixScore: 0,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: skillFromTube2.name,
            });
            directKnowledgeElementFromTube2.id = undefined;
            const inferredKnowledgeElementForEasierSkillFromTube2 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              pixScore: 0,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: easierSkillFromTube2.name,
            });
            inferredKnowledgeElementForEasierSkillFromTube2.id = undefined;
            const inferredKnowledgeElementForMuchEasierSkillFromTube2 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              pixScore: 0,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: muchEasierSkillFromTube2.name,
            });
            inferredKnowledgeElementForMuchEasierSkillFromTube2.id = undefined;

            const directKnowledgeElementFromTube3 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              pixScore: 0,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: skillFromTube3.name,
            });
            directKnowledgeElementFromTube3.id = undefined;
            const inferredKnowledgeElementForEasierSkillFromTube3 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              pixScore: 0,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: easierSkillFromTube3.name,
            });
            inferredKnowledgeElementForEasierSkillFromTube3.id = undefined;
            const inferredKnowledgeElementForMuchEasierSkillFromTube3 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              pixScore: 0,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: muchEasierSkillFromTube3.name,
            });
            inferredKnowledgeElementForMuchEasierSkillFromTube3.id = undefined;

            const expectedKnowledgeElements = [
              directKnowledgeElementFromTube1,
              directKnowledgeElementFromTube2,
              directKnowledgeElementFromTube3,
              inferredKnowledgeElementForEasierSkillFromTube1,
              inferredKnowledgeElementForMuchEasierSkillFromTube1,
              inferredKnowledgeElementForEasierSkillFromTube2,
              inferredKnowledgeElementForMuchEasierSkillFromTube2,
              inferredKnowledgeElementForEasierSkillFromTube3,
              inferredKnowledgeElementForMuchEasierSkillFromTube3,
            ];

            expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
          });
        });

        context('and the answer is incorrect', () => {

          let createdKnowledgeElements;

          beforeEach(() => {
            // when
            createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
              answer: invalidAnswer,
              associatedChallenge: challenge,
              previouslyValidatedSkills: [],
              previouslyFailedSkills: [],
              targetSkills,
            });
          });

          it('should create the three direct knowledge elements' +
            ' and the six inferred validated for harder skills', () => {
            const directKnowledgeElementFromTube1 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              pixScore: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: skillFromTube1.name,
            });
            directKnowledgeElementFromTube1.id = undefined;
            const inferredKnowledgeElementForHarderSkillFromTube1 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              pixScore: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: harderSkillFromTube1.name,
            });
            inferredKnowledgeElementForHarderSkillFromTube1.id = undefined;
            const inferredKnowledgeElementForMuchHarderSkillFromTube1 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              pixScore: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: muchHarderSkillFromTube1.name,
            });
            inferredKnowledgeElementForMuchHarderSkillFromTube1.id = undefined;

            const directKnowledgeElementFromTube2 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              pixScore: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: skillFromTube2.name,
            });
            directKnowledgeElementFromTube2.id = undefined;
            const inferredKnowledgeElementForHarderSkillFromTube2 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              pixScore: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: harderSkillFromTube2.name,
            });
            inferredKnowledgeElementForHarderSkillFromTube2.id = undefined;
            const inferredKnowledgeElementForMuchHarderSkillFromTube2 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              pixScore: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: muchHarderSkillFromTube2.name,
            });
            inferredKnowledgeElementForMuchHarderSkillFromTube2.id = undefined;

            const directKnowledgeElementFromTube3 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              pixScore: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: skillFromTube3.name,
            });
            directKnowledgeElementFromTube3.id = undefined;
            const inferredKnowledgeElementForHarderSkillFromTube3 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              pixScore: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: harderSkillFromTube3.name,
            });
            inferredKnowledgeElementForHarderSkillFromTube3.id = undefined;
            const inferredKnowledgeElementForMuchHarderSkillFromTube3 = factory.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              pixScore: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: muchHarderSkillFromTube3.name,
            });
            inferredKnowledgeElementForMuchHarderSkillFromTube3.id = undefined;

            const expectedKnowledgeElements = [
              directKnowledgeElementFromTube1,
              directKnowledgeElementFromTube2,
              directKnowledgeElementFromTube3,
              inferredKnowledgeElementForHarderSkillFromTube1,
              inferredKnowledgeElementForMuchHarderSkillFromTube1,
              inferredKnowledgeElementForHarderSkillFromTube2,
              inferredKnowledgeElementForMuchHarderSkillFromTube2,
              inferredKnowledgeElementForHarderSkillFromTube3,
              inferredKnowledgeElementForMuchHarderSkillFromTube3,
            ];

            expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
          });
        });
      });
    });

    context('when some skills are already assessed', () => {

      context('and the challenge has multiple skills', () => {

        let challenge;
        let easierSkillFromTube1;
        let easierSkillFromTube2;
        let easierSkillFromTube3;
        let harderSkillFromTube1;
        let harderSkillFromTube2;
        let harderSkillFromTube3;
        let muchEasierSkillFromTube1;
        let muchEasierSkillFromTube2;
        let muchEasierSkillFromTube3;
        let muchHarderSkillFromTube1;
        let muchHarderSkillFromTube2;
        let muchHarderSkillFromTube3;
        let skillFromTube1;
        let skillFromTube2;
        let skillFromTube3;
        let validAnswer;

        beforeEach(() => {
          // given
          [muchEasierSkillFromTube1,
            easierSkillFromTube1,
            skillFromTube1,
            harderSkillFromTube1,
            muchHarderSkillFromTube1,
          ] = factory.buildSkillCollection({
            minLevel: 1,
            maxLevel: 5,
          });
          [muchEasierSkillFromTube2,
            easierSkillFromTube2,
            skillFromTube2,
            harderSkillFromTube2,
            muchHarderSkillFromTube2,
          ] = factory.buildSkillCollection({
            minLevel: 1,
            maxLevel: 5,
          });
          [muchEasierSkillFromTube3,
            easierSkillFromTube3,
            skillFromTube3,
            harderSkillFromTube3,
            muchHarderSkillFromTube3,
          ] = factory.buildSkillCollection({
            minLevel: 1,
            maxLevel: 5,
          });

          challenge = factory.buildChallenge({ skills: [skillFromTube1, skillFromTube2, skillFromTube3] });
          validAnswer = factory.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });
        });

        context('and the skills has other skills in their tube', () => {

          let targetSkills;

          beforeEach(() => {
            targetSkills = [
              easierSkillFromTube1,
              easierSkillFromTube2,
              easierSkillFromTube3,
              harderSkillFromTube1,
              harderSkillFromTube2,
              harderSkillFromTube3,
              muchEasierSkillFromTube1,
              muchEasierSkillFromTube2,
              muchEasierSkillFromTube3,
              muchHarderSkillFromTube1,
              muchHarderSkillFromTube2,
              muchHarderSkillFromTube3,
              skillFromTube1,
              skillFromTube2,
              skillFromTube3,
            ];
          });

          context('and the answer is correct', () => {

            let createdKnowledgeElements;

            beforeEach(() => {
              // when
              createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
                answer: validAnswer,
                associatedChallenge: challenge,
                previouslyValidatedSkills: [easierSkillFromTube1, muchEasierSkillFromTube1],
                previouslyFailedSkills: [easierSkillFromTube2],
                targetSkills,
              });
            });

            it('should create the three direct knowledge elements' +
              ' and the three inferred validated for easier skills than are not evaluated', () => {
              const directKnowledgeElementFromTube1 = factory.buildSmartPlacementKnowledgeElement({
                source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
                status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
                pixScore: 0,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: skillFromTube1.name,
              });
              directKnowledgeElementFromTube1.id = undefined;

              const directKnowledgeElementFromTube2 = factory.buildSmartPlacementKnowledgeElement({
                source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
                status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
                pixScore: 0,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: skillFromTube2.name,
              });
              directKnowledgeElementFromTube2.id = undefined;
              const inferredKnowledgeElementForMuchEasierSkillFromTube2 = factory.buildSmartPlacementKnowledgeElement({
                source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
                status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
                pixScore: 0,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: muchEasierSkillFromTube2.name,
              });
              inferredKnowledgeElementForMuchEasierSkillFromTube2.id = undefined;

              const directKnowledgeElementFromTube3 = factory.buildSmartPlacementKnowledgeElement({
                source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
                status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
                pixScore: 0,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: skillFromTube3.name,
              });
              directKnowledgeElementFromTube3.id = undefined;
              const inferredKnowledgeElementForEasierSkillFromTube3 = factory.buildSmartPlacementKnowledgeElement({
                source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
                status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
                pixScore: 0,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: easierSkillFromTube3.name,
              });
              inferredKnowledgeElementForEasierSkillFromTube3.id = undefined;
              const inferredKnowledgeElementForMuchEasierSkillFromTube3 = factory.buildSmartPlacementKnowledgeElement({
                source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
                status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
                pixScore: 0,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: muchEasierSkillFromTube3.name,
              });
              inferredKnowledgeElementForMuchEasierSkillFromTube3.id = undefined;

              const expectedKnowledgeElements = [
                directKnowledgeElementFromTube1,
                directKnowledgeElementFromTube2,
                directKnowledgeElementFromTube3,
                inferredKnowledgeElementForMuchEasierSkillFromTube2,
                inferredKnowledgeElementForEasierSkillFromTube3,
                inferredKnowledgeElementForMuchEasierSkillFromTube3,
              ];

              expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
            });
          });
        });
      });
    });
  });
});
