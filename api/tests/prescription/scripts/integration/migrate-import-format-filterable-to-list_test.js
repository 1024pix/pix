import sinon from 'sinon';

import { MigrateImportFormatFilterableToList } from '../../../../src/prescription/scripts/migrate-import-format-filterable-to-list.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/domain/constants.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Script | Prescription | Migrate import format filterable string to list', function () {
  const FORMAT_NAME = 'TEST_FORMAT';

  function buildFormatWithFilterableString({ name = FORMAT_NAME } = {}) {
    return databaseBuilder.factory.buildOrganizationLearnerImportFormat({
      name,
      fileType: 'csv',
      config: {
        unicityColumns: ['INE'],
        acceptedEncoding: ['utf8'],
        headers: [
          {
            name: 'Nom',
            required: true,
            config: { property: 'lastName', validate: { type: 'string', required: true } },
          },
          {
            name: 'Prénom',
            required: true,
            config: { property: 'firstName', validate: { type: 'string', required: true } },
          },
          {
            name: 'INE',
            required: true,
            config: { validate: { type: 'string', required: true } },
          },
          {
            name: 'Libellé classe',
            required: true,
            config: {
              validate: { type: 'string', required: true },
              displayable: { position: 1, name: 'division', filterable: { type: 'string' } },
            },
          },
        ],
      },
    });
  }

  function linkOrganizationToFormat({ organizationId, importFormatId }) {
    const feature = databaseBuilder.factory.buildFeature({ key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key });
    databaseBuilder.factory.buildOrganizationFeature({
      organizationId,
      featureId: feature.id,
      params: { organizationLearnerImportFormatId: importFormatId },
    });
  }

  describe('#handle', function () {
    it('migrates filterable.type from "string" to "list" in the format config', async function () {
      const importFormat = buildFormatWithFilterableString();
      await databaseBuilder.commit();

      const script = new MigrateImportFormatFilterableToList();
      const logger = { info: sinon.spy(), warn: sinon.spy(), error: sinon.spy() };

      await script.handle({ options: { names: [FORMAT_NAME], dryRun: false }, logger });

      const updatedFormat = await knex('organization-learner-import-formats').where({ id: importFormat.id }).first();
      const filterableHeader = updatedFormat.config.headers.find((header) => header.name === 'Libellé classe');
      expect(filterableHeader.config.displayable.filterable).to.deep.equal({ type: 'list' });
    });

    it('leaves untouched headers without filterable or with filterable.type !== "string"', async function () {
      const importFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
        name: FORMAT_NAME,
        config: {
          unicityColumns: ['INE'],
          acceptedEncoding: ['utf8'],
          headers: [
            {
              name: 'Nom',
              required: true,
              config: { property: 'lastName', validate: { type: 'string', required: true } },
            },
            {
              name: 'Prénom',
              required: true,
              config: { property: 'firstName', validate: { type: 'string', required: true } },
            },
            {
              name: 'Classe',
              required: true,
              config: {
                validate: { type: 'string', required: true },
                displayable: { position: 1, name: 'division', filterable: { type: 'list' } },
              },
            },
          ],
        },
      });
      await databaseBuilder.commit();

      const script = new MigrateImportFormatFilterableToList();
      const logger = { info: sinon.spy(), warn: sinon.spy(), error: sinon.spy() };

      await script.handle({ options: { names: [FORMAT_NAME], dryRun: false }, logger });

      const updatedFormat = await knex('organization-learner-import-formats').where({ id: importFormat.id }).first();
      const classeHeader = updatedFormat.config.headers.find((header) => header.name === 'Classe');
      expect(classeHeader.config.displayable.filterable).to.deep.equal({ type: 'list' });
      const nomHeader = updatedFormat.config.headers.find((header) => header.name === 'Nom');
      expect(nomHeader.config.displayable).to.be.undefined;
    });

    it('backfills organization_learner_filters with unique attribute values from existing learners', async function () {
      const importFormat = buildFormatWithFilterableString();
      const organization = databaseBuilder.factory.buildOrganization();
      linkOrganizationToFormat({ organizationId: organization.id, importFormatId: importFormat.id });

      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        attributes: { 'Libellé classe': '6A', INE: 'A1' },
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        attributes: { 'Libellé classe': '6B', INE: 'A2' },
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        attributes: { 'Libellé classe': '6A', INE: 'A3' },
      });

      await databaseBuilder.commit();

      const script = new MigrateImportFormatFilterableToList();
      const logger = { info: sinon.spy(), warn: sinon.spy(), error: sinon.spy() };

      await script.handle({ options: { names: [FORMAT_NAME], dryRun: false }, logger });

      const filters = await knex('organization_learner_filters').where({ organization_id: organization.id });
      expect(filters).to.have.lengthOf(1);
      expect(filters[0].attribute_name).to.equal('division');
      expect(filters[0].values).to.deep.equal(['6A', '6B']);
    });

    it('replaces existing organization_learner_filters rows for impacted organizations', async function () {
      const importFormat = buildFormatWithFilterableString();
      const organization = databaseBuilder.factory.buildOrganization();
      linkOrganizationToFormat({ organizationId: organization.id, importFormatId: importFormat.id });

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFilter({
        organizationId: organization.id,
        attributeName: 'stale-attribute',
        values: ['stale'],
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        attributes: { 'Libellé classe': '6A' },
      });
      await databaseBuilder.commit();

      const script = new MigrateImportFormatFilterableToList();
      const logger = { info: sinon.spy(), warn: sinon.spy(), error: sinon.spy() };

      await script.handle({ options: { names: [FORMAT_NAME], dryRun: false }, logger });

      const filters = await knex('organization_learner_filters').where({ organization_id: organization.id });
      expect(filters).to.have.lengthOf(1);
      expect(filters[0].attribute_name).to.equal('division');
    });

    it('does not persist changes when dryRun is true', async function () {
      const importFormat = buildFormatWithFilterableString();
      const organization = databaseBuilder.factory.buildOrganization();
      linkOrganizationToFormat({ organizationId: organization.id, importFormatId: importFormat.id });

      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        attributes: { 'Libellé classe': '6A' },
      });
      await databaseBuilder.commit();

      const script = new MigrateImportFormatFilterableToList();
      const logger = { info: sinon.spy(), warn: sinon.spy(), error: sinon.spy() };

      await script.handle({ options: { names: [FORMAT_NAME], dryRun: true }, logger });

      const reloadedFormat = await knex('organization-learner-import-formats').where({ id: importFormat.id }).first();
      const header = reloadedFormat.config.headers.find((h) => h.name === 'Libellé classe');
      expect(header.config.displayable.filterable).to.deep.equal({ type: 'string' });

      const filters = await knex('organization_learner_filters').where({ organization_id: organization.id });
      expect(filters).to.be.empty;
    });

    it('skips unknown format names with a warning', async function () {
      await databaseBuilder.commit();

      const script = new MigrateImportFormatFilterableToList();
      const logger = { info: sinon.spy(), warn: sinon.spy(), error: sinon.spy() };

      await script.handle({ options: { names: ['UNKNOWN_FORMAT'], dryRun: false }, logger });

      expect(logger.warn).to.have.been.calledWithMatch('UNKNOWN_FORMAT');
    });
  });
});
