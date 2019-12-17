const AirtableRecord = require('airtable').Record;
const { airtableBuilder, expect, sinon } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/caches/cache');
const airtable = require('../../../lib/infrastructure/airtable');

function assertAirtableRecordToEqualExpectedJson(actualRecord, expectedRecordJson) {
  expect(actualRecord).to.be.an.instanceOf(AirtableRecord);
  expect(actualRecord.getId()).to.equal(expectedRecordJson.id);
  expect(actualRecord.fields).to.deep.equal(expectedRecordJson.fields);
  expect(actualRecord._rawJson).to.deep.equal(expectedRecordJson);
}

describe('Integration | Infrastructure | airtable', () => {

  beforeEach(() => {
    sinon.stub(cache, 'get');
    sinon.stub(cache, 'set');
  });

  afterEach(() => {
    airtableBuilder.cleanAll();
  });

  describe('#getRecord{SkipCache}', () => {

    const tableName = 'Tests';
    const recordId = 'recNPB7dTNt5krlMA';
    const cacheKey = 'Tests_recNPB7dTNt5krlMA';
    let airtableCourseJson;

    beforeEach(() => {
      airtableCourseJson = airtableBuilder.factory.buildCourse({
        id: 'recNPB7dTNt5krlMA',
      });
      airtableBuilder
        .mockGet({ tableName })
        .returns(airtableCourseJson)
        .activate();

    });

    context('when the response was previously cached', () => {
      it('should resolve with cached value', async () => {
        // given
        const cachedValue = airtableCourseJson;
        cache.get.withArgs(cacheKey).resolves(cachedValue);

        // when
        const record = await airtable.getRecord(tableName, recordId);

        // then
        assertAirtableRecordToEqualExpectedJson(record, airtableCourseJson);
      });
    });

    context('when the response was previously cached but we do not want to use cache', () => {
      it('should Airtable fetched record and store it in cache', async () => {
        // given
        cache.set.resolves();

        // when
        const record = await airtable.getRecordSkipCache(tableName, recordId);

        // then
        expect(cache.get).to.have.not.been.called;
        assertAirtableRecordToEqualExpectedJson(record, airtableCourseJson);
        expect(cache.set).to.have.been.calledWith(cacheKey, airtableCourseJson);
      });
    });

    context('when the response was not previously cached', () => {
      it('should query for record and resolve with value now in cache', async () => {
        // given
        cache.get.withArgs(cacheKey).callsFake(async (_key, generator) => generator());

        // when
        const record = await airtable.getRecord(tableName, recordId);

        // then
        assertAirtableRecordToEqualExpectedJson(record, airtableCourseJson);
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
    const airtableRecordsJson = [{
      id: 'recId1',
      fields: {
        foo: 'bar',
        titi: 'toto',
        toto: 'titi'
      }
    }, {
      id: 'recId2',
      fields: {
        foo: 'bar',
        titi: 'toto',
        toto: 'titi'
      }
    }];

    const airtableRecordsJsonWithSpecificFields = [{
      id: 'recId1',
      fields: {
        titi: 'toto',
        toto: 'titi'
      }
    }, {
      id: 'recId2',
      fields: {
        titi: 'toto',
        toto: 'titi'
      }
    }];

    beforeEach(() => {
      airtableBuilder
        .mockList({ tableName })
        .respondsToQuery({})
        .returns(airtableRecordsJson)
        .activate();

      airtableBuilder
        .mockList({ tableName })
        .respondsToQuery({
          'fields[]': ['titi', 'toto']
        })
        .returns(airtableRecordsJsonWithSpecificFields)
        .activate();
    });

    context('when the response was previously cached', () => {
      it('should resolve with cached value', async () => {
        // given
        cache.get.withArgs(cacheKey).resolves(airtableRecordsJson);

        // when
        const records = await airtable.findRecords(tableName);

        // then
        records.forEach((record, index) => {
          const expectedRecord = airtableRecordsJson[index];
          assertAirtableRecordToEqualExpectedJson(record, expectedRecord);
        });
      });
    });

    context('when the response was previously cached but we do not want to use cache', () => {
      beforeEach(() => {
        // given
        const cachedValue = null;
        cache.get.resolves(cachedValue);
        cache.set.resolves();
      });
      it('should fetch Airtable record and store it in cache', async () => {
        // when
        const records = await airtable.findRecordsSkipCache(tableName);

        // then
        expect(cache.get).to.have.not.been.called;

        records.forEach((record, index) => {
          const expectedRecord = airtableRecordsJson[index];
          assertAirtableRecordToEqualExpectedJson(record, expectedRecord);
        });
        expect(cache.set).to.have.been.calledWith('Tests', airtableRecordsJson);
      });

      it('should allow to fetch Airtable record with specific fields and store it in cache', async () => {
        // when
        const records = await airtable.findRecordsSkipCache(tableName, ['titi', 'toto']);

        // then
        records.forEach((record, index) => {
          const expectedRecord = airtableRecordsJsonWithSpecificFields[index];
          assertAirtableRecordToEqualExpectedJson(record, expectedRecord);
        });
        expect(cache.set).to.have.been.calledWith('Tests', airtableRecordsJsonWithSpecificFields);
      });

    });

    context('when the response was not previously cached', () => {
      beforeEach(function() {
        // given
        cache.get.withArgs(cacheKey).callsFake(async (_key, generator) => generator());
      });

      it('should query for records and resolve with value now in cache', async () => {
        // when
        const records = await airtable.findRecords(tableName);

        // then
        records.forEach((record, index) => {
          const expectedRecord = airtableRecordsJson[index];
          assertAirtableRecordToEqualExpectedJson(record, expectedRecord);
        });
      });

      it('should allow query for records with specific fields and resolve with value now in cache', async () => {
        // when
        const records = await airtable.findRecords(tableName, ['titi', 'toto']);

        // then
        records.forEach((record, index) => {
          const expectedRecord = airtableRecordsJsonWithSpecificFields[index];
          assertAirtableRecordToEqualExpectedJson(record, expectedRecord);
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

  describe('#preload', () => {

    const tableName = 'Tests';

    const airtableRecordsJsonWithSpecificFields = [{
      id: 'recId1',
      fields: {
        field_A: 'Foo_1',
        field_B: 'Bar_1'
      }
    }, {
      id: 'recId2',
      fields: {
        field_A: 'Foo_2',
        field_B: 'Bar_2'
      }
    }];

    beforeEach(() => {
      airtableBuilder
        .mockList({ tableName })
        .respondsToQuery({
          'fields[]': ['field_A', 'field_B']
        })
        .returns(airtableRecordsJsonWithSpecificFields)
        .activate();
    });

    it('should load all the table records and cache all Airtable Records (with the list indexed one)', async () => {
      // given
      const usedFields = ['field_A', 'field_B'];

      // when
      const success = await airtable.preload(tableName, usedFields);

      // then
      expect(success).to.be.true;
      expect(cache.set).to.have.been.calledThrice;
    });
  });

});
