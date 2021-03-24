const { PassThrough } = require('stream');
const { expect, sinon, domainBuilder, streamToPromise, catchErr } = require('../../../test-helper');
const startWritingCampaignAssessmentResultsToStream = require('../../../../lib/domain/usecases/start-writing-campaign-assessment-results-to-stream');
const { UserNotAuthorizedToGetCampaignResultsError } = require('../../../../lib/domain/errors');
const campaignCsvExportService = require('../../../../lib/domain/services/campaign-csv-export-service');
const { getI18n } = require('../../../tooling/i18n/i18n');

describe('Unit | Domain | Use Cases | start-writing-campaign-assessment-results-to-stream', function() {
  const campaignRepository = { get: () => undefined };
  const userRepository = { getWithMemberships: () => undefined };
  const targetProfileWithLearningContentRepository = { get: () => undefined };
  const organizationRepository = { get: () => undefined };
  const campaignParticipationInfoRepository = { findByCampaignId: () => undefined };
  const knowledgeElementRepository = { findTargetedGroupedByCompetencesForUsers: () => undefined };
  const badgeAcquisitionRepository = { getCampaignAcquiredBadgesByUsers: () => undefined };
  let writableStream;
  let csvPromise;

  const i18n = getI18n();

  beforeEach(function() {
    writableStream = new PassThrough();
    csvPromise = streamToPromise(writableStream);
  });

  it('should throw a UserNotAuthorizedToGetCampaignResultsError when user is not authorized', async function() {
    // given
    const notAuthorizedUser = domainBuilder.buildUser({ memberships: [] });
    const campaign = domainBuilder.buildCampaign();
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(notAuthorizedUser.id).resolves(notAuthorizedUser);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').rejects();
    sinon.stub(organizationRepository, 'get').rejects();
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').rejects();
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').rejects();

    // when
    const err = await catchErr(startWritingCampaignAssessmentResultsToStream)({
      userId: notAuthorizedUser.id,
      campaignId: campaign.id,
      writableStream,
      i18n,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });

    // then
    expect(err).to.be.instanceOf(UserNotAuthorizedToGetCampaignResultsError);
    expect(err.message).to.equal(`User does not have an access to the organization ${campaign.organization.id}`);
  });

  it('should return common parts of header with appropriate info', async function() {
    // given
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign({ type: 'SUP' });
    const skill1_1_1 = domainBuilder.buildTargetedSkill({ id: 'skill1_1_1', tubeId: 'tube1', name: '@acquis1' });
    const skill2_1_1 = domainBuilder.buildTargetedSkill({ id: 'skill2_1_1', tubeId: 'tube3', name: '@acquis2' });
    const tube1 = domainBuilder.buildTargetedTube({ id: 'tube1', skills: [skill1_1_1], competenceId: 'comp1_1' });
    const tube2 = domainBuilder.buildTargetedTube({ id: 'tube3', skills: [skill2_1_1], competenceId: 'comp2_1' });
    const competence1_1 = domainBuilder.buildTargetedCompetence({ id: 'comp1_1', tubes: [tube1], areaId: 'area1' });
    const competence2_1 = domainBuilder.buildTargetedCompetence({ id: 'comp2_1', tubes: [tube2], areaId: 'area2' });
    const area1 = domainBuilder.buildTargetedArea({ id: 'area1', competences: [competence1_1] });
    const area2 = domainBuilder.buildTargetedArea({ id: 'area2', competences: [competence2_1] });
    const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
      skills: [skill1_1_1, skill2_1_1],
      tubes: [tube1, tube2],
      competences: [competence1_1, competence2_1],
      areas: [area2, area1],
    });
    campaign.targetProfile = targetProfile;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organization.id).resolves(organization);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').withArgs({ id: targetProfile.id, locale: 'fr' }).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
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
      `"'${skill2_1_1.name}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      i18n,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should contains idPixLabel in header if any setup in campaign', async function() {
    // given
    const idPixLabel = 'Numéro de carte bleue';
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign({ idPixLabel, type: 'SUP' });
    const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
    campaign.targetProfile = targetProfile;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organization.id).resolves(organization);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').withArgs({ id: targetProfile.id, locale: 'fr' }).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
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
      `"% de maitrise des acquis de la compétence ${targetProfile.competences[0].name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${targetProfile.competences[0].name}";` +
      `"Acquis maitrisés dans la compétence ${targetProfile.competences[0].name}";` +
      `"% de maitrise des acquis du domaine ${targetProfile.areas[0].title}";` +
      `"Nombre d'acquis du profil cible du domaine ${targetProfile.areas[0].title}";` +
      `"Acquis maitrisés du domaine ${targetProfile.areas[0].title}";` +
      `"${targetProfile.skills[0].name}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      i18n,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should contains studentNumber header when organization is SUP and managing students', async function() {
    // given
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign({ isManagingStudents: true, type: 'SUP' });
    const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
    campaign.targetProfile = targetProfile;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organization.id).resolves(organization);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').withArgs({ id: targetProfile.id, locale: 'fr' }).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
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
      `"% de maitrise des acquis de la compétence ${targetProfile.competences[0].name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${targetProfile.competences[0].name}";` +
      `"Acquis maitrisés dans la compétence ${targetProfile.competences[0].name}";` +
      `"% de maitrise des acquis du domaine ${targetProfile.areas[0].title}";` +
      `"Nombre d'acquis du profil cible du domaine ${targetProfile.areas[0].title}";` +
      `"Acquis maitrisés du domaine ${targetProfile.areas[0].title}";` +
      `"${targetProfile.skills[0].name}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      campaignRepository,
      userRepository,
      i18n,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should contains badges header when linked to target profile', async function() {
    // given
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign({ type: 'PRO' });
    const badge1 = domainBuilder.buildBadge({ title: 'badge1' });
    const badge2 = domainBuilder.buildBadge({ title: 'badge2' });
    const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent({ badges: [badge1, badge2] });
    campaign.targetProfile = targetProfile;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organization.id).resolves(organization);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').withArgs({ id: targetProfile.id, locale: 'fr' }).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
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
      `"${badge1.title} obtenu (O/N)";` +
      `"${badge2.title} obtenu (O/N)";` +
      '"% maitrise de l\'ensemble des acquis du profil";' +
      `"% de maitrise des acquis de la compétence ${targetProfile.competences[0].name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${targetProfile.competences[0].name}";` +
      `"Acquis maitrisés dans la compétence ${targetProfile.competences[0].name}";` +
      `"% de maitrise des acquis du domaine ${targetProfile.areas[0].title}";` +
      `"Nombre d'acquis du profil cible du domaine ${targetProfile.areas[0].title}";` +
      `"Acquis maitrisés du domaine ${targetProfile.areas[0].title}";` +
      `"${targetProfile.skills[0].name}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      i18n,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should hide skills names header when organization is SCO', async function() {
    // given
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign({ type: 'SCO' });
    const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
    campaign.targetProfile = targetProfile;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organization.id).resolves(organization);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').withArgs({ id: targetProfile.id, locale: 'fr' }).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
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
      `"% de maitrise des acquis de la compétence ${targetProfile.competences[0].name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${targetProfile.competences[0].name}";` +
      `"Acquis maitrisés dans la compétence ${targetProfile.competences[0].name}";` +
      `"% de maitrise des acquis du domaine ${targetProfile.areas[0].title}";` +
      `"Nombre d'acquis du profil cible du domaine ${targetProfile.areas[0].title}";` +
      `"Acquis maitrisés du domaine ${targetProfile.areas[0].title}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      i18n,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should display stages header when link to target profile', async function() {
    // given
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign({ type: 'SCO' });
    const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
    targetProfile.stages = [
      domainBuilder.buildStage({ threshold: 0 }),
      domainBuilder.buildStage({ threshold: 10 }),
      domainBuilder.buildStage({ threshold: 50 }),
    ];
    campaign.targetProfile = targetProfile;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organization.id).resolves(organization);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').withArgs({ id: targetProfile.id, locale: 'fr' }).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
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
      '"Palier obtenu (/2)";' +
      '"% maitrise de l\'ensemble des acquis du profil";' +
      `"% de maitrise des acquis de la compétence ${targetProfile.competences[0].name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${targetProfile.competences[0].name}";` +
      `"Acquis maitrisés dans la compétence ${targetProfile.competences[0].name}";` +
      `"% de maitrise des acquis du domaine ${targetProfile.areas[0].title}";` +
      `"Nombre d'acquis du profil cible du domaine ${targetProfile.areas[0].title}";` +
      `"Acquis maitrisés du domaine ${targetProfile.areas[0].title}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      i18n,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should display division header when organization is SCO and managing students', async function() {
    // given
    const { user, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign({ type: 'SCO', isManagingStudents: true });
    const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
    campaign.targetProfile = targetProfile;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(user.id).resolves(user);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organization.id).resolves(organization);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').withArgs({ id: targetProfile.id, locale: 'fr' }).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([]);
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').rejects();

    const csvExpected = '\uFEFF"Nom de l\'organisation";' +
      '"ID Campagne";' +
      '"Nom de la campagne";' +
      '"Nom du Profil Cible";' +
      '"Nom du Participant";' +
      '"Prénom du Participant";' +
      '"Classe";' +
      '"% de progression";' +
      '"Date de début";' +
      '"Partage (O/N)";' +
      '"Date du partage";' +
      '"% maitrise de l\'ensemble des acquis du profil";' +
      `"% de maitrise des acquis de la compétence ${targetProfile.competences[0].name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${targetProfile.competences[0].name}";` +
      `"Acquis maitrisés dans la compétence ${targetProfile.competences[0].name}";` +
      `"% de maitrise des acquis du domaine ${targetProfile.areas[0].title}";` +
      `"Nombre d'acquis du profil cible du domaine ${targetProfile.areas[0].title}";` +
      `"Acquis maitrisés du domaine ${targetProfile.areas[0].title}"\n`;

    // when
    startWritingCampaignAssessmentResultsToStream({
      userId: user.id,
      campaignId: campaign.id,
      writableStream,
      i18n,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      campaignCsvExportService,
    });
    const csv = await csvPromise;

    // then
    expect(csv).to.equal(csvExpected);
  });

  it('should process result for each participation and add it to csv', async function() {
    // given
    const { user: admin, campaign, organization } = _buildOrganizationAndUserWithMembershipAndCampaign({ type: 'SUP' });
    const badge = domainBuilder.buildBadge({ title: 'badge sup' });
    const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent({ badges: [badge] });
    const participantInfo = domainBuilder.buildCampaignParticipationInfo({ createdAt: new Date('2020-01-01'), sharedAt: new Date('2020-02-01') });
    const knowledgeElement = domainBuilder.buildKnowledgeElement({
      status: 'validated',
      skillId: targetProfile.skills[0].id,
      competenceId: targetProfile.competences[0].id,
    });
    campaign.targetProfile = targetProfile;
    badge.targetProfileId = targetProfile.id;
    sinon.stub(campaignRepository, 'get').withArgs(campaign.id).resolves(campaign);
    sinon.stub(userRepository, 'getWithMemberships').withArgs(admin.id).resolves(admin);
    sinon.stub(organizationRepository, 'get').withArgs(campaign.organization.id).resolves(organization);
    sinon.stub(targetProfileWithLearningContentRepository, 'get').withArgs({ id: targetProfile.id, locale: 'fr' }).resolves(targetProfile);
    sinon.stub(campaignParticipationInfoRepository, 'findByCampaignId').withArgs(campaign.id).resolves([participantInfo]);
    sinon.stub(knowledgeElementRepository, 'findTargetedGroupedByCompetencesForUsers').resolves({
      [participantInfo.userId]: {
        [targetProfile.competences[0].id]: [knowledgeElement],
      },
    });
    sinon.stub(badgeAcquisitionRepository, 'getCampaignAcquiredBadgesByUsers').resolves({
      [participantInfo.userId]: [badge],
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
      `"${badge.title} obtenu (O/N)";` +
      '"% maitrise de l\'ensemble des acquis du profil";' +
      `"% de maitrise des acquis de la compétence ${targetProfile.competences[0].name}";` +
      `"Nombre d'acquis du profil cible dans la compétence ${targetProfile.competences[0].name}";` +
      `"Acquis maitrisés dans la compétence ${targetProfile.competences[0].name}";` +
      `"% de maitrise des acquis du domaine ${targetProfile.areas[0].title}";` +
      `"Nombre d'acquis du profil cible du domaine ${targetProfile.areas[0].title}";` +
      `"Acquis maitrisés du domaine ${targetProfile.areas[0].title}";` +
      `"${targetProfile.skills[0].name}"`;

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
      '"Oui";' +
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
      i18n,
      campaignRepository,
      userRepository,
      targetProfileWithLearningContentRepository,
      organizationRepository,
      campaignParticipationInfoRepository,
      knowledgeElementRepository,
      badgeAcquisitionRepository,
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
  const campaign = domainBuilder.buildCampaign({ organization, idPixLabel });

  return {
    user,
    campaign,
    organization,
  };
}
