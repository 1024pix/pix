const { expect, sinon, domainBuilder } = require('$tests/test-helper');
const solutionRepository = require('$lib/infrastructure/repositories/solution-repository');
const solutionAdapter = require('$lib/infrastructure/adapters/solution-adapter');
const challengeDatasource = require('$lib/infrastructure/datasources/airtable/challenge-datasource');
const Solution = require('$lib/domain/models/Solution');

describe('Unit | Repository | solution-repository', () => {

  beforeEach(() => {
    sinon.stub(challengeDatasource, 'get');
    sinon.stub(solutionAdapter, 'fromChallengeAirtableDataObject');
  });

  describe('#getByChallengeId', () => {

    let promise;
    let challengeDataObject;
    let solution;
    let recordId;

    beforeEach(() => {
      // given
      recordId = 'rec-challengeId';
      challengeDataObject = domainBuilder.buildChallengeAirtableDataObject();
      challengeDatasource.get.resolves(challengeDataObject);
      solution = domainBuilder.buildSolution();
      solutionAdapter.fromChallengeAirtableDataObject.returns(solution);

      // when
      promise = solutionRepository.getByChallengeId(recordId);
    });

    it('should succeed', () => {
      // then
      return expect(promise).to.be.fulfilled;
    });
    it('should call the challenge datasource with the challenge Id to compose the get solution', () => {
      // then
      return promise.then(() => {
        expect(challengeDatasource.get).to.have.been.calledWith(recordId);
      });
    });
    it('should call the solution adapter to create the Solution from the dataObject', () => {
      // then
      return promise.then(() => {
        expect(solutionAdapter.fromChallengeAirtableDataObject).to.have.been.calledWith(challengeDataObject);
      });
    });
    it('should return the solution', () => {
      // then
      return promise.then((result) => {
        expect(result).to.be.an.instanceof(Solution);
        expect(result).to.deep.equal(solution);
      });
    });
  });
});
