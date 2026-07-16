import * as url from 'node:url';

import sinon from 'sinon';

import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));
import { AttachCertificationCentersToOrganizationsScript } from '../../../../src/organizational-entities/scripts/attach-certification-centers-to-organizations.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Scripts | Attach certification centers to organizations', function () {
  it('parses CSV file correctly', async function () {
    // given
    const testCsvFile = `${currentDirectory}files/orga_cdc_attachment_test_file.csv`;
    const script = new AttachCertificationCentersToOrganizationsScript();
    const expectedFileData = [
      { organization_id: 1, certification_center_id: 10 },
      { organization_id: 2, certification_center_id: 20 },
      { organization_id: 3, certification_center_id: 30 },
      { organization_id: 4, certification_center_id: 40 },
      { organization_id: 5, certification_center_id: 50 },
      { organization_id: 6, certification_center_id: 60 },
      { organization_id: 7, certification_center_id: 70 },
      { organization_id: 8, certification_center_id: 80 },
      { organization_id: 9, certification_center_id: 90 },
    ];

    // when
    const { options } = script.metaInfo;
    const fileData = await options.file.coerce(testCsvFile);

    // then
    expect(fileData).to.deep.equal(expectedFileData);
  });

  describe('#handle', function () {
    let script;
    let logger;

    beforeEach(function () {
      script = new AttachCertificationCentersToOrganizationsScript();
      logger = { info: sinon.stub(), error: sinon.stub() };
    });

    describe('Error cases', function () {
      context('File integrity', function () {
        context('When there are duplicates in organization ids', function () {
          it('throws an error with the duplicate ids', async function () {
            const file = [
              { organization_id: 1, certification_center_id: 10 },
              { organization_id: 1, certification_center_id: 20 },
              { organization_id: 2, certification_center_id: 20 },
            ];

            // when
            const error = await catchErr(script.handle)({ options: { file, batchSize: 2 }, logger });

            // then
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.equal(
              'Organization ids 1 have duplicates. Please ensure all organization ids are unique in the file.',
            );
          });
        });

        context('When there are duplicates in certification centers ids', function () {
          it('throws an error with the duplicate ids', async function () {
            const file = [
              { organization_id: 1, certification_center_id: 10 },
              { organization_id: 2, certification_center_id: 10 },
              { organization_id: 3, certification_center_id: 20 },
              { organization_id: 4, certification_center_id: 20 },
            ];

            // when
            const error = await catchErr(script.handle)({ options: { file, batchSize: 2 }, logger });

            // then
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.equal(
              'Certification center ids 10, 20 have duplicates. Please ensure all certification center ids are unique in the file.',
            );
          });
        });
      });
      context('When some organizations do not exist', function () {
        it('throws an error with the missing organization ids', async function () {
          // given
          const file = [
            { organization_id: 1, certification_center_id: 10 },
            { organization_id: 2, certification_center_id: 20 },
            { organization_id: 3, certification_center_id: 30 },
          ];

          databaseBuilder.factory.buildOrganization({ id: 1 });

          await databaseBuilder.commit();

          // when
          const error = await catchErr(script.handle)({ options: { file, batchSize: 3 }, logger });

          // then
          expect(error).to.be.an.instanceOf(Error);
          expect(error.message).to.equal('Organizations with ids 2, 3 do not exist.');
        });
      });

      context('When some certification centers do not exist', function () {
        it('throws an error with the missing certification center ids', async function () {
          // given
          const file = [
            { organization_id: 1, certification_center_id: 10 },
            { organization_id: 2, certification_center_id: 20 },
            { organization_id: 3, certification_center_id: 30 },
          ];

          databaseBuilder.factory.buildOrganizationWithStructure({ organizationData: { id: 1 } });
          databaseBuilder.factory.buildOrganizationWithStructure({ organizationData: { id: 2 } });
          databaseBuilder.factory.buildOrganizationWithStructure({ organizationData: { id: 3 } });

          databaseBuilder.factory.buildCertificationCenter({ id: 10 });

          await databaseBuilder.commit();

          // when
          const error = await catchErr(script.handle)({ options: { file, batchSize: 3 }, logger });

          // then
          expect(error).to.be.an.instanceOf(Error);
          expect(error.message).to.equal('Certification centers with ids 20, 30 do not exist.');
        });
      });

      context('When some organizations do not have a structure', function () {
        it('throws an error with the organization ids', async function () {
          // given
          const file = [
            { organization_id: 1, certification_center_id: 10 },
            { organization_id: 2, certification_center_id: 20 },
            { organization_id: 3, certification_center_id: 30 },
          ];

          databaseBuilder.factory.buildOrganizationWithStructure({ organizationData: { id: 1 } });
          databaseBuilder.factory.buildOrganization({ id: 2 });
          databaseBuilder.factory.buildOrganizationWithStructure({ organizationData: { id: 3 } });
          await databaseBuilder.commit();

          // when
          const error = await catchErr(script.handle)({ options: { file, batchSize: 3 }, logger });

          // then
          expect(error).to.be.an.instanceOf(Error);
          expect(error.message).to.equal(
            'Organizations with ids 2 do not have a structure and cannot be attached to a certification center.',
          );
        });
      });

      context('When some organizations already have an attached certification center', function () {
        it('throws an error with organization ids', async function () {
          // given
          databaseBuilder.factory.buildCertificationCenter({ id: 10 });
          databaseBuilder.factory.buildCertificationCenter({ id: 20 });
          databaseBuilder.factory.buildCertificationCenter({ id: 30 });
          databaseBuilder.factory.buildCertificationCenter({ id: 40 });

          databaseBuilder.factory.buildOrganizationWithStructure({
            organizationData: { id: 1 },
            certificationCenterId: 10,
          });
          databaseBuilder.factory.buildOrganizationWithStructure({
            organizationData: { id: 2 },
            certificationCenterId: 20,
          });

          await databaseBuilder.commit();

          const file = [
            { organization_id: 1, certification_center_id: 30 },
            { organization_id: 2, certification_center_id: 40 },
          ];

          // when
          const error = await catchErr(script.handle)({ options: { file, batchSize: 3 }, logger });

          // then
          expect(error).to.be.an.instanceOf(Error);
          expect(error.message).to.equal('Organizations with ids 1, 2 already have an attached certification center.');
        });
      });

      context('When some certification centers already have an attached organization', function () {
        it('throws an error with certification center ids', async function () {
          // given
          databaseBuilder.factory.buildOrganizationWithStructure({ organizationData: { id: 1 } });
          databaseBuilder.factory.buildOrganizationWithStructure({ organizationData: { id: 2 } });

          databaseBuilder.factory.buildCertificationCenter({ id: 10 });
          databaseBuilder.factory.buildCertificationCenter({ id: 20 });

          databaseBuilder.factory.buildOrganizationWithStructure({
            organizationData: { id: 3 },
            certificationCenterId: 10,
          });
          databaseBuilder.factory.buildOrganizationWithStructure({
            organizationData: { id: 4 },
            certificationCenterId: 20,
          });

          await databaseBuilder.commit();

          const file = [
            { organization_id: 1, certification_center_id: 10 },
            { organization_id: 2, certification_center_id: 20 },
          ];

          // when
          const error = await catchErr(script.handle)({ options: { file, batchSize: 3 }, logger });

          // then
          expect(error).to.be.an.instanceOf(Error);
          expect(error.message).to.equal(
            'Certification centers with ids 10, 20 already have an attached organization.',
          );
        });
      });
    });

    describe('Success', function () {
      context('when dryRun is set to false', function () {
        it('should attach organizations to certification centers', async function () {
          // given
          databaseBuilder.factory.buildOrganizationWithStructure({ organizationData: { id: 1 } });
          databaseBuilder.factory.buildCertificationCenter({ id: 10 });

          databaseBuilder.factory.buildOrganizationWithStructure({ organizationData: { id: 2 } });
          databaseBuilder.factory.buildCertificationCenter({ id: 20 });

          await databaseBuilder.commit();

          const file = [
            { organization_id: 1, certification_center_id: 10 },
            { organization_id: 2, certification_center_id: 20 },
          ];

          // when
          await script.handle({ options: { file, batchSize: 1, dryRun: false }, logger });

          // then
          const fct_structures = await knex('fct_structures').select('organization_id', 'certification_center_id');
          expect(fct_structures).to.deep.equal([
            { organization_id: 1, certification_center_id: 10 },
            { organization_id: 2, certification_center_id: 20 },
          ]);
        });
      });

      context('when dryRun is set to true', function () {
        it('should not attach organizations to certification centers', async function () {
          // given
          databaseBuilder.factory.buildOrganizationWithStructure({ organizationData: { id: 1 } });
          databaseBuilder.factory.buildCertificationCenter({ id: 10 });

          databaseBuilder.factory.buildOrganizationWithStructure({ organizationData: { id: 2 } });
          databaseBuilder.factory.buildCertificationCenter({ id: 20 });

          await databaseBuilder.commit();

          const file = [
            { organization_id: 1, certification_center_id: 10 },
            { organization_id: 2, certification_center_id: 20 },
          ];

          // when
          await script.handle({ options: { file, batchSize: 1, dryRun: true }, logger });

          // then
          const fct_structures = await knex('fct_structures').select('organization_id', 'certification_center_id');
          expect(fct_structures).to.deep.equal([
            { organization_id: 1, certification_center_id: null },
            { organization_id: 2, certification_center_id: null },
          ]);
        });
      });
    });
  });
});
