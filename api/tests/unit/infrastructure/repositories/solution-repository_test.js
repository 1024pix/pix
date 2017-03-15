const { describe, it, beforeEach, afterEach, expect, sinon } = require('../../../test-helper');
const airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/cache');
const solutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');
const solutionSerializer = require('../../../../lib/infrastructure/serializers/airtable/solution-serializer');

describe('Unit | Repository | solution-repository', function () {

  let getRecord;
  let getRecords;

  beforeEach(function () {
    cache.flushAll();
    getRecord = sinon.stub(airtable, 'getRecord');
    getRecords = sinon.stub(airtable, 'getRecords');
  });

  afterEach(function () {
    cache.flushAll();
    getRecord.restore();
    getRecords.restore();
  });

  /*
   * #get
   */

  describe('#get', function () {

    const challengeId = 'challengeId';
    const cacheKey = `solution-repository_get_${challengeId}`;
    const solution = { foo: 'bar' };

    it('should resolve with the solution directly retrieved from the cache without calling airtable when the solution has been cached', function () {
      // given
      getRecord.resolves(true);
      cache.set(cacheKey, solution);

      // when
      const result = solutionRepository.get(challengeId);

      // then
      expect(getRecord.notCalled).to.be.true;
      return expect(result).to.eventually.deep.equal(solution);
    });

    it('should reject with an error when the cache throw an error', function () {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'get', (key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = solutionRepository.get(challengeId);

      // then
      cache.get.restore();
      return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
    });

    describe('when the solution was not previously cached', function () {

      beforeEach(function () {
        getRecord.resolves(solution);
      });

      it('should resolve with the challenges fetched from airtable', function (done) {
        // when
        const result = solutionRepository.get(challengeId);

        // then
        expect(result).to.eventually.deep.equal(solution);
        done();
      });

      it('should cache the solution fetched from airtable', function (done) {
        // when
        solutionRepository.get(challengeId).then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
            done();
          });
        });
      });

      it('should query correctly airtable', function (done) {
        // when
        solutionRepository.get(challengeId).then(() => {

          // then
          expect(getRecord.calledWith('Epreuves', challengeId, solutionSerializer)).to.be.true;
          done();
        });
      });
    });
  });

  /*
   * #refresh
   */

  describe('#refresh', function () {

    const challengeId = 'challenge_id';
    const cacheKey = `solution-repository_get_${challengeId}`;

    it('should reject with an error when the cache throw an error', function (done) {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'del', (key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = solutionRepository.refresh(challengeId);

      // then
      cache.del.restore();
      expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      done();
    });

    it('should resolve with the solution fetched from airtable when the solution was not previously cached', function (done) {
      // given
      const solution = {
        id: challengeId,
        value: 'Solution value'
      };
      getRecord.resolves(solution);

      // when
      const result = solutionRepository.refresh(challengeId);

      // then
      expect(result).to.eventually.deep.equal(solution);
      done();
    });

    it('should replace the old solution by the new one in cache', function (done) {
      // given
      const oldCourse = {
        id: challengeId,
        name: 'Old solution',
        description: 'Old description of the solution'
      };
      cache.set(cacheKey, oldCourse);
      const newCourse = {
        id: challengeId,
        name: 'New solution',
        description: 'new description of the solution'
      };
      getRecord.resolves(newCourse);

      // when
      solutionRepository.refresh(challengeId).then(() => {

        // then
        cache.get(cacheKey, (err, cachedValue) => {
          expect(cachedValue).to.deep.equal(newCourse);
          done();
        });
      });
    });
  });

});
