import { expect } from 'chai';

import { UnableToAttachCertificationCenterToOrganization } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCase | attach-certification-center-to-organization', function () {
  describe('success case', function () {
    context('when certification center has its own structure', function () {
      it('deletes its structure and attaches it to the organization structure', async function () {
        // given
        const organizationCategoryId = databaseBuilder.factory.buildStructureCategory({ label: 'Orga category' }).id;
        const certificationCenterCategoryId = databaseBuilder.factory.buildStructureCategory({
          label: 'CDC category',
        }).id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const certificationCenterStructureId = databaseBuilder.factory.buildStructure({
          categoryId: certificationCenterCategoryId,
        }).id;
        databaseBuilder.factory.buildFactStructure({
          structureId: certificationCenterStructureId,
          certificationCenterId,
        });
        const { organization, structure: organizationStructure } =
          databaseBuilder.factory.buildOrganizationWithStructure({ categoryId: organizationCategoryId });

        await databaseBuilder.commit();

        // when
        await usecases.attachCertificationCenterToOrganization({
          organizationId: organization.id,
          certificationCenterId,
        });

        // then
        const certificationCenterFactStructures = await knex('fct_structures').where({
          certification_center_id: certificationCenterId,
        });
        expect(certificationCenterFactStructures).to.have.lengthOf(1);
        expect(certificationCenterFactStructures[0].organization_id).to.equal(organization.id);
        expect(certificationCenterFactStructures[0].structure_id).to.equal(organizationStructure.id);

        const deletedStructure = await knex('structures').where({ id: certificationCenterStructureId }).first();
        expect(deletedStructure).to.be.undefined;

        const keptStructure = await knex('structures').where({ id: organizationStructure.id }).first();
        expect(keptStructure.category_id).to.equal(organizationCategoryId);
      });
    });

    // TODO(PIX-24402): enlever ce test provisoire
    context('when certification center does not have a structure', function () {
      it('attaches it to the organization structure without deleting any structure', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
        await databaseBuilder.commit();

        // when
        await usecases.attachCertificationCenterToOrganization({
          organizationId: organization.id,
          certificationCenterId,
        });

        // then
        const factStructures = await knex('fct_structures').where({ certification_center_id: certificationCenterId });
        expect(factStructures).to.have.lengthOf(1);
        expect(factStructures[0].structure_id).to.equal(structure.id);

        const organizationStructure = await knex('structures').where({ id: structure.id }).first();
        expect(organizationStructure).to.exist;
      });
    });
  });

  describe('error cases', function () {
    context('when organization does not exist', function () {
      it('throws an UnableToAttachCertificationCenterToOrganization error', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const unknownOrganizationId = 999;

        await databaseBuilder.commit();

        // when
        const error = await catchErr(usecases.attachCertificationCenterToOrganization)({
          organizationId: unknownOrganizationId,
          certificationCenterId: certificationCenterId,
        });

        // then
        expect(error).to.be.instanceOf(UnableToAttachCertificationCenterToOrganization);
        expect(error.code).to.equal('ORGANIZATION_NOT_FOUND');
        expect(error.meta.organizationId).to.equal(unknownOrganizationId);
      });
    });

    context('when certification-center does not exist', function () {
      it('throws an UnableToAttachCertificationCenterToOrganization error', async function () {
        // given
        const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();
        const unknownCertificationCenterId = 999;

        await databaseBuilder.commit();

        // when
        const error = await catchErr(usecases.attachCertificationCenterToOrganization)({
          organizationId: organization.id,
          certificationCenterId: unknownCertificationCenterId,
        });

        // then
        expect(error).to.be.instanceOf(UnableToAttachCertificationCenterToOrganization);
        expect(error.code).to.equal('NON_EXISTING_CERTIFICATION_CENTER');
        expect(error.meta.certificationCenterId).to.equal(unknownCertificationCenterId);
        expect(error.meta.organizationId).to.equal(organization.id);
      });
    });

    context('when organization is already attached to another certification center', function () {
      it('throws an UnableToAttachCertificationCenterToOrganization error', async function () {
        // given
        const alreadyAttachedCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const { organization: alreadyAttachedOrganization } = databaseBuilder.factory.buildOrganizationWithStructure({
          certificationCenterId: alreadyAttachedCertificationCenterId,
        });

        const certificationCenterToAttach = databaseBuilder.factory.buildCertificationCenter();

        await databaseBuilder.commit();

        // when
        const error = await catchErr(usecases.attachCertificationCenterToOrganization)({
          organizationId: alreadyAttachedOrganization.id,
          certificationCenterId: certificationCenterToAttach.id,
        });

        // then
        expect(error).to.be.instanceOf(UnableToAttachCertificationCenterToOrganization);
        expect(error.code).to.equal('ALREADY_ATTACHED_ORGANIZATION');
        expect(error.meta.organizationId).to.equal(alreadyAttachedOrganization.id);
        expect(error.meta.alreadyAttachedCertificationCenterId).to.equal(alreadyAttachedCertificationCenterId);
      });
    });

    context('when certification-center is already attached to another organization', function () {
      it('throws an UnableToAttachCertificationCenterToOrganization error', async function () {
        // given
        const alreadyAttachedCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const { organization: alreadyAttachedOrganization } = databaseBuilder.factory.buildOrganizationWithStructure({
          certificationCenterId: alreadyAttachedCertificationCenterId,
        });

        const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();

        await databaseBuilder.commit();

        // when
        const error = await catchErr(usecases.attachCertificationCenterToOrganization)({
          organizationId: organization.id,
          certificationCenterId: alreadyAttachedCertificationCenterId,
        });

        // then
        expect(error).to.be.instanceOf(UnableToAttachCertificationCenterToOrganization);
        expect(error.code).to.equal('ALREADY_ATTACHED_CERTIFICATION_CENTER');
        expect(error.meta.certificationCenterId).to.equal(alreadyAttachedCertificationCenterId);
        expect(error.meta.organizationId).to.equal(organization.id);
        expect(error.meta.alreadyAttachedOrganizationId).to.equal(alreadyAttachedOrganization.id);
      });
    });
  });
});
