const { expect, sinon, factory } = require('../../../test-helper');
const correctionRepository = require('../../../../lib/infrastructure/repositories/correction-repository');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const tutorialDataSource = require('../../../../lib/infrastructure/datasources/airtable/tutorial-datasource');
const Correction = require('../../../../lib/domain/models/Correction');
const Hint = require('../../../../lib/domain/models/Hint');
const ChallengeAirtableDataObjectFixture = require('../../../fixtures/infrastructure/challengeAirtableDataObjectFixture');
const SkillAirtableDataObjectFixture = require('../../../fixtures/infrastructure/skillAirtableDataObjectFixture');
const tutorialAirtableDataObjectFixture = require('../../../fixtures/infrastructure/tutorialAirtableDataObjectFixture');

describe('Unit | Repository | correction-repository', function() {

  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sandbox.stub(challengeDatasource, 'get');
    sandbox.stub(skillDatasource, 'get');
    sandbox.stub(tutorialDataSource, 'get');
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('#getByChallengeId', function() {

    const recordId = 'rec-challengeId';
    const expectedHints = [
      factory.buildHint({ skillName: '@web2', value: 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?' }),
      factory.buildHint({ skillName: '@web3', value: 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?' }),
    ];

    const expectedTutorials = [
      factory.buildTutorial({ id: 'recTuto1', title:'Comment dresser un panda' }),
      factory.buildTutorial({ id: 'recTuto2', title:'Comment dresser un chat' }),
    ];

    const expectedLearningMoreTutorials = [
      factory.buildTutorial({ id: 'recTuto3', title:'Comment dresser un tigre du bengale' }),
      factory.buildTutorial({ id: 'recTuto4', title:'Comment dresser une belette' }),
    ];

    describe('normal challenge', () => {

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
        const tutoDatas = [
          tutorialAirtableDataObjectFixture({
            id: 'recTuto1',
            title: 'Comment dresser un panda',
          }),
          tutorialAirtableDataObjectFixture({
            id: 'recTuto2',
            title: 'Comment dresser un chat',
          }),
          tutorialAirtableDataObjectFixture({
            id: 'recTuto3',
            title: 'Comment dresser un tigre du bengale',
          }),
          tutorialAirtableDataObjectFixture({
            id: 'recTuto4',
            title: 'Comment dresser une belette',
          }),
        ];

        challengeDatasource.get.resolves(challengeDataObject);
        skillDatas.forEach((skillData, index) => skillDatasource.get.onCall(index).resolves(skillData));
        tutoDatas.forEach((tutoData, index) => tutorialDataSource.get.onCall(index).resolves(tutoData));

        // when
        promise = correctionRepository.getByChallengeId(recordId);
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

    describe('duplicated tutorials', () => {

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
        const tutoDatas = [
          tutorialAirtableDataObjectFixture({
            id: expectedTutorials[0].id,
            title: expectedTutorials[0].title,
          }),
          tutorialAirtableDataObjectFixture({
            id: expectedLearningMoreTutorials[0].id,
            title: expectedLearningMoreTutorials[0].title,
          }),
        ];

        challengeDatasource.get.resolves(challengeDataObject);
        skillDatas.forEach((skillData, index) => skillDatasource.get.onCall(index).resolves(skillData));
        tutoDatas.forEach((tutoData, index) => tutorialDataSource.get.onCall(index).resolves(tutoData));

        // when
        promise = correctionRepository.getByChallengeId(recordId);
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
