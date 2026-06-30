import { DatabaseBuilder } from '../../../../db/database-builder/database-builder.js';
import { createOrganization } from '../../../../db/seeds/data/common/tooling/organization-tooling.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../databases.js';

describe('Integration | Tooling | DatabaseBuilder | database-builder', function () {
  describe('#create', function () {
    it('returns an initialised instance of DatabaseBuilder', async function () {
      // when
      const databaseBuilder = await DatabaseBuilder.create({ knex });

      // then
      expect(databaseBuilder).to.be.an.instanceOf(DatabaseBuilder);
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
