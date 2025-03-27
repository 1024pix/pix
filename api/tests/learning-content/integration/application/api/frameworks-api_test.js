import * as frameworksApi from '../../../../../src/learning-content/application/api/frameworks-api.js';
import { FrameworkDTO } from '../../../../../src/learning-content/application/api/models/FrameworkDTO.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

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
});
