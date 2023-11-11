import { expect, databaseBuilder, knex } from '../../../../../test-helper.js';
import iconv from 'iconv-lite';

import { importSupOrganizationLearners } from '../../../../../../src/prescription/learner-management/domain/usecases/import-sup-organization-learners.js';
import * as supOrganizationLearnerRepository from '../../../../../../src/prescription/learner-management/infrastructure/repositories/sup-organization-learner-repository.js';
import { SupOrganizationLearnerParser } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

const i18n = getI18n();

const supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

describe('Integration | UseCase | ImportSupOrganizationLearner', function () {
  context('when there is no organization learners for the organization', function () {
    it('parses the csv received and creates the SupOrganizationLearner', async function () {
      const input = `${supOrganizationLearnerImportHeader}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
          O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
      `.trim();

      const encodedInput = iconv.encode(input, 'utf8');

      const organization = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();
      await importSupOrganizationLearners({
        organizationId: organization.id,
        supOrganizationLearnerRepository,
        supOrganizationLearnerParser: new SupOrganizationLearnerParser(encodedInput, organization.id, i18n),
      });

      const learners = await knex('organization-learners').where({ organizationId: organization.id });
      expect(learners).to.have.lengthOf(2);
    });
  });

  context('when there is an organization learner for the organization', function () {
    context('which matches by student number', function () {
      it('updates the existing organization learner which have matched with csv data', async function () {
        const input = `${supOrganizationLearnerImportHeader}
            Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        `.trim();

        const encodedInput = iconv.encode(input, 'utf8');

        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          studentNumber: '123456',
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1970-01-01',
          email: 'old.email@dva.com',
        });

        await databaseBuilder.commit();
        await importSupOrganizationLearners({
          organizationId: organization.id,
          supOrganizationLearnerRepository,
          supOrganizationLearnerParser: new SupOrganizationLearnerParser(encodedInput, organization.id, i18n),
        });

        const [learner] = await knex('organization-learners').where({ organizationId: organization.id });
        expect(learner.email).to.equal('thebride@example.net');
      });
    });
  });

  it('should return warnings about the import', async function () {
    const input = `${supOrganizationLearnerImportHeader}
            Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
        `.trim();

    const encodedInput = iconv.encode(input, 'utf8');
    const organization = databaseBuilder.factory.buildOrganization();
    await databaseBuilder.commit();

    const warnings = await importSupOrganizationLearners({
      organizationId: organization.id,
      supOrganizationLearnerRepository,
      supOrganizationLearnerParser: new SupOrganizationLearnerParser(encodedInput, organization.id, i18n),
    });

    expect(warnings).to.deep.equal([
      { studentNumber: '123456', field: 'study-scheme', value: 'BAD', code: 'unknown' },
      { studentNumber: '123456', field: 'diploma', value: 'BAD', code: 'unknown' },
    ]);
  });
});
