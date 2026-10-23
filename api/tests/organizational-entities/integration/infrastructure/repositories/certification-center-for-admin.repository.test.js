import { expect } from 'chai';
import sinon from 'sinon';

import { StructureNotFoundError } from '../../../../../src/organizational-entities/domain/errors.js';
import { AttachedCertificationCenter } from '../../../../../src/organizational-entities/domain/models/AttachedCertificationCenter.js';
import { CenterForAdmin } from '../../../../../src/organizational-entities/domain/models/CenterForAdmin.js';
import * as certificationCenterForAdminRepository from '../../../../../src/organizational-entities/infrastructure/repositories/certification-center-for-admin.repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Infrastructure | Repository | certification-center-for-admin', function () {
  const now = new Date('2021-11-16');

  beforeEach(function () {
    sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  describe('#save', function () {
    it('saves the given certification center', async function () {
      // given
      const certificationCenterName = 'CertificationCenterName';
      const certificationCenterType = 'SCO';
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const certificationCenterForAdmin = new CenterForAdmin({
        center: { name: certificationCenterName, type: certificationCenterType, createdBy: userId },
      });

      // when
      const savedCertificationCenter = await certificationCenterForAdminRepository.save(certificationCenterForAdmin);

      // then
      expect(savedCertificationCenter).to.be.instanceof(CenterForAdmin);
      expect(savedCertificationCenter.id).to.exist;
      expect(savedCertificationCenter.name).to.equal(certificationCenterName);
      expect(savedCertificationCenter.type).to.equal(certificationCenterType);
      expect(savedCertificationCenter.createdBy).to.equal(userId);
    });
  });

  describe('#update', function () {
    let center;

    before(async function () {
      // given
      center = databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.commit();
    });

    it('updates the given certification center', async function () {
      // when
      await certificationCenterForAdminRepository.update({
        id: center.id,
        name: 'Great Oak Certification Center',
        updatedAt: now,
      });

      // then
      const updatedCertificationCenter = await knex('certification-centers').select().where({ id: center.id }).first();
      expect(updatedCertificationCenter).to.deep.equal({
        ...center,
        name: 'Great Oak Certification Center',
        updatedAt: updatedCertificationCenter.updatedAt,
      });
    });

    it('updates the category of the certification center structure', async function () {
      // given
      const categoryId = databaseBuilder.factory.buildStructureCategory({ label: 'Nouvelle catégorie' }).id;
      const { certificationCenter, structure } = databaseBuilder.factory.buildCertificationCenterWithStructure({});
      await databaseBuilder.commit();
      const certificationCenterForAdmin = new CenterForAdmin({
        center: { ...certificationCenter, categoryId },
      });

      // when
      await certificationCenterForAdminRepository.update(certificationCenterForAdmin);

      // then
      const updatedStructure = await knex('structures').where({ id: structure.id }).first();
      expect(updatedStructure.category_id).to.equal(categoryId);
    });

    it('does not update the structure of another certification center', async function () {
      // given
      const categoryId = databaseBuilder.factory.buildStructureCategory({ label: 'Nouvelle catégorie' }).id;
      const { certificationCenter } = databaseBuilder.factory.buildCertificationCenterWithStructure({});
      const { structure: otherStructure } = databaseBuilder.factory.buildCertificationCenterWithStructure({});
      await databaseBuilder.commit();
      const certificationCenterForAdmin = new CenterForAdmin({
        center: { ...certificationCenter, categoryId },
      });

      // when
      await certificationCenterForAdminRepository.update(certificationCenterForAdmin);

      // then
      const untouchedStructure = await knex('structures').where({ id: otherStructure.id }).first();
      expect(untouchedStructure.category_id).to.be.null;
    });

    it('does not clear the category when no category is given', async function () {
      // given
      const { certificationCenter, structureId, categoryId, structureUpdatedAt } =
        _buildCertificationCenterWithCategorizedStructure();
      await databaseBuilder.commit();
      const certificationCenterForAdmin = new CenterForAdmin({
        center: { ...certificationCenter, categoryId: undefined },
      });

      // when
      await certificationCenterForAdminRepository.update(certificationCenterForAdmin);

      // then
      const untouchedStructure = await knex('structures').where({ id: structureId }).first();
      expect(untouchedStructure.category_id).to.equal(categoryId);
      expect(untouchedStructure.updated_at).to.deep.equal(structureUpdatedAt);
    });

    it('does not write the structure when the category is unchanged', async function () {
      // given
      const { certificationCenter, structureId, categoryId, structureUpdatedAt } =
        _buildCertificationCenterWithCategorizedStructure();
      await databaseBuilder.commit();
      const certificationCenterForAdmin = new CenterForAdmin({
        center: { ...certificationCenter, categoryId },
      });

      // when
      await certificationCenterForAdminRepository.update(certificationCenterForAdmin);

      // then
      const untouchedStructure = await knex('structures').where({ id: structureId }).first();
      expect(untouchedStructure.updated_at).to.deep.equal(structureUpdatedAt);
    });

    it('throws a StructureNotFoundError when the certification center has no structure', async function () {
      // given
      const categoryId = databaseBuilder.factory.buildStructureCategory({ label: 'Nouvelle catégorie' }).id;
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ withoutStructure: true });
      await databaseBuilder.commit();
      const certificationCenterForAdmin = new CenterForAdmin({
        center: { ...certificationCenter, categoryId },
      });

      // when
      const error = await catchErr(certificationCenterForAdminRepository.update)(certificationCenterForAdmin);

      // then
      expect(error).to.be.instanceOf(StructureNotFoundError);
      expect(error.meta.certificationCenterId).to.equal(certificationCenter.id);
    });
  });

  describe('#archive', function () {
    it('archives the given certification center', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      const archiveDate = new Date(2021, 10, 31);

      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
        updatedAt: new Date(2021, 12, 3),
      });
      const otherCertificationCenter = databaseBuilder.factory.buildCertificationCenter({
        updatedAt: new Date(2021, 12, 3),
      });

      await databaseBuilder.commit();

      // when
      await certificationCenterForAdminRepository.archive({
        certificationCenterId: certificationCenter.id,
        archivedBy: superAdminUserId,
        archiveDate,
      });

      // then
      const archivedCertificationCenter = await knex('certification-centers')
        .where({ id: certificationCenter.id })
        .first();

      expect(archivedCertificationCenter.archivedBy).to.equal(superAdminUserId);
      expect(archivedCertificationCenter.archivedAt).to.deep.equal(archiveDate);

      const nonArchivedCertificationCenter = await knex('certification-centers')
        .where({ id: otherCertificationCenter.id })
        .first();
      expect(nonArchivedCertificationCenter).to.deep.equal(otherCertificationCenter);
    });

    describe('when certification center does not exist', function () {
      it('throws NotFoundError', async function () {
        // given
        const certificationCenterId = 1;
        const archiveDate = new Date(2021, 10, 31);

        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
        await databaseBuilder.commit();

        // when
        await expect(
          certificationCenterForAdminRepository.archive({
            certificationCenterId,
            archivedBy: superAdminUserId,
            archiveDate,
          }),
        ).to.be.rejectedWith(NotFoundError);
      });
    });
  });

  describe('#findAttachedByOrganizationId', function () {
    describe('when a given organization is linked to a certification center', function () {
      it('returns certification center linked to a given organization', async function () {
        // given
        const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          organizationId: organization.id,
        }).id;

        await databaseBuilder.commit();

        // when
        const foundCertificationCenter = await certificationCenterForAdminRepository.findAttachedByOrganizationId(
          organization.id,
        );

        // then
        expect(foundCertificationCenter).to.have.lengthOf(1);
        expect(foundCertificationCenter[0].id).to.equal(certificationCenterId);
        expect(foundCertificationCenter[0]).to.be.instanceOf(AttachedCertificationCenter);
      });

      it('does not return certification center linked to another organization', async function () {
        // given
        const { organization: firstOrganization } = databaseBuilder.factory.buildOrganizationWithStructure();
        const firstCertificationCenter = databaseBuilder.factory.buildCertificationCenter({
          organizationId: firstOrganization.id,
        });

        const { organization: secondOrganization } = databaseBuilder.factory.buildOrganizationWithStructure();
        databaseBuilder.factory.buildCertificationCenter({ organizationId: secondOrganization.id });

        await databaseBuilder.commit();

        // when
        const foundCertificationCenter = await certificationCenterForAdminRepository.findAttachedByOrganizationId(
          firstOrganization.id,
        );

        // then
        expect(foundCertificationCenter[0].id).to.equal(firstCertificationCenter.id);
      });
    });

    describe('when a given organization has no linked certification center', function () {
      it('returns an empty array', async function () {
        // given
        const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();
        await databaseBuilder.commit();

        // when
        const foundCertificationCenter = await certificationCenterForAdminRepository.findAttachedByOrganizationId(
          organization.id,
        );

        // then
        expect(foundCertificationCenter).to.be.an('array').that.is.empty;
      });
    });
  });

  function _buildCertificationCenterWithCategorizedStructure() {
    const structureUpdatedAt = new Date('2020-01-01');
    const categoryId = databaseBuilder.factory.buildStructureCategory({ label: 'Catégorie initiale' }).id;
    const structure = databaseBuilder.factory.buildStructure({ categoryId, updatedAt: structureUpdatedAt });
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ structureId: structure.id });

    return { certificationCenter, structureId: structure.id, categoryId, structureUpdatedAt };
  }
});
