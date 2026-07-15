import { moduleRepository } from '../../../../../src/learning-content/infrastructure/repositories/module-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Learning Content | Integration | Repositories | Module', function () {
  afterEach(async function () {
    await knex('learningcontent.modules').truncate();
  });

  describe('#list', function () {
    it('should return a list of modules', async function () {
      // given
      databaseBuilder.factory.learningContent.buildModule();
      databaseBuilder.factory.learningContent.buildModule({ shortId: 'biduile' });
      await databaseBuilder.commit();

      // when
      const modules = await moduleRepository.list();

      // then
      expect(modules).length(2);
    });
  });
});
