const { expect, sinon } = require('../../../test-helper');
const solutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const Solution = require('../../../../lib/domain/models/Solution');
const ChallengeAirtableDataModelFixture = require('../../../fixtures/infrastructure/ChallengeAirtableDataModelFixture');

describe('Unit | Repository | solution-repository', function() {

  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sandbox.stub(challengeDatasource, 'get');
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('#getByChallengeId', function() {

    it('should call the challenge datasource with the challenge Id to compose the get solution', function() {
      // given
      const recordId = 'rec-challengeId';
      const explectedSolution = new Solution({
        id: 'recwWzTquPlvIl4So',
        isT1Enabled: true,
        isT2Enabled: false,
        isT3Enabled: true,
        scoring: '1: outilsTexte2\n2: outilsTexte4',
        type: 'QCM',
        value: '1, 5'
      });
      challengeDatasource.get.resolves(ChallengeAirtableDataModelFixture());

      // when
      const promise = solutionRepository.getByChallengeId(recordId);

      // then
      return promise.then((result) => {
        expect(challengeDatasource.get).to.have.been.calledWith(recordId);
        expect(result).to.be.an.instanceof(Solution);
        expect(result).to.deep.equal(explectedSolution);
      });
    });
  });
});
