import { Readable } from 'node:stream';

import sinon from 'sinon';

import { ImportSupOrganizationLearnersJobController } from '../../../../../../src/prescription/learner-management/application/jobs/import-sup-organization-learners-job-controller.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { importStorage } from '../../../../../../src/prescription/learner-management/infrastructure/storage/import-storage.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Integration | Infrastructure | Jobs | ImportSupOrganizationLearnersJobController', function () {
  let organizationId, user, organizationImport, i18n;
  const locale = 'fr';
  let beatrixStudentId, orenStudentId;

  context('#handle', function () {
    beforeEach(async function () {
      i18n = getI18n();
      const supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(i18n).columns
        .map((column) => column.name)
        .join(';');

      user = databaseBuilder.factory.buildUser();
      organizationId = databaseBuilder.factory.buildOrganization().id;
      organizationImport = databaseBuilder.factory.buildOrganizationImport({
        organizationId,
        createdBy: user.id,
        filename: 'plop',
      });

      beatrixStudentId = 9876;
      orenStudentId = 8765;
      sinon.stub(importStorage, 'deleteFile').resolves();
      sinon
        .stub(importStorage, 'readFile')
        .withArgs({ filename: 'plop' })
        .callsFake(() =>
          Readable.from(
            Buffer.from(
              `${supOrganizationLearnerImportHeader}
Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1990;thebride@example.net;${beatrixStudentId};Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend
O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;${orenStudentId};Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;Autre;`,
              'utf-8',
            ),
          ),
        );

      await databaseBuilder.commit();
    });

    context('add students', function () {
      it('should add students from file', async function () {
        // given
        const handler = new ImportSupOrganizationLearnersJobController();

        // when
        await handler.handle({
          data: {
            organizationImportId: organizationImport.id,
            locale,
            type: 'ADDITIONAL_STUDENT',
          },
        });

        const learners = await knex('organization-learners').select('*').orderBy('studentNumber');
        expect(learners).lengthOf(2);
        expect(learners.map(({ studentNumber }) => studentNumber)).deep.equal([
          orenStudentId.toString(),
          beatrixStudentId.toString(),
        ]);
      });
    });

    context('replace students', function () {
      it('should replace students from file', async function () {
        // given
        const handler = new ImportSupOrganizationLearnersJobController();

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          email: 'cottonmouth@example.net',
          studentNumber: orenStudentId,
        });
        await databaseBuilder.commit();

        // when
        await handler.handle({
          data: {
            organizationImportId: organizationImport.id,
            locale,
            type: 'REPLACE_STUDENT',
          },
        });

        // then
        const learners = await knex('view-active-organization-learners').select('*').orderBy('studentNumber');
        expect(learners).lengthOf(2);
        expect(learners.map(({ studentNumber }) => studentNumber)).deep.equal([
          orenStudentId.toString(),
          beatrixStudentId.toString(),
        ]);
      });

      it('should delete active learners not present in file', async function () {
        // given
        const handler = new ImportSupOrganizationLearnersJobController();

        const activeOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          studentNumber: '1234',
        });
        await databaseBuilder.commit();

        // when
        await handler.handle({
          data: {
            organizationImportId: organizationImport.id,
            locale,
            type: 'REPLACE_STUDENT',
          },
        });

        const deletedLearners = await knex('organization-learners').select('*').whereNotNull('deletedAt');
        expect(deletedLearners).lengthOf(1);
        expect(deletedLearners[0].id).equal(activeOrganizationLearner.id);
      });
    });
  });
});
