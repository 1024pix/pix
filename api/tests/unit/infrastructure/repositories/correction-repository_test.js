const { expect, sinon } = require('../../../test-helper');
const correctionRepository = require('../../../../lib/infrastructure/repositories/correction-repository');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const Correction = require('../../../../lib/domain/models/Correction');
const ChallengeAirtableDataModelFixture = require('../../../fixtures/infrastructure/ChallengeAirtableDataModelFixture');

describe('Unit | Repository | correction-repository', function() {

  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sandbox.stub(challengeDatasource, 'get');
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('#getByChallengeId', function() {

    it('should call the challenge datasource with the challenge Id to compose the get correction', function() {
      // given
      const recordId = 'rec-challengeId';
      const explectedCorrection = new Correction({
        id: 'recwWzTquPlvIl4So',
        solution: '1, 5'
      });
      challengeDatasource.get.resolves(ChallengeAirtableDataModelFixture);

      // when
      const promise = correctionRepository.getByChallengeId(recordId);

      // then
      return promise.then((result) => {
        expect(challengeDatasource.get).to.have.been.calledWith(recordId);
        expect(result).to.be.an.instanceof(Correction);
        expect(result).to.deep.equal(explectedCorrection);
      });
    });
  });
});
