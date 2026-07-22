import { ORGANIZATIONS_UPDATE_HEADER } from '../../../../../src/organizational-entities/domain/constants.js';
import {
  AdministrationTeamNotFound,
  CountryNotFoundError,
  DpoEmailInvalid,
  OrganizationLearnerTypeNotFound,
  OrganizationNotFound,
} from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';
import { createTempFile, removeTempFile } from '../../../../tooling/test-utils/file.js';

describe('Integration | Organizational Entities | Domain | UseCase | update-organizations-in-batch', function () {
  let filePath;

  afterEach(async function () {
    await removeTempFile(filePath);
  });

  context('when parsing a CSV file without organization', function () {
    it('does nothing', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({ name: 'Before' });
      await databaseBuilder.commit();

      const headers = ORGANIZATIONS_UPDATE_HEADER.columns.map(({ name }) => name).join(';');
      filePath = await createTempFile('test.csv', headers);

      // when
      await usecases.updateOrganizationsInBatch({ filePath });

      // then
      const dbOrganization = await knex('organizations').where({ id: organization.id }).first();
      expect(dbOrganization.name).to.equal('Before');
    });
  });

  context('when parsing a CSV file which contains a list of organizations to update', function () {
    let organization1, organization2;

    beforeEach(async function () {
      Object.values(ORGANIZATION_FEATURE).forEach((feat) => {
        databaseBuilder.factory.buildFeature({ key: feat.key });
      });

      databaseBuilder.factory.buildAdministrationTeam({ id: 1234 });
      databaseBuilder.factory.buildAdministrationTeam({ id: 5678 });

      databaseBuilder.factory.buildOrganizationLearnerType({ id: 12 });
      databaseBuilder.factory.buildOrganizationLearnerType({ id: 34 });

      databaseBuilder.factory.buildCertificationCpfCountry({
        code: '99100',
        commonName: 'France',
        originalName: 'France',
      });

      organization1 = databaseBuilder.factory.buildOrganization({
        externalId: 111,
        identityProviderForCampaigns: null,
        documentationUrl: null,
        administrationTeamId: null,
        countryCode: 99200,
        name: 'Org 1 Before',
      });
      organization2 = databaseBuilder.factory.buildOrganization({
        externalId: 222,
        name: 'Org 2 Before',
        administrationTeamId: null,
        countryCode: 99200,
      });

      await databaseBuilder.commit();
    });

    it('updates organizations in DB accordingly', async function () {
      // given
      const headers = ORGANIZATIONS_UPDATE_HEADER.columns.map(({ name }) => name).join(';');
      const fileData = `${headers}
      ${organization1.id};;12;OIDC_EXAMPLE_NET;https://doc.url;;Troisjour;Adam;foo@email.com;1234;99100;12
      ${organization2.id};New Name;;;;;;Cali;;5678;99100;34`;
      filePath = await createTempFile('test.csv', fileData);

      // when
      await usecases.updateOrganizationsInBatch({ filePath });

      // then
      const updatedOrganization1 = await knex('organizations').where({ id: organization1.id }).first();
      expect(updatedOrganization1.externalId).to.equal('12');
      expect(updatedOrganization1.identityProviderForCampaigns).to.equal('OIDC_EXAMPLE_NET');
      expect(updatedOrganization1.documentationUrl).to.equal('https://doc.url');
      expect(updatedOrganization1.administrationTeamId).to.equal(1234);
      expect(updatedOrganization1.countryCode).to.equal(99100);
      expect(updatedOrganization1.organizationLearnerTypeId).to.equal(12);

      const dpo1 = await knex('data-protection-officers').where({ organizationId: organization1.id }).first();
      expect(dpo1.firstName).to.equal('Adam');
      expect(dpo1.lastName).to.equal('Troisjour');
      expect(dpo1.email).to.equal('foo@email.com');

      const updatedOrganization2 = await knex('organizations').where({ id: organization2.id }).first();
      expect(updatedOrganization2.name).to.equal('New Name');
      expect(updatedOrganization2.administrationTeamId).to.equal(5678);
      expect(updatedOrganization2.countryCode).to.equal(99100);
      expect(updatedOrganization2.organizationLearnerTypeId).to.equal(34);
    });
  });

  context('when CSV files contains some errors in the list of organizations to update', function () {
    beforeEach(function () {
      Object.values(ORGANIZATION_FEATURE).forEach((feat) => {
        databaseBuilder.factory.buildFeature({ key: feat.key });
      });
    });

    it('throws an OrganizationNotFound when organization does not exist', async function () {
      // given
      const headers = ORGANIZATIONS_UPDATE_HEADER.columns.map(({ name }) => name).join(';');
      const fileData = `${headers}
      999999;;12;OIDC_EXAMPLE_NET;https://doc.url;;Troisjour;Adam;;1234;;`;
      filePath = await createTempFile('test.csv', fileData);

      // when
      const error = await catchErr(usecases.updateOrganizationsInBatch)({ filePath });

      // then
      expect(error).to.be.instanceOf(OrganizationNotFound);
      expect(error.meta.organizationId).to.equal('999999');
    });

    it('throws an AdministrationTeamNotFound when administration team does not exist', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({ externalId: 999 });
      await databaseBuilder.commit();

      const headers = ORGANIZATIONS_UPDATE_HEADER.columns.map(({ name }) => name).join(';');
      const fileData = `${headers}
      ${organization.id};;12;OIDC_EXAMPLE_NET;https://doc.url;;Troisjour;Adam;;1234;;`;
      filePath = await createTempFile('test.csv', fileData);

      // when
      const error = await catchErr(usecases.updateOrganizationsInBatch)({ filePath });

      // then
      expect(error).to.be.instanceOf(AdministrationTeamNotFound);
      expect(error.meta.administrationTeamId).to.equal('1234');
    });

    it('throws a CountryNotFoundError when country does not exist', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({ externalId: 999 });
      await databaseBuilder.commit();

      const headers = ORGANIZATIONS_UPDATE_HEADER.columns.map(({ name }) => name).join(';');
      const fileData = `${headers}
      ${organization.id};;12;OIDC_EXAMPLE_NET;https://doc.url;;Troisjour;Adam;;;99999;`;
      filePath = await createTempFile('test.csv', fileData);

      // when
      const error = await catchErr(usecases.updateOrganizationsInBatch)({ filePath });

      // then
      expect(error).to.be.instanceOf(CountryNotFoundError);
      expect(error.meta.countryCode).to.equal('99999');
    });

    context('when the administration team id is not provided', function () {
      it('does not throw', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ externalId: 999 });
        await databaseBuilder.commit();

        const headers = ORGANIZATIONS_UPDATE_HEADER.columns.map(({ name }) => name).join(';');
        const fileData = `${headers}
        ${organization.id};;12;OIDC_EXAMPLE_NET;https://doc.url;;Troisjour;Adam;;;;`;
        filePath = await createTempFile('test.csv', fileData);

        // when
        await usecases.updateOrganizationsInBatch({ filePath });

        // then
        const updated = await knex('organizations').where({ id: organization.id }).first();
        expect(updated.externalId).to.equal('12');
      });
    });

    context('when country code is not provided', function () {
      it('updates organization without country', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ externalId: 999 });
        await databaseBuilder.commit();

        const headers = ORGANIZATIONS_UPDATE_HEADER.columns.map(({ name }) => name).join(';');
        const fileData = `${headers}
        ${organization.id};;12;OIDC_EXAMPLE_NET;https://doc.url;;Troisjour;Adam;foo@email.com;;;`;
        filePath = await createTempFile('test.csv', fileData);

        // when
        const before = await knex('organizations').where({ id: organization.id }).first();
        await usecases.updateOrganizationsInBatch({ filePath });

        // then
        const updated = await knex('organizations').where({ id: organization.id }).first();
        expect(updated.externalId).to.equal('12');
        expect(updated.countryCode).to.equal(before.countryCode);
      });
    });

    context('when DPO email is not valid', function () {
      it('throws a DpoEmailInvalid', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ externalId: 999 });
        await databaseBuilder.commit();

        const headers = ORGANIZATIONS_UPDATE_HEADER.columns.map(({ name }) => name).join(';');
        const fileData = `${headers}
        ${organization.id};;12;OIDC_EXAMPLE_NET;https://doc.url;;Troisjour;Adam;foo;;;`;
        filePath = await createTempFile('test.csv', fileData);

        // when
        const error = await catchErr(usecases.updateOrganizationsInBatch)({ filePath });

        // then
        expect(error).to.be.instanceOf(DpoEmailInvalid);
        expect(error.meta.organizationId).to.equal(`${organization.id}`);
      });
    });

    it('throws a OrganizationLearnerTypeNotFound error when organization learner type does not exist', async function () {
      // given
      const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({ id: 1234 });
      const organization = databaseBuilder.factory.buildOrganization({
        externalId: 999,
        organizationLearnerTypeId: organizationLearnerType.id,
      });
      await databaseBuilder.commit();

      const headers = ORGANIZATIONS_UPDATE_HEADER.columns.map(({ name }) => name).join(';');
      const fileData = `${headers}
      ${organization.id};;12;OIDC_EXAMPLE_NET;https://doc.url;;Troisjour;Adam;;;;5678`;
      filePath = await createTempFile('test.csv', fileData);

      // when
      const error = await catchErr(usecases.updateOrganizationsInBatch)({
        filePath,
      });

      // then
      expect(error).to.be.instanceOf(OrganizationLearnerTypeNotFound);
      expect(error.meta.organizationLearnerTypeId).to.equal('5678');
    });
  });
});
