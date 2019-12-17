const { expect, sinon } = require('../../../../test-helper');
const dataSource = require('../../../../../lib/infrastructure/datasources/airtable/datasource');
const airtable = require('../../../../../lib/infrastructure/airtable');
const AirtableResourceNotFound = require('../../../../../lib/infrastructure/datasources/airtable/AirtableResourceNotFound');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');

describe('Unit | Infrastructure | Datasource | Airtable | datasource', () => {

  beforeEach(() => {
    sinon.stub(cache, 'get');
  });

  const someDatasource = dataSource.extend({

    modelName: 'AirtableModel',

    tableName: 'Airtable_table',

    usedFields: ['Shi', 'Foo', 'Bar'],

    fromAirTableObject: (record) => ({
      id: record.id,
      tableName: record.tableName,
      fields: record.fields
    }),
  });

  describe('#get', () => {

    const recordId = 'some-record-id';
    const cacheKey = someDatasource.modelName;

    beforeEach(() => {
      cache.get.withArgs(cacheKey).callsFake((cacheKey, generator) => generator());
    });

    context('(success cases)', () => {

      beforeEach(() => {
        sinon.stub(airtable, 'findRecords').callsFake(async (tableName) => {
          return [{ tableName, id: recordId, fields: { foo: 'bar' } }];
        });
      });

      it('should fetch a single record from Airtable (or its cached copy)', async () => {
        // when
        const record = await someDatasource.get(recordId);

        // then
        expect(record).to.deep.equal({ id: 'some-record-id', tableName: 'Airtable_table', fields: { foo: 'bar' } });
      });

      it('should correctly manage the `this` context', async () => {
        // given
        const unboundGet = someDatasource.get;

        // when
        const record = await unboundGet(recordId);

        // then
        expect(record).to.deep.equal({ id: 'some-record-id', tableName: 'Airtable_table', fields: { foo: 'bar' } });
      });

      it('should be cachable', async () => {
        // when
        await someDatasource.get(recordId);

        // then
        expect(cache.get).to.have.been.calledWith(cacheKey);
      });
    });

    context('(error cases)', () => {

      it('should throw an AirtableResourceNotFound if record was not found', () => {
        // given
        sinon.stub(airtable, 'findRecords').callsFake(async (tableName) => {
          return [{ tableName, id: recordId, fields: { foo: 'bar' } }];
        });

        // when
        const promise = someDatasource.get('UNKNOWN_RECORD_ID');

        // then
        return expect(promise).to.have.been.rejectedWith(AirtableResourceNotFound);
      });

      it('should dispatch error in case of generic error', () => {
        // given
        const err = new Error();
        sinon.stub(airtable, 'findRecords').rejects(err);

        // when
        const promise = someDatasource.get(recordId);

        // then
        return expect(promise).to.have.been.rejectedWith(err);
      });
    });
  });

  describe('#list', () => {

    beforeEach(() => {
      cache.get.withArgs(someDatasource.modelName).callsFake((cacheKey, generator) => generator());

      sinon.stub(airtable, 'findRecords').callsFake(async (tableName, usedFields) => {
        return [{ id: 1, tableName, fields: usedFields }];
      });
    });

    it('should fetch all the records of a given type (table) from Airtable (or its cached copy)', async () => {
      // when
      const record = await someDatasource.list();

      // then
      expect(record).to.deep.equal([{ id: 1, tableName: 'Airtable_table', fields: ['Shi', 'Foo', 'Bar'] }]);
    });

    it('should correctly manage the `this` context', async () => {
      // given
      const unboundList = someDatasource.list;

      // when
      const record = await unboundList();

      // then
      expect(record).to.deep.equal([{ id: 1, tableName: 'Airtable_table', fields: ['Shi', 'Foo', 'Bar'] }]);
    });

    it('should be cachable', async () => {
      // when
      await someDatasource.list();

      // then
      expect(cache.get).to.have.been.calledWith(someDatasource.modelName);
    });
  });

  describe('#loadEntries', () => {

    beforeEach(() => {
      cache.get.withArgs(someDatasource.modelName).callsFake((cacheKey, generator) => generator());
      sinon.stub(cache, 'set');
      sinon.stub(airtable, 'findRecords').resolves([
        { id: 'rec1', tableName: 'Airtable_table', fields: 'value1' },
        { id: 'rec2', tableName: 'Airtable_table', fields: 'value2' }
      ]);
    });

    it('should load all the Airtable table content in the cache (and return them)', async () => {
      // when
      const results = await someDatasource.loadEntries();

      // then
      expect(results.length).to.equal(2);
    });

    it('should preload cache', async () => {
      // when
      await someDatasource.loadEntries();

      // then
      expect(cache.set).to.have.been.calledWith('AirtableModel');
    });
  });

  describe('#loadEntry', () => {

    it('should force Airtable to reload the record and store or replace it in the cache', async () => {
      // given
      const airtableRecord = {
        id: 'recId',
        tableName: someDatasource.tableName,
        fields: []
      };
      sinon.stub(airtable, 'getRecord')
        .withArgs(someDatasource.tableName, airtableRecord.id)
        .resolves(airtableRecord);
      sinon.stub(cache, 'set').callsFake((key, value) => value);

      // when
      const entry = await someDatasource.loadEntry(airtableRecord.id);

      // then
      expect(entry).to.deep.equal({
        id: 'recId',
        tableName: 'Airtable_table',
        fields: []
      });
    });
  });
});
