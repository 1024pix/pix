const Airtable = require('airtable');
const hash = require('object-hash');
const { expect, sinon } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/caches/cache');
const airtable = require('../../../lib/infrastructure/airtable');

describe('Integration | Class | airtable', () => {

  const sandbox = sinon.sandbox.create();

  const findStub = sandbox.stub();
  const allStub = sandbox.stub();

  beforeEach(() => {
    sandbox.stub(cache, 'get');
    sandbox.stub(cache, 'set');
    sandbox.stub(Airtable.prototype, 'init').returns();
    sandbox.stub(Airtable.prototype, 'base').returns({
      table() {
        return {
          find: findStub,
          select() {
            return {
              all: allStub
            };
          },
        };
      }
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#getRecord', () => {

    const tableName = 'Tests';
    const recordId = 'recNPB7dTNt5krlMA';
    const cacheKey = 'Tests_recNPB7dTNt5krlMA';
    const airtableRecord = { foo: 'bar' };

    context('when the response was previously cached', () => {

      it('should resolve with cached value', () => {
        // given
        const cachedValue = airtableRecord;
        cache.get.resolves(cachedValue);
        cache.set.resolves();

        // when
        const promise = airtable.getRecord(tableName, recordId);

        // then
        return promise.then(record => {
          expect(record).to.deep.equal(airtableRecord);
          expect(findStub).to.have.not.been.called;
        });
      });
    });

    context('when the response was not previously cached', () => {

      it('should resolve Airtable fetched record and store it in cache', () => {
        // given
        const cachedValue = null;
        cache.get.resolves(cachedValue);
        cache.set.resolves();
        findStub.resolves(airtableRecord);

        // when
        const promise = airtable.getRecord(tableName, recordId);

        // then
        return promise.then(record => {
          expect(record).to.deep.equal(airtableRecord);
          expect(cache.set).to.have.been.calledWith(cacheKey, airtableRecord);
        });
      });
    });

    context('when the cache throws an error', () => {

      it('should reject the error', () => {
        // given
        const error = new Error('cache error');
        cache.get.rejects(error);

        // when
        const promise = airtable.getRecord(tableName, recordId);

        // then
        return expect(promise).to.have.been.rejectedWith(error);
      });
    });
  });

  describe('#findRecords', () => {

    const tableName = 'Tests';
    const query = { view: 'View name' };
    const cacheKey = `Tests_${hash(query)}`;
    const airtableRecords = { foo: 'bar' };

    context('when the response was previously cached', () => {

      it('should resolve with cached value', () => {
        // given
        const cachedValue = airtableRecords;
        cache.get.resolves(cachedValue);
        cache.set.resolves();

        // when
        const promise = airtable.findRecords(tableName, query);

        // then
        return promise.then(record => {
          expect(record).to.deep.equal(airtableRecords);
          expect(allStub).to.have.not.been.called;
        });
      });
    });

    context('when the response was not previously cached', () => {

      it('should resolve Airtable fetched record and store it in cache', () => {
        // given
        const cachedValue = null;
        cache.get.resolves(cachedValue);
        cache.set.resolves();
        allStub.resolves(airtableRecords);

        // when
        const promise = airtable.findRecords(tableName, query);

        // then
        return promise.then(record => {
          expect(record).to.deep.equal(airtableRecords);
          expect(cache.set).to.have.been.calledWith(cacheKey, airtableRecords);
        });
      });
    });

    context('when the cache throws an error', () => {

      it('should reject the error', () => {
        // given
        const error = new Error('cache error');
        cache.get.rejects(error);

        // when
        const promise = airtable.findRecords(tableName, query);

        // then
        return expect(promise).to.have.been.rejectedWith(error);
      });
    });
  });
});

