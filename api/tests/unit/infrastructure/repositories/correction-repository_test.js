const { expect, sinon, domainBuilder } = require('../../../test-helper');
const correctionRepository = require('../../../../lib/infrastructure/repositories/correction-repository');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const tutorialRepository = require('../../../../lib/infrastructure/repositories/tutorial-repository');
const Correction = require('../../../../lib/domain/models/Correction');
const Hint = require('../../../../lib/domain/models/Hint');
const ChallengeAirtableDataObjectFixture = require('../../../tooling/fixtures/infrastructure/challengeAirtableDataObjectFixture');
const SkillAirtableDataObjectFixture = require('../../../tooling/fixtures/infrastructure/skillAirtableDataObjectFixture');

describe('Unit | Repository | correction-repository', function() {

  beforeEach(function() {
    sinon.stub(challengeDatasource, 'get');
    sinon.stub(skillDatasource, 'get');
    sinon.stub(tutorialRepository, 'findByRecordIdsForCurrentUser');
  });

  describe('#getByChallengeId', function() {

    const recordId = 'rec-challengeId';
    const userId = 'userId';

    const expectedHints = [
      domainBuilder.buildHint({ skillName: '@web2', value: 'Peut-on géo-localiser un lapin sur la banquise ?' }),
      domainBuilder.buildHint({ skillName: '@web3', value: 'Peut-on géo-localiser un lapin sur la banquise ?' }),
    ];

    const userTutorial = { id: 'userTutorialId', userId, tutorialId: 'recTuto1' };
    const tutorialEvaluation = { id: 'tutorialEvaluationId', userId, tutorialId: 'recTuto1' };
    const expectedTutorials = [
      domainBuilder.buildTutorial({ id: 'recTuto1', title:'Comment dresser un panda' }),
      domainBuilder.buildTutorial({ id: 'recTuto2', title:'Comment dresser un chat' }),
    ];
    expectedTutorials[0].userTutorial = userTutorial;
    expectedTutorials[0].tutorialEvaluation = tutorialEvaluation;

    const userTutorial3 = { id: 'userTutorialId3', userId, tutorialId: 'recTuto3' };
    const tutorialEvaluation3 = { id: 'tutorialEvaluationId3', userId, tutorialId: 'recTuto3' };
    const expectedLearningMoreTutorials = [
      domainBuilder.buildTutorial({ id: 'recTuto3', title:'Comment dresser un tigre du bengale' }),
      domainBuilder.buildTutorial({ id: 'recTuto4', title:'Comment dresser une belette' }),
    ];
    expectedLearningMoreTutorials[0].userTutorial = userTutorial3;
    expectedLearningMoreTutorials[0].tutorialEvaluation = tutorialEvaluation3;

    context('normal challenge', () => {

      const expectedCorrection = new Correction({
        id: 'recwWzTquPlvIl4So',
        solution: '1, 5',
        hints: expectedHints,
        tutorials: expectedTutorials,
        learningMoreTutorials: expectedLearningMoreTutorials,
      });

      let promise;

      beforeEach(() => {
        // given
        const challengeDataObject = ChallengeAirtableDataObjectFixture({ skillIds: ['recIdSkill001', 'recIdSkill002', 'recIdSkill003'] });
        const skillDatas = [
          SkillAirtableDataObjectFixture({
            name: '@web1',
            hintStatus: 'Proposé',
            tutorialIds: ['recTuto1'],
            learningMoreTutorialIds: ['recTuto3'],
          }),
          SkillAirtableDataObjectFixture({
            name: '@web2',
            hintStatus: 'Validé',
            tutorialIds: ['recTuto2'],
            learningMoreTutorialIds: ['recTuto4'],
          }),
          SkillAirtableDataObjectFixture({
            name: '@web3',
            hintStatus: 'pré-validé',
            tutorialIds: [],
            learningMoreTutorialIds: [],
          }),
        ];

        challengeDatasource.get.resolves(challengeDataObject);
        skillDatas.forEach((skillData, index) => skillDatasource.get.onCall(index).resolves(skillData));
        tutorialRepository.findByRecordIdsForCurrentUser.withArgs({ ids: ['recTuto1', 'recTuto2'], userId }).resolves(expectedTutorials);
        tutorialRepository.findByRecordIdsForCurrentUser.withArgs({ ids: ['recTuto3', 'recTuto4'], userId }).resolves(expectedLearningMoreTutorials);

        // when
        promise = correctionRepository.getByChallengeId({ challengeId: recordId, userId });
      });

      it('should return a correction with the solution', function() {
        // then
        return promise.then((result) => {
          expect(result).to.be.an.instanceof(Correction);
          expect(result).to.deep.equal(expectedCorrection);
          expect(challengeDatasource.get).to.have.been.calledWith(recordId);
        });
      });

      it('should return the correction with hints that are validated', function() {
        // then
        return promise.then((result) => {
          result.hints.forEach((hint) => expect(hint).to.be.an.instanceof(Hint));
          expect(result.hints).to.deep.equal(expectedHints);
        });
      });
    });

    context('duplicated tutorials', () => {

      const expectedCorrection = new Correction({
        id: 'recwWzTquPlvIl4So',
        solution: '1, 5',
        hints: expectedHints,
        tutorials: [expectedTutorials[0]],
        learningMoreTutorials: [expectedLearningMoreTutorials[0]],
      });

      let promise;

      beforeEach(() => {
        // given
        const challengeDataObject = ChallengeAirtableDataObjectFixture({ skillIds: ['recIdSkill001', 'recIdSkill002', 'recIdSkill003'] });
        const skillDatas = [
          SkillAirtableDataObjectFixture({
            name: '@web1',
            hintStatus: 'Proposé',
            tutorialIds: ['recTuto1'],
            learningMoreTutorialIds: [],
          }),
          SkillAirtableDataObjectFixture({
            name: '@web2',
            hintStatus: 'Validé',
            tutorialIds: ['recTuto1', 'recTuto1'],
            learningMoreTutorialIds: ['recTuto3'],
          }),
          SkillAirtableDataObjectFixture({
            name: '@web3',
            hintStatus: 'pré-validé',
            tutorialIds: [],
            learningMoreTutorialIds: ['recTuto3']
          }),
        ];

        challengeDatasource.get.resolves(challengeDataObject);
        skillDatas.forEach((skillData, index) => skillDatasource.get.onCall(index).resolves(skillData));
        tutorialRepository.findByRecordIdsForCurrentUser.withArgs({ ids: ['recTuto1'], userId }).resolves([expectedTutorials[0]]);
        tutorialRepository.findByRecordIdsForCurrentUser.withArgs({ ids: ['recTuto3'], userId }).resolves([expectedLearningMoreTutorials[0]]);

        // when
        promise = correctionRepository.getByChallengeId({ challengeId: recordId, userId });
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
