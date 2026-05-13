import { Readable } from 'node:stream';

import sinon from 'sinon';

import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { SupHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/headers/sup-header.js';
import { importStorage } from '../../../../../../src/prescription/learner-management/infrastructure/storage/import-storage.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | findSupLearnerIdsToDelete', function () {
  let organizationId, user, organizationImport, i18n;
  let beatrixStudentId, orenStudentId;

  beforeEach(async function () {
    i18n = getI18n();
    const supOrganizationLearnerImportHeader = new SupHeader(i18n).columns.map((column) => column.name).join(';');

    user = databaseBuilder.factory.buildUser();
    organizationId = databaseBuilder.factory.buildOrganization().id;
    organizationImport = databaseBuilder.factory.buildOrganizationImport({
      organizationId,
      createdBy: user.id,
      filename: 'plop',
    });

    beatrixStudentId = 9876;
    orenStudentId = 8765;
    sinon
      .stub(importStorage, 'readFile')
      .withArgs({ filename: 'plop' })
      .returns(
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

  it('should return only active organizationlearnerIds', async function () {
    // given
    const activeOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      studentNumber: '1234',
    });
    const anotherActiveOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      studentNumber: '2345',
    });
    databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      studentNumber: '3456',
      deletedBy: user.id,
      deletedAt: new Date('2025-04-15'),
    });
    await databaseBuilder.commit();

    // when
    const activeLearnerIds = await usecases.findSupLearnerIdsToDelete({
      organizationImportId: organizationImport.id,
      i18n,
    });

    // then
    expect(activeLearnerIds).lengthOf(2);
    expect(activeLearnerIds).deep.members([anotherActiveOrganizationLearner.id, activeOrganizationLearner.id]);
  });

  it('should not return active organizationlearnerIds present in file', async function () {
    // given
    const activeOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      studentNumber: '1234',
    });
    databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      studentNumber: orenStudentId,
    });
    await databaseBuilder.commit();

    // when
    const activeLearnerIds = await usecases.findSupLearnerIdsToDelete({
      organizationImportId: organizationImport.id,
      i18n,
    });

    // then
    expect(activeLearnerIds).lengthOf(1);
    expect(activeLearnerIds).deep.members([activeOrganizationLearner.id]);
  });
});
