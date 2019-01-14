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

describe('Integration | Infrastructure | airtable', () => {

  const sandbox = sinon.createSandbox();

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

  describe('#getRecord{SkipCache}', () => {

    const tableName = 'Tests';
    const recordId = 'recNPB7dTNt5krlMA';
    const cacheKey = 'Tests_recNPB7dTNt5krlMA';
    const airtableRecord = new AirtableRecord(tableName, recordId, {
      id: recordId,
      fields:
        {
          foo: 'bar'
        }
    });

    context('when the response was previously cached', () => {

      it('should resolve with cached value', () => {
        // given
        const cachedValue = airtableRecord._rawJson;
        cache.get.withArgs(cacheKey).resolves(cachedValue);

        // when
        const promise = airtable.getRecord(tableName, recordId);

        // then
        return promise.then((record) => {
          assertAirtableRecordToEqualExpected(record, airtableRecord);
        });
      });

    });

    context('when the response was previously cached but we do not want to use cache', () => {

      it('should Airtable fetched record and store it in cache', () => {
        // given
        const cachedValue = airtableRecord._rawJson;
        cache.get.resolves(cachedValue);
        cache.set.resolves();
        findStub.resolves(airtableRecord);

        // when
        const promise = airtable.getRecordSkipCache(tableName, recordId);

        // then
        return promise.then((record) => {
          expect(cache.get).to.have.not.been.called;
          assertAirtableRecordToEqualExpected(record, airtableRecord);
          expect(cache.set).to.have.been.calledWith(cacheKey, airtableRecord._rawJson);
        });
      });
    });

    context('when the response was not previously cached', () => {

      it('should query for record and resolve with value now in cache', () => {
        // given
        cache.get.withArgs(cacheKey)
          .callsFake((_key, generator) => Promise.resolve(generator()));

        findStub.withArgs(recordId).resolves(airtableRecord);

        // when
        const promise = airtable.getRecord(tableName, recordId);

        // then
        return promise.then((record) => {
          assertAirtableRecordToEqualExpected(record, airtableRecord);
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

  describe('#findRecords{SkipCache}', () => {

    const tableName = 'Tests';
    const cacheKey = tableName;
    const airtableRecords = [
      new AirtableRecord(tableName, 'recId1', {
        id: 'recId1',
        fields:
          {
            foo: 'bar'
          }
      }),
      new AirtableRecord(tableName, 'recId2', {
        id: 'recId2',
        fields:
          {
            titi: 'toto'
          }
      })
    ];

    context('when the response was previously cached', () => {

      it('should resolve with cached value', () => {
        // given
        const cachedArrayOfRawJson = airtableRecords.map((airtableRecord) => airtableRecord._rawJson);
        cache.get.withArgs(cacheKey).resolves(cachedArrayOfRawJson);

        // when
        const promise = airtable.findRecords(tableName);

        // then
        return promise.then((records) => {
          records.forEach((record, index) => {
            const expectedRecord = airtableRecords[index];
            assertAirtableRecordToEqualExpected(record, expectedRecord);
          });
        });
      });
    });

    context('when the response was previously cached but we do not want to use case', () => {

      it('should Airtable fetched record and store it in cache', () => {
        // given
        const cachedValue = null;
        cache.get.resolves(cachedValue);
        cache.set.resolves();
        allStub.resolves(airtableRecords);

        // when
        const promise = airtable.findRecordsSkipCache(tableName);

        // then
        return promise.then((records) => {
          expect(cache.get).to.have.not.been.called;

          records.forEach((record, index) => {
            const expectedRecord = airtableRecords[index];
            assertAirtableRecordToEqualExpected(record, expectedRecord);
          });
          expect(cache.set).to.have.been.calledWith('Tests', airtableRecords.map((airtableRecord) => airtableRecord._rawJson));
        });
      });
    });

    context('when the response was not previously cached', () => {

      it('should query for records and resolve with value now in cache', () => {
        // given
        cache.get.withArgs(cacheKey)
          .callsFake((_key, generator) => Promise.resolve(generator()));

        allStub.resolves(airtableRecords);

        // when
        const promise = airtable.findRecords(tableName);

        // then
        return promise.then((records) => {
          records.forEach((record, index) => {
            const expectedRecord = airtableRecords[index];
            assertAirtableRecordToEqualExpected(record, expectedRecord);
          });
        });
      });

    });

    context('when the cache throws an error', () => {

      it('should reject the error', () => {
        // given
        const error = new Error('cache error');
        cache.get.rejects(error);

        // when
        const promise = airtable.findRecords(tableName);

        // then
        return expect(promise).to.have.been.rejectedWith(error);
      });
    });
  });
});
