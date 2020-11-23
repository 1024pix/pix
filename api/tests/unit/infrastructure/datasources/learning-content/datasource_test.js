const { expect, sinon } = require('../../../../test-helper');
const dataSource = require('../../../../../lib/infrastructure/datasources/learning-content/datasource');
const airtable = require('../../../../../lib/infrastructure/airtable');
const lcms = require('../../../../../lib/infrastructure/lcms');
const LearningContentResourceNotFound = require('../../../../../lib/infrastructure/datasources/learning-content/LearningContentResourceNotFound');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');

describe('Unit | Infrastructure | Datasource | Learning Content | datasource', () => {

  beforeEach(() => {
    sinon.stub(cache, 'get');
  });

  const someDatasource = dataSource.extend({

    modelName: 'learningContentModel',

    tableName: 'Airtable_table',

    usedFields: ['Shi', 'Foo', 'Bar'],

    fromAirTableObject: (record) => ({
      id: record.id,
      tableName: record.tableName,
      fields: record.fields,
    }),
  });

  describe('#get', () => {

    const recordId = 'rec1';
    const cacheKey = someDatasource.modelName;

    beforeEach(() => {
      cache.get.withArgs(cacheKey).callsFake((cacheKey, generator) => generator());
    });

    context('(success cases)', () => {

      let learningContent;

      beforeEach(() => {
        learningContent = {
          learningContentModel: [
            { id: 'rec1', property: 'value1' },
            { id: 'rec2', property: 'value2' },
          ],
        };
        sinon.stub(lcms, 'getLatestRelease').resolves(learningContent);
      });

      it('should fetch a single record from LCMS API (or its cached copy)', async () => {
        // when
        const record = await someDatasource.get(recordId);

        // then
        expect(record).to.deep.equal({ id: 'rec1', property: 'value1' });
      });

      it('should correctly manage the `this` context', async () => {
        // given
        const unboundGet = someDatasource.get;

        // when
        const record = await unboundGet(recordId);

        // then
        expect(record).to.deep.equal({ id: 'rec1', property: 'value1' });
      });

      it('should be cachable', async () => {
        // when
        await someDatasource.get(recordId);

        // then
        expect(cache.get).to.have.been.calledWith(cacheKey);
      });
    });

    context('(error cases)', () => {

      it('should throw an LearningContentResourceNotFound if record was not found', () => {
        // given
        const learningContent = {
          learningContentModel: [
            { id: 'rec1', property: 'value1' },
            { id: 'rec2', property: 'value2' },
          ],
        };
        sinon.stub(lcms, 'getLatestRelease').resolves(learningContent);

        // when
        const promise = someDatasource.get('UNKNOWN_RECORD_ID');

        // then
        return expect(promise).to.have.been.rejectedWith(LearningContentResourceNotFound);
      });

      it('should dispatch error in case of generic error', () => {
        // given
        const err = new Error();
        sinon.stub(lcms, 'getLatestRelease').rejects(err);

        // when
        const promise = someDatasource.get(recordId);

        // then
        return expect(promise).to.have.been.rejectedWith(err);
      });
    });
  });

  describe('#list', () => {
    let learningContent;

    beforeEach(() => {
      cache.get.withArgs(someDatasource.modelName).callsFake((cacheKey, generator) => generator());

      learningContent = {
        learningContentModel: [
          { id: 'rec1', property: 'value1' },
          { id: 'rec2', property: 'value2' },
        ],
      };
      sinon.stub(lcms, 'getLatestRelease').resolves(learningContent);
    });

    it('should fetch all the records of a given type from LCMS API (or its cached copy)', async () => {
      // when
      const learningContentModelObjects = await someDatasource.list();

      // then
      expect(learningContentModelObjects).to.deep.equal(learningContent.learningContentModel);
    });

    it('should correctly manage the `this` context', async () => {
      // given
      const unboundList = someDatasource.list;

      // when
      const learningContentModelObjects = await unboundList();

      // then
      expect(learningContentModelObjects).to.deep.equal(learningContent.learningContentModel);
    });

    it('should be cachable', async () => {
      // when
      await someDatasource.list();

      // then
      expect(cache.get).to.have.been.calledWith(someDatasource.modelName);
    });
  });

  describe('#refreshLearningContentCacheRecords', () => {

    let learningContent;

    beforeEach(() => {
      cache.get.withArgs(someDatasource.modelName).callsFake((cacheKey, generator) => generator());
      sinon.stub(cache, 'set');
      learningContent = {
        learningContentModel: [
          { id: 'rec1', property: 'value1' },
          { id: 'rec2', property: 'value2' },
        ],
      };
      sinon.stub(lcms, 'getLatestRelease').resolves(learningContent);
    });

    it('should load all the Airtable table content in the cache (and return them)', async () => {
      // when
      const results = await dataSource.refreshLearningContentCacheRecords();

      // then
      expect(results).to.equal(learningContent);
    });

    it('should preload cache', async () => {
      // when
      await dataSource.refreshLearningContentCacheRecords();

      // then
      expect(cache.set).to.have.been.calledWith('LearningContent', learningContent);
    });
  });

  describe('#refreshLearningContentCacheRecord', () => {

    it('should force Airtable to reload the record and store or replace it in the cache', async () => {
      // given
      const airtableRecord = {
        id: 'recId',
        tableName: someDatasource.tableName,
        fields: [],
      };
      sinon.stub(airtable, 'getRecord')
        .withArgs(someDatasource.tableName, airtableRecord.id)
        .resolves(airtableRecord);
      sinon.stub(cache, 'set').callsFake((key, value) => value);

      // when
      const entry = await someDatasource.refreshLearningContentCacheRecord(airtableRecord.id);

      // then
      expect(entry).to.deep.equal({
        id: 'recId',
        tableName: 'Airtable_table',
        fields: [],
      });
    });
  });
});
