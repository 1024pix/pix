const { expect, sinon } = require('../../../test-helper');
const airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/cache');
const solutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');
const solutionSerializer = require('../../../../lib/infrastructure/serializers/airtable/solution-serializer');
const Solution = require('../../../../lib/domain/models/Solution');

describe('Unit | Repository | solution-repository', function() {

  let sandbox;

  beforeEach(function() {
    cache.flushAll();

    sandbox = sinon.sandbox.create();
    sandbox.stub(airtable, 'getRecord');
    sandbox.stub(airtable, 'getRecords');
    sandbox.stub(airtable, 'newGetRecord');
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

});
