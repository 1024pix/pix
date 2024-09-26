import stream from 'node:stream';

const { PassThrough } = stream;

import { CampaignProfilesCollectionExport } from '../../../../../../../src/prescription/campaign/infrastructure/serializers/csv/campaign-profiles-collection-export.js';
import { domainBuilder, expect, sinon, streamToPromise } from '../../../../../../test-helper.js';
import { getI18n } from '../../../../../../tooling/i18n/i18n.js';

describe('Unit | Serializer | CSV | campaign-profiles-collection-export', function () {
  describe('#export', function () {
    let outputStream, csvPromise, organization, campaign, competences;

    const placementProfileServiceStub = {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      getPlacementProfilesWithSnapshotting: sinon.stub(),
    };

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const translate = getI18n().__;

    beforeEach(function () {
      outputStream = new PassThrough();
      csvPromise = streamToPromise(outputStream);

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

    it('should write csv lines to stream', async function () {
      // given
      const noOpStream = { write: sinon.stub() };

      const translateStub = sinon.stub();
      const additionalHeaders = [{ columnName: 'Classe' }];
      const exporter = new CampaignProfilesCollectionExport({
        outputStream: noOpStream,
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
      await exporter.export(campaignParticipationResultDatas, placementProfileStub, {
        CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING: 1,
        CONCURRENCY_HEAVY_OPERATIONS: 1,
      });

      // then
      expect(noOpStream.write.getCall(1).args[0]).to.includes('John');
      expect(noOpStream.write.getCall(2).args[0]).to.includes('Jane');
      // check additionnalInfos
      expect(noOpStream.write.getCall(1).args[0]).to.includes('CM1');
      expect(noOpStream.write.getCall(2).args[0]).to.includes('CM2');
    });

    it('should display common header parts of csv', async function () {
      //given
      const campaignProfile = new CampaignProfilesCollectionExport({
        outputStream,
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

      outputStream.end();

      const csv = await csvPromise;

      // then
      expect(csv).to.equal(expectedHeader);
    });

    it('should display division header when organization is SCO and managing students', async function () {
      //given
      organization.isSco = true;
      organization.isManagingStudents = true;

      const campaignProfile = new CampaignProfilesCollectionExport({
        outputStream,
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

      outputStream.end();

      const csv = await csvPromise;

      // then
      expect(csv).to.equal(expectedHeader);
    });

    it('It displays all headers for SUP organization that manages students', async function () {
      //given
      organization.isSup = true;
      organization.isManagingStudents = true;

      const campaignProfile = new CampaignProfilesCollectionExport({
        outputStream,
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

      outputStream.end();

      const csv = await csvPromise;

      // then
      expect(csv).to.equal(expectedHeader);
    });

    it('should display idPixLabel header when campaign has one', async function () {
      //given
      campaign.idPixLabel = 'email';
      const campaignProfile = new CampaignProfilesCollectionExport({
        outputStream,
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

      outputStream.end();

      const csv = await csvPromise;

      // then
      expect(csv).to.equal(expectedHeader);
    });
  });
});
