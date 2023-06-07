import { expect, databaseBuilder, knex } from '../../../test-helper.js';
import { updateDocumentationUrl, URL } from '../../../../scripts/prod/update-documentation-url.js';

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

  context('when the organization is INTERNATIONAL', function () {
    context('when the organization is PRO', function () {
      it('uses the INTERNATIONAL documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'INTERNATIONAL' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).equal(URL.INTERNATIONAL);
      });
    });

    context('when the organization is SCO', function () {
      it('uses the INTERNATIONAL documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'INTERNATIONAL' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.equal(URL.INTERNATIONAL);
      });
    });

    context('when the organization is SUP', function () {
      it('uses the INTERNATIONAL documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SUP',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'INTERNATIONAL' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.equal(URL.INTERNATIONAL);
      });
    });
  });

  context('when the organization is PRIVE HORS CONTRAT', function () {
    context('when the organization is PRO', function () {
      it('uses the PRIVE HORS CONTRAT documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'PRIVE HORS CONTRAT' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).equal(URL.PRIVE_HORS_CONTRAT);
      });
    });

    context('when the organization is SUP', function () {
      it('uses the PRIVE HORS CONTRAT documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'SUP' });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'PRIVE HORS CONTRAT' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).equal(URL.PRIVE_HORS_CONTRAT);
      });
    });

    context('when the organization is SCO', function () {
      it('does not the PRIVE HORS CONTRAT documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'PRIVE HORS CONTRAT' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.PRIVE_HORS_CONTRAT);
      });
    });
  });

  context('when the organization is DOC ENGLISH', function () {
    it('uses the DOC ENGLISH documentation', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'DOC ENGLISH' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.DOC_ENGLISH);
    });

    context('when the organization is not PRO', function () {
      it('does not the DOC ENGLISH documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'DOC ENGLISH' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.DOC_ENGLISH);
      });
    });
  });

  context('when the organization is PROMSOC', function () {
    context('when the organization is PRO', function () {
      it('uses the PROMSOC documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'PROMSOC' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).equal(URL.PROMSOC);
      });
    });

    context('when the organization is SUP', function () {
      it('uses the PROMSOC documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'SUP' });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'PROMSOC' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).equal(URL.PROMSOC);
      });
    });

    context('when the organization is SCO', function () {
      it('does not the PROMSOC documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'PROMSOC' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.PROMSOC);
      });
    });
  });

  context('when the organization is AUF', function () {
    it('uses the AUF documentation', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'AUF' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.AUF);
    });

    context('when the organization is not PRO', function () {
      it('does not the AUF documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'AUF' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.AUF);
      });
    });
  });

  context('when the organization is EFENH', function () {
    context('when the organization is SCO', function () {
      it('uses the EFENH documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'EFENH' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).equal(URL.EFENH);
      });
    });

    context('when the organization is SUP', function () {
      it('does not the EFENH documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SUP',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'EFENH' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.EFENH);
      });
    });

    context('when the organization is PRO', function () {
      it('does not the EFENH documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'PRO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'EFENH' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.EFENH);
      });
    });
  });

  context('when the organization is DIPUTACIO DE BARCELONA', function () {
    context('when the organization is PRO', function () {
      it('uses the DIPUTACIO DE BARCELONA documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'DIPUTACIO DE BARCELONA' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).equal(URL.DIPUTACIO_DE_BARCELONA);
      });
    });

    context('when the organization is not PRO', function () {
      it('does not the DIPUTACIO DE BARCELONA documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'DIPUTACIO DE BARCELONA' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.DIPUTACIO_DE_BARCELONA);
      });
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

  context('when the organization is CPAM', function () {
    it('uses the CPAM documentation', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'CPAM' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.CPAM);
    });

    context('when the organization is not PRO', function () {
      it('does not the CPAM documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'CPAM' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.CPAM);
      });
    });
  });

  context('when the organization is CNAF', function () {
    it('uses the CPAM documentation', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'CNAF' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.CNAF);
    });

    context('when the organization is not PRO', function () {
      it('does not the CNAF documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'CNAF' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.CNAF);
      });
    });
  });

  context('when the organization is CNAV', function () {
    it('uses the CNAV documentation', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'CNAV' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.CNAV);
    });

    context('when the organization is not PRO', function () {
      it('does not the CNAV documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'CNAV' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.CNAV);
      });
    });
  });

  context('when the organization is ACOSS', function () {
    it('uses the ACOSS documentation', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'ACOSS' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.ACOSS);
    });

    context('when the organization is not PRO', function () {
      it('does not the ACOSS documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'ACOSS' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.ACOSS);
      });
    });
  });

  context('when the organization is INSTITUT 4.10', function () {
    it('uses the INSTITUT 4.10 documentation', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'INSTITUT 4.10' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.INSTITUT410);
    });

    context('when the organization is not PRO', function () {
      it('does not the INSTITUT 4.10 documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'INSTITUT 4.10' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.INSTITUT410);
      });
    });
  });

  context('when the organization is UCANSS', function () {
    it('uses the UCANSS documentation', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'UCANSS' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.UCANSS);
    });

    context('when the organization is not PRO', function () {
      it('does not the UCANSS documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'UCANSS' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.UCANSS);
      });
    });
  });

  context('when the organization is SECTEUR_CHIMIE', function () {
    it('uses the SECTEUR_CHIMIE documentation', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'SECTEUR CHIMIE' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.SECTEUR_CHIMIE);
    });

    context('when the organization is not PRO', function () {
      it('does not the SECTEUR_CHIMIE documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'SECTEUR CHIMIE' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.SECTEUR_CHIMIE);
      });
    });
  });

  context('when the organization is EDUSERVICES', function () {
    it('uses the EDUSERVICES documentation', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'EDUSERVICES' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.EDUSERVICES);
    });

    context('when the organization is not PRO', function () {
      it('does not the EDUSERVICES documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'EDUSERVICES' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.EDUSERVICES);
      });
    });
  });

  context('when the organization is PIXTERRITOIRES', function () {
    it('uses the PIXTERRITOIRES documentation', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'PIXTERRITOIRES' });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

      await databaseBuilder.commit();

      await updateDocumentationUrl();

      const { documentationUrl } = await knex('organizations').first();

      expect(documentationUrl).equal(URL.PIXTERRITOIRES);
    });

    context('when the organization is not PRO', function () {
      it('does not the PIXTERRITOIRES documentation', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          documentationUrl: 'toto',
        });
        const { id: tagId } = databaseBuilder.factory.buildTag({ name: 'PIXTERRITOIRES' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });

        await databaseBuilder.commit();

        await updateDocumentationUrl();

        const { documentationUrl } = await knex('organizations').first();

        expect(documentationUrl).to.not.equal(URL.PIXTERRITOIRES);
      });
    });
  });
});
