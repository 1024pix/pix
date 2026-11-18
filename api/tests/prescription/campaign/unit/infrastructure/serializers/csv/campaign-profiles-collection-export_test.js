import { text } from 'node:stream/consumers';

import { expect } from 'chai';
import sinon from 'sinon';

import { CampaignProfilesCollectionExport } from '../../../../../../../src/prescription/campaign/infrastructure/serializers/csv/campaign-profiles-collection-export.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | CSV | campaign-profiles-collection-export', function () {
  describe('#export', function () {
    let organization, campaign, competences;

    const placementProfileServiceStub = {
      getPlacementProfilesWithSnapshotting: sinon.stub(),
    };

    const translate = getI18n().__;

    beforeEach(function () {
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

    it('should produce csv lines in the stream', async function () {
      // given
      const translateStub = sinon.stub();
      const additionalHeaders = [{ columnName: 'Classe' }];
      const exporter = new CampaignProfilesCollectionExport({
        organization,
        campaign,
        competences,
        translate: translateStub,
        additionalHeaders,
      });
      const placementProfileStub = {
        getPlacementProfilesWithSnapshotting: sinon.stub().resolves([]),
      };
      const campaignParticipationResultDatas = [
        {
          id: 1,
          createdAt: new Date(),
          isShared: false,
          sharedAt: null,
          participantExternalId: null,
          userId: 1,
          isCompleted: false,
          studentNumber: null,
          participantFirstName: 'John',
          participantLastName: 'Doe',
          division: '3C',
          pixScore: 136,
          group: null,
          additionalInfos: { Classe: 'CM1' },
        },
        {
          id: 2,
          createdAt: new Date(),
          isShared: false,
          sharedAt: null,
          participantExternalId: null,
          userId: 2,
          isCompleted: false,
          studentNumber: null,
          participantFirstName: 'Jane',
          participantLastName: 'Doe',
          division: '3C',
          pixScore: 200,
          group: null,
          additionalInfos: { Classe: 'CM2' },
        },
      ];

      // when
      const csv = await text(
        exporter.export(campaignParticipationResultDatas, placementProfileStub, {
          CHUNK_SIZE_CAMPAIGN_PROFILES_COLLECTION_EXPORT: 1,
        }),
      );

      // then
      const [, firstLine, secondLine] = csv.split('\n');
      expect(firstLine).to.includes('John');
      expect(secondLine).to.includes('Jane');
      // check additionnalInfos
      expect(firstLine).to.includes('CM1');
      expect(secondLine).to.includes('CM2');
    });

    it('should display common header parts of csv', async function () {
      //given
      const campaignProfile = new CampaignProfilesCollectionExport({
        organization,
        campaign,
        competences,
        translate,
      });

      const expectedHeader =
        '\uFEFF"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Code";' +
        '"Nom de la campagne";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"Envoi (O/N)";' +
        '"Date et heure de l\'envoi (Europe/Paris)";' +
        '"Nombre de pix total";' +
        '"Certifiable (O/N)";' +
        '"Nombre de compétences certifiables";' +
        '"Niveau pour la compétence Competence1";' +
        '"Nombre de pix pour la compétence Competence1";' +
        '"Niveau pour la compétence Competence2";' +
        '"Nombre de pix pour la compétence Competence2"\n';
      //when
      const csv = await text(campaignProfile.export([], placementProfileServiceStub));

      // then
      expect(csv).to.equal(expectedHeader);
    });

    it('should display division header when organization is SCO and managing students', async function () {
      //given
      organization.isSco = true;
      organization.isManagingStudents = true;

      const campaignProfile = new CampaignProfilesCollectionExport({
        organization,
        campaign,
        competences,
        translate,
      });

      const expectedHeader =
        '\uFEFF"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Code";' +
        '"Nom de la campagne";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"Classe";' +
        '"Envoi (O/N)";' +
        '"Date et heure de l\'envoi (Europe/Paris)";' +
        '"Nombre de pix total";' +
        '"Certifiable (O/N)";' +
        '"Nombre de compétences certifiables";' +
        '"Niveau pour la compétence Competence1";' +
        '"Nombre de pix pour la compétence Competence1";' +
        '"Niveau pour la compétence Competence2";' +
        '"Nombre de pix pour la compétence Competence2"\n';
      //when
      const csv = await text(campaignProfile.export([], placementProfileServiceStub));

      // then
      expect(csv).to.equal(expectedHeader);
    });

    it('It displays all headers for SUP organization that manages students', async function () {
      //given
      organization.isSup = true;
      organization.isManagingStudents = true;

      const campaignProfile = new CampaignProfilesCollectionExport({
        organization,
        campaign,
        competences,
        translate,
      });

      const expectedHeader =
        '\uFEFF"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Code";' +
        '"Nom de la campagne";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"Groupe";' +
        '"Numéro Étudiant";' +
        '"Envoi (O/N)";' +
        '"Date et heure de l\'envoi (Europe/Paris)";' +
        '"Nombre de pix total";' +
        '"Certifiable (O/N)";' +
        '"Nombre de compétences certifiables";' +
        '"Niveau pour la compétence Competence1";' +
        '"Nombre de pix pour la compétence Competence1";' +
        '"Niveau pour la compétence Competence2";' +
        '"Nombre de pix pour la compétence Competence2"\n';
      //when
      const csv = await text(campaignProfile.export([], placementProfileServiceStub));

      // then
      expect(csv).to.equal(expectedHeader);
    });

    it('should display externalIdLabel header when campaign has one', async function () {
      //given
      campaign.externalIdLabel = 'email';
      const campaignProfile = new CampaignProfilesCollectionExport({
        organization,
        campaign,
        competences,
        translate,
      });

      const expectedHeader =
        '\uFEFF"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Code";' +
        '"Nom de la campagne";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"email";' +
        '"Envoi (O/N)";' +
        '"Date et heure de l\'envoi (Europe/Paris)";' +
        '"Nombre de pix total";' +
        '"Certifiable (O/N)";' +
        '"Nombre de compétences certifiables";' +
        '"Niveau pour la compétence Competence1";' +
        '"Nombre de pix pour la compétence Competence1";' +
        '"Niveau pour la compétence Competence2";' +
        '"Nombre de pix pour la compétence Competence2"\n';
      //when
      const csv = await text(campaignProfile.export([], placementProfileServiceStub));

      // then
      expect(csv).to.equal(expectedHeader);
    });

    context('when consuming the stream', function () {
      let placementProfileStub, exporter, participations;

      const buildParticipation = (id) => ({
        id,
        createdAt: new Date(),
        isShared: false,
        sharedAt: null,
        participantExternalId: null,
        userId: id,
        isCompleted: false,
        studentNumber: null,
        participantFirstName: `Prénom${id}`,
        participantLastName: `Nom${id}`,
        division: null,
        pixScore: 0,
        group: null,
        additionalInfos: {},
      });
      const constants = {
        CHUNK_SIZE_CAMPAIGN_PROFILES_COLLECTION_EXPORT: 1,
      };

      beforeEach(function () {
        placementProfileStub = { getPlacementProfilesWithSnapshotting: sinon.stub().resolves([]) };
        exporter = new CampaignProfilesCollectionExport({ organization, campaign, competences });
        participations = Array.from({ length: 100 }, (_, index) => buildParticipation(index + 1));
      });

      it('should stop processing chunks when the stream is destroyed', async function () {
        // given
        const chunks = exporter.export(participations, placementProfileStub, constants);

        // when
        // eslint-disable-next-line no-unused-vars
        for await (const _chunk of chunks) {
          break;
        }

        // then
        expect(placementProfileStub.getPlacementProfilesWithSnapshotting.callCount).to.be.below(participations.length);
      });

      it('should fail when a chunk cannot be computed', async function () {
        // given
        const error = new Error('boom');
        placementProfileStub.getPlacementProfilesWithSnapshotting.rejects(error);

        // when
        const call = text(exporter.export(participations, placementProfileStub, constants));

        // then
        await expect(call).to.be.rejectedWith(error);
      });
    });
  });
});
