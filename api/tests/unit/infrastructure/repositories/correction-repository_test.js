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

    const expectedCorrection = new Correction({
      id: 'recwWzTquPlvIl4So',
      solution: '1, 5',
      hints: expectedHints,
      tutorials: expectedTutorials
    });

    let promise;

    beforeEach(() => {
      // given
      const challengeDataObject = ChallengeAirtableDataObjectFixture();
      challengeDataObject.skillIds = ['recIdSkill001', 'recIdSkill002', 'recIdSkill003'];
      const skillDataObject1 = SkillAirtableDataObjectFixture();
      skillDataObject1.name = '@web1';
      skillDataObject1.hintStatus = 'Proposé';
      skillDataObject1.tutorialIds = ['recTuto1'];
      const skillDataObject2 = SkillAirtableDataObjectFixture();
      skillDataObject2.name = '@web2';
      skillDataObject2.hintStatus = 'Validé';
      skillDataObject2.tutorialIds = ['recTuto2'];
      const skillDataObject3 = SkillAirtableDataObjectFixture();
      skillDataObject3.name = '@web3';
      skillDataObject3.hintStatus = 'pré-validé';
      skillDataObject3.tutorialIds = [];
      const tutoData1 = tutorialAirtableDataObjectFixture();
      tutoData1.id = 'recTuto1';
      tutoData1.title = 'Comment dresser un panda';
      const tutoData2 = tutorialAirtableDataObjectFixture();
      tutoData2.id = 'recTuto2';
      tutoData2.title = 'Comment dresser un chat';

      challengeDatasource.get.resolves(challengeDataObject);
      skillDatasource.get.onFirstCall().resolves(skillDataObject1);
      skillDatasource.get.onSecondCall().resolves(skillDataObject2);
      skillDatasource.get.onThirdCall().resolves(skillDataObject3);
      tutorialDataSource.get.onFirstCall().resolves(tutoData1);
      tutorialDataSource.get.onSecondCall().resolves(tutoData2);

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
});
