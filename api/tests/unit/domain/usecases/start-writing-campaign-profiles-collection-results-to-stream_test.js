const { PassThrough } = require('stream');
const { expect, sinon, domainBuilder, streamToPromise } = require('../../../test-helper');

const startWritingCampaignProfilesCollectionResultsToStream = require('../../../../lib/domain/usecases/start-writing-campaign-profiles-collection-results-to-stream');
const CertificationProfile = require('../../../../lib/domain/models/CertificationProfile');

describe('Unit | Domain | Use Cases | start-writing-campaign-profiles-collection-results-to-stream', () => {

  describe('#startWritingCampaignProfilesCollectionResultsToStream', () => {

    const user = domainBuilder.buildUser({ firstName: '@Jean', lastName: '=Bono' });
    const organization = user.memberships[0].organization;
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

    const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection({
      name: '@Campagne de Test N°2',
      code: 'QWERTY456',
      organizationId: organization.id,
      idPixLabel: 'Mail Perso',
    });

    const certificationProfile = new CertificationProfile({
      userCompetences: [{
        id: 'recCompetence1',
        pixScore: 9,
        estimatedLevel: 1
      }, {
        id: 'recCompetence2',
        pixScore: 4,
        estimatedLevel: 0
      }]
    });

    const campaignRepository = { get: () => undefined };
    const userRepository = { getWithMemberships: () => undefined };
    const competenceRepository = { listPixCompetencesOnly: () => undefined };
    const organizationRepository = { get: () => undefined };
    const campaignParticipationRepository = { findProfilesCollectionResultDataByCampaignId: () => undefined };
    const userService = { getCertificationProfile: () => undefined };
    let findProfilesCollectionResultDataByCampaignIdStub;

    let writableStream;
    let csvPromise;

    beforeEach(() => {
      sinon.stub(competenceRepository, 'listPixCompetencesOnly').resolves(competences);
      sinon.stub(userRepository, 'getWithMemberships').resolves(user);
      sinon.stub(organizationRepository, 'get').resolves(organization);
      findProfilesCollectionResultDataByCampaignIdStub = sinon.stub(campaignParticipationRepository, 'findProfilesCollectionResultDataByCampaignId');
      sinon.stub(campaignRepository, 'get').resolves(campaign);
      sinon.stub(userService, 'getCertificationProfile').resolves(certificationProfile);

      writableStream = new PassThrough();
      csvPromise = streamToPromise(writableStream);
    });

    it('should return the header in CSV styles with all competences', async () => {
      // given
      const csvExpected = '\uFEFF"Nom de l\'organisation";' +
        '"ID Campagne";' +
        '"Nom de la campagne";' +
        '"Nom du Participant";' +
        '"Prénom du Participant";' +
        '"Mail Perso";' +
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
        userService,
      });

      const csv = await csvPromise;

      // then
      expect(csv).to.equal(csvExpected);
    });

    context('when isShared is true', () => {

      it('should return the complete line with 1 certifiable competence', async () => {
        // given
        sinon.stub(CertificationProfile.prototype, 'isCertifiable').returns(false);
        sinon.stub(CertificationProfile.prototype, 'getCertifiableCompetencesCount').returns(1);

        const campaignParticipationResultData = {
          id: 1,
          isShared: true,
          isCompleted: true,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          sharedAt: new Date('2019-03-01T23:04:05Z'),
          participantExternalId: '+Mon mail pro',
          userId: 123,
          participantFirstName: user.firstName,
          participantLastName: user.lastName,
        };
        findProfilesCollectionResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

        const csvSecondLine = `"${organization.name}";` +
          `${campaign.id};` +
          `"'${campaign.name}";` +
          `"'${user.lastName}";` +
          `"'${user.firstName}";` +
          `"'${campaignParticipationResultData.participantExternalId}";` +
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
          userService,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');

        // then
        expect(csvLines[1]).to.equal(csvSecondLine);
      });

      it('should return the complete line with 5 certifiable competence', async () => {
        // given
        sinon.stub(CertificationProfile.prototype, 'isCertifiable').returns(true);
        sinon.stub(CertificationProfile.prototype, 'getCertifiableCompetencesCount').returns(5);

        const campaignParticipationResultData = {
          id: 1,
          isShared: true,
          isCompleted: true,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          sharedAt: new Date('2019-03-01T23:04:05Z'),
          participantExternalId: '+Mon mail pro',
          userId: 123,
          participantFirstName: user.firstName,
          participantLastName: user.lastName,
        };
        findProfilesCollectionResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

        const csvSecondLine = `"${organization.name}";` +
          `${campaign.id};` +
          `"'${campaign.name}";` +
          `"'${user.lastName}";` +
          `"'${user.firstName}";` +
          `"'${campaignParticipationResultData.participantExternalId}";` +
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
          userService,
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
        };

        findProfilesCollectionResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

        const csvSecondLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"'${campaign.name}";` +
          `"'${user.lastName}";` +
          `"'${user.firstName}";` +
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
          userService,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');

        // then
        expect(csvLines[1]).to.equal(csvSecondLine);
      });
    });

    context('when campaign do not have a idPixLabel', () => {

      beforeEach(() => {
        const campaignParticipationResultData = {
          id: 1,
          isShared: false,
          createdAt: new Date('2019-02-25T10:00:00Z'),
          userId: 123,
          participantFirstName: user.firstName,
          participantLastName: user.lastName,
        };

        findProfilesCollectionResultDataByCampaignIdStub.resolves([campaignParticipationResultData]);

        const campaignWithoutIdPixLabel = domainBuilder.buildCampaign.ofTypeProfilesCollection({
          name: 'CampaignName',
          code: 'AZERTY123',
          organizationId: organization.id,
          idPixLabel: null,
        });
        campaignRepository.get.resolves(campaignWithoutIdPixLabel);
      });

      it('should return the header in CSV styles with all competence, domain and skills', async () => {
        // given
        const csvExpected = '\uFEFF"Nom de l\'organisation";' +
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
          userService,
        });

        const csv = await csvPromise;
        const csvLines = csv.split('\n');

        // then
        expect(csvLines[0]).to.equal(csvExpected);
      });
    });
  });
});
