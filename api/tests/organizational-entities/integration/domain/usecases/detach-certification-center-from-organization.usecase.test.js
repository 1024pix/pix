import { expect } from 'chai';

import { OrganizationNotFound } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
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

    it('creates a dedicated structure for the certification center with the organization category', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const categoryId = databaseBuilder.factory.buildStructureCategory().id;
      const { organization, structure: organizationStructure } = databaseBuilder.factory.buildOrganizationWithStructure(
        { certificationCenterId, categoryId },
      );

      await databaseBuilder.commit();

      // when
      await usecases.detachCertificationCenterFromOrganization({
        organizationId: organization.id,
      });

      // then
      const certificationCenterFactStructures = await knex('fct_structures').where({
        certification_center_id: certificationCenterId,
      });
      expect(certificationCenterFactStructures).to.have.lengthOf(1);
      const [certificationCenterFactStructure] = certificationCenterFactStructures;
      expect(certificationCenterFactStructure.organization_id).to.be.null;
      expect(certificationCenterFactStructure.structure_id).to.not.equal(organizationStructure.id);

      const certificationCenterStructure = await knex('structures')
        .where({ id: certificationCenterFactStructure.structure_id })
        .first();
      expect(certificationCenterStructure.category_id).to.equal(categoryId);
    });

    context('when organization has no attached certification center', function () {
      it('does not create any structure', async function () {
        // given
        const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();
        await databaseBuilder.commit();
        const { count: structuresCountBefore } = await knex('structures').count().first();

        // when
        await usecases.detachCertificationCenterFromOrganization({
          organizationId: organization.id,
        });

        // then
        const { count: structuresCountAfter } = await knex('structures').count().first();
        expect(structuresCountAfter).to.equal(structuresCountBefore);
      });
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
