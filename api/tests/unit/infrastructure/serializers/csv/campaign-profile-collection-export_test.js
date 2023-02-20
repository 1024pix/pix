import { PassThrough } from 'stream';
import { domainBuilder, expect, sinon, streamToPromise } from '../../../../test-helper';
import CampaignProfilesCollectionExport from '../../../../../lib/infrastructure/serializers/csv/campaign-profiles-collection-export';
import { getI18n } from '../../../../tooling/i18n/i18n';

describe('Unit | Serializer | CSV | campaign-profiles-collection-export', function () {
  describe('#export', function () {
    let writableStream, csvPromise, organization, campaign, competences;

    const placementProfileServiceStub = {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      getPlacementProfilesWithSnapshotting: sinon.stub(),
    };

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const translate = getI18n().__;

    beforeEach(function () {
      writableStream = new PassThrough();
      csvPromise = streamToPromise(writableStream);

      organization = {};
      campaign = {};

      placementProfileServiceStub.getPlacementProfilesWithSnapshotting.resolves([]);

      const listSkills1 = domainBuilder.buildSkillCollection({ name: '@web', minLevel: 1, maxLevel: 5 });
      const listSkills2 = domainBuilder.buildSkillCollection({ name: '@url', minLevel: 1, maxLevel: 2 });

      competences = [
        {
          id: 'recCompetence1',
          name: 'Competence1',
          skillIds: listSkills1.map((skill) => skill.id),
        },
        {
          id: 'recCompetence2',
          name: 'Competence2',
          skillIds: listSkills2.map((skill) => skill.id),
        },
      ];
    });

    it('should display common header parts of csv', async function () {
      //given
      const campaignProfile = new CampaignProfilesCollectionExport(
        writableStream,
        organization,
        campaign,
        competences,
        translate
      );

      const expectedHeader =
        '\uFEFF"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Nom de la campagne";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"Envoi (O/N)";' +
        '"Date de l\'envoi";' +
        '"Nombre de pix total";' +
        '"Certifiable (O/N)";' +
        '"Nombre de compétences certifiables";' +
        '"Niveau pour la compétence Competence1";' +
        '"Nombre de pix pour la compétence Competence1";' +
        '"Niveau pour la compétence Competence2";' +
        '"Nombre de pix pour la compétence Competence2"\n';
      //when
      await campaignProfile.export([], placementProfileServiceStub);

      writableStream.end();

      const csv = await csvPromise;

      // then
      expect(csv).to.equal(expectedHeader);
    });

    it('should display division header when organization is SCO and managing students', async function () {
      //given
      organization.isSco = true;
      organization.isManagingStudents = true;

      const campaignProfile = new CampaignProfilesCollectionExport(
        writableStream,
        organization,
        campaign,
        competences,
        translate
      );

      const expectedHeader =
        '\uFEFF"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Nom de la campagne";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"Classe";' +
        '"Envoi (O/N)";' +
        '"Date de l\'envoi";' +
        '"Nombre de pix total";' +
        '"Certifiable (O/N)";' +
        '"Nombre de compétences certifiables";' +
        '"Niveau pour la compétence Competence1";' +
        '"Nombre de pix pour la compétence Competence1";' +
        '"Niveau pour la compétence Competence2";' +
        '"Nombre de pix pour la compétence Competence2"\n';
      //when
      await campaignProfile.export([], placementProfileServiceStub);

      writableStream.end();

      const csv = await csvPromise;

      // then
      expect(csv).to.equal(expectedHeader);
    });

    it('It displays all headers for SUP organization that manages students', async function () {
      //given
      organization.isSup = true;
      organization.isManagingStudents = true;

      const campaignProfile = new CampaignProfilesCollectionExport(
        writableStream,
        organization,
        campaign,
        competences,
        translate
      );

      const expectedHeader =
        '\uFEFF"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Nom de la campagne";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"Groupe";' +
        '"Numéro Étudiant";' +
        '"Envoi (O/N)";' +
        '"Date de l\'envoi";' +
        '"Nombre de pix total";' +
        '"Certifiable (O/N)";' +
        '"Nombre de compétences certifiables";' +
        '"Niveau pour la compétence Competence1";' +
        '"Nombre de pix pour la compétence Competence1";' +
        '"Niveau pour la compétence Competence2";' +
        '"Nombre de pix pour la compétence Competence2"\n';
      //when
      await campaignProfile.export([], placementProfileServiceStub);

      writableStream.end();

      const csv = await csvPromise;

      // then
      expect(csv).to.equal(expectedHeader);
    });

    it('should display idPixLabel header when campaign has one', async function () {
      //given
      campaign.idPixLabel = 'email';
      const campaignProfile = new CampaignProfilesCollectionExport(
        writableStream,
        organization,
        campaign,
        competences,
        translate
      );

      const expectedHeader =
        '\uFEFF"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Nom de la campagne";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"email";' +
        '"Envoi (O/N)";' +
        '"Date de l\'envoi";' +
        '"Nombre de pix total";' +
        '"Certifiable (O/N)";' +
        '"Nombre de compétences certifiables";' +
        '"Niveau pour la compétence Competence1";' +
        '"Nombre de pix pour la compétence Competence1";' +
        '"Niveau pour la compétence Competence2";' +
        '"Nombre de pix pour la compétence Competence2"\n';
      //when
      await campaignProfile.export([], placementProfileServiceStub);

      writableStream.end();

      const csv = await csvPromise;

      // then
      expect(csv).to.equal(expectedHeader);
    });
  });
});
