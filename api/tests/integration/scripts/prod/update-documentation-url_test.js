import { expect, databaseBuilder, knex } from '../../../test-helper';
import { updateDocumentationUrl, URL } from '../../../../scripts/prod/update-documentation-url';

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

  context('when the organization is MEDNUM', function () {
    it('uses the MEDNUM documentation', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'MEDNUM' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.MEDNUM);
    });

    context('when the organization is not PRO', function () {
      it('does not the MEDNUM documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'MEDNUM' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.MEDNUM);
      });
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

    context('when the organization is AGRI', function () {
      it('uses the AGRI documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          isManagingStudents: true,
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).equal(URL.AGRI);
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
});
