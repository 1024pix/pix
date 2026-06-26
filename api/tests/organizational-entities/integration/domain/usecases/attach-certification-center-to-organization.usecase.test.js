import { UnableToAttachCertificationCenterToOrganization } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCase | attach-certification-center-to-organization', function () {
  describe('success case', function () {
    it('attaches certification center to organization', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();

      await databaseBuilder.commit();

      // when
      await usecases.attachCertificationCenterToOrganization({
        organizationId: organization.id,
        certificationCenterId,
      });

      // then
      const organizationFactStructure = await knex('fct_structures')
        .where({ organization_id: organization.id })
        .first();

      expect(organizationFactStructure.certification_center_id).to.equal(certificationCenterId);
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
