import * as frameworksApi from '../../../../../src/learning-content/application/api/frameworks-api.js';
import { FrameworkDTO } from '../../../../../src/learning-content/application/api/models/FrameworkDTO.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect } from '../../../../test-helper.js';

describe('LearningContent | Integration | Application | Api | frameworks', function () {
  describe('#list', function () {
    it('should return an empty array when no frameworks found', async function () {
      // when
      const emptyFrameworkDTOs = await frameworksApi.list();

      // then
      expect(emptyFrameworkDTOs).to.deep.equal([]);
    });

    it('should return the framework DTOs when frameworks found', async function () {
      // given
      databaseBuilder.factory.learningContent.buildFramework({
        id: 'recId0',
        name: 'mon framework 0',
      });
      databaseBuilder.factory.learningContent.buildFramework({
        id: 'recId1',
        name: 'mon framework 1',
      });
      await databaseBuilder.commit();

      // when
      const frameworkDTOs = await frameworksApi.list();

      // then
      expect(frameworkDTOs).to.deepEqualArray([
        new FrameworkDTO({ id: 'recId0', name: 'mon framework 0' }),
        new FrameworkDTO({ id: 'recId1', name: 'mon framework 1' }),
      ]);
    });
  });

  describe('#findByNames', function () {
    it('should return an empty array when invalid or empty array of names given', async function () {
      // when
      const emptyFrameworkDTOs1 = await frameworksApi.findByNames({ somethingElse: 'coucou' });
      const emptyFrameworkDTOs2 = await frameworksApi.findByNames({ names: null });
      const emptyFrameworkDTOs3 = await frameworksApi.findByNames({ names: [] });
      const emptyFrameworkDTOs4 = await frameworksApi.findByNames({ names: 'coucou' });

      // then
      expect(emptyFrameworkDTOs1).to.deep.equal([]);
      expect(emptyFrameworkDTOs2).to.deep.equal([]);
      expect(emptyFrameworkDTOs3).to.deep.equal([]);
      expect(emptyFrameworkDTOs4).to.deep.equal([]);
    });

    it('should return the framework DTOs when frameworks found by name', async function () {
      // given
      databaseBuilder.factory.learningContent.buildFramework({
        id: 'recId0',
        name: 'mon framework 0',
      });
      databaseBuilder.factory.learningContent.buildFramework({
        id: 'recId1',
        name: 'mon framework 1',
      });
      databaseBuilder.factory.learningContent.buildFramework({
        id: 'recId2',
        name: 'mon framework 2',
      });
      await databaseBuilder.commit();

      // when
      const frameworkDTOs = await frameworksApi.findByNames({
        names: ['mon framework 2', 'mon framework 0'],
      });

      // then
      expect(frameworkDTOs).to.deepEqualArray([
        new FrameworkDTO({ id: 'recId2', name: 'mon framework 2' }),
        new FrameworkDTO({ id: 'recId0', name: 'mon framework 0' }),
      ]);
    });

    it('should throw a NotFoundError when a given name does not refer to an actual framework', async function () {
      // given
      databaseBuilder.factory.learningContent.buildFramework({
        id: 'recId0',
        name: 'mon framework 0',
      });
      await databaseBuilder.commit();

      // when
      const err = await catchErr(frameworksApi.findByNames)({
        names: ['zouzou', 'mon framework 0'],
      });

      // then
      expect(err).to.be.instanceOf(NotFoundError);
      expect(err.message).to.equal('Framework not found for name zouzou');
    });
  });
});
