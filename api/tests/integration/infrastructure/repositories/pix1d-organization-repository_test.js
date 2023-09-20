import { expect, databaseBuilder, knex } from '../../../test-helper.js';
import * as pix1dOrganizationRepository from '../../../../lib/infrastructure/repositories/pix1d-organization-repository.js';

describe('Integration | Repository | Pix1d-organization', function () {
  describe('#save', function () {
    afterEach(async function () {
      await knex('pix1d-organizations').delete();
    });

    it('saves the given organization', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO-1D' });
      await databaseBuilder.commit();

      // when
      const code = await pix1dOrganizationRepository.save({ organizationId: organization.id });

      // then

      expect(code).to.equal('MINIPIXOU');
    });
  });
});
