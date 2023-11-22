import { expect, knex } from '../../../test-helper.js';
import { DatabaseBuilder } from '../../../../db/database-builder/database-builder.js';

describe('Integration | Tooling | DatabaseBuilder | database-builder', function () {
  describe('#create', function () {
    it('returns an initialised instance of DatabaseBuilder', async function () {
      // given
      // when
      const databaseBuilder = await DatabaseBuilder.create({ knex });

      // then
      expect(databaseBuilder).to.be.an.instanceOf(DatabaseBuilder);
      expect(databaseBuilder.isFirstCommit).to.be.false;
    });
  });
});
