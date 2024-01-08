import { databaseBuilder, expect, knex } from '../../../test-helper.js';
import { DatabaseBuilder } from '../../../../db/database-builder/database-builder.js';
import { createOrganization } from '../../../../db/seeds/data/common/tooling/organization-tooling.js';

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

  describe('#clean', function () {
    context('when there is circular references', function () {
      it('cleans properly the database', async function () {
        // given
        const grandParentOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const parentOrganizationId = databaseBuilder.factory.buildOrganization({
          parentOrganizationId: grandParentOrganizationId,
        }).id;
        databaseBuilder.factory.buildOrganization({ parentOrganizationId });
        const tagIds = [
          databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' }).id,
          databaseBuilder.factory.buildTag({ name: 'PUBLIC' }).id,
        ];

        await createOrganization({ databaseBuilder, tagIds, parentOrganizationId });

        await databaseBuilder.commit();

        // when
        // then
        expect(async () => await databaseBuilder.clean()).to.not.throw();
      });
    });
  });
});
