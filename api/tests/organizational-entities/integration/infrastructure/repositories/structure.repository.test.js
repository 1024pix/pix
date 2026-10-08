import { expect } from 'chai';

import * as structureRepository from '../../../../../src/organizational-entities/infrastructure/repositories/structure.repository.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Organizational Entities | Infrastructure | Repositories | structure', function () {
  describe('#findByOrganizationId', function () {
    describe('when organization has a structure', function () {
      it('returns the structure', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const categoryId = databaseBuilder.factory.buildStructureCategory().id;
        const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure({
          certificationCenterId,
          categoryId,
        });

        await databaseBuilder.commit();

        const expectedStructure = domainBuilder.acquisition.buildStructure({
          id: structure.id,
          organizationId: organization.id,
          certificationCenterId,
          categoryId,
        });

        // when
        const foundStructure = await structureRepository.findByOrganizationId({ organizationId: organization.id });

        // then
        expect(foundStructure).to.deepEqualInstance(expectedStructure);
      });
    });

    describe('when organization has no structure', function () {
      it('returns null', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        await databaseBuilder.commit();

        // when
        const foundStructure = await structureRepository.findByOrganizationId({ organizationId: organization.id });

        // then
        expect(foundStructure).to.be.null;
      });
    });
  });

  describe('#findByCertificationCenterId', function () {
    describe('when certification center has a structure', function () {
      it('returns the structure', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const { certificationCenter, structure } = databaseBuilder.factory.buildCertificationCenterWithStructure({
          organizationId,
        });

        await databaseBuilder.commit();

        const expectedStructure = domainBuilder.acquisition.buildStructure({
          id: structure.id,
          organizationId,
          certificationCenterId: certificationCenter.id,
        });

        // when
        const foundStructure = await structureRepository.findByCertificationCenterId({
          certificationCenterId: certificationCenter.id,
        });

        // then
        expect(foundStructure).to.deepEqualInstance(expectedStructure);
      });
    });

    describe('when certification center has no structure', function () {
      it('returns null', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        await databaseBuilder.commit();

        // when
        const foundStructure = await structureRepository.findByCertificationCenterId({
          certificationCenterId: certificationCenter.id,
        });

        // then
        expect(foundStructure).to.be.null;
      });
    });
  });

  describe('#deleteStructure', function () {
    it('deletes the fact structure and the structure', async function () {
      // given
      const { structure } = databaseBuilder.factory.buildCertificationCenterWithStructure();
      await databaseBuilder.commit();

      // when
      await structureRepository.deleteStructure({ structureId: structure.id });

      // then
      const factStructureInDB = await knex('fct_structures').where({ structure_id: structure.id }).first();
      const structureInDB = await knex('structures').where({ id: structure.id }).first();
      expect(factStructureInDB).to.be.undefined;
      expect(structureInDB).to.be.undefined;
    });

    it('does not delete other structures', async function () {
      // given
      const { structure } = databaseBuilder.factory.buildCertificationCenterWithStructure();
      const { organization, structure: otherStructure } = databaseBuilder.factory.buildOrganizationWithStructure();
      await databaseBuilder.commit();

      // when
      await structureRepository.deleteStructure({ structureId: structure.id });

      // then
      const otherFactStructure = await knex('fct_structures').where({ organization_id: organization.id }).first();
      const otherStructureInDb = await knex('structures').where({ id: otherStructure.id }).first();
      expect(otherFactStructure.structure_id).to.equal(otherStructure.id);
      expect(otherStructureInDb).to.exist;
    });
  });

  describe('#save', function () {
    context('when the structure has an id', function () {
      it('updates the organization and certification center of the structure and returns it', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const newOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const { structure } = databaseBuilder.factory.buildOrganizationWithStructure();
        const { organization: otherOrganization } = databaseBuilder.factory.buildOrganizationWithStructure();
        await databaseBuilder.commit();
        const { count: structuresCountBefore } = await knex('structures').count().first();

        // when
        const savedStructure = await structureRepository.save(
          domainBuilder.acquisition.buildStructure({
            id: structure.id,
            organizationId: newOrganizationId,
            certificationCenterId,
          }),
        );

        // then
        expect(savedStructure).to.deepEqualInstance(
          domainBuilder.acquisition.buildStructure({
            id: structure.id,
            organizationId: newOrganizationId,
            certificationCenterId,
          }),
        );

        const factStructure = await knex('fct_structures').where({ structure_id: structure.id }).first();
        expect(factStructure.organization_id).to.equal(newOrganizationId);
        expect(factStructure.certification_center_id).to.equal(certificationCenterId);

        const otherFactStructure = await knex('fct_structures')
          .where({ organization_id: otherOrganization.id })
          .first();
        expect(otherFactStructure.certification_center_id).to.be.null;

        const { count: structuresCountAfter } = await knex('structures').count().first();
        expect(structuresCountAfter).to.equal(structuresCountBefore);
      });

      it('does not update the category of the structure', async function () {
        // given
        const categoryId = databaseBuilder.factory.buildStructureCategory().id;
        const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure({ categoryId });
        await databaseBuilder.commit();

        // when
        const savedStructure = await structureRepository.save(
          domainBuilder.acquisition.buildStructure({
            id: structure.id,
            organizationId: organization.id,
            categoryId: null,
          }),
        );

        // then
        const structureInDB = await knex('structures').where({ id: structure.id }).first();
        expect(structureInDB.category_id).to.equal(categoryId);
        expect(savedStructure.categoryId).to.equal(categoryId);
      });
    });

    context('when the structure has no id', function () {
      it('creates the structure', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const categoryId = databaseBuilder.factory.buildStructureCategory().id;
        await databaseBuilder.commit();

        // when
        const savedStructure = await structureRepository.save(
          domainBuilder.acquisition.buildStructure({ id: null, certificationCenterId, categoryId }),
        );

        // then
        const factStructureInDB = await knex('fct_structures').where({ structure_id: savedStructure.id }).first();
        expect(factStructureInDB.certification_center_id).to.equal(certificationCenterId);
        expect(factStructureInDB.organization_id).to.be.null;
        const structureInDB = await knex('structures').where({ id: savedStructure.id }).first();
        expect(structureInDB.category_id).to.equal(categoryId);
        expect(savedStructure).to.deepEqualInstance(
          domainBuilder.acquisition.buildStructure({
            id: savedStructure.id,
            organizationId: null,
            certificationCenterId,
            categoryId,
          }),
        );
      });
    });
  });
});
