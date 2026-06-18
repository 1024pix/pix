import stream from 'node:stream';
import { text } from 'node:stream/consumers';

import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

const { PassThrough } = stream;

import { CampaignAssessmentExport } from '../../../../../../../src/prescription/campaign/infrastructure/serializers/csv/campaign-assessment-export.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | CSV | campaign-assessment-export', function () {
  describe('#export', function () {
    let outputStream, organization, campaign, competences, targetProfile, learningContent, stageCollection, translate;

    beforeEach(function () {
      outputStream = new PassThrough();
      translate = getI18n().__;

      organization = {};
      targetProfile = {
        badges: [],
      };
      stageCollection = {};
      learningContent = { skills: [], skillNames: [], competences: [], areas: [] };
      campaign = domainBuilder.prescription.campaign.buildCampaign.ofTypeAssessment({ externalIdLabel: null });

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
      const campaignProfile = new CampaignAssessmentExport({
        outputStream,
        organization,
        campaign,
        competences,
        targetProfile,
        learningContent,
        stageCollection,
        translate,
      });

      const expectedHeader =
        '"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Code";' +
        '"Nom de la campagne";' +
        '"Parcours";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"% de progression";' +
        '"Date et heure de début (Europe/Paris)";' +
        '"Partage (O/N)";' +
        '"Date et heure du partage (Europe/Paris)";' +
        '"% maitrise de l\'ensemble des acquis du profil"' +
        '\n';
      //when
      await campaignProfile.export({});

      outputStream.end();

      // then
      const csv = await text(outputStream);
      expect(csv).to.equal(expectedHeader);
    });

    it('should display additional header on generic import', async function () {
      //given
      const campaignProfile = new CampaignAssessmentExport({
        outputStream,
        organization,
        campaign,
        competences,
        targetProfile,
        learningContent,
        stageCollection,
        translate,
        additionalHeaders: [{ columnName: 'hobby' }, { columnName: 'holiday' }],
      });

      const expectedHeader =
        '"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Code";' +
        '"Nom de la campagne";' +
        '"Parcours";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"hobby";' +
        '"holiday";' +
        '"% de progression";' +
        '"Date et heure de début (Europe/Paris)";' +
        '"Partage (O/N)";' +
        '"Date et heure du partage (Europe/Paris)";' +
        '"% maitrise de l\'ensemble des acquis du profil"' +
        '\n';
      //when
      await campaignProfile.export({});

      outputStream.end();

      // then
      const csv = await text(outputStream);
      expect(csv).to.equal(expectedHeader);
    });

    it('should display all badges header', async function () {
      //given
      targetProfile.badges = [{ title: 'Un Pins' }, { title: 'Un macaron' }, { title: 'Une gomette' }];
      const campaignProfile = new CampaignAssessmentExport({
        outputStream,
        organization,
        campaign,
        competences,
        targetProfile,
        learningContent,
        stageCollection,
        translate,
      });

      const expectedHeader =
        '"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Code";' +
        '"Nom de la campagne";' +
        '"Parcours";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"% de progression";' +
        '"Date et heure de début (Europe/Paris)";' +
        '"Partage (O/N)";' +
        '"Date et heure du partage (Europe/Paris)";' +
        '"Un Pins obtenu (O/N)";' +
        '"Un macaron obtenu (O/N)";' +
        '"Une gomette obtenu (O/N)";' +
        '"% maitrise de l\'ensemble des acquis du profil"' +
        '\n';
      //when
      await campaignProfile.export({});

      outputStream.end();

      // then
      const csv = await text(outputStream);
      expect(csv).to.equal(expectedHeader);
    });

    it('should display stages header before badges header', async function () {
      //given
      targetProfile.badges = [{ title: 'Une gomette' }];
      stageCollection.hasStage = true;
      stageCollection.totalStages = 3;

      const campaignProfile = new CampaignAssessmentExport({
        outputStream,
        organization,
        campaign,
        competences,
        targetProfile,
        learningContent,
        stageCollection,
        translate,
      });

      const expectedHeader =
        '"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Code";' +
        '"Nom de la campagne";' +
        '"Parcours";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"% de progression";' +
        '"Date et heure de début (Europe/Paris)";' +
        '"Partage (O/N)";' +
        '"Date et heure du partage (Europe/Paris)";' +
        '"Palier obtenu (/2)";' +
        '"Une gomette obtenu (O/N)";' +
        '"% maitrise de l\'ensemble des acquis du profil"' +
        '\n';
      //when
      await campaignProfile.export({});

      outputStream.end();

      // then
      const csv = await text(outputStream);
      expect(csv).to.equal(expectedHeader);
    });

    it('should display division header when organization is SCO and managing students', async function () {
      //given
      organization.isSco = true;
      organization.isManagingStudents = true;

      const campaignProfile = new CampaignAssessmentExport({
        outputStream,
        organization,
        campaign,
        competences,
        targetProfile,
        learningContent,
        stageCollection,
        translate,
      });

      const expectedHeader =
        '"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Code";' +
        '"Nom de la campagne";' +
        '"Parcours";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"Classe";' +
        '"% de progression";' +
        '"Date et heure de début (Europe/Paris)";' +
        '"Partage (O/N)";' +
        '"Date et heure du partage (Europe/Paris)";' +
        '"% maitrise de l\'ensemble des acquis du profil"' +
        '\n';

      //when
      await campaignProfile.export({});

      outputStream.end();

      // then
      const csv = await text(outputStream);
      expect(csv).to.equal(expectedHeader);
    });

    it('displays all headers for SUP organization that manages students', async function () {
      //given
      organization.isSup = true;
      organization.isManagingStudents = true;

      const campaignProfile = new CampaignAssessmentExport({
        outputStream,
        organization,
        campaign,
        competences,
        targetProfile,
        learningContent,
        stageCollection,
        translate,
      });

      const expectedHeader =
        '"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Code";' +
        '"Nom de la campagne";' +
        '"Parcours";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"Groupe";' +
        '"Numéro Étudiant";' +
        '"% de progression";' +
        '"Date et heure de début (Europe/Paris)";' +
        '"Partage (O/N)";' +
        '"Date et heure du partage (Europe/Paris)";' +
        '"% maitrise de l\'ensemble des acquis du profil"' +
        '\n';

      //when
      await campaignProfile.export({});

      outputStream.end();

      // then
      const csv = await text(outputStream);
      expect(csv).to.equal(expectedHeader);
    });

    it('display externalIdLabel header when campaign has one', async function () {
      //given
      campaign.externalIdLabel = 'email';
      const campaignProfile = new CampaignAssessmentExport({
        outputStream,
        organization,
        campaign,
        competences,
        targetProfile,
        learningContent,
        stageCollection,
        translate,
      });

      const expectedHeader =
        '"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Code";' +
        '"Nom de la campagne";' +
        '"Parcours";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"email";' +
        '"% de progression";' +
        '"Date et heure de début (Europe/Paris)";' +
        '"Partage (O/N)";' +
        '"Date et heure du partage (Europe/Paris)";' +
        '"% maitrise de l\'ensemble des acquis du profil"' +
        '\n';

      //when
      await campaignProfile.export({});

      outputStream.end();

      // then
      const csv = await text(outputStream);
      expect(csv).to.equal(expectedHeader);
    });

    it('display skillNames when organization required it', async function () {
      //given
      organization.showSkills = true;
      learningContent.skillNames = ['ouai', 'cool', 'wahou'];
      const campaignProfile = new CampaignAssessmentExport({
        outputStream,
        organization,
        campaign,
        competences,
        targetProfile,
        learningContent,
        stageCollection,
        translate,
      });

      const expectedHeader =
        '"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Code";' +
        '"Nom de la campagne";' +
        '"Parcours";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"% de progression";' +
        '"Date et heure de début (Europe/Paris)";' +
        '"Partage (O/N)";' +
        '"Date et heure du partage (Europe/Paris)";' +
        '"% maitrise de l\'ensemble des acquis du profil";' +
        '"ouai";' +
        '"cool";' +
        '"wahou"' +
        '\n';

      //when
      await campaignProfile.export({});

      outputStream.end();

      // then
      const csv = await text(outputStream);
      expect(csv).to.equal(expectedHeader);
    });
  });
});
