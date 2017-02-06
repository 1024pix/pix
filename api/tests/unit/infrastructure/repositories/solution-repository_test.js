/* global sinon */
const { describe, it, before, after, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');

const Airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/cache');
const SolutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');
const solutionSerializer = require('../../../../lib/infrastructure/serializers/airtable/solution-serializer');

describe('Unit | Repository | solution-repository', function () {

  let stub;

  beforeEach(function () {
    cache.flushAll();
    stub = sinon.stub(Airtable, 'base');
  });

  afterEach(function () {
    cache.flushAll();
    stub.restore();
  });

  /*
   * #get(id)
   */

  describe('#get(id)', function () {

    describe('when the solution has been previously fetched and cached', function () {

      const solutionId = 'solutionId';
      const cacheKey = `solution-repository_get_${solutionId}`;
      const cachedValue = { foo: 'bar' };

      beforeEach(function () {
        cache.set(cacheKey, cachedValue);
      });

      it('should return the solution directly retrieved from the cache', function () {
        // when
        const result = SolutionRepository.get(solutionId);

        // then
        return expect(result).to.eventually.deep.equal(cachedValue);
      });

      it('should not make call to Airtable', function () {
        // when
        SolutionRepository.get(solutionId);

        // then
        expect(stub.called).to.be.false;
      });

    });

    describe('when the cache throw an error', function () {

      const cacheErrorMessage = 'Cache error';

      before(function () {
        sinon.stub(cache, 'get', (key, callback) => {
          callback(new Error(cacheErrorMessage));
        });
      });

      after(function () {
        cache.get.restore();
      });

      it('should reject with thrown error', function () {
        // when
        const result = SolutionRepository.get('solution_id');

        // then
        return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      });

    });

    describe('when the solution has not been previously cached', function () {

      const record = { id: 'solution_id' };

      beforeEach(function () {
        stub.returns({
          find(id, callback) {
            if (record.id !== id) callback(new Error());
            return callback(null, record);
          }
        });
      });

      it('should return the solution fetched from Airtable', function () {
        // given
        const solution = solutionSerializer.deserialize(record);

        // when
        const result = SolutionRepository.get(solution.id);

        // then
        return expect(result).to.eventually.deep.equal(solution);
      });

      it('should store the solution in the cache', function () {
        // given
        const solutionId = 'solution_id';

        // when
        SolutionRepository.get(solutionId);

        cache.get(`solution-repository_get_${solutionId}`, (err, cachedValue) => {
          expect(cachedValue).to.exist;
        });
      });
    });
  });

  /*
   * #refresh(id)
   */

  describe('#refresh(id)', function () {

    const record = {
      id: 'solution_id',
      'fields': {
        'Type d\'épreuve': 'QROCM',
        'Bonnes réponses': '${moteur 1} ou ${moteur 2} ou ${moteur 3} = \nGoogle\nBing\nQwant\nDuckduckgo\nYahoo\nYahoo Search\nLycos\nAltavista\nHotbot'
      }
    };

    beforeEach(function () {
      stub.returns({
        find(id, callback) {
          if (record.id !== id) callback(new Error());
          return callback(null, record);
        }
      });
    });

    it('should return the solution fetched from Airtable', function () {
      // given
      const solution = solutionSerializer.deserialize(record);

      // when
      const result = SolutionRepository.refresh(solution.id);

      // then
      return expect(result).to.eventually.deep.equal(solution);
    });

    it('should store the solution in the cache', function () {
      // given
      const solutionId = 'solution_id';

      // when
      SolutionRepository.refresh(solutionId);

      // then
      cache.get(`solution-repository_get_${solutionId}`, (err, cachedValue) => {
        expect(cachedValue).to.exist;
      });
    });

    describe('when the cache throw an error', function () {

      const cacheErrorMessage = 'Cache error';

      before(function () {
        sinon.stub(cache, 'del', (key, callback) => {
          callback(new Error(cacheErrorMessage));
        });
      });

      after(function () {
        cache.del.restore();
      });

      it('should reject with thrown error', function () {
        // when
        const result = SolutionRepository.refresh('solution_id');

        // then
        return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      });

    });

  });

});
