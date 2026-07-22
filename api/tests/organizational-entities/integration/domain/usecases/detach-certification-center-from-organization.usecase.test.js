import { OrganizationNotFound } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCase | detach-certification-center-from-organization', function () {
  describe('success case', function () {
    it('detaches certification center from organization', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const { organization } = databaseBuilder.factory.buildOrganizationWithStructure({
        certificationCenterId,
      });

      await databaseBuilder.commit();

      // when
      await usecases.detachCertificationCenterFromOrganization({
        organizationId: organization.id,
      });

      // then
      const organizationFactStructure = await knex('fct_structures')
        .where({ organization_id: organization.id })
        .first();

      expect(organizationFactStructure.certification_center_id).to.equal(null);
    });
  });

  describe('error cases', function () {
    context('when organization does not exist', function () {
      it('throws an OrganizationNotFound error', async function () {
        // given
        const unknownOrganizationId = 999;

        // when
        const error = await catchErr(usecases.detachCertificationCenterFromOrganization)({
          organizationId: unknownOrganizationId,
        });

        // then
        expect(error).to.be.instanceOf(OrganizationNotFound);
        expect(error.code).to.equal('ORGANIZATION_NOT_FOUND');
        expect(error.meta.organizationId).to.equal(unknownOrganizationId);
      });
    });
  });
});
