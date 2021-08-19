const { expect, sinon, domainBuilder } = require('../../../test-helper');
const correctionRepository = require('../../../../lib/infrastructure/repositories/correction-repository');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/learning-content/challenge-datasource');
const skillDatasource = require('../../../../lib/infrastructure/datasources/learning-content/skill-datasource');
const tutorialRepository = require('../../../../lib/infrastructure/repositories/tutorial-repository');
const Correction = require('../../../../lib/domain/models/Correction');
const Hint = require('../../../../lib/domain/models/Hint');
const ChallengeLearningContentDataObjectFixture = require('../../../tooling/fixtures/infrastructure/challengeLearningContentDataObjectFixture');
const SkillLearningContentDataObjectFixture = require('../../../tooling/fixtures/infrastructure/skillLearningContentDataObjectFixture');

describe('Unit | Repository | correction-repository', function() {

  beforeEach(function() {
    sinon.stub(challengeDatasource, 'get');
    sinon.stub(skillDatasource, 'get');
    sinon.stub(tutorialRepository, 'findByRecordIdsForCurrentUser');
  });

  describe('#getByChallengeId', function() {

    const recordId = 'rec-challengeId';
    const userId = 'userId';
    const locale = 'en';

    const expectedHints = [
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      domainBuilder.buildHint(
        { skillName: '@web2', value: 'Can we geo-locate a rabbit on the ice floe?' },
      ),
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      domainBuilder.buildHint(
        { skillName: '@web3', value: 'Can we geo-locate a rabbit on the ice floe?' },
      ),
    ];

    const userTutorial = { id: 'userTutorialId', userId, tutorialId: 'recTuto1' };
    const tutorialEvaluation = { id: 'tutorialEvaluationId', userId, tutorialId: 'recTuto1' };
    const expectedTutorials = [
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      domainBuilder.buildTutorial({ id: 'recTuto1', title: 'Comment dresser un panda' }),
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      domainBuilder.buildTutorial({ id: 'recTuto2', title: 'Comment dresser un chat' }),
    ];
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    expectedTutorials[0].userTutorial = userTutorial;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    expectedTutorials[0].tutorialEvaluation = tutorialEvaluation;

    const userTutorial3 = { id: 'userTutorialId3', userId, tutorialId: 'recTuto3' };
    const tutorialEvaluation3 = { id: 'tutorialEvaluationId3', userId, tutorialId: 'recTuto3' };
    const expectedLearningMoreTutorials = [
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      domainBuilder.buildTutorial({ id: 'recTuto3', title: 'Comment dresser un tigre du bengale' }),
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      domainBuilder.buildTutorial({ id: 'recTuto4', title: 'Comment dresser une belette' }),
    ];
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    expectedLearningMoreTutorials[0].userTutorial = userTutorial3;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    expectedLearningMoreTutorials[0].tutorialEvaluation = tutorialEvaluation3;

    context('normal challenge', function() {

      let challengeDataObject;

      beforeEach(function() {
        // given
        const skillDatas = [
          SkillLearningContentDataObjectFixture({
            name: '@web1',
            hintStatus: 'Proposé',
            tutorialIds: ['recTuto1'],
            learningMoreTutorialIds: ['recTuto3'],
          }),
          SkillLearningContentDataObjectFixture({
            name: '@web2',
            hintStatus: 'Validé',
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
        tutorialRepository.findByRecordIdsForCurrentUser.withArgs({ ids: ['recTuto1', 'recTuto2'], userId, locale }).resolves(expectedTutorials);
        tutorialRepository.findByRecordIdsForCurrentUser.withArgs({ ids: ['recTuto3', 'recTuto4'], userId, locale }).resolves(expectedLearningMoreTutorials);
      });

      it('should return a correction with the solution and solutionToDisplay', async function() {
        // given
        const expectedCorrection = new Correction({
          id: 'recwWzTquPlvIl4So',
          solution: '1, 5',
          solutionToDisplay: '1',
          hints: expectedHints,
          tutorials: expectedTutorials,
          learningMoreTutorials: expectedLearningMoreTutorials,
        });
        challengeDataObject = ChallengeLearningContentDataObjectFixture({
          skillIds: ['recIdSkill001', 'recIdSkill002', 'recIdSkill003'],
          solution: '1, 5',
          solutionToDisplay: '1',
        });
        challengeDatasource.get.resolves(challengeDataObject);

        // when
        const result = await correctionRepository.getByChallengeId({ challengeId: recordId, userId, locale });

        // then
        expect(result).to.be.an.instanceof(Correction);
        expect(result).to.deep.equal(expectedCorrection);
        expect(challengeDatasource.get).to.have.been.calledWith(recordId);
      });

      it('should return the correction with hints that are validated', async function() {
        // given
        challengeDataObject = ChallengeLearningContentDataObjectFixture({ skillIds: ['recIdSkill001', 'recIdSkill002', 'recIdSkill003'] });
        challengeDatasource.get.resolves(challengeDataObject);

        // when
        const result = await correctionRepository.getByChallengeId({ challengeId: recordId, userId, locale });

        // then
        result.hints.forEach((hint) => expect(hint).to.be.an.instanceof(Hint));
        expect(result.hints).to.deep.equal(expectedHints);
      });
    });

    context('duplicated tutorials', function() {

      const expectedCorrection = new Correction({
        id: 'recwWzTquPlvIl4So',
        solution: '1, 5',
        solutionToDisplay: '1, 5',
        hints: expectedHints,
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        tutorials: [expectedTutorials[0]],
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        learningMoreTutorials: [expectedLearningMoreTutorials[0]],
      });

      let promise;

      beforeEach(function() {
        // given
        const challengeDataObject = ChallengeLearningContentDataObjectFixture({ skillIds: ['recIdSkill001', 'recIdSkill002', 'recIdSkill003'] });
        const skillDatas = [
          SkillLearningContentDataObjectFixture({
            name: '@web1',
            hintStatus: 'Proposé',
            tutorialIds: ['recTuto1'],
            learningMoreTutorialIds: [],
          }),
          SkillLearningContentDataObjectFixture({
            name: '@web2',
            hintStatus: 'Validé',
            tutorialIds: ['recTuto1', 'recTuto1'],
            learningMoreTutorialIds: ['recTuto3'],
          }),
          SkillLearningContentDataObjectFixture({
            name: '@web3',
            hintStatus: 'pré-validé',
            tutorialIds: [],
            learningMoreTutorialIds: ['recTuto3'],
          }),
        ];

        challengeDatasource.get.resolves(challengeDataObject);
        skillDatas.forEach((skillData, index) => skillDatasource.get.onCall(index).resolves(skillData));
        tutorialRepository.findByRecordIdsForCurrentUser.withArgs({ ids: ['recTuto1'], userId, locale }).resolves([expectedTutorials[0]]);
        tutorialRepository.findByRecordIdsForCurrentUser.withArgs({ ids: ['recTuto3'], userId, locale }).resolves([expectedLearningMoreTutorials[0]]);

        // when
        promise = correctionRepository.getByChallengeId({ challengeId: recordId, userId, locale });
      });

      it('should return a correction with deduplicated tutorials', function() {
        // then
        return promise.then((result) => {
          expect(result).to.be.an.instanceof(Correction);
          expect(result).to.deep.equal(expectedCorrection);
          expect(challengeDatasource.get).to.have.been.calledWith(recordId);
        });
      });
    });
  });
});
