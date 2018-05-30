const hash = require('object-hash');
const Airtable = require('airtable');
const AirtableRecord = require('airtable').Record;
const { expect, sinon } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/caches/cache');
const airtable = require('../../../lib/infrastructure/airtable');

function assertAirtableRecordToEqualExpected(actualRecord, expectedRecord) {
  expect(actualRecord).to.be.an.instanceOf(AirtableRecord);
  expect(actualRecord.getId()).to.equal(expectedRecord.getId());
  expect(actualRecord.fields).to.deep.equal(expectedRecord.fields);
  expect(actualRecord._rawJson).to.deep.equal(expectedRecord._rawJson);
}

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
    const airtableRecord = new AirtableRecord(tableName, recordId, {
      id : recordId,
      fields:
        {
          foo: 'bar'
        }
    });

    context('when the response was previously cached', () => {

      it('should resolve with cached value', () => {
        // given
        const cachedValue = airtableRecord._rawJson;
        cache.get.resolves(cachedValue);
        cache.set.resolves();

        // when
        const promise = airtable.getRecord(tableName, recordId);

        // then
        return promise.then(record => {
          assertAirtableRecordToEqualExpected(record, airtableRecord);
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
          assertAirtableRecordToEqualExpected(record, airtableRecord);
          expect(cache.set).to.have.been.calledWith(cacheKey, airtableRecord._rawJson);
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
    const airtableRecords = [
      new AirtableRecord(tableName, 'recId1', {
        id : 'recId1',
        fields:
          {
            foo: 'bar'
          }
      }),
      new AirtableRecord(tableName, 'recId2', {
        id : 'recId2',
        fields:
          {
            titi: 'toto'
          }
      })
    ];

    context('when the response was previously cached', () => {

      it('should resolve with cached value', () => {
        // given
        const cachedArrayOfRawJson = airtableRecords.map(airtableRecord => airtableRecord._rawJson);
        cache.get.resolves(cachedArrayOfRawJson);
        cache.set.resolves();

        // when
        const promise = airtable.findRecords(tableName, query);

        // then
        return promise.then(records => {
          records.forEach((record, index) => {
            const expectedRecord = airtableRecords[index];
            assertAirtableRecordToEqualExpected(record, expectedRecord);
          });
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
        return promise.then(records => {
          records.forEach((record, index) => {
            const expectedRecord = airtableRecords[index];
            assertAirtableRecordToEqualExpected(record, expectedRecord);
          });
          expect(cache.set).to.have.been.calledWith(cacheKey, airtableRecords.map(airtableRecord => airtableRecord._rawJson));
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

