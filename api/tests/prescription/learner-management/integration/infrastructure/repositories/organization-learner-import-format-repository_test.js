import { OrganizationLearnerImportFormat } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerImportFormat.js';
import * as organizationLearnerImportFormatRepository from '../../../../../../src/prescription/learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect, knex, sinon } from '../../../../../test-helper.js';

describe('Integration | Repository | Organization Learner Management | Organization Learner Import Format', function () {
  describe('#get', function () {
    it('should return import state', async function () {
      // given
      const importConfig = {
        name: 'MY_TEST_EXPORT',
        fileType: 'csv',
        config: {
          acceptedEncoding: ['utf-8'],
          unicityColumns: ['my_column1'],
          validationRules: {
            formats: [
              { name: 'my_column1', type: 'string' },
              { name: 'my_column2', type: 'string' },
            ],
          },
          headers: [
            { name: 'my_column1', required: true, property: 'lastName' },
            { name: 'my_column2', required: true, property: 'firstName' },
          ],
        },
      };

      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const featureId = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
      }).id;

      const organizationLearnerImportFormatId =
        databaseBuilder.factory.buildOrganizationLearnerImportFormat(importConfig).id;

      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId,
        params: { organizationLearnerImportFormatId },
      });

      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerImportFormatRepository.get(organizationId);

      // then
      expect(result).to.be.an.instanceOf(OrganizationLearnerImportFormat);
      expect(result).to.be.deep.equal(new OrganizationLearnerImportFormat(importConfig));
    });

    it('should return null if nothing was found', async function () {
      const result = await organizationLearnerImportFormatRepository.get(1);

      expect(result).to.equal(null);
    });
  });

  describe('#updateAllByName', function () {
    let clock;
    const now = new Date('2022-02-02');
    const updatedAt = new Date('2020-01-01');

    afterEach(function () {
      clock.restore();
    });

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

      // First format
      databaseBuilder.factory.buildOrganizationLearnerImportFormat({
        name: 'FIRST_FORMAT',
        fileType: 'xml',
        config: { basic_config: 'first_format' },
        updatedAt,
      });

      // Second format
      databaseBuilder.factory.buildOrganizationLearnerImportFormat({
        name: 'SECOND_FORMAT',
        fileType: 'xml',
        config: { basic_config: 'second_format' },
        updatedAt,
      });

      databaseBuilder.factory.buildOrganizationLearnerImportFormat({
        name: 'THIRD_FORMAT',
        fileType: 'xml',
        config: { basic_config: 'third_format' },
        updatedAt,
      });

      await databaseBuilder.commit();
    });

    it('update several learner import format given', async function () {
      // given
      const organizationLearnerImportFormats = [
        { name: 'FIRST_FORMAT', fileType: 'csv', config: { new_config: 'awesome' } },
        { name: 'SECOND_FORMAT', fileType: 'csv', config: { new_config: 'not_bad' } },
      ];
      // when
      await organizationLearnerImportFormatRepository.updateAllByName({ organizationLearnerImportFormats });

      // then
      const fistLearnerImportFormat = await knex('organization-learner-import-formats')
        .where({
          name: 'FIRST_FORMAT',
        })
        .first();

      expect(fistLearnerImportFormat.config).to.deep.equal({ new_config: 'awesome' });
      expect(fistLearnerImportFormat.fileType).to.equal('csv');

      const secondLearnerImportFormat = await knex('organization-learner-import-formats')
        .where({
          name: 'SECOND_FORMAT',
        })
        .first();

      expect(secondLearnerImportFormat.config).to.deep.equal({ new_config: 'not_bad' });
      expect(secondLearnerImportFormat.fileType).to.equal('csv');
    });

    it('set updatedAt field to today', async function () {
      // given
      const organizationLearnerImportFormats = [
        { name: 'FIRST_FORMAT', fileType: 'csv', config: { new_config: 'awesome' } },
      ];
      // when
      await organizationLearnerImportFormatRepository.updateAllByName({ organizationLearnerImportFormats });

      // then
      const fistLearnerImportFormat = await knex('organization-learner-import-formats')
        .where({
          name: 'FIRST_FORMAT',
        })
        .first();

      expect(fistLearnerImportFormat.updatedAt).to.deep.equal(now);
    });

    it('should not update other import format', async function () {
      // given
      const organizationLearnerImportFormats = [
        { name: 'FIRST_FORMAT', fileType: 'csv', config: { new_config: 'awesome' } },
      ];
      // when
      await organizationLearnerImportFormatRepository.updateAllByName({ organizationLearnerImportFormats });

      // then
      const fistLearnerImportFormat = await knex('organization-learner-import-formats')
        .where({
          name: 'SECOND_FORMAT',
        })
        .first();

      expect(fistLearnerImportFormat.fileType).to.be.equal('xml');
      expect(fistLearnerImportFormat.config).to.deep.equal({ basic_config: 'second_format' });
      expect(fistLearnerImportFormat.updatedAt).to.deep.equal(updatedAt);
    });
  });
});
