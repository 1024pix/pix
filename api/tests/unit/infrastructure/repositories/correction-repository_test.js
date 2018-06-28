const { expect, sinon } = require('../../../test-helper');
const correctionRepository = require('../../../../lib/infrastructure/repositories/correction-repository');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const tutorialDataSource = require('../../../../lib/infrastructure/datasources/airtable/tutorial-datasource');
const Correction = require('../../../../lib/domain/models/Correction');
const Hint = require('../../../../lib/domain/models/Hint');
const Tutorial = require('../../../../lib/domain/models/Tutorial');
const ChallengeAirtableDataObjectFixture = require('../../../fixtures/infrastructure/challengeAirtableDataObjectFixture');
const SkillAirtableDataObjectFixture = require('../../../fixtures/infrastructure/skillAirtableDataObjectFixture');
const TutorialAirtableDataObjectFixture = require('../../../fixtures/infrastructure/tutorialAirtableDataObjectFixture');

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
      new Hint({ skillName: '@web2', value: 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?' }),
      new Hint({ skillName: '@web3', value: 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?' }),
    ];

    const expectedTutorials = [
      new Tutorial({ id: 'recTuto1', duration: '00:01:30', format: 'video', link: 'https://youtube.fr', source: 'Youtube', title:'Comment dresser un panda' }),
      new Tutorial({ id: 'recTuto2', duration: '00:01:30', format: 'document', link: 'https://youtube.fr', source: 'Youtube', title:'Comment dresser un chat' }),
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
      skillDataObject1.tutorialId = ['recTuto1'];
      const skillDataObject2 = SkillAirtableDataObjectFixture();
      skillDataObject2.name = '@web2';
      skillDataObject2.hintStatus = 'Validé';
      skillDataObject2.tutorialId = ['recTuto2'];
      const skillDataObject3 = SkillAirtableDataObjectFixture();
      skillDataObject3.name = '@web3';
      skillDataObject3.hintStatus = 'Validé';
      skillDataObject3.tutorialId = [];
      const tutoData1 = TutorialAirtableDataObjectFixture();
      tutoData1.id = 'recTuto1';
      const tutoData2 = TutorialAirtableDataObjectFixture();
      tutoData2.format = 'document';
      tutoData2.title = 'Comment dresser un chat';
      tutoData2.id = 'recTuto2';

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
