const { expect, sinon } = require('../../../test-helper');
const airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/cache');
const solutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');
const solutionSerializer = require('../../../../lib/infrastructure/serializers/airtable/solution-serializer');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const Solution = require('../../../../lib/domain/models/Solution');
const ChallengeAirtableDataModelFixture = require('../../../fixtures/infrastructure/ChallengeAirtableDataModelFixture');

describe('Unit | Repository | solution-repository', function() {

  let sandbox;

  beforeEach(function() {
    cache.flushAll();

    sandbox = sinon.sandbox.create();
    sandbox.stub(airtable, 'getRecord');
    sandbox.stub(airtable, 'getRecords');
    sandbox.stub(challengeDatasource, 'get');
  });

  afterEach(function() {
    sandbox.restore();
    cache.flushAll();
  });

  describe('#get', function() {

    const challengeId = 'challengeId';
    const cacheKey = `solution-repository_get_${challengeId}`;
    const solution = { foo: 'bar' };

    it('should resolve with the solution directly retrieved from the cache without calling airtable when the solution has been cached', function() {
      // given
      airtable.getRecord.resolves(true);
      cache.set(cacheKey, solution);

      // when
      const result = solutionRepository.get(challengeId);

      // then
      expect(airtable.getRecord.notCalled).to.be.true;
      return expect(result).to.eventually.deep.equal(solution);
    });

    it('should reject with an error when the cache throw an error', function() {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'get').callsFake((key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = solutionRepository.get(challengeId);

      // then
      cache.get.restore();
      return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
    });

    describe('when the solution was not previously cached', function() {

      beforeEach(function() {
        airtable.getRecord.resolves(solution);
      });

      it('should resolve with the challenges fetched from airtable', function(done) {
        // when
        const result = solutionRepository.get(challengeId);

        // then
        expect(result).to.eventually.deep.equal(solution);
        done();
      });

      it('should cache the solution fetched from airtable', function(done) {
        // when
        solutionRepository.get(challengeId).then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
            done();
          });
        });
      });

      it('should query correctly airtable', function(done) {
        // when
        solutionRepository.get(challengeId).then(() => {

          // then
          expect(airtable.getRecord.calledWith('Epreuves', challengeId, solutionSerializer)).to.be.true;
          done();
        });
      });
    });
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
      challengeDatasource.get.resolves(ChallengeAirtableDataModelFixture);

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
