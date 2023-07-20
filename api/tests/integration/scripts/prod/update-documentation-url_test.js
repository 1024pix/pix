import { expect, databaseBuilder, knex } from '../../../test-helper.js';
import { updateDocumentationUrl, URL } from '../../../../scripts/prod/update-documentation-url.js';
import sample from 'lodash/sample.js';

describe('updateDocumentationUrl', function () {
  context('when the organization is PRO', function () {
    it('uses the PRO documentation', async function () {
      databaseBuilder.factory.buildOrganization({ type: 'PRO' });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.PRO);
    });
  });

  context('when the organization is SUP', function () {
    it('uses the SUP documentation', async function () {
      databaseBuilder.factory.buildOrganization({ type: 'SUP' });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.SUP);
    });
  });

  context('when the organization is SCO', function () {
    it('uses the SCO documentation', async function () {
      databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.SCO);
    });

    context('when the organization does not manage students', function () {
      it('does not update documentation', async function () {
        databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          isManagingStudents: false,
          documentationUrl: 'toto',
        });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).equal('toto');
      });
    });

    context('when the organization is AEFE', function () {
      it('uses the AEFE documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'AEFE' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).equal(URL.AEFE);
      });
    });

    context('when the organization is MLF', function () {
      it('uses the MLF documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'MLF' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).equal(URL.MLF);
      });
    });

    context('when the organization is AGRICULTURE', function () {
      it('uses the AGRICULTURE documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          isManagingStudents: true,
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).equal(URL.AGRICULTURE);
      });

      context('when the organization is not managing students', function () {
        it('does not update documentation', async function () {
          const { id: organizationId } = databaseBuilder.factory.buildOrganization({
            type: 'SCO',
            isManagingStudents: false,
            documentationUrl: 'toto',
          });
          const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' });
          databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

          await databaseBuilder.commit();

          await updateDocumentationUrl();

          const { documentationUrl } = await knex('organizations').first();

          expect(documentationUrl).equal('toto');
        });
      });
    });
  });

  context(`regardless organization type`, function () {
    let organizationId;
    const organizationType = ['PRO', 'SUP', 'SCO'];
    beforeEach(async function () {
      const type = sample(organizationType);

      organizationId = databaseBuilder.factory.buildOrganization({ type, isManagingStudents: false }).id;
      await databaseBuilder.commit();
    });

    it('sets right documentation URL for INTERNATIONAL', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'INTERNATIONAL' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.INTERNATIONAL);
    });

    it('sets right documentation URL for DOC ENGLISH', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'DOC ENGLISH' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.DOC_ENGLISH);
    });

    it('sets right documentation URL for PROMSOC', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'PROMSOC' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.PROMSOC);
    });

    it('sets right documentation URL for AUF', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'AUF' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.AUF);
    });

    it('sets right documentation URL for MEDNUM', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'MEDNUM' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.MEDNUM);
    });

    it('sets right documentation URL for EFENH', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'EFENH' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.EFENH);
    });

    it('sets right documentation URL for DIPUTACIO DE BARCELONA', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'DIPUTACIO DE BARCELONA' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.DIPUTACIO_DE_BARCELONA);
    });

    it('sets right documentation URL for PRIVE HORS CONTRAT', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'PRIVE HORS CONTRAT' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.PRIVE_HORS_CONTRAT);
    });

    it('sets right documentation URL for PIC', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'PIC' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.PIC);
    });

    it('sets right documentation URL for MISSION LOCALE', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'MISSION LOCALE' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.MISSION_LOCALE);
    });

    it('sets right documentation URL for CAP EMPLOI', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'CAP EMPLOI' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.CAP_EMPLOI);
    });

    it('sets right documentation URL for EPIDE', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'EPIDE' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.EPIDE);
    });

    it('sets right documentation URL for E2C', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'E2C' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.E2C);
    });

    it('sets right documentation URL for CPAM', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'CPAM' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.CPAM);
    });

    it('sets right documentation URL for CNAF', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'CNAF' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.CNAF);
    });

    it('sets right documentation URL for CNAV', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'CNAV' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.CNAV);
    });

    it('sets right documentation URL for ACOSS', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'ACOSS' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.ACOSS);
    });

    it('sets right documentation URL for INSTITUT410', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'INSTITUT 4.10' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.INSTITUT410);
    });

    it('sets right documentation URL for UCANSS', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'UCANSS' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.UCANSS);
    });

    it('sets right documentation URL for SECTEUR_CHIMIE', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'SECTEUR CHIMIE' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.SECTEUR_CHIMIE);
    });

    it('sets right documentation URL for EDUSERVICES', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'EDUSERVICES' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.EDUSERVICES);
    });

    it('sets right documentation URL for PIXTERRITOIRES', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'PIXTERRITOIRES' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.PIXTERRITOIRES);
    });

    it('sets right documentation URL for INTERINDUSTRIES', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'INTERINDUSTRIES' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.INTERINDUSTRIES);
    });

    it('sets right documentation URL for EXPE MADA', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'EXPE MADA' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.EXPE_MADA);
    });

    it('sets right documentation URL for SUP-FWB', async function () {
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'SUP-FWB' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.SUP_FWB);
    });
  });
});
