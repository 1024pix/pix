const { expect, sinon } = require('../../../../test-helper');
const dataSource = require('../../../../../lib/infrastructure/datasources/airtable/datasource');
const airtable = require('../../../../../lib/infrastructure/airtable');
const AirtableResourceNotFound = require('../../../../../lib/infrastructure/datasources/airtable/AirtableResourceNotFound');

describe('Unit | Infrastructure | Datasource | Airtable | datasource', () => {

  const someDatasource = dataSource.extend({
    tableName: 'Airtable_table',

    usedFields: ['Shi', 'Foo', 'Bar'],

    fromAirTableObject: (record) => ({ record }),
  });

  describe('#get', () => {

    context('(success cases)', () => {

      beforeEach(() => {
        sinon.stub(airtable, 'getRecord').callsFake(async (tableName, id) => {
          return { tableName, id };
        });
      });

      it('should fetch a single record from Airtable (or its cached copy)', async () => {
        // when
        const record = await someDatasource.get('some-record-id');

        // then
        expect(record).to.deep.equal({ record: { tableName: 'Airtable_table', id: 'some-record-id' } });
      });

      it('should correctly manage the `this` context', async () => {
        // given
        const unboundGet = someDatasource.get;

        // when
        const record = await unboundGet('some-record-id');

        // then
        expect(record).to.deep.equal({ record: { tableName: 'Airtable_table', id: 'some-record-id' } });
      });

    });

    context('(error cases)', () => {

      it('should throw an AirtableResourceNotFound if record was not found', () => {
        // given
        const err = new Error();
        err.error = 'NOT_FOUND';
        sinon.stub(airtable, 'getRecord').rejects(err);

        // when
        const promise = someDatasource.get('some-record-id');

        // then
        return expect(promise).to.have.been.rejectedWith(AirtableResourceNotFound);
      });

      it('should dispatch error in case of generic error', () => {
        // given
        const err = new Error();
        sinon.stub(airtable, 'getRecord').rejects(err);

        // when
        const promise = someDatasource.get('some-record-id');

        // then
        return expect(promise).to.have.been.rejectedWith(err);
      });
    });
  });

  describe('#list', () => {

    beforeEach(() => {
      sinon.stub(airtable, 'findRecords').callsFake(async (tableName, usedFields) => {
        return [{ tableName, usedFields }];
      });
    });

    it('should fetch all the records of a given type (table) from Airtable (or its cached copy)', async () => {
      // when
      const record = await someDatasource.list();

      // then
      expect(record).to.deep.equal([{ record: { tableName: 'Airtable_table', usedFields: ['Shi', 'Foo', 'Bar'] } }]);
    });

    it('should correctly manage the `this` context', async () => {
      // given
      const unboundList = someDatasource.list;

      // when
      const record = await unboundList();

      // then
      expect(record).to.deep.equal([{ record: { tableName: 'Airtable_table', usedFields: ['Shi', 'Foo', 'Bar'] } }]);
    });
  });

  describe('#preload', () => {

    it('should load all the Airtable table content in the cache (and return them)', async () => {
      // given
      sinon.stub(airtable, 'preload').withArgs(someDatasource.tableName, someDatasource.usedFields).resolves(true);

      // when
      const success = await someDatasource.preload();

      // then
      expect(success).to.be.true;
    });
  });

});
