const { expect, sinon, domainBuilder } = require('../../../test-helper');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const moment = require('moment');

describe('Unit | Domain | Models | KnowledgeElement', function() {

  describe('#isValidated', function() {

    it('should be true if status validated', function() {
      // given
      const knowledgeElement = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
      });

      // when
      const isValidated = knowledgeElement.isValidated;

      // then
      expect(isValidated).to.be.true;
    });

    it('should be false if status not validated', function() {
      // given
      const knowledgeElement = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
      });

      // when
      const isValidated = knowledgeElement.isValidated;

      // then
      expect(isValidated).to.be.false;
    });
  });

  describe('#isDirectlyValidated', function() {

    [
      {
        status: KnowledgeElement.StatusType.VALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        expected: true,
      },
      {
        status: KnowledgeElement.StatusType.INVALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        expected: false,
      },
      {
        status: KnowledgeElement.StatusType.VALIDATED,
        source: KnowledgeElement.SourceType.INFERRED,
        expected: false,
      },
      {
        status: KnowledgeElement.StatusType.INVALIDATED,
        source: KnowledgeElement.SourceType.INFERRED,
        expected: false,
      },
    ].forEach(({ status, source, expected }) => {
      it(`should be ${expected} with ${status} status and ${source} source`, function() {
        // given
        const knowledgeElement = domainBuilder.buildKnowledgeElement({ status, source });

        // when
        const result = knowledgeElement.isDirectlyValidated();

        // then
        expect(result).to.equal(expected);
      });
    });

  });

  describe('#isInValidated', function() {

    it('should be true if status invalidated', function() {
      // given
      const knowledgeElement = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
      });

      // when
      const isInvalidated = knowledgeElement.isInvalidated;

      // then
      expect(isInvalidated).to.be.true;
    });

    it('should be false if status not invalidated', function() {
      // given
      const knowledgeElement = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
      });

      // when
      const isInvalidated = knowledgeElement.isInvalidated;

      // then
      expect(isInvalidated).to.be.false;
    });
  });

  describe('#createKnowledgeElementsForAnswer', function() {

    const userId = 3;

    context('when the challenge has one skill', function() {

      let challenge;
      let easierSkill;
      let harderSkill;
      let muchEasierSkill;
      let muchHarderSkill;
      let skill;
      let invalidAnswer;
      let validAnswer;

      beforeEach(function() {
        // given
        [muchEasierSkill, easierSkill, skill, harderSkill, muchHarderSkill] = domainBuilder.buildSkillCollection({
          minLevel: 1,
          maxLevel: 5,
        });
        challenge = domainBuilder.buildChallenge({ skills: [skill] });
        validAnswer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });
        invalidAnswer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.KO });
      });

      context('and the skill is not in the target profile', function() {

        let otherSkill;
        let createdKnowledgeElements;

        beforeEach(function() {
          // given
          otherSkill = domainBuilder.buildSkill();

          // when
          createdKnowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
            answer: validAnswer,
            challenge: challenge,
            previouslyValidatedSkills: [],
            previouslyFailedSkills: [],
            targetSkills: [otherSkill],
            userId,
          });
        });

        it('should not create any knowledge elements', function() {
          // then
          expect(createdKnowledgeElements).to.deep.equal([]);
        });
      });

      context('and the skill is in the target profil and is alone in it’s tube', function() {

        let createdKnowledgeElements;
        let targetSkills;

        beforeEach(function() {
          // given
          targetSkills = [skill];

          // when
          createdKnowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
            answer: validAnswer,
            challenge: challenge,
            previouslyValidatedSkills: [],
            previouslyFailedSkills: [],
            targetSkills,
            userId,
          });
        });

        it('should create a knowledge element', function() {
          // then
          const directKnowledgeElement = domainBuilder.buildKnowledgeElement({
            source: KnowledgeElement.SourceType.DIRECT,
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: skill.pixValue,
            answerId: validAnswer.id,
            assessmentId: validAnswer.assessmentId,
            skillId: skill.id,
            userId: 3,
            competenceId: skill.competenceId,
          });
          directKnowledgeElement.id = undefined;

          expect(createdKnowledgeElements).to.deep.equal([directKnowledgeElement]);
        });
      });

      context('and the skill is in the target profil and has other skills in it’s tube', function() {

        let targetSkills;

        beforeEach(function() {
          // given
          targetSkills = [muchEasierSkill, easierSkill, skill, harderSkill, muchHarderSkill];
        });

        context('and the answer is correct', function() {

          let createdKnowledgeElements;

          beforeEach(function() {
            // when
            createdKnowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
              answer: validAnswer,
              challenge: challenge,
              previouslyValidatedSkills: [],
              previouslyFailedSkills: [],
              targetSkills,
              createdAt: undefined,
              userId,
            });
          });

          it('should create one direct knowledge element and two inferred validated for easier skills', function() {
            // then
            const directKnowledgeElement = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.DIRECT,
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: skill.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: skill.id,
              createdAt: undefined,
              userId,
              competenceId: skill.competenceId,
            });
            directKnowledgeElement.id = undefined;
            const inferredKnowledgeElementForEasierSkill = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: easierSkill.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: easierSkill.id,
              createdAt: undefined,
              userId,
              competenceId: easierSkill.competenceId,
            });
            inferredKnowledgeElementForEasierSkill.id = undefined;
            const inferredKnowledgeElementForMuchEasierSkill = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: muchEasierSkill.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: muchEasierSkill.id,
              createdAt: undefined,
              userId,
              competenceId: muchEasierSkill.competenceId,
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

        context('and the answer is incorrect', function() {

          let createdKnowledgeElements;

          beforeEach(function() {
            // when
            createdKnowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
              answer: invalidAnswer,
              challenge: challenge,
              previouslyValidatedSkills: [],
              previouslyFailedSkills: [],
              targetSkills,
              createdAt: undefined,
              userId,
            });
          });

          it('should create one direct knowledge element and two inferred invalidated for harder skills', function() {
            // then
            const directKnowledgeElement = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.DIRECT,
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: skill.id,
              userId,
              competenceId: skill.competenceId,
            });
            directKnowledgeElement.id = undefined;
            const inferredKnowledgeElementForHarderSkill = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: harderSkill.id,
              userId,
              competenceId: harderSkill.competenceId,
            });
            inferredKnowledgeElementForHarderSkill.id = undefined;
            const inferredKnowledgeElementForMuchHarderSkill = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: muchHarderSkill.id,
              userId,
              competenceId: muchHarderSkill.competenceId,
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

    context('when the challenge has multiple skills', function() {

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

      beforeEach(function() {
        // given
        [muchEasierSkillFromTube1,
          easierSkillFromTube1,
          skillFromTube1,
          harderSkillFromTube1,
          muchHarderSkillFromTube1,
        ] = domainBuilder.buildSkillCollection({
          minLevel: 1,
          maxLevel: 5,
        });
        [muchEasierSkillFromTube2,
          easierSkillFromTube2,
          skillFromTube2,
          harderSkillFromTube2,
          muchHarderSkillFromTube2,
        ] = domainBuilder.buildSkillCollection({
          minLevel: 1,
          maxLevel: 5,
        });
        [muchEasierSkillFromTube3,
          easierSkillFromTube3,
          skillFromTube3,
          harderSkillFromTube3,
          muchHarderSkillFromTube3,
        ] = domainBuilder.buildSkillCollection({
          minLevel: 1,
          maxLevel: 5,
        });

        challenge = domainBuilder.buildChallenge({ skills: [skillFromTube1, skillFromTube2, skillFromTube3] });
        validAnswer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });
        invalidAnswer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.KO });
      });

      context('and the skills are alone in their tube but one of those skill is not in the target profile', function() {

        let createdKnowledgeElements;

        beforeEach(function() {
          // when
          createdKnowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
            answer: validAnswer,
            challenge: challenge,
            previouslyValidatedSkills: [],
            previouslyFailedSkills: [],
            targetSkills: [skillFromTube1, skillFromTube3],
            userId,
          });
        });

        it('should create knowledge elements for the other skills that are in the target profile', function() {
          // then
          const directKnowledgeElementFromTube1 = domainBuilder.buildKnowledgeElement({
            source: KnowledgeElement.SourceType.DIRECT,
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: skillFromTube1.pixValue,
            answerId: validAnswer.id,
            assessmentId: validAnswer.assessmentId,
            skillId: skillFromTube1.id,
            userId,
            competenceId: skillFromTube1.competenceId,
          });
          directKnowledgeElementFromTube1.id = undefined;
          const directKnowledgeElementFromTube3 = domainBuilder.buildKnowledgeElement({
            source: KnowledgeElement.SourceType.DIRECT,
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: skillFromTube3.pixValue,
            answerId: validAnswer.id,
            assessmentId: validAnswer.assessmentId,
            skillId: skillFromTube3.id,
            userId,
            competenceId: skillFromTube3.competenceId,
          });
          directKnowledgeElementFromTube3.id = undefined;
          const expectedKnowledgeElements = [directKnowledgeElementFromTube1, directKnowledgeElementFromTube3];

          expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
        });
      });

      context('and the skills has other skills in their tube', function() {

        let targetSkills;

        beforeEach(function() {
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

        context('and the answer is correct', function() {

          let createdKnowledgeElements;

          beforeEach(function() {
            // when
            createdKnowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
              answer: validAnswer,
              challenge: challenge,
              previouslyValidatedSkills: [],
              previouslyFailedSkills: [],
              targetSkills,
              userId,
            });
          });

          it('should create the three direct knowledge elements' +
            ' and the six inferred validated for easier skills', function() {
            const directKnowledgeElementFromTube1 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.DIRECT,
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: skillFromTube1.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: skillFromTube1.id,
              userId,
              competenceId: skillFromTube1.competenceId,
            });
            directKnowledgeElementFromTube1.id = undefined;
            const inferredKnowledgeElementForEasierSkillFromTube1 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: easierSkillFromTube1.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: easierSkillFromTube1.id,
              userId,
              competenceId: easierSkillFromTube1.competenceId,
            });
            inferredKnowledgeElementForEasierSkillFromTube1.id = undefined;
            const inferredKnowledgeElementForMuchEasierSkillFromTube1 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: muchEasierSkillFromTube1.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: muchEasierSkillFromTube1.id,
              userId,
              competenceId: muchEasierSkillFromTube1.competenceId,
            });
            inferredKnowledgeElementForMuchEasierSkillFromTube1.id = undefined;

            const directKnowledgeElementFromTube2 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.DIRECT,
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: skillFromTube2.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: skillFromTube2.id,
              userId,
              competenceId: skillFromTube2.competenceId,
            });
            directKnowledgeElementFromTube2.id = undefined;
            const inferredKnowledgeElementForEasierSkillFromTube2 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: easierSkillFromTube2.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: easierSkillFromTube2.id,
              userId,
              competenceId: easierSkillFromTube2.competenceId,
            });
            inferredKnowledgeElementForEasierSkillFromTube2.id = undefined;
            const inferredKnowledgeElementForMuchEasierSkillFromTube2 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: muchEasierSkillFromTube2.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: muchEasierSkillFromTube2.id,
              userId,
              competenceId: muchEasierSkillFromTube2.competenceId,
            });
            inferredKnowledgeElementForMuchEasierSkillFromTube2.id = undefined;

            const directKnowledgeElementFromTube3 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.DIRECT,
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: skillFromTube3.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: skillFromTube3.id,
              userId,
              competenceId: skillFromTube3.competenceId,
            });
            directKnowledgeElementFromTube3.id = undefined;
            const inferredKnowledgeElementForEasierSkillFromTube3 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: easierSkillFromTube3.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: easierSkillFromTube3.id,
              userId,
              competenceId: easierSkillFromTube3.competenceId,
            });
            inferredKnowledgeElementForEasierSkillFromTube3.id = undefined;
            const inferredKnowledgeElementForMuchEasierSkillFromTube3 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: muchEasierSkillFromTube3.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: muchEasierSkillFromTube3.id,
              userId,
              competenceId: muchEasierSkillFromTube3.competenceId,
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

        context('and the answer is incorrect', function() {

          let createdKnowledgeElements;

          beforeEach(function() {
            // when
            createdKnowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
              answer: invalidAnswer,
              challenge: challenge,
              previouslyValidatedSkills: [],
              previouslyFailedSkills: [],
              targetSkills,
              userId,
            });
          });

          it('should create the three direct knowledge elements' +
            ' and the six inferred validated for harder skills', function() {
            const directKnowledgeElementFromTube1 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.DIRECT,
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: skillFromTube1.id,
              userId,
              competenceId: skillFromTube1.competenceId,
            });
            directKnowledgeElementFromTube1.id = undefined;
            const inferredKnowledgeElementForHarderSkillFromTube1 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: harderSkillFromTube1.id,
              userId,
              competenceId: harderSkillFromTube1.competenceId,
            });
            inferredKnowledgeElementForHarderSkillFromTube1.id = undefined;
            const inferredKnowledgeElementForMuchHarderSkillFromTube1 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: muchHarderSkillFromTube1.id,
              userId,
              competenceId: muchHarderSkillFromTube1.competenceId,
            });
            inferredKnowledgeElementForMuchHarderSkillFromTube1.id = undefined;

            const directKnowledgeElementFromTube2 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.DIRECT,
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: skillFromTube2.id,
              userId,
              competenceId: skillFromTube2.competenceId,
            });
            directKnowledgeElementFromTube2.id = undefined;
            const inferredKnowledgeElementForHarderSkillFromTube2 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: harderSkillFromTube2.id,
              userId,
              competenceId: harderSkillFromTube2.competenceId,
            });
            inferredKnowledgeElementForHarderSkillFromTube2.id = undefined;
            const inferredKnowledgeElementForMuchHarderSkillFromTube2 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: muchHarderSkillFromTube2.id,
              userId,
              competenceId: muchHarderSkillFromTube2.competenceId,
            });
            inferredKnowledgeElementForMuchHarderSkillFromTube2.id = undefined;

            const directKnowledgeElementFromTube3 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.DIRECT,
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: skillFromTube3.id,
              userId,
              competenceId: skillFromTube3.competenceId,
            });
            directKnowledgeElementFromTube3.id = undefined;
            const inferredKnowledgeElementForHarderSkillFromTube3 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: harderSkillFromTube3.id,
              userId,
              competenceId: harderSkillFromTube3.competenceId,
            });
            inferredKnowledgeElementForHarderSkillFromTube3.id = undefined;
            const inferredKnowledgeElementForMuchHarderSkillFromTube3 = domainBuilder.buildKnowledgeElement({
              source: KnowledgeElement.SourceType.INFERRED,
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: muchHarderSkillFromTube3.id,
              userId,
              competenceId: muchHarderSkillFromTube3.competenceId,
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

    context('when some skills are already assessed', function() {

      context('and the challenge has multiple skills', function() {

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

        beforeEach(function() {
          // given
          [muchEasierSkillFromTube1,
            easierSkillFromTube1,
            skillFromTube1,
            harderSkillFromTube1,
            muchHarderSkillFromTube1,
          ] = domainBuilder.buildSkillCollection({
            minLevel: 1,
            maxLevel: 5,
          });
          [muchEasierSkillFromTube2,
            easierSkillFromTube2,
            skillFromTube2,
            harderSkillFromTube2,
            muchHarderSkillFromTube2,
          ] = domainBuilder.buildSkillCollection({
            minLevel: 1,
            maxLevel: 5,
          });
          [muchEasierSkillFromTube3,
            easierSkillFromTube3,
            skillFromTube3,
            harderSkillFromTube3,
            muchHarderSkillFromTube3,
          ] = domainBuilder.buildSkillCollection({
            minLevel: 1,
            maxLevel: 5,
          });

          challenge = domainBuilder.buildChallenge({ skills: [skillFromTube1, skillFromTube2, skillFromTube3] });
          validAnswer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });
        });

        context('and the skills has other skills in their tube', function() {

          let targetSkills;

          beforeEach(function() {
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

          context('and the answer is correct', function() {

            let createdKnowledgeElements;

            beforeEach(function() {
              // when
              createdKnowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
                answer: validAnswer,
                challenge: challenge,
                previouslyValidatedSkills: [easierSkillFromTube1, muchEasierSkillFromTube1],
                previouslyFailedSkills: [easierSkillFromTube2],
                targetSkills,
                userId,
              });
            });

            it('should create the three direct knowledge elements' +
              ' and the three inferred validated for easier skills than are not evaluated', function() {
              const directKnowledgeElementFromTube1 = domainBuilder.buildKnowledgeElement({
                source: KnowledgeElement.SourceType.DIRECT,
                status: KnowledgeElement.StatusType.VALIDATED,
                earnedPix: skillFromTube1.pixValue,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: skillFromTube1.id,
                userId,
                competenceId: skillFromTube1.competenceId,
              });
              directKnowledgeElementFromTube1.id = undefined;

              const directKnowledgeElementFromTube2 = domainBuilder.buildKnowledgeElement({
                source: KnowledgeElement.SourceType.DIRECT,
                status: KnowledgeElement.StatusType.VALIDATED,
                earnedPix: skillFromTube2.pixValue,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: skillFromTube2.id,
                userId,
                competenceId: skillFromTube2.competenceId,
              });
              directKnowledgeElementFromTube2.id = undefined;
              const inferredKnowledgeElementForMuchEasierSkillFromTube2 = domainBuilder.buildKnowledgeElement({
                source: KnowledgeElement.SourceType.INFERRED,
                status: KnowledgeElement.StatusType.VALIDATED,
                earnedPix: muchEasierSkillFromTube2.pixValue,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: muchEasierSkillFromTube2.id,
                userId,
                competenceId: muchEasierSkillFromTube2.competenceId,
              });
              inferredKnowledgeElementForMuchEasierSkillFromTube2.id = undefined;

              const directKnowledgeElementFromTube3 = domainBuilder.buildKnowledgeElement({
                source: KnowledgeElement.SourceType.DIRECT,
                status: KnowledgeElement.StatusType.VALIDATED,
                earnedPix: skillFromTube3.pixValue,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: skillFromTube3.id,
                userId,
                competenceId: skillFromTube3.competenceId,
              });
              directKnowledgeElementFromTube3.id = undefined;
              const inferredKnowledgeElementForEasierSkillFromTube3 = domainBuilder.buildKnowledgeElement({
                source: KnowledgeElement.SourceType.INFERRED,
                status: KnowledgeElement.StatusType.VALIDATED,
                earnedPix: easierSkillFromTube3.pixValue,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: easierSkillFromTube3.id,
                userId,
                competenceId: easierSkillFromTube3.competenceId,
              });
              inferredKnowledgeElementForEasierSkillFromTube3.id = undefined;
              const inferredKnowledgeElementForMuchEasierSkillFromTube3 = domainBuilder.buildKnowledgeElement({
                source: KnowledgeElement.SourceType.INFERRED,
                status: KnowledgeElement.StatusType.VALIDATED,
                earnedPix: muchEasierSkillFromTube3.pixValue,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: muchEasierSkillFromTube3.id,
                userId,
                competenceId: muchEasierSkillFromTube3.competenceId,

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

  describe('#computeDaysSinceLastKnowledgeElement', function() {

    let testCurrentDate;
    let knowledgeElements;
    let daysSinceLastKnowledgeElement;

    beforeEach(function() {
      testCurrentDate = new Date('2018-01-10T05:00:00Z');
      sinon.useFakeTimers(testCurrentDate.getTime());
    });

    [
      { daysBefore: 0, hoursBefore: 2, expectedDaysSinceLastKnowledgeElement: 0.0833 },
      { daysBefore: 1, hoursBefore: 0, expectedDaysSinceLastKnowledgeElement: 1 },
      { daysBefore: 5, hoursBefore: 0, expectedDaysSinceLastKnowledgeElement: 5 },
      { daysBefore: 5, hoursBefore: 12, expectedDaysSinceLastKnowledgeElement: 5.5 },
      { daysBefore: 6, hoursBefore: 0, expectedDaysSinceLastKnowledgeElement: 6 },
      { daysBefore: 6, hoursBefore: 11, expectedDaysSinceLastKnowledgeElement: 6.4583 },
      { daysBefore: 6, hoursBefore: 12, expectedDaysSinceLastKnowledgeElement: 6.5 },
      { daysBefore: 6, hoursBefore: 13, expectedDaysSinceLastKnowledgeElement: 6.5416 },
      { daysBefore: 7, hoursBefore: 0, expectedDaysSinceLastKnowledgeElement: 7 },
      { daysBefore: 10, hoursBefore: 0, expectedDaysSinceLastKnowledgeElement: 10 },
    ].forEach(({ daysBefore, hoursBefore, expectedDaysSinceLastKnowledgeElement }) => {
      it(`should return ${expectedDaysSinceLastKnowledgeElement} days when the last knowledge element is ${daysBefore} days and ${hoursBefore} hours old`, function() {
        const knowledgeElementCreationDate = moment(testCurrentDate).subtract(daysBefore, 'day').subtract(hoursBefore, 'hour').toDate();
        const oldDate = moment(testCurrentDate).subtract(100, 'day').toDate();

        knowledgeElements = [{ createdAt: oldDate }, { createdAt: knowledgeElementCreationDate }];

        // when
        daysSinceLastKnowledgeElement = KnowledgeElement.computeDaysSinceLastKnowledgeElement(knowledgeElements);

        // then
        expect(daysSinceLastKnowledgeElement).to.be.closeTo(expectedDaysSinceLastKnowledgeElement, 0.0001);
      });
    });
  });
});
