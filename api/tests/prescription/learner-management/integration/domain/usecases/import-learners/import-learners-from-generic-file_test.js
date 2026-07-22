import { Readable } from 'node:stream';

import sinon from 'sinon';

import { usecases } from '../../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { importStorage } from '../../../../../../../src/prescription/learner-management/infrastructure/storage/import-storage.js';
import { ORGANIZATION_FEATURE } from '../../../../../../../src/shared/constants.js';
import { expect } from '../../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../../tooling/databases.js';

describe('Integration | Infrastructure | Jobs | ImportFromSupJobController', function () {
  let organizationId, user, organizationImport;

  beforeEach(async function () {
    user = databaseBuilder.factory.buildUser();
    organizationId = databaseBuilder.factory.buildOrganization().id;
    organizationImport = databaseBuilder.factory.buildOrganizationImport({
      organizationId,
      createdBy: user.id,
      filename: 'plop',
    });

    const importFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT);
    const importFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
      name: 'test',
      fileType: 'csv',
      config: {
        acceptedEncoding: ['utf-8'],
        unicityColumns: ['Classe'],
        headers: [
          { name: 'Nom', config: { property: 'lastName' }, required: true },
          { name: 'Prénom', config: { property: 'firstName' }, required: true },
          {
            name: 'Classe',
            config: {
              displayable: {
                name: 'MY_KEY',
                filterable: {
                  type: 'list',
                },
              },
            },
            required: true,
          },
          {
            name: 'Date de naissance',
            required: true,
          },
        ],
      },
    });

    databaseBuilder.factory.buildOrganizationFeature({
      featureId: importFeature.id,
      organizationId,
      params: { organizationLearnerImportFormatId: importFormat.id },
    });

    await databaseBuilder.commit();

    sinon.stub(importStorage, 'deleteFile').withArgs({ filename: 'plop' }).resolves();
    sinon
      .stub(importStorage, 'readFile')
      .withArgs({ filename: 'plop' })
      .callsFake(() =>
        Readable.from(
          Buffer.from(
            `Nom;Prénom;Classe;Date de naissance
Beatrix;Kiddo;6A;01/01/1990
O-Ren;Ishii;5B;01/02/1980`,
            'utf-8',
          ),
        ),
      );
  });

  it('save two learner on organization', async function () {
    // when
    await usecases.importLearnersFromGenericFile({ organizationImportId: organizationImport.id });

    const learners = await knex('organization-learners')
      .select('firstName', 'lastName', 'attributes')
      .where({ organizationId });

    expect(learners).lengthOf(2);
  });

  it('keep only configured organization learner filter', async function () {
    // given
    databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFilter({
      organizationId,
      attributeName: 'TOTO',
      values: ['zero', 'plus', '0', 'égal'],
    });

    await databaseBuilder.commit();

    // when
    await usecases.importLearnersFromGenericFile({ organizationImportId: organizationImport.id });

    const filters = await knex('organization_learner_filters').where('organization_id', organizationId);

    expect(filters).lengthOf(1);
    expect(filters[0].attribute_name).equal('MY_KEY');
    expect(filters[0].values).deep.equal(['5B', '6A']);
  });
});
