import { expect } from 'chai';
import sinon from 'sinon';

import { CreateStructureForEveryCertificationCenterScript } from '../../../../src/organizational-entities/scripts/create-structure-for-every-certification-center.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | Organizational Entities | Scripts | Create structure for every certification center', function () {
  let logger, script;

  beforeEach(async function () {
    logger = { info: sinon.stub(), error: sinon.stub() };
    script = new CreateStructureForEveryCertificationCenterScript();
  });

  afterEach(async function () {
    await knex('fct_structures').delete();
    await knex('structures').delete();
  });

  describe('when no certification centers have a structure', function () {
    it('should create fct_structures matching existing certification center ids and with no duplicates of certification center ids', async function () {
      // given
      const certificationCenter2 = await databaseBuilder.factory.buildCertificationCenter();
      const certificationCenter1 = await databaseBuilder.factory.buildCertificationCenter();

      await databaseBuilder.commit();

      // when
      await script.handle({ options: { dryRun: false, chunkSize: 1, throttleDelay: 0 }, logger });

      // then
      const structures = await knex('structures');
      const factStructures = await knex('fct_structures');

      const certificationCenterIdsFromFactStructures = factStructures.map((fct) => fct.certification_center_id);

      const expectedCertificationCenterIdsFromFactStructures = [certificationCenter1.id, certificationCenter2.id];

      expect(structures.length).to.deep.equal(2);
      expect(factStructures.length).to.deep.equal(2);
      expect(certificationCenterIdsFromFactStructures).to.have.members(
        expectedCertificationCenterIdsFromFactStructures,
      );
    });

    it('should create fct_structures with no duplicates of structures ids', async function () {
      // given
      await databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.factory.buildCertificationCenter();

      await databaseBuilder.commit();

      // when
      await script.handle({ options: { dryRun: false, chunkSize: 1, throttleDelay: 0 }, logger });

      // then
      const factStructures = await knex('fct_structures');

      const structureIdsFromFactStructures = factStructures.map((fct) => fct.structure_id);

      const structureIdsFromFactStructuresWithNoDuplicates = new Set(structureIdsFromFactStructures);

      expect(structureIdsFromFactStructuresWithNoDuplicates.size).to.equal(structureIdsFromFactStructures.length);
    });
  });

  describe('when all certification centers already have a structure', function () {
    it('should not create structures and fct_structures.', async function () {
      // given
      await databaseBuilder.factory.buildCertificationCenterWithStructure();
      await databaseBuilder.factory.buildCertificationCenterWithStructure();

      await databaseBuilder.commit();

      // when
      await script.handle({ options: { dryRun: false, chunkSize: 1, throttleDelay: 0 }, logger });

      // then
      const structures = await knex('structures');
      const factStructures = await knex('fct_structures');

      expect(structures.length).to.deep.equal(2);
      expect(factStructures.length).to.deep.equal(2);
    });
  });

  describe("when some certification centers have a structure but others don't", function () {
    it('should create structures and fct_structures only for certification centers without structures', async function () {
      // given
      await databaseBuilder.factory.buildCertificationCenterWithStructure();
      await databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.factory.buildCertificationCenter();

      await databaseBuilder.commit();

      // when
      await script.handle({ options: { dryRun: false, chunkSize: 1, throttleDelay: 0 }, logger });

      // then
      const structures = await knex('structures');
      const factStructures = await knex('fct_structures');

      expect(structures.length).to.equal(3);
      expect(factStructures.length).to.equal(3);
    });
  });

  describe('when dryRun option is true', function () {
    it('should not commit', async function () {
      // given
      await databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.factory.buildCertificationCenter();

      await databaseBuilder.commit();

      const structuresBefore = await knex('structures');

      // when
      await script.handle({ options: { dryRun: true, chunkSize: 1, throttleDelay: 0 }, logger });

      // then
      const structuresAfter = await knex('structures');
      expect(structuresAfter.length).to.equal(structuresBefore.length);
    });
  });
});
