const { PassThrough } = require('stream');
const { expect, sinon, domainBuilder, streamToPromise } = require('../../../test-helper');

const startWritingCampaignProfilesCollectionResultsToStream = require('../../../../lib/domain/usecases/start-writing-campaign-profiles-collection-results-to-stream');
const PlacementProfile = require('../../../../lib/domain/models/PlacementProfile');

describe('Unit | Domain | Use Cases | start-writing-campaign-profiles-collection-results-to-stream', () => {

  const user = domainBuilder.buildUser({ firstName: '@Jean', lastName: '=Bono' });
  const organization = user.memberships[0].organization;
  let campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection({
    name: '@Campagne de Test N°2',
    code: 'QWERTY456',
    organizationId: organization.id,
    idPixLabel: null,
  });

  describe('#startWritingCampaignProfilesCollectionResultsToStream', () => {

    const listSkills1 = domainBuilder.buildSkillCollection({ name: '@web', minLevel: 1, maxLevel: 5 });
    const listSkills2 = domainBuilder.buildSkillCollection({ name: '@url', minLevel: 1, maxLevel: 2 });

    const competences = [
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

    const placementProfile = new PlacementProfile({
      userId: 123,
      userCompetences: [{
        id: 'recCompetence1',
        pixScore: 9,
        estimatedLevel: 1,
      }, {
        id: 'recCompetence2',
        pixScore: 4,
        estimatedLevel: 0,
      }],
    });

    const campaignRepository = { get: () => undefined };
    const userRepository = { getWithMemberships: () => undefined };
    const competenceRepository = { listPixCompetencesOnly: () => undefined };
    const organizationRepository = { get: () => undefined };
    const campaignParticipationRepository = { findProfilesCollectionResultDataByCampaignId: () => undefined };
    const placementProfileService = { getPlacementProfilesWithSnapshotting: () => undefined };
    let findProfilesCollectionResultDataByCampaignIdStub;

    let writableStream;
    let csvPromise;

    beforeEach(() => {
      sinon.stub(competenceRepository, 'listPixCompetencesOnly').resolves(competences);
      sinon.stub(userRepository, 'getWithMemberships').resolves(user);
      findProfilesCollectionResultDataByCampaignIdStub = sinon.stub(campaignParticipationRepository, 'findProfilesCollectionResultDataByCampaignId');
      sinon.stub(campaignRepository, 'get').resolves(campaign);
      sinon.stub(placementProfileService, 'getPlacementProfilesWithSnapshotting').resolves([placementProfile]);
      writableStream = new PassThrough();
      csvPromise = streamToPromise(writableStream);
    });

    context('When organization is not SUP', () => {
      beforeEach(() => {
        organization.type = 'SCO';
        sinon.stub(organizationRepository, 'get').resolves(organization);
      });

      it('should return the header in CSV styles with all competences', async () => {
        // given
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
        findProfilesCollectionResultDataByCampaignIdStub.resolves([]);

        // when
        startWritingCampaignProfilesCollectionResultsToStream({
          userId: user.id,
          campaignId: campaign.id,
          writableStream,
          campaignRepository,
          userRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          placementProfileService,
        });

        const csv = await csvPromise;

        // then
        expect(csv).to.equal(expectedHeader);
      });

      context('when isShared is true', () => {

        it('should return the complete line with 1 certifiable competence', async () => {
          // given
          sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(false);
          sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(1);

          const campaignParticipationResultData = {
            id: 1,
            isShared: true,
            isCompleted: true,
            createdAt: new Date('2019-02-25T10:00:00Z'),
            sharedAt: new Date('2019-03-01T23:04:05Z'),
            userId: 123,
            participantFirstName: user.firstName,
            participantLastName: user.lastName,
            division: '6emeA',
          };
          findProfilesCollectionResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

          const csvSecondLine = `"${organization.name}";` +
            `${campaign.id};` +
            `"'${campaign.name}";` +
            `"'${user.lastName}";` +
            `"'${user.firstName}";` +
            `"${campaignParticipationResultData.division}";` +
            '"Oui";' +
            '2019-03-01;' +
            '13;' +
            '"Non";' +
            '1;' +
            '1;' +
            '9;' +
            '0;' +
            '4';

          // when
          startWritingCampaignProfilesCollectionResultsToStream({
            userId: user.id,
            campaignId: campaign.id,
            writableStream,
            campaignRepository,
            userRepository,
            competenceRepository,
            organizationRepository,
            campaignParticipationRepository,
            placementProfileService,
          });

          const csv = await csvPromise;
          const csvLines = csv.split('\n');

          // then
          expect(csvLines[1]).to.equal(csvSecondLine);
        });

        it('should return the complete line with 5 certifiable competence', async () => {
          // given
          sinon.stub(PlacementProfile.prototype, 'isCertifiable').returns(true);
          sinon.stub(PlacementProfile.prototype, 'getCertifiableCompetencesCount').returns(5);

          const campaignParticipationResultData = {
            id: 1,
            isShared: true,
            isCompleted: true,
            createdAt: new Date('2019-02-25T10:00:00Z'),
            sharedAt: new Date('2019-03-01T23:04:05Z'),
            userId: 123,
            participantFirstName: user.firstName,
            participantLastName: user.lastName,
            division: '5emeB',
          };
          findProfilesCollectionResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

          const csvSecondLine = `"${organization.name}";` +
            `${campaign.id};` +
            `"'${campaign.name}";` +
            `"'${user.lastName}";` +
            `"'${user.firstName}";` +
            `"${campaignParticipationResultData.division}";` +
            '"Oui";' +
            '2019-03-01;' +
            '13;' +
            '"Oui";' +
            '5;' +
            '1;' +
            '9;' +
            '0;' +
            '4';

          // when
          startWritingCampaignProfilesCollectionResultsToStream({
            userId: user.id,
            campaignId: campaign.id,
            writableStream,
            campaignRepository,
            userRepository,
            competenceRepository,
            organizationRepository,
            campaignParticipationRepository,
            placementProfileService,
          });

          const csv = await csvPromise;
          const csvLines = csv.split('\n');

          // then
          expect(csvLines[1]).to.equal(csvSecondLine);
        });
      });

      context('when isShared is false', () => {

        it('should return the beginning of the line with user information for her participation', async () => {
          // given
          const campaignParticipationResultData = {
            id: 1,
            isShared: false,
            isCompleted: true,
            createdAt: new Date('2019-02-25T10:00:00Z'),
            sharedAt: new Date('2019-03-01T23:04:05Z'),
            participantExternalId: '-Mon mail pro',
            userId: 123,
            participantFirstName: user.firstName,
            participantLastName: user.lastName,
            division: '4emeC',
          };

          findProfilesCollectionResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

          const csvSecondLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"'${campaign.name}";` +
            `"'${user.lastName}";` +
            `"'${user.firstName}";` +
            `"${campaignParticipationResultData.division}";` +
            '"Non";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA"';

          // when
          startWritingCampaignProfilesCollectionResultsToStream({
            userId: user.id,
            campaignId: campaign.id,
            writableStream,
            campaignRepository,
            userRepository,
            competenceRepository,
            organizationRepository,
            campaignParticipationRepository,
            placementProfileService,
          });

          const csv = await csvPromise;
          const csvLines = csv.split('\n');

          // then
          expect(csvLines[1]).to.equal(csvSecondLine);
        });
      });
    });

    context('When organization is SUP and isManagingStudent', () => {
      beforeEach(() => {
        organization.type = 'SUP';
        organization.isManagingStudents = true;
        sinon.stub(organizationRepository, 'get').resolves(organization);
      });

      it('should return the header in CSV with Student Number', async () => {
        // given
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
          '"Nombre de pix pour la compétence Competence2"';

        // when
        startWritingCampaignProfilesCollectionResultsToStream({
          userId: user.id,
          campaignId: campaign.id,
          writableStream,
          campaignRepository,
          userRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          placementProfileService,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');

        // then
        expect(csvLines[0]).to.equal(expectedHeader);
      });

      context ('when the participant does not have a student number', () => {
        it('should return the csv without student number information', async () => {
          // given
          const campaignParticipationResultData = {
            id: 1,
            isShared: false,
            isCompleted: true,
            createdAt: new Date('2019-02-25T10:00:00Z'),
            sharedAt: new Date('2019-03-01T23:04:05Z'),
            userId: 123,
            participantFirstName: user.firstName,
            participantLastName: user.lastName,
            studentNumber: '',
          };

          findProfilesCollectionResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

          const csvSecondLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"'${campaign.name}";` +
            `"'${user.lastName}";` +
            `"'${user.firstName}";` +
            `"${campaignParticipationResultData.studentNumber}";` +
            '"Non";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA"';

          // when
          startWritingCampaignProfilesCollectionResultsToStream({
            userId: user.id,
            campaignId: campaign.id,
            writableStream,
            campaignRepository,
            userRepository,
            competenceRepository,
            organizationRepository,
            campaignParticipationRepository,
            placementProfileService,
          });

          const csv = await csvPromise;
          const csvLines = csv.split('\n');

          // then
          expect(csvLines[1]).to.equal(csvSecondLine);
        });
      });

      context ('when the participant have a student number', () => {
        it('should return the csv with student number information', async () => {
          // given
          const campaignParticipationResultData = {
            id: 1,
            isShared: false,
            isCompleted: true,
            createdAt: new Date('2019-02-25T10:00:00Z'),
            sharedAt: new Date('2019-03-01T23:04:05Z'),
            userId: 123,
            participantFirstName: user.firstName,
            participantLastName: user.lastName,
            studentNumber: '12345A',
          };

          findProfilesCollectionResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

          const csvSecondLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"'${campaign.name}";` +
            `"'${user.lastName}";` +
            `"'${user.firstName}";` +
            `"${campaignParticipationResultData.studentNumber}";` +
            '"Non";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA"';

          // when
          startWritingCampaignProfilesCollectionResultsToStream({
            userId: user.id,
            campaignId: campaign.id,
            writableStream,
            campaignRepository,
            userRepository,
            competenceRepository,
            organizationRepository,
            campaignParticipationRepository,
            placementProfileService,
          });

          const csv = await csvPromise;
          const csvLines = csv.split('\n');

          // then
          expect(csvLines[1]).to.equal(csvSecondLine);
        });
      });
    });

    context('When organization is SUP and not isManagingStudent', () => {
      beforeEach(() => {
        organization.type = 'SUP';
        organization.isManagingStudents = false;
        sinon.stub(organizationRepository, 'get').resolves(organization);
      });

      it('should return the header in CSV without Student Number', async () => {
        // given
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
            '"Nombre de pix pour la compétence Competence2"';

        // when
        startWritingCampaignProfilesCollectionResultsToStream({
          userId: user.id,
          campaignId: campaign.id,
          writableStream,
          campaignRepository,
          userRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          placementProfileService,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');

        // then
        expect(csvLines[0]).to.equal(expectedHeader);
      });

      context ('when the participant have a student number', () => {
        it('should return the csv without student number information', async () => {
          // given
          const campaignParticipationResultData = {
            id: 1,
            isShared: false,
            isCompleted: true,
            createdAt: new Date('2019-02-25T10:00:00Z'),
            sharedAt: new Date('2019-03-01T23:04:05Z'),
            userId: 123,
            participantFirstName: user.firstName,
            participantLastName: user.lastName,
            studentNumber: '12345A',
          };

          findProfilesCollectionResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

          const csvSecondLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"'${campaign.name}";` +
            `"'${user.lastName}";` +
            `"'${user.firstName}";` +
            '"Non";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA"';

          // when
          startWritingCampaignProfilesCollectionResultsToStream({
            userId: user.id,
            campaignId: campaign.id,
            writableStream,
            campaignRepository,
            userRepository,
            competenceRepository,
            organizationRepository,
            campaignParticipationRepository,
            placementProfileService,
          });

          const csv = await csvPromise;
          const csvLines = csv.split('\n');

          // then
          expect(csvLines[1]).to.equal(csvSecondLine);
        });
      });
    });

    context('When campaign has an idPixLabel', () => {
      beforeEach(() => {
        organization.type = 'SCO';
        campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection({
          name: '@Campagne test idPixLabel',
          code: 'AZERTY123',
          organizationId: organization.id,
          idPixLabel: 'Mail Pro',
        });

        campaignRepository.get.resolves(campaign);
        sinon.stub(organizationRepository, 'get').resolves(organization);
      });

      it('should return the header in CSV styles with all competence, domain and skills', async () => {
        // given
        const expectedHeader = '\uFEFF"Nom de l\'organisation";' +
          '"ID Campagne";' +
          '"Nom de la campagne";' +
          '"Nom du Participant";' +
          '"Prénom du Participant";' +
          '"Classe";' +
          '"Mail Pro";' +
          '"Envoi (O/N)";' +
          '"Date de l\'envoi";' +
          '"Nombre de pix total";' +
          '"Certifiable (O/N)";' +
          '"Nombre de compétences certifiables";' +
          '"Niveau pour la compétence Competence1";' +
          '"Nombre de pix pour la compétence Competence1";' +
          '"Niveau pour la compétence Competence2";' +
          '"Nombre de pix pour la compétence Competence2"';

        // when
        startWritingCampaignProfilesCollectionResultsToStream({
          userId: user.id,
          campaignId: campaign.id,
          writableStream,
          campaignRepository,
          userRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          placementProfileService,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');

        // then
        expect(csvLines[0]).to.equal(expectedHeader);
      });

      it('should return the csv with external id label', async () => {
        // given
        const campaignParticipationResultData = {
          id: 1,
          isShared: false,
          isCompleted: true,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          sharedAt: new Date('2019-03-01T23:04:05Z'),
          participantExternalId: '-Mon mail pro',
          userId: 123,
          participantFirstName: user.firstName,
          participantLastName: user.lastName,
          division: '3emeD',
        };

        findProfilesCollectionResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

        const csvSecondLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"'${campaign.name}";` +
          `"'${user.lastName}";` +
          `"'${user.firstName}";` +
          `"${campaignParticipationResultData.division}";` +
          `"'${campaignParticipationResultData.participantExternalId}";` +
          '"Non";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA"';

        // when
        startWritingCampaignProfilesCollectionResultsToStream({
          userId: user.id,
          campaignId: campaign.id,
          writableStream,
          campaignRepository,
          userRepository,
          competenceRepository,
          organizationRepository,
          campaignParticipationRepository,
          placementProfileService,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');

        // then
        expect(csvLines[1]).to.equal(csvSecondLine);
      });
    });
  });
});
