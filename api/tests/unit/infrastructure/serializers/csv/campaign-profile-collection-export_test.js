const { PassThrough } = require('stream');
const { domainBuilder, expect, sinon, streamToPromise } = require('../../../../test-helper');

const CampaignProfileCollectionExport = require('../../../../../lib/infrastructure/serializers/csv/campaign-profile-collection-export');
const { getI18n } = require('../../../../tooling/i18n/i18n');

describe('Unit | Serializer | CSV | campaign-profile-collection-export', () => {
  describe('#export', () => {
    let writableStream, csvPromise, organization, campaign, competences;

    const placementProfileServiceStub = {
      getPlacementProfilesWithSnapshotting: sinon.stub(),
    };

    const translate = getI18n().__;

    beforeEach(() => {
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

    it('should display common header parts of csv', async () => {
      //given
      const campaignProfile = new CampaignProfileCollectionExport(writableStream, organization, campaign, competences, translate);

      const expectedHeader = '\uFEFF"Nom de l\'organisation";' +
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

    it('should display division header when organization is SCO and managing students', async () => {
      //given
      organization.isSco = true;
      organization.isManagingStudents = true;

      const campaignProfile = new CampaignProfileCollectionExport(writableStream, organization, campaign, competences, translate);

      const expectedHeader = '\uFEFF"Nom de l\'organisation";' +
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

    it('should display student number header when organization is SUP and managing students', async () => {
      //given
      organization.isSup = true;
      organization.isManagingStudents = true;

      const campaignProfile = new CampaignProfileCollectionExport(writableStream, organization, campaign, competences, translate);

      const expectedHeader = '\uFEFF"Nom de l\'organisation";' +
          '"ID Campagne";' +
          '"Nom de la campagne";' +
          '"Nom du Participant";' +
          '"Prénom du Participant";' +
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

    it('should display idPixLabel header when campaign has one', async () => {
      //given
      campaign.idPixLabel = 'email';
      const campaignProfile = new CampaignProfileCollectionExport(writableStream, organization, campaign, competences, translate);

      const expectedHeader = '\uFEFF"Nom de l\'organisation";' +
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
