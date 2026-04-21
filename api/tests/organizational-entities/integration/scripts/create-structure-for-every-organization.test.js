import sinon from 'sinon';

import { CreateStructureForEveryOrganizationScript } from '../../../../src/organizational-entities/scripts/create-structure-for-every-organization.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | Organizational Entities | Scripts | Create structure for every organization', function () {
  let logger, script;

  beforeEach(async function () {
    logger = { info: sinon.stub(), error: sinon.stub() };
    script = new CreateStructureForEveryOrganizationScript();
    await knex('fct_structures').delete();
    await knex('structures').delete();
  });

  describe('when no organizations have a structure', function () {
    it('should create fct_structures matching existing organization ids and with no duplicates of organizations ids', async function () {
      // given
      const organization2 = await databaseBuilder.factory.buildOrganization();
      const organization1 = await databaseBuilder.factory.buildOrganization();

      await databaseBuilder.commit();

      // when
      await script.handle({ options: { dryRun: false, chunkSize: 1, throttleDelay: 0 }, logger });

      // then
      const structures = await knex('structures');
      const factStructures = await knex('fct_structures');

      const organizationIdsFromFactStructures = factStructures.map((fct) => fct.organization_id);

      const expectedOrganizationIdsFromFactStructures = [organization1.id, organization2.id];

      expect(structures.length).to.deep.equal(2);
      expect(factStructures.length).to.deep.equal(2);
      expect(organizationIdsFromFactStructures).to.have.members(expectedOrganizationIdsFromFactStructures);
    });

    it('should create fct_structures with no duplicates of structures ids', async function () {
      // given
      await databaseBuilder.factory.buildOrganization();
      await databaseBuilder.factory.buildOrganization();

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

  describe('when all organizations already have a structure', function () {
    it('should not create structures and fct_structures.', async function () {
      // given
      const organization1 = await databaseBuilder.factory.buildOrganization();
      const organization2 = await databaseBuilder.factory.buildOrganization();

      const structure1 = await databaseBuilder.factory.buildStructure();
      const structure2 = await databaseBuilder.factory.buildStructure();

      await databaseBuilder.factory.buildFactStructure({
        structureId: structure1.id,
        organizationId: organization1.id,
      });
      await databaseBuilder.factory.buildFactStructure({
        structureId: structure2.id,
        organizationId: organization2.id,
      });

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

  describe("when some organizations have a structure but others don't", function () {
    it('should create structures and fct_structures only for organizations without structures', async function () {
      // given
      const organization1 = await databaseBuilder.factory.buildOrganization();
      await databaseBuilder.factory.buildOrganization();
      await databaseBuilder.factory.buildOrganization();

      const structure1 = await databaseBuilder.factory.buildStructure();

      await databaseBuilder.factory.buildFactStructure({
        structureId: structure1.id,
        organizationId: organization1.id,
      });

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
      await databaseBuilder.factory.buildOrganization();
      await databaseBuilder.factory.buildOrganization();

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
