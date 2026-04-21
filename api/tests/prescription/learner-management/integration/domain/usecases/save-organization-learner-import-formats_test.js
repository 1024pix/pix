import fs from 'node:fs';
import path from 'node:path';
import * as url from 'node:url';

import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { EntityValidationError, FileValidationError } from '../../../../../../src/shared/domain/errors.js';

import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

// Get __dirname in ESM
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Organizational Entities | Domain | UseCase | save-organization-learner-import-formats', function () {
  let userId;

  beforeEach(function () {
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildOrganizationLearnerImportFormat({
      name: 'FIRST_FORMAT',
      fileType: 'xml',
      config: { basic_config: 'first_format' },
    });

    databaseBuilder.factory.buildOrganizationLearnerImportFormat({
      name: 'SECOND_FORMAT',
      fileType: 'csv',
      config: { basic_config: 'second_format' },
    });

    return databaseBuilder.commit();
  });

  describe('success case', function () {
    it('update organization learner import format given parameter', async function () {
      // given
      const payload = fs.createReadStream(path.join(__dirname, 'test-file/import-format-file', 'ok.json'));
      // when
      await usecases.saveOrganizationLearnerImportFormats({
        userId,
        payload,
      });

      // then
      const importFormat = await knex('organization-learner-import-formats').where({ name: 'FIRST_FORMAT' }).first();

      expect(importFormat.fileType).to.be.equal('csv');
      expect(importFormat.config).to.be.deep.equal({ new_config: 'awesome' });
    });
  });

  describe('error case', function () {
    it('should not update organization learner import format when error occured', async function () {
      // given && when
      const payload = fs.createReadStream(path.join(__dirname, 'test-file/import-format-file', 'ko.json'));

      const error = await catchErr(usecases.saveOrganizationLearnerImportFormats)({
        userId,
        payload,
      });

      // then
      const firstImportFormat = await knex('organization-learner-import-formats')
        .where({ name: 'FIRST_FORMAT' })
        .first();

      expect(firstImportFormat.fileType).to.be.equal('xml');
      expect(firstImportFormat.config).to.be.deep.equal({ basic_config: 'first_format' });

      const secondImportFormat = await knex('organization-learner-import-formats')
        .where({ name: 'SECOND_FORMAT' })
        .first();

      expect(secondImportFormat.fileType).to.be.equal('csv');
      expect(secondImportFormat.config).to.be.deep.equal({ basic_config: 'second_format' });

      expect(error).to.be.instanceOf(EntityValidationError);
    });

    it('should throw an error when file is not a json', async function () {
      // given && when
      const payload = fs.createReadStream(path.join(__dirname, 'test-file/import-format-file', 'not-a-json.json'));

      const error = await catchErr(usecases.saveOrganizationLearnerImportFormats)({
        userId,
        payload,
      });

      // then
      const firstImportFormat = await knex('organization-learner-import-formats')
        .where({ name: 'FIRST_FORMAT' })
        .first();

      expect(firstImportFormat.fileType).to.be.equal('xml');
      expect(firstImportFormat.config).to.be.deep.equal({ basic_config: 'first_format' });

      const secondImportFormat = await knex('organization-learner-import-formats')
        .where({ name: 'SECOND_FORMAT' })
        .first();

      expect(secondImportFormat.fileType).to.be.equal('csv');
      expect(secondImportFormat.config).to.be.deep.equal({ basic_config: 'second_format' });

      expect(error).to.be.instanceOf(FileValidationError);
    });
  });
});
