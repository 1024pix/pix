const { PassThrough } = require('stream');
const { expect, sinon, domainBuilder, streamToPromise, catchErr } = require('../../../test-helper');
const startWritingCampaignAssessmentResultsToStream = require('../../../../lib/domain/usecases/start-writing-campaign-assessment-results-to-stream');
const { UserNotAuthorizedToGetCampaignResultsError } = require('../../../../lib/domain/errors');
const campaignCsvExportService = require('../../../../lib/domain/services/campaign-csv-export-service');

describe('Unit | Domain | Use Cases | start-writing-campaign-assessment-results-to-stream', () => {
  const campaignRepository = { get: () => undefined };
  const userRepository = { getWithMemberships: () => undefined };
  const targetProfileRepository = { get: () => undefined };
  const competenceRepository = { list: () => undefined };
  const organizationRepository = { get: () => undefined };
  const campaignParticipationInfoRepository = { findByCampaignId: () => undefined };
  const knowledgeElementRepository = { findTargetedGroupedByCompetencesForUsers: () => undefined };
  let writableStream;
  let csvPromise;

  beforeEach(() => {
    writableStream = new PassThrough();
    csvPromise = streamToPromise(writableStream);
  });

  it('should throw a UserNotAuthorizedToGetCampaignResultsError when user is not authorized', async () => {
    // given
    const notAuthorizedUser = domainBuilder.buildUser({ memberships: [] });
    const campaign = domainBuilder.buildCampaign();
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(notAuthorizedUser.id).resolves(notAuthorizedUser);
    sinon.stub(targetProfileRepository, 'get').rejects();
    sinon.stub(competenceRepository, 'list').rejects();
    sinon.stub(organizationRepository, 'get').rejects();
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').rejects();
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').rejects();

    // when
    const err = await catchErr(startWritingCampaignAssessmentResultsToStream)({
      userId: notAuthorizedUser.id,
      campaignId: campaign.id,
      writableStream,
      campaignRepository,
      userRepository,
      targetProfileRepository,
      competenceRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });

    // then
    expect(err).to.be.instanceOf(UserNotAuthorizedToGetCampaignResultsError);
    expect(err.message).to.equal(`User does not have an access to the organization ${campaign.organizationId}`);
  });

  it('should throw an error when target profile presents a competence unknown in the learning content', async () => {
    // given
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign();
    const targetedSkillOfUnknownCompetence = domainBuilder.buildSkill({ competenceId: 'TROLOLOLO' });
    const targetProfile = domainBuilder.buildTargetProfile({ skills: [targetedSkillOfUnknownCompetence] });
    campaign.targetProfileId = targetProfile.id;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organizationId).resolves(organization);
    sinon.stub(targetProfileRepository, 'get').withArgs(campaign.targetProfileId).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
    sinon.stub(competenceRepository, 'list').resolves([domainBuilder.buildCompetence({ id: 'realCompetenceId' })]);
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').rejects();

    // when
    const err = await catchErr(startWritingCampaignAssessmentResultsToStream)({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      campaignRepository,
      userRepository,
      targetProfileRepository,
      competenceRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });

    // then
    expect(err).to.be.instanceOf(Error);
    expect(err.message).to.equal('Unknown competence TROLOLOLO');
  });

  it('should return common parts of header with appropriate info', async () => {
    // given
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign();
    const area1 = domainBuilder.buildArea({ code: '1' });
    const competence1_1 = domainBuilder.buildCompetence({ area: area1, index: '1.1' });
    const skill1_1_1 = domainBuilder.buildSkill({ competenceId: competence1_1.id, name: '@acquis1' });
    const competence1_2 = domainBuilder.buildCompetence({ area: area1, index: '1.2' });
    const skill1_2_1 = domainBuilder.buildSkill({ competenceId: competence1_2.id, name: '@acquis2' });
    const area2 = domainBuilder.buildArea({ code: '2' });
    const competence2_1 = domainBuilder.buildCompetence({ area: area2, index: '2.1' });
    const skill2_1_1 = domainBuilder.buildSkill({ competenceId: competence2_1.id, name: '@acquis3' });
    const skill2_1_2 = domainBuilder.buildSkill({ competenceId: competence2_1.id, name: '@acquis4' });
    const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1_1_1, skill1_2_1, skill2_1_1, skill2_1_2] });
    campaign.targetProfileId = targetProfile.id;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organizationId).resolves(organization);
    sinon.stub(targetProfileRepository, 'get').withArgs(campaign.targetProfileId).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
    sinon.stub(competenceRepository, 'list').resolves([competence1_2, competence2_1, competence1_1]);
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').rejects();
    const csvExpected = '\uFEFF"Nom de l\'organisation";' +
      '"ID Campagne";' +
      '"Nom de la campagne";' +
      '"Nom du Profil Cible";' +
      '"Nom du Participant";' +
      '"Prénom du Participant";' +
      '"% de progression";' +
      '"Date de début";' +
      '"Partage (O/N)";' +
      '"Date du partage";' +
      '"% maitrise de l\'ensemble des acquis du profil";' +
      `"% de maitrise des acquis de la compétence ${competence1_1.name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${competence1_1.name}";` +
      `"Acquis maitrisés dans la compétence ${competence1_1.name}";` +
      `"% de maitrise des acquis de la compétence ${competence1_2.name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${competence1_2.name}";` +
      `"Acquis maitrisés dans la compétence ${competence1_2.name}";` +
      `"% de maitrise des acquis de la compétence ${competence2_1.name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${competence2_1.name}";` +
      `"Acquis maitrisés dans la compétence ${competence2_1.name}";` +
      `"% de maitrise des acquis du domaine ${area1.title}";` +
      `"Nombre d'acquis du profil cible du domaine ${area1.title}";` +
      `"Acquis maitrisés du domaine ${area1.title}";` +
      `"% de maitrise des acquis du domaine ${area2.title}";` +
      `"Nombre d'acquis du profil cible du domaine ${area2.title}";` +
      `"Acquis maitrisés du domaine ${area2.title}";` +
      `"'${skill1_1_1.name}";` +
      `"'${skill1_2_1.name}";` +
      `"'${skill2_1_1.name}";` +
      `"'${skill2_1_2.name}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      campaignRepository,
      userRepository,
      targetProfileRepository,
      competenceRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should contains idPixLabel in header if any setup in campaign', async () => {
    // given
    const idPixLabel = 'Numéro de carte bleue';
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign({ idPixLabel });
    const area = domainBuilder.buildArea();
    const competence = domainBuilder.buildCompetence({ area });
    const skill = domainBuilder.buildSkill({ competenceId: competence.id });
    const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });
    campaign.targetProfileId = targetProfile.id;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organizationId).resolves(organization);
    sinon.stub(targetProfileRepository, 'get').withArgs(campaign.targetProfileId).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
    sinon.stub(competenceRepository, 'list').resolves([competence]);
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').rejects();
    const csvExpected = '\uFEFF"Nom de l\'organisation";' +
      '"ID Campagne";' +
      '"Nom de la campagne";' +
      '"Nom du Profil Cible";' +
      '"Nom du Participant";' +
      '"Prénom du Participant";' +
      `"${idPixLabel}";` +
      '"% de progression";' +
      '"Date de début";' +
      '"Partage (O/N)";' +
      '"Date du partage";' +
      '"% maitrise de l\'ensemble des acquis du profil";' +
      `"% de maitrise des acquis de la compétence ${competence.name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${competence.name}";` +
      `"Acquis maitrisés dans la compétence ${competence.name}";` +
      `"% de maitrise des acquis du domaine ${area.title}";` +
      `"Nombre d'acquis du profil cible du domaine ${area.title}";` +
      `"Acquis maitrisés du domaine ${area.title}";` +
      `"'${skill.name}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      campaignRepository,
      userRepository,
      targetProfileRepository,
      competenceRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should contains Numéro Étudiant header when orga is SUP and managing students', async () => {
    // given
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign({ isManagingStudents: true, type: 'SUP' });
    const area = domainBuilder.buildArea();
    const competence = domainBuilder.buildCompetence({ area });
    const skill = domainBuilder.buildSkill({ competenceId: competence.id });
    const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });
    campaign.targetProfileId = targetProfile.id;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organizationId).resolves(organization);
    sinon.stub(targetProfileRepository, 'get').withArgs(campaign.targetProfileId).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
    sinon.stub(competenceRepository, 'list').resolves([competence]);
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').rejects();
    const csvExpected = '\uFEFF"Nom de l\'organisation";' +
      '"ID Campagne";' +
      '"Nom de la campagne";' +
      '"Nom du Profil Cible";' +
      '"Nom du Participant";' +
      '"Prénom du Participant";' +
      '"Numéro Étudiant";' +
      '"% de progression";' +
      '"Date de début";' +
      '"Partage (O/N)";' +
      '"Date du partage";' +
      '"% maitrise de l\'ensemble des acquis du profil";' +
      `"% de maitrise des acquis de la compétence ${competence.name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${competence.name}";` +
      `"Acquis maitrisés dans la compétence ${competence.name}";` +
      `"% de maitrise des acquis du domaine ${area.title}";` +
      `"Nombre d'acquis du profil cible du domaine ${area.title}";` +
      `"Acquis maitrisés du domaine ${area.title}";` +
      `"'${skill.name}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      campaignRepository,
      userRepository,
      targetProfileRepository,
      competenceRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should process result for each participation and add it to csv', async () => {
    // given
    const { user: admin, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign();
    const area = domainBuilder.buildArea();
    const competence = domainBuilder.buildCompetence({ area });
    const skill = domainBuilder.buildSkill({ competenceId: competence.id });
    const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });
    const participantInfo = domainBuilder.buildCampaignParticipationInfo({ createdAt: new Date('2020-01-01'), sharedAt: new Date('2020-02-01') });
    const knowledgeElement = domainBuilder.buildKnowledgeElement({
      status: 'validated',
      skillId: skill.id,
      competenceId: competence.id,
    });
    campaign.targetProfileId = targetProfile.id;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(admin.id).resolves(admin);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organizationId).resolves(organization);
    sinon.stub(targetProfileRepository, 'get').withArgs(campaign.targetProfileId).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([participantInfo]);
    sinon.stub(competenceRepository, 'list').resolves([competence]);
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').resolves({
      [participantInfo.userId] : {
        [competence.id] : [knowledgeElement],
      },
    });
    const csvHeaderExpected = '\uFEFF"Nom de l\'organisation";' +
      '"ID Campagne";' +
      '"Nom de la campagne";' +
      '"Nom du Profil Cible";' +
      '"Nom du Participant";' +
      '"Prénom du Participant";' +
      '"% de progression";' +
      '"Date de début";' +
      '"Partage (O/N)";' +
      '"Date du partage";' +
      '"% maitrise de l\'ensemble des acquis du profil";' +
      `"% de maitrise des acquis de la compétence ${competence.name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${competence.name}";` +
      `"Acquis maitrisés dans la compétence ${competence.name}";` +
      `"% de maitrise des acquis du domaine ${area.title}";` +
      `"Nombre d'acquis du profil cible du domaine ${area.title}";` +
      `"Acquis maitrisés du domaine ${area.title}";` +
      `"'${skill.name}"`;
    const csvParticipantResultExpected = `"${organization.name}";` +
      `${campaign.id};` +
      `"${campaign.name}";` +
      `"${targetProfile.name}";` +
      `"${participantInfo.participantLastName}";` +
      `"${participantInfo.participantFirstName}";` +
      '1;' +
      '2020-01-01;' +
      '"Oui";' +
      '2020-02-01;' +
      '1;' +
      '1;' +
      '1;' +
      '1;' +
      '1;' +
      '1;' +
      '1;' +
      '"OK"';

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: admin.id,
      campaignId: campaign.id,
      writableStream,
      campaignRepository,
      userRepository,
      targetProfileRepository,
      competenceRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    const csvLines = csv.split('\n');

    // then
    expect(csvLines).to.have.length(3);
    expect(csvLines[0]).equal(csvHeaderExpected);
    expect(csvLines[1]).equal(csvParticipantResultExpected);
    expect(csvLines[2]).equal('');
  });

});

function _buildOrganizationAndUserWithMembershipAndCampaign({ idPixLabel = null, type = 'SCO', isManagingStudents = false } = {}) {
  const organization = domainBuilder.buildOrganization({ type, isManagingStudents });
  const user = domainBuilder.buildUser();
  const membership = domainBuilder.buildMembership({ user, organization });
  user.memberships = [membership];
  const campaign = domainBuilder.buildCampaign({ organizationId: organization.id, idPixLabel });

  return {
    user,
    campaign,
    organization,
  };
}
