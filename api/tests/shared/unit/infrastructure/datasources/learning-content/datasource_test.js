import { learningContentCache } from '../../../../../../src/shared/infrastructure/caches/learning-content-cache.js';
import * as dataSource from '../../../../../../src/shared/infrastructure/datasources/learning-content/datasource.js';
import { LearningContentResourceNotFound } from '../../../../../../src/shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Infrastructure | Datasource | Learning Content | datasource', function () {
  let someDatasource;

  beforeEach(function () {
    sinon.stub(learningContentCache, 'get');
    someDatasource = dataSource.extend({
      modelName: 'learningContentModel',
    });
  });

  describe('#get', function () {
    let learningContent;

    beforeEach(function () {
      learningContent = {
        learningContentModel: [
          { id: 'rec1', property: 'value1' },
          { id: 'rec2', property: 'value2' },
        ],
      };
      learningContentCache.get.resolves(learningContent);
    });

    context('(success cases)', function () {
      it('should fetch a single record from the learning content cache', async function () {
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
        learningContentCache.get.resolves(learningContent);

        // when
        const promise = someDatasource.get('UNKNOWN_RECORD_ID');

        // then
        return expect(promise).to.have.been.rejectedWith(LearningContentResourceNotFound);
      });

      it('should dispatch error in case of generic error', function () {
        // given
        const err = new Error();
        learningContentCache.get.rejects(err);

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
      learningContent = {
        learningContentModel: [
          { id: 'rec1', property: 'value1' },
          { id: 'rec2', property: 'value2' },
          { id: 'rec3', property: 'value3' },
        ],
      };
      learningContentCache.get.resolves(learningContent);
    });

    it('should fetch all records from Learning content cached corresponding to the ids passed', async function () {
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
      learningContent = {
        learningContentModel: [
          { id: 'rec1', property: 'value1' },
          { id: 'rec2', property: 'value2' },
        ],
      };
      learningContentCache.get.resolves(learningContent);
    });

    it('should fetch all the records of a given type from Learning content cache', async function () {
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
});
