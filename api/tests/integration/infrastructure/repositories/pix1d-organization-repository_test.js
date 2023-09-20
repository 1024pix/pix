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
      const result = await pix1dOrganizationRepository.save({ organizationId: organization.id, code: 'HAPPYY123' });

      // then
      expect(result).to.equal('HAPPYY123');
    });
  });
  describe('#isCodeAvailable', function () {
    beforeEach(async function () {
      databaseBuilder.factory.buildPix1dOrganisation({ code: 'BADOIT710' });
      await databaseBuilder.commit();
    });

    it('should resolve true if the code is available', async function () {
      // when
      const isCodeAvailable = await pix1dOrganizationRepository.isCodeAvailable('FRANCE998');

      // then
      expect(isCodeAvailable).to.be.true;
    });

    it('should resolve false if the code is not available', async function () {
      // when
      const isCodeAvailable = await pix1dOrganizationRepository.isCodeAvailable('BADOIT710');

      // then
      expect(isCodeAvailable).to.be.false;
    });
  });
});
