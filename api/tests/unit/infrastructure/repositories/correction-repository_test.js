import { Answer } from '../../../../lib/domain/models/Answer.js';
import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import * as correctionRepository from '../../../../lib/infrastructure/repositories/correction-repository.js';
import { challengeDatasource } from '../../../../lib/infrastructure/datasources/learning-content/challenge-datasource.js';
import { skillDatasource } from '../../../../lib/infrastructure/datasources/learning-content/skill-datasource.js';
import { Correction } from '../../../../lib/domain/models/Correction.js';
import { ChallengeLearningContentDataObjectFixture } from '../../../tooling/fixtures/infrastructure/challengeLearningContentDataObjectFixture.js';
import { SkillLearningContentDataObjectFixture } from '../../../tooling/fixtures/infrastructure/skillLearningContentDataObjectFixture.js';

describe('Unit | Repository | correction-repository', function () {
  let tutorialRepository;

  beforeEach(function () {
    sinon.stub(challengeDatasource, 'get');
    sinon.stub(skillDatasource, 'get');
    tutorialRepository = {
      findByRecordIdsForCurrentUser: sinon.stub(),
    };
  });

  describe('#getByChallengeId', function () {
    const recordId = 'rec-challengeId';
    const userId = 'userId';
    const locale = 'en';
    let fromDatasourceObject;
    let expectedHint;
    let expectedTutorials;
    let expectedLearningMoreTutorials;
    const userSavedTutorial = { id: 'userSavedTutorialId', userId, tutorialId: 'recTuto1' };
    const tutorialEvaluation = { id: 'tutorialEvaluationId', userId, tutorialId: 'recTuto1' };

    const userSavedTutorial3 = { id: 'userSavedTutorialId3', userId, tutorialId: 'recTuto3' };
    const tutorialEvaluation3 = { id: 'tutorialEvaluationId3', userId, tutorialId: 'recTuto3' };

    beforeEach(function () {
      fromDatasourceObject = sinon.stub();

      expectedHint = domainBuilder.buildHint({
        skillName: '@web1',
        value: 'Can we geo-locate a rabbit on the ice floe?',
      });

      expectedTutorials = [
        domainBuilder.buildTutorial({ id: 'recTuto1', title: 'Comment dresser un panda' }),
        domainBuilder.buildTutorial({ id: 'recTuto2', title: 'Comment dresser un chat' }),
      ];

      expectedTutorials[0].userSavedTutorial = userSavedTutorial;
      expectedTutorials[0].tutorialEvaluation = tutorialEvaluation;

      expectedLearningMoreTutorials = [
        domainBuilder.buildTutorial({ id: 'recTuto3', title: 'Comment dresser un tigre du bengale' }),
        domainBuilder.buildTutorial({ id: 'recTuto4', title: 'Comment dresser une belette' }),
      ];
      expectedLearningMoreTutorials[0].userSavedTutorial = userSavedTutorial3;
      expectedLearningMoreTutorials[0].tutorialEvaluation = tutorialEvaluation3;
    });

    context('normal challenge', function () {
      let challengeDataObject;

      beforeEach(function () {
        // given
        const skillDatas = [
          SkillLearningContentDataObjectFixture({
            name: '@web1',
            hintStatus: 'Validé',
            tutorialIds: ['recTuto1'],
            learningMoreTutorialIds: ['recTuto3'],
          }),
          SkillLearningContentDataObjectFixture({
            name: '@web2',
            hintStatus: 'Proposé',
            tutorialIds: ['recTuto2'],
            learningMoreTutorialIds: ['recTuto4'],
          }),
          SkillLearningContentDataObjectFixture({
            name: '@web3',
            hintStatus: 'pré-validé',
            tutorialIds: [],
            learningMoreTutorialIds: [],
          }),
        ];

        skillDatas.forEach((skillData, index) => skillDatasource.get.onCall(index).resolves(skillData));
        tutorialRepository.findByRecordIdsForCurrentUser
          .withArgs({ ids: ['recTuto1'], userId, locale })
          .resolves(expectedTutorials);
        tutorialRepository.findByRecordIdsForCurrentUser
          .withArgs({ ids: ['recTuto3'], userId, locale })
          .resolves(expectedLearningMoreTutorials);
      });

      it('should return a correction with the solution and solutionToDisplay', async function () {
        // given
        const expectedCorrection = new Correction({
          id: 'recwWzTquPlvIl4So',
          solution: '1, 5',
          solutionToDisplay: '1',
          hint: expectedHint,
          tutorials: expectedTutorials,
          learningMoreTutorials: expectedLearningMoreTutorials,
        });
        challengeDataObject = ChallengeLearningContentDataObjectFixture({
          skillId: 'recIdSkill003',
          solution: '1, 5',
          solutionToDisplay: '1',
          type: 'QCM',
        });
        challengeDatasource.get.resolves(challengeDataObject);
        const getSolutionStub = sinon.stub();

        // when
        const result = await correctionRepository.getByChallengeId({
          challengeId: recordId,
          userId,
          locale,
          dependencies: { tutorialRepository, fromDatasourceObject, getSolution: getSolutionStub },
        });

        // then
        expect(getSolutionStub).not.to.have.been.called;
        expect(result).to.be.an.instanceof(Correction);
        expect(result).to.deep.equal(expectedCorrection);
        expect(challengeDatasource.get).to.have.been.calledWith(recordId);
        expect(expectedCorrection.tutorials.map(({ skillId }) => skillId)).to.deep.equal([
          'recSK0X22abcdefgh',
          'recSK0X22abcdefgh',
        ]);
      });

      it('should return the correction with validated hint', async function () {
        // given
        challengeDataObject = ChallengeLearningContentDataObjectFixture({
          skillId: 'recIdSkill003',
        });
        challengeDatasource.get.resolves(challengeDataObject);
        const getSolutionStub = sinon.stub();

        // when
        const result = await correctionRepository.getByChallengeId({
          challengeId: recordId,
          userId,
          locale,
          dependencies: { tutorialRepository, fromDatasourceObject, getSolution: getSolutionStub },
        });

        // then
        expect(result.hint).to.deep.equal(expectedHint);
      });

      context('when challenge type is QROCM-dep', function () {
        context('when answer is skipped', function () {
          it('should not call getSolution service', async function () {
            // given
            challengeDataObject = ChallengeLearningContentDataObjectFixture({
              skillId: 'recIdSkill003',
              solution: '1, 5',
              type: 'QROCM-dep',
            });
            challengeDatasource.get.resolves(challengeDataObject);

            const answerValue = Answer.FAKE_VALUE_FOR_SKIPPED_QUESTIONS;
            const solution = Symbol('solution');
            fromDatasourceObject.withArgs(challengeDataObject).returns(solution);
            const getSolutionStub = sinon.stub();

            // when
            const correction = await correctionRepository.getByChallengeId({
              challengeId: recordId,
              answerValue,
              userId,
              locale,
              dependencies: { tutorialRepository, fromDatasourceObject, getSolution: getSolutionStub },
            });

            // then
            expect(getSolutionStub).not.to.have.been.called;
            expect(correction.correctionBlocks).to.deep.equal([]);
          });
        });

        it('should call solution service and return solution blocks', async function () {
          // given
          challengeDataObject = ChallengeLearningContentDataObjectFixture({
            skillId: 'recIdSkill003',
            solution: '1, 5',
            type: 'QROCM-dep',
          });
          challengeDatasource.get.resolves(challengeDataObject);

          const answerValue = Symbol('answerValue');
          const solution = Symbol('solution');
          fromDatasourceObject.withArgs(challengeDataObject).returns(solution);
          const getSolutionStub = sinon.stub();
          const correctionBlocks = Symbol('correctionBlocks');
          getSolutionStub.withArgs({ solution, answerValue }).returns(correctionBlocks);

          // when
          const correction = await correctionRepository.getByChallengeId({
            challengeId: recordId,
            answerValue,
            userId,
            locale,
            dependencies: { tutorialRepository, fromDatasourceObject, getSolution: getSolutionStub },
          });

          // then
          expect(getSolutionStub).to.have.been.calledWithExactly({ solution, answerValue });
          expect(correction.correctionBlocks).to.equal(correctionBlocks);
        });
      });
    });
  });
});
