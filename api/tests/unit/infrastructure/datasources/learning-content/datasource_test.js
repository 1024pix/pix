const { expect, sinon } = require('../../../../test-helper');
const dataSource = require('../../../../../lib/infrastructure/datasources/learning-content/datasource');
const lcms = require('../../../../../lib/infrastructure/lcms');
const LearningContentResourceNotFound = require('../../../../../lib/infrastructure/datasources/learning-content/LearningContentResourceNotFound');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');

describe('Unit | Infrastructure | Datasource | Learning Content | datasource', function() {

  beforeEach(function() {
    sinon.stub(cache, 'get');
  });

  const someDatasource = dataSource.extend({
    modelName: 'learningContentModel',
  });

  describe('#get', function() {

    beforeEach(function() {
      cache.get.callsFake((generator) => generator());
    });

    context('(success cases)', function() {

      let learningContent;

      beforeEach(function() {
        learningContent = {
          learningContentModel: [
            { id: 'rec1', property: 'value1' },
            { id: 'rec2', property: 'value2' },
          ],
        };
        sinon.stub(lcms, 'getLatestRelease').resolves(learningContent);
      });

      it('should fetch a single record from LCMS API (or its cached copy)', async function() {
        // when
        const record = await someDatasource.get('rec1');

        // then
        expect(record).to.deep.equal({ id: 'rec1', property: 'value1' });
      });

      it('should correctly manage the `this` context', async function() {
        // given
        const unboundGet = someDatasource.get;

        // when
        const record = await unboundGet('rec1');

        // then
        expect(record).to.deep.equal({ id: 'rec1', property: 'value1' });
      });

      it('should be cachable', async function() {
        // when
        await someDatasource.get('rec1');

        // then
        expect(cache.get).to.have.been.called;
      });
    });

    context('(error cases)', function() {

      it('should throw an LearningContentResourceNotFound if record was not found', function() {
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

      it('should dispatch error in case of generic error', function() {
        // given
        const err = new Error();
        sinon.stub(lcms, 'getLatestRelease').rejects(err);

        // when
        const promise = someDatasource.get('rec1');

        // then
        return expect(promise).to.have.been.rejectedWith(err);
      });
    });
  });

  describe('#list', function() {
    let learningContent;

    beforeEach(function() {
      cache.get.callsFake((generator) => generator());

      learningContent = {
        learningContentModel: [
          { id: 'rec1', property: 'value1' },
          { id: 'rec2', property: 'value2' },
        ],
      };
      sinon.stub(lcms, 'getLatestRelease').resolves(learningContent);
    });

    it('should fetch all the records of a given type from LCMS API (or its cached copy)', async function() {
      // when
      const learningContentModelObjects = await someDatasource.list();

      // then
      expect(learningContentModelObjects).to.deep.equal(learningContent.learningContentModel);
    });

    it('should correctly manage the `this` context', async function() {
      // given
      const unboundList = someDatasource.list;

      // when
      const learningContentModelObjects = await unboundList();

      // then
      expect(learningContentModelObjects).to.deep.equal(learningContent.learningContentModel);
    });

    it('should be cachable', async function() {
      // when
      await someDatasource.list();

      // then
      expect(cache.get).to.have.been.called;
    });
  });

  describe('#refreshLearningContentCacheRecords', function() {

    let learningContent;

    beforeEach(function() {
      cache.get.withArgs(someDatasource.modelName).callsFake((generator) => generator());
      sinon.stub(cache, 'set');
      learningContent = {
        learningContentModel: [
          { id: 'rec1', property: 'value1' },
          { id: 'rec2', property: 'value2' },
        ],
      };
      sinon.stub(lcms, 'getLatestRelease').resolves(learningContent);
    });

    it('should load all the learning content table content in the cache (and return them)', async function() {
      // when
      const results = await dataSource.refreshLearningContentCacheRecords();

      // then
      expect(results).to.equal(learningContent);
    });

    it('should preload cache', async function() {
      // when
      await dataSource.refreshLearningContentCacheRecords();

      // then
      expect(cache.set).to.have.been.calledWith(learningContent);
    });
  });

  describe('#refreshLearningContentCacheRecord', function() {

    it('should replace the record (identified with id) by given record and store or replace it in the cache', async function() {
      // given
      const record = { id: 'rec1', property: 'updatedValue' };
      const learningContent = {
        learningContentModel: [
          { id: 'rec1', property: 'value1' },
          { id: 'rec2', property: 'value2' },
        ],
        learningContentOtherModel: [
          { id: 'rec3', property: 'value3' },
        ],
      };
      cache.get.resolves(learningContent);
      sinon.stub(cache, 'set').callsFake((value) => value);

      // when
      const entry = await someDatasource.refreshLearningContentCacheRecord('rec1', record);

      // then
      expect(entry).to.deep.equal({
        id: 'rec1',
        property: 'updatedValue',
      });
      expect(cache.set).to.have.been.deep.calledWith({
        learningContentModel: [
          { id: 'rec2', property: 'value2' },
          { id: 'rec1', property: 'updatedValue' },
        ],
        learningContentOtherModel: [
          { id: 'rec3', property: 'value3' },
        ],
      });
    });
  });
});
