import sinon from 'sinon';

import { OrganizationLearnerImportFormat } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerImportFormat.js';
import * as organizationLearnerImportFormatRepository from '../../../../../../src/prescription/learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/constants.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

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

      expect(result.config).to.be.deep.equal(importConfig.config);
      expect(result.name).to.be.deep.equal(importConfig.name);
      expect(result.fileType).to.be.deep.equal(importConfig.fileType);
    });

    it('should return null if nothing was found', async function () {
      const result = await organizationLearnerImportFormatRepository.get(1);

      expect(result).to.equal(null);
    });
  });
  describe('#findAll', function () {
    it('should return all import formats', async function () {
      const scoOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const supOrganizationId = databaseBuilder.factory.buildOrganization().id;

      const featureId = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
      }).id;

      const scoImportFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({ name: 'SCO' });
      const supImportFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({ name: 'SUP' });

      databaseBuilder.factory.buildOrganizationFeature({
        organizationId: scoOrganizationId,
        featureId,
        params: {
          organizationLearnerImportFormatId: scoImportFormat.id,
          organizationLearnerImportFormatName: scoImportFormat.name,
        },
      });
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId: supOrganizationId,
        featureId,
        params: {
          organizationLearnerImportFormatId: supImportFormat.id,
          organizationLearnerImportFormatName: supImportFormat.name,
        },
      });

      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerImportFormatRepository.findAll();

      // then
      expect(result).lengthOf(2);
      expect(result[0]).to.be.an.instanceOf(OrganizationLearnerImportFormat);
      expect(result[0]).to.be.deep.equal(new OrganizationLearnerImportFormat(scoImportFormat));
      expect(result[1]).to.be.deep.equal(new OrganizationLearnerImportFormat(supImportFormat));
    });

    it('should return an empty array if nothing was found', async function () {
      const result = await organizationLearnerImportFormatRepository.findAll();

      expect(result).lengthOf(0);
    });
  });
  describe('#save', function () {
    let clock, userId;
    const now = new Date('2022-02-02');
    const updatedAt = new Date('2020-01-01');

    afterEach(function () {
      clock.restore();
    });

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

      userId = databaseBuilder.factory.buildUser().id;
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
        new OrganizationLearnerImportFormat({
          id: 123,
          name: 'FIRST_FORMAT',
          fileType: 'csv',
          config: { new_config: 'awesome' },
          createdBy: userId,
          createdAt: now,
        }),
        new OrganizationLearnerImportFormat({
          id: 456,
          name: 'SECOND_FORMAT',
          fileType: 'csv',
          config: { new_config: 'not_bad' },
          createdBy: userId,
          createdAt: now,
        }),
      ];
      // when
      await organizationLearnerImportFormatRepository.save({ organizationLearnerImportFormats });

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
        new OrganizationLearnerImportFormat({
          id: 123,
          name: 'FIRST_FORMAT',
          fileType: 'csv',
          config: { new_config: 'awesome' },
          createdBy: userId,
          createdAt: now,
        }),
      ];
      // when
      await organizationLearnerImportFormatRepository.save({ organizationLearnerImportFormats });

      // then
      const fistLearnerImportFormat = await knex('organization-learner-import-formats')
        .where({
          name: 'FIRST_FORMAT',
        })
        .first();

      expect(fistLearnerImportFormat.updatedAt).to.deep.equal(now);
    });

    it('should not update createdAt createdBy fields', async function () {
      // given
      const organizationLearnerImportFormats = [
        new OrganizationLearnerImportFormat({
          id: 123,
          name: 'FIRST_FORMAT',
          fileType: 'csv',
          config: { new_config: 'awesome' },
          createdBy: userId,
          createdAt: now,
        }),
      ];
      // when
      await organizationLearnerImportFormatRepository.save({ organizationLearnerImportFormats });

      // then
      const fistLearnerImportFormat = await knex('organization-learner-import-formats')
        .where({
          name: 'FIRST_FORMAT',
        })
        .first();

      expect(fistLearnerImportFormat.createdAt).not.deep.equal(now);
      expect(fistLearnerImportFormat.createdBy).not.equal(userId);
    });

    it('should not update other import format', async function () {
      // given
      const organizationLearnerImportFormats = [
        new OrganizationLearnerImportFormat({
          id: 123,
          name: 'FIRST_FORMAT',
          fileType: 'csv',
          config: { new_config: 'awesome' },
          createdBy: userId,
          createdAt: now,
        }),
      ];
      // when
      await organizationLearnerImportFormatRepository.save({ organizationLearnerImportFormats });

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

    it('should insert new import format', async function () {
      // given
      const organizationLearnerImportFormats = [
        new OrganizationLearnerImportFormat({
          id: 123,
          name: 'NEW_FORMAT',
          fileType: 'csv',
          config: { new_config: 'awesome' },
          createdBy: userId,
          createdAt: now,
        }),
      ];
      // when
      await organizationLearnerImportFormatRepository.save({ organizationLearnerImportFormats });

      // then
      const fistLearnerImportFormat = await knex('organization-learner-import-formats')
        .where({
          name: 'NEW_FORMAT',
        })
        .first();

      expect(fistLearnerImportFormat.fileType).to.be.equal('csv');
      expect(fistLearnerImportFormat.config).to.deep.equal({ new_config: 'awesome' });
      expect(fistLearnerImportFormat.createdAt).to.deep.equal(now);
      expect(fistLearnerImportFormat.createdBy).equal(userId);
    });
  });
});
