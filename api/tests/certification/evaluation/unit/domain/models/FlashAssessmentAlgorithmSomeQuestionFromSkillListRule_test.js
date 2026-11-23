import { expect } from 'chai';
import sinon from 'sinon';

import { FlashAssessmentAlgorithmSomeQuestionFromSkillListRule } from '../../../../../../src/certification/evaluation/domain/models/FlashAssessmentAlgorithmSomeQuestionFromSkillListRule.js';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | FlashAssessmentAlgorithm | FlashAssessmentAlgorithmSomeQuestionFromSkillListRule', function () {
  describe('#isApplicable', function () {
    describe('when the questionNumberToPickFromSkillList is null', function () {
      it('should return false', function () {
        const configuration = {
          questionNumberToPickFromSkillList: null,
        };

        expect(FlashAssessmentAlgorithmSomeQuestionFromSkillListRule.isApplicable(configuration)).to.be.false;
      });
    });

    describe('when the questionNumberToPickFromSkillList is a list', function () {
      it('should return true', function () {
        const configuration = {
          questionNumberToPickFromSkillList: [1, 4],
        };

        expect(FlashAssessmentAlgorithmSomeQuestionFromSkillListRule.isApplicable(configuration)).to.be.true;
      });
    });
  });

  describe('#execute', function () {
    describe(`when next question's index isn't included in questionNumberToPickFromSkillList`, function () {
      it('should return all available challenges without filtering', function () {
        const skillInSkillListId = 'skillInSkillList';
        const skillNotInSkillListId = 'skillNotInSkillList';
        const skillInSkillList = domainBuilder.buildSkill({ id: skillInSkillListId });

        const skillNotInSkillList = domainBuilder.buildSkill({ id: skillNotInSkillListId });

        const challengeInSkillList1 = domainBuilder.buildChallenge({
          skill: skillInSkillList,
          id: 'rec1',
        });

        const challengeInSkillList2 = domainBuilder.buildChallenge({
          skill: skillInSkillList,
          id: 'rec2',
        });

        const challengeNotInSkillList1 = domainBuilder.buildChallenge({
          skill: skillNotInSkillList,
          id: 'rec3',
        });

        const challengeNotInSkillList2 = domainBuilder.buildChallenge({
          skill: skillNotInSkillList,
          id: 'rec4',
        });

        const allChallenges = [
          challengeInSkillList1,
          challengeInSkillList2,
          challengeNotInSkillList1,
          challengeNotInSkillList2,
        ];

        const skills = [skillInSkillList];

        const assessmentAnswers = [
          domainBuilder.buildAnswer({
            challengeId: challengeNotInSkillList1.id,
          }),
        ];

        expect(
          FlashAssessmentAlgorithmSomeQuestionFromSkillListRule.execute({
            allChallenges,
            availableChallenges: allChallenges,
            assessmentAnswers,
            skills,
            questionNumberToPickFromSkillList: [3],
          }),
        ).to.deep.equal(allChallenges);
      });
    });
    describe(`when next question's index is included in questionNumberToPickFromSkillList`, function () {
      it('should remove the challenges not in target profile', function () {
        const skillInSkillListId = 'skillInSkillList';
        const skillNotInSkillListId = 'skillNotInSkillList';
        const skillInSkillList = domainBuilder.buildSkill({ id: skillInSkillListId });

        const skillNotInSkillList = domainBuilder.buildSkill({ id: skillNotInSkillListId });

        const challengeInSkillList1 = domainBuilder.buildChallenge({
          skill: skillInSkillList,
          id: 'rec1',
        });

        const challengeInSkillList2 = domainBuilder.buildChallenge({
          skill: skillInSkillList,
          id: 'rec2',
        });

        const challengeNotInSkillList1 = domainBuilder.buildChallenge({
          skill: skillNotInSkillList,
          id: 'rec3',
        });

        const challengeNotInSkillList2 = domainBuilder.buildChallenge({
          skill: skillNotInSkillList,
          id: 'rec4',
        });

        const allChallenges = [
          challengeInSkillList1,
          challengeInSkillList2,
          challengeNotInSkillList1,
          challengeNotInSkillList2,
        ];

        const skills = [skillInSkillList];

        const assessmentAnswers = [
          domainBuilder.buildAnswer({
            challengeId: challengeNotInSkillList1.id,
          }),
        ];

        expect(
          FlashAssessmentAlgorithmSomeQuestionFromSkillListRule.execute({
            allChallenges,
            availableChallenges: allChallenges,
            assessmentAnswers,
            skills,
            questionNumberToPickFromSkillList: [2],
          }),
        ).to.deep.equal([challengeInSkillList1, challengeInSkillList2]);
      });
      describe(`when no available challenges are in target profile (empty intersection)`, function () {
        it('should log warning and fallback on returning all available challenges', function () {
          const skillInSkillListId = 'skillInSkillList';
          const skillNotInSkillListId = 'skillNotInSkillList';
          const skillInSkillList = domainBuilder.buildSkill({ id: skillInSkillListId });

          const skillNotInSkillList = domainBuilder.buildSkill({ id: skillNotInSkillListId });

          const challengeNotInSkillList1 = domainBuilder.buildChallenge({
            skill: skillNotInSkillList,
            id: 'rec3',
          });

          const challengeNotInSkillList2 = domainBuilder.buildChallenge({
            skill: skillNotInSkillList,
            id: 'rec4',
          });

          const allChallenges = [challengeNotInSkillList1, challengeNotInSkillList2];

          const skills = [skillInSkillList];

          const assessmentAnswers = [
            domainBuilder.buildAnswer({
              challengeId: challengeNotInSkillList1.id,
            }),
          ];

          const loggerWarnStub = sinon.stub(logger, 'warn');
          expect(
            FlashAssessmentAlgorithmSomeQuestionFromSkillListRule.execute({
              allChallenges,
              availableChallenges: allChallenges,
              assessmentAnswers,
              skills,
              questionNumberToPickFromSkillList: [2],
            }),
          ).to.deep.equal(allChallenges);
          expect(loggerWarnStub).to.have.been.calledOnce;
        });
      });
    });
  });
});
