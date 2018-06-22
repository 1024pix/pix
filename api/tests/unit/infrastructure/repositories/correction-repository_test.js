const { expect, sinon } = require('../../../test-helper');
const correctionRepository = require('../../../../lib/infrastructure/repositories/correction-repository');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const Correction = require('../../../../lib/domain/models/Correction');
const Hint = require('../../../../lib/domain/models/Hint');
const ChallengeAirtableDataObjectFixture = require('../../../fixtures/infrastructure/ChallengeAirtableDataObjectFixture');
const SkillAirtableDataObjectFixture = require('../../../fixtures/infrastructure/SkillAirtableDataObjectFixture');

describe('Unit | Repository | correction-repository', function() {

  let sandbox;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    sandbox.stub(challengeDatasource, 'get');
    sandbox.stub(skillDatasource, 'get');
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('#getByChallengeId', function() {

    const recordId = 'rec-challengeId';
    const expectedHints = [
      new Hint({ skillName: '@web3', value: 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?' }),
      new Hint({ skillName: '@web2', value: 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?' })
    ];
    const explectedCorrection = new Correction({
      id: 'recwWzTquPlvIl4So',
      solution: '1, 5',
      hints: expectedHints
    });

    let promise;

    beforeEach(() => {
      // given
      const challengeDataObject = ChallengeAirtableDataObjectFixture();
      challengeDataObject.skillIds = ['recIdSkill001', 'recIdSkill002', 'recIdSkill003'];
      const skillDataObject1 = SkillAirtableDataObjectFixture();
      skillDataObject1.name = '@web3';
      skillDataObject1.hintStatus = 'Validé';
      const skillDataObject2 = SkillAirtableDataObjectFixture();
      skillDataObject2.name = '@web2';
      skillDataObject2.hintStatus = 'Validé';
      const skillDataObject3 = SkillAirtableDataObjectFixture();
      skillDataObject3.name = '@web1';
      skillDataObject3.hintStatus = 'Proposé';

      challengeDatasource.get.resolves(challengeDataObject);
      skillDatasource.get.onFirstCall().resolves(skillDataObject1);
      skillDatasource.get.onSecondCall().resolves(skillDataObject2);
      skillDatasource.get.onThirdCall().resolves(skillDataObject3);

      // when
      promise = correctionRepository.getByChallengeId(recordId);
    });

    it('should return a correction with the solution', function() {
      // then
      return promise.then((result) => {
        expect(result).to.be.an.instanceof(Correction);
        expect(result).to.deep.equal(explectedCorrection);
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
