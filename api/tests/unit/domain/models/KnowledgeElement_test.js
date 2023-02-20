import { expect, sinon, domainBuilder } from '../../../test-helper';
import AnswerStatus from '../../../../lib/domain/models/AnswerStatus';
import KnowledgeElement from '../../../../lib/domain/models/KnowledgeElement';
import dayjs from 'dayjs';

describe('Unit | Domain | Models | KnowledgeElement', function () {
  describe('#isValidated', function () {
    it('should be true if status validated', function () {
      // given
      const knowledgeElement = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
      });

      // when
      const isValidated = knowledgeElement.isValidated;

      // then
      expect(isValidated).to.be.true;
    });

    it('should be false if status not validated', function () {
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

  describe('#isDirectlyValidated', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        status: KnowledgeElement.StatusType.VALIDATED,
        // eslint-disable-next-line mocha/no-setup-in-describe
        source: KnowledgeElement.SourceType.DIRECT,
        expected: true,
      },
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        status: KnowledgeElement.StatusType.INVALIDATED,
        // eslint-disable-next-line mocha/no-setup-in-describe
        source: KnowledgeElement.SourceType.DIRECT,
        expected: false,
      },
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        status: KnowledgeElement.StatusType.VALIDATED,
        // eslint-disable-next-line mocha/no-setup-in-describe
        source: KnowledgeElement.SourceType.INFERRED,
        expected: false,
      },
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        status: KnowledgeElement.StatusType.INVALIDATED,
        // eslint-disable-next-line mocha/no-setup-in-describe
        source: KnowledgeElement.SourceType.INFERRED,
        expected: false,
      },
    ].forEach(({ status, source, expected }) => {
      it(`should be ${expected} with ${status} status and ${source} source`, function () {
        // given
        const knowledgeElement = domainBuilder.buildKnowledgeElement({ status, source });

        // when
        const result = knowledgeElement.isDirectlyValidated();

        // then
        expect(result).to.equal(expected);
      });
    });
  });

  describe('#isInValidated', function () {
    it('should be true if status invalidated', function () {
      // given
      const knowledgeElement = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
      });

      // when
      const isInvalidated = knowledgeElement.isInvalidated;

      // then
      expect(isInvalidated).to.be.true;
    });

    it('should be false if status not invalidated', function () {
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

  describe('#createKnowledgeElementsForAnswer', function () {
    const userId = 3;

    let challenge;
    let easierSkill;
    let harderSkill;
    let muchEasierSkill;
    let muchHarderSkill;
    let skill;
    let invalidAnswer;
    let validAnswer;

    beforeEach(function () {
      // given
      [muchEasierSkill, easierSkill, skill, harderSkill, muchHarderSkill] = domainBuilder.buildSkillCollection({
        minLevel: 1,
        maxLevel: 5,
      });
      challenge = domainBuilder.buildChallenge({ skill });
      validAnswer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });
      invalidAnswer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.KO });
    });

    context('and the skill is not in the target profile', function () {
      let otherSkill;
      let createdKnowledgeElements;

      beforeEach(function () {
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

      it('should not create any knowledge elements', function () {
        // then
        expect(createdKnowledgeElements).to.deep.equal([]);
      });
    });

    context('and the skill is in the target profile and is alone in it’s tube', function () {
      let createdKnowledgeElements;
      let targetSkills;

      beforeEach(function () {
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

      it('should create a knowledge element', function () {
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

    context('and the skill is in the target profil and has other skills in it’s tube', function () {
      let targetSkills;

      beforeEach(function () {
        // given
        targetSkills = [muchEasierSkill, easierSkill, skill, harderSkill, muchHarderSkill];
      });

      context('and the answer is correct', function () {
        let createdKnowledgeElements;

        beforeEach(function () {
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

        it('should create one direct knowledge element and two inferred validated for easier skills', function () {
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

      context('and the answer is incorrect', function () {
        let createdKnowledgeElements;

        beforeEach(function () {
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

        it('should create one direct knowledge element and two inferred invalidated for harder skills', function () {
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

  describe('#computeDaysSinceLastKnowledgeElement', function () {
    let testCurrentDate;
    let knowledgeElements;
    let daysSinceLastKnowledgeElement;

    beforeEach(function () {
      testCurrentDate = new Date('2018-01-10T05:00:00Z');
      sinon.useFakeTimers(testCurrentDate.getTime());
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
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
      it(`should return ${expectedDaysSinceLastKnowledgeElement} days when the last knowledge element is ${daysBefore} days and ${hoursBefore} hours old`, function () {
        const knowledgeElementCreationDate = dayjs(testCurrentDate)
          .subtract(daysBefore, 'day')
          .subtract(hoursBefore, 'hour')
          .toDate();
        const oldDate = dayjs(testCurrentDate).subtract(100, 'day').toDate();

        knowledgeElements = [{ createdAt: oldDate }, { createdAt: knowledgeElementCreationDate }];

        // when
        daysSinceLastKnowledgeElement = KnowledgeElement.computeDaysSinceLastKnowledgeElement(knowledgeElements);

        // then
        expect(daysSinceLastKnowledgeElement).to.be.closeTo(expectedDaysSinceLastKnowledgeElement, 0.0001);
      });
    });
  });
});
