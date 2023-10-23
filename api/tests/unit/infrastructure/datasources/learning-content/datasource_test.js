import { expect, sinon } from '../../../../test-helper.js';
import * as dataSource from '../../../../../lib/infrastructure/datasources/learning-content/datasource.js';
import { lcms } from '../../../../../lib/infrastructure/lcms.js';
import { LearningContentResourceNotFound } from '../../../../../lib/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { learningContentCache } from '../../../../../lib/infrastructure/caches/learning-content-cache.js';

describe('Unit | Infrastructure | Datasource | Learning Content | datasource', function () {
  let someDatasource;

  beforeEach(function () {
    sinon.stub(learningContentCache, 'get');
    someDatasource = dataSource.extend({
      modelName: 'learningContentModel',
    });
  });

  describe('#get', function () {
    beforeEach(function () {
      learningContentCache.get.callsFake((generator) => generator());
    });

    context('(success cases)', function () {
      let learningContent;

      beforeEach(function () {
        learningContent = {
          learningContentModel: [
            { id: 'rec1', property: 'value1' },
            { id: 'rec2', property: 'value2' },
          ],
        };
        sinon.stub(lcms, 'getLatestRelease').resolves(learningContent);
      });

      it('should fetch a single record from LCMS API (or its cached copy)', async function () {
        // when
        const record = await someDatasource.get('rec1');

        // then
        expect(record).to.deep.equal({ id: 'rec1', property: 'value1' });
      });

      it('should correctly manage the `this` context', async function () {
        // given
        const unboundGet = someDatasource.get;

        // when
        const record = await unboundGet('rec1');

        // then
        expect(record).to.deep.equal({ id: 'rec1', property: 'value1' });
      });

      it('should be cachable', async function () {
        // when
        await someDatasource.get('rec1');

        // then
        expect(learningContentCache.get).to.have.been.called;
      });
    });

    context('(error cases)', function () {
      it('should throw an LearningContentResourceNotFound if record was not found', function () {
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

      it('should dispatch error in case of generic error', function () {
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

  describe('#getMany', function () {
    let learningContent;

    beforeEach(function () {
      learningContentCache.get.callsFake((generator) => generator());

      learningContent = {
        learningContentModel: [
          { id: 'rec1', property: 'value1' },
          { id: 'rec2', property: 'value2' },
          { id: 'rec3', property: 'value3' },
        ],
      };
      sinon.stub(lcms, 'getLatestRelease').resolves(learningContent);
    });

    it('should fetch all records from LCMS API corresponfing to the ids passed', async function () {
      // when
      const result = await someDatasource.getMany(['rec1', 'rec2']);

      // then
      expect(result).to.deep.equal([
        { id: 'rec1', property: 'value1' },
        { id: 'rec2', property: 'value2' },
      ]);
    });

    it('should throw an LearningContentResourceNotFound if no record was found', function () {
      // when
      const promise = someDatasource.getMany(['UNKNOWN_RECORD_ID']);

      // then
      return expect(promise).to.have.been.rejectedWith(LearningContentResourceNotFound);
    });
  });

  describe('#list', function () {
    let learningContent;

    beforeEach(function () {
      learningContentCache.get.callsFake((generator) => generator());

      learningContent = {
        learningContentModel: [
          { id: 'rec1', property: 'value1' },
          { id: 'rec2', property: 'value2' },
        ],
      };
      sinon.stub(lcms, 'getLatestRelease').resolves(learningContent);
    });

    it('should fetch all the records of a given type from LCMS API (or its cached copy)', async function () {
      // when
      const learningContentModelObjects = await someDatasource.list();

      // then
      expect(learningContentModelObjects).to.deep.equal(learningContent.learningContentModel);
    });

    it('should correctly manage the `this` context', async function () {
      // given
      const unboundList = someDatasource.list;

      // when
      const learningContentModelObjects = await unboundList();

      // then
      expect(learningContentModelObjects).to.deep.equal(learningContent.learningContentModel);
    });

    it('should be cachable', async function () {
      // when
      await someDatasource.list();

      // then
      expect(learningContentCache.get).to.have.been.called;
    });
  });

  describe('#refreshLearningContentCacheRecords', function () {
    let learningContent;

    beforeEach(function () {
      learningContentCache.get.withArgs(someDatasource.modelName).callsFake((generator) => generator());
      sinon.stub(learningContentCache, 'set');
      learningContent = {
        learningContentModel: [
          { id: 'rec1', property: 'value1' },
          { id: 'rec2', property: 'value2' },
        ],
      };
      sinon.stub(lcms, 'getLatestRelease').resolves(learningContent);
    });

    it('should load all the learning content table content in the cache (and return them)', async function () {
      // when
      const results = await dataSource.refreshLearningContentCacheRecords();

      // then
      expect(results).to.equal(learningContent);
    });

    it('should preload cache', async function () {
      // when
      await dataSource.refreshLearningContentCacheRecords();

      // then
      expect(learningContentCache.set).to.have.been.calledWithExactly(learningContent);
    });
  });

  describe('#refreshLearningContentCacheRecord', function () {
    context('when record id is already in the cache', function () {
      it('should replace the existing record by given record in the cache', async function () {
        // given
        const record = { id: 'rec1', property: 'updatedValue' };
        const learningContent = {
          learningContentModel: [
            null,
            { id: 'rec1', property: 'value1', oldProperty: 'value' },
            { id: 'rec2', property: 'value2' },
          ],
          learningContentOtherModel: [{ id: 'rec3', property: 'value3' }],
        };
        learningContentCache.get.resolves(learningContent);
        sinon.stub(learningContentCache, 'patch').resolves();

        // when
        const entry = await someDatasource.refreshLearningContentCacheRecord('rec1', record);

        // then
        expect(entry).to.deep.equal({
          id: 'rec1',
          property: 'updatedValue',
        });
        expect(learningContentCache.patch).to.have.been.calledWith({
          operation: 'assign',
          path: 'learningContentModel[1]',
          value: record,
        });
      });
    });

    context('when record id is not in the cache', function () {
      it('should insert the given record in the cache', async function () {
        // given
        const record = { id: 'rec4', property: 'newValue' };
        const learningContent = {
          learningContentModel: [null, { id: 'rec1', property: 'value1' }, { id: 'rec2', property: 'value2' }],
          learningContentOtherModel: [{ id: 'rec3', property: 'value3' }],
        };
        learningContentCache.get.resolves(learningContent);
        sinon.stub(learningContentCache, 'patch').resolves();

        // when
        const entry = await someDatasource.refreshLearningContentCacheRecord('rec4', record);

        // then
        expect(entry).to.deep.equal({
          id: 'rec4',
          property: 'newValue',
        });
        expect(learningContentCache.patch).to.have.been.calledWith({
          operation: 'push',
          path: 'learningContentModel',
          value: record,
        });
      });
    });
  });
});
