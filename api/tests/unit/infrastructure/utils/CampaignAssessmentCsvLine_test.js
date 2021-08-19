const { expect, domainBuilder } = require('../../../test-helper');
const CampaignAssessmentCsvLine = require('../../../../lib/infrastructure/utils/CampaignAssessmentCsvLine');
const campaignParticipationService = require('../../../../lib/domain/services/campaign-participation-service');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const { getI18n } = require('../../../tooling/i18n/i18n');

function _computeExpectedColumnsIndex(campaign, organization, badges, stages) {
  const studentNumberPresenceModifier = (organization.type === 'SUP' && organization.isManagingStudents) ? 1 : 0;
  const externalIdPresenceModifier = campaign.idPixLabel ? 1 : 0;
  const divisionPresenceModifier = organization.type === 'SCO' && organization.isManagingStudents ? 1 : 0;
  const badgePresenceModifier = badges.length;
  const stagesPresenceModifier = stages[0] ? 1 : 0;

  return {
    ORGANIZATION_NAME: 0,
    CAMPAIGN_ID: 1,
    CAMPAIGN_NAME: 2,
    TARGET_PROFILE_NAME: 3,
    PARTICIPANT_LAST_NAME: 4,
    PARTICIPANT_FIRST_NAME: 5,
    DIVISION: 6,
    STUDENT_NUMBER_COL: 6 + divisionPresenceModifier,
    EXTERNAL_ID: 6 + studentNumberPresenceModifier + divisionPresenceModifier,
    PARTICIPATION_PROGRESSION: 6 + divisionPresenceModifier + studentNumberPresenceModifier + externalIdPresenceModifier,
    PARTICIPATION_CREATED_AT: 7 + divisionPresenceModifier + studentNumberPresenceModifier + externalIdPresenceModifier,
    PARTICIPATION_IS_SHARED: 8 + divisionPresenceModifier + studentNumberPresenceModifier + externalIdPresenceModifier,
    PARTICIPATION_SHARED_AT: 9 + divisionPresenceModifier + studentNumberPresenceModifier + externalIdPresenceModifier,
    BADGE: 10 + divisionPresenceModifier + studentNumberPresenceModifier + externalIdPresenceModifier,
    STAGE_REACHED: 10 + divisionPresenceModifier + studentNumberPresenceModifier + externalIdPresenceModifier + badgePresenceModifier,
    PARTICIPATION_PERCENTAGE: 10 + divisionPresenceModifier + studentNumberPresenceModifier + externalIdPresenceModifier + badgePresenceModifier + stagesPresenceModifier,
    DETAILS_START: 11 + divisionPresenceModifier + studentNumberPresenceModifier + externalIdPresenceModifier + badgePresenceModifier + stagesPresenceModifier,
  };
}

describe('Unit | Infrastructure | Utils | CampaignAssessmentCsvLine', function() {
  const translate = getI18n().__;

  describe('#toCsvLine', function() {

    it('should return common info', function() {
      // given
      const organization = domainBuilder.buildOrganization({ isManagingStudents: false });
      const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
      const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ createdAt: new Date('2020-01-01'), isCompleted: false });
      const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
        organization,
        campaign,
        campaignParticipationInfo,
        targetProfileWithLearningContent,
        participantKnowledgeElementsByCompetenceId: {
          [targetProfileWithLearningContent.competences[0].id]: [],
        },
        campaignParticipationService,
        translate,
      });

      // when
      const csvLine = campaignAssessmentCsvLine.toCsvLine();

      // then
      const cols = _computeExpectedColumnsIndex(campaign, organization, [], []);
      expect(csvLine[cols.ORGANIZATION_NAME], 'organization name').to.equal(organization.name);
      expect(csvLine[cols.CAMPAIGN_ID], 'campaign id').to.equal(campaign.id);
      expect(csvLine[cols.CAMPAIGN_NAME], 'campaign name').to.equal(campaign.name);
      expect(csvLine[cols.TARGET_PROFILE_NAME], 'target profile name').to.equal(targetProfileWithLearningContent.name);
      expect(csvLine[cols.PARTICIPANT_LAST_NAME], 'participant last name').to.equal(campaignParticipationInfo.participantLastName);
      expect(csvLine[cols.PARTICIPANT_FIRST_NAME], 'participant first name').to.equal(campaignParticipationInfo.participantFirstName);
      expect(csvLine[cols.PARTICIPATION_CREATED_AT], 'participant created at').to.equal('2020-01-01');
      expect(csvLine[cols.PARTICIPATION_PROGRESSION], 'participation progression').to.equal(0);
    });

    context('on student number column', function() {
      it('should write the student number when organization is of type SUP and campaign is restricted', function() {
        // given
        const organization = domainBuilder.buildOrganization({ type: 'SUP', isManagingStudents: true });
        const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
        const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ studentNumber: 'someStudentNumber' });
        const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
        const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
          organization,
          campaign,
          campaignParticipationInfo,
          targetProfileWithLearningContent,
          stages: [],
          participantKnowledgeElementsByCompetenceId: {
            [targetProfileWithLearningContent.competences[0].id]: [],
          },
          campaignParticipationService,
          translate,
        });

        // when
        const csvLine = campaignAssessmentCsvLine.toCsvLine();

        // then
        const cols = _computeExpectedColumnsIndex(campaign, organization, [], []);
        expect(csvLine[cols.STUDENT_NUMBER_COL], 'student number').to.equal(campaignParticipationInfo.studentNumber);
      });
    });

    context('on external id column', function() {

      it('should write the participantExternalId when campaign has an idPixLabel', function() {
        // given
        const organization = domainBuilder.buildOrganization({ isManagingStudents: false });
        const campaign = domainBuilder.buildCampaign({ idPixLabel: 'I Have One !' });
        const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ participantExternalId: 'someParticipantExternalId' });
        const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
        const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
          organization,
          campaign,
          campaignParticipationInfo,
          targetProfileWithLearningContent,
          stages: [],
          participantKnowledgeElementsByCompetenceId: {
            [targetProfileWithLearningContent.competences[0].id]: [],
          },
          campaignParticipationService,
          translate,
        });

        // when
        const csvLine = campaignAssessmentCsvLine.toCsvLine();

        // then
        const cols = _computeExpectedColumnsIndex(campaign, organization, [], []);
        expect(csvLine[cols.EXTERNAL_ID], 'external id').to.equal(campaignParticipationInfo.participantExternalId);
      });

      it('should write the participantExternalId aside with the student number if student number is required', function() {
        // given
        const organization = domainBuilder.buildOrganization({ type: 'SUP', isManagingStudents: true });
        const campaign = domainBuilder.buildCampaign({ idPixLabel: 'I Have One !' });
        const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ studentNumber: 'someStudentNumber', participantExternalId: 'someParticipantExternalId' });
        const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
        const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
          organization,
          campaign,
          areas: [],
          competences: [],
          campaignParticipationInfo,
          targetProfileWithLearningContent,
          stages: [],
          participantKnowledgeElementsByCompetenceId: {
            [targetProfileWithLearningContent.competences[0].id]: [],
          },
          campaignParticipationService,
          translate,
        });

        // when
        const csvLine = campaignAssessmentCsvLine.toCsvLine();

        // then
        const cols = _computeExpectedColumnsIndex(campaign, organization, [], []);
        expect(csvLine[cols.EXTERNAL_ID], 'external id').to.equal(campaignParticipationInfo.participantExternalId);
        expect(csvLine[cols.STUDENT_NUMBER_COL], 'student number').to.equal(campaignParticipationInfo.studentNumber);
      });
    });

    context('when participation is not shared', function() {
      it('should show informations regarding a not shared participation', function() {
        // given
        const organization = domainBuilder.buildOrganization();
        const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
        const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: null });
        const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
        const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
          organization,
          campaign,
          campaignParticipationInfo,
          targetProfileWithLearningContent,
          stages: [],
          participantKnowledgeElementsByCompetenceId: {
            [targetProfileWithLearningContent.competences[0].id]: [],
          },
          campaignParticipationService,
          translate,
        });

        // when
        const csvLine = campaignAssessmentCsvLine.toCsvLine();

        // then
        const cols = _computeExpectedColumnsIndex(campaign, organization, [], []);
        const EMPTY_CONTENT = 'NA';
        expect(csvLine[cols.PARTICIPATION_IS_SHARED], 'is shared').to.equal('Non');
        expect(csvLine[cols.PARTICIPATION_SHARED_AT], 'shared at').to.equal(EMPTY_CONTENT);
        expect(csvLine[cols.PARTICIPATION_PERCENTAGE], 'participation percentage').to.equal(EMPTY_CONTENT);
      });
    });

    context('when participation is shared', function() {
      it('should show informations regarding a shared participation', function() {
        // given
        const organization = domainBuilder.buildOrganization();
        const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
        const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: new Date('2020-01-01') });
        const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
        const knowledgeElement = domainBuilder.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          earnedPix: 3,
          skillId: targetProfileWithLearningContent.skills[0].id,
          competenceId: targetProfileWithLearningContent.competences[0].id,
        });
        const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
          organization,
          campaign,
          campaignParticipationInfo,
          targetProfileWithLearningContent,
          stages: [],
          participantKnowledgeElementsByCompetenceId: {
            [targetProfileWithLearningContent.competences[0].id]: [knowledgeElement],
          },
          campaignParticipationService,
          translate,
        });

        // when
        const csvLine = campaignAssessmentCsvLine.toCsvLine();

        // then
        const cols = _computeExpectedColumnsIndex(campaign, organization, [], []);
        expect(csvLine[cols.PARTICIPATION_IS_SHARED], 'is shared').to.equal('Oui');
        expect(csvLine[cols.PARTICIPATION_SHARED_AT], 'shared at').to.equal('2020-01-01');
        expect(csvLine[cols.PARTICIPATION_PERCENTAGE], 'participation percentage').to.equal(1);
      });
    });

    context('when organization type is not SCO', function() {
      context('when participation is shared', function() {
        it('should show details for each competence, area and skills', function() {
          // given
          const organization = domainBuilder.buildOrganization({ type: 'SUP' });
          const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: new Date('2020-01-01') });
          const skill1_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_1', tubeId: 'recTube1' });
          const skill1_2 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_2', tubeId: 'recTube1' });
          const skill2_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill2_1', tubeId: 'recTube2' });
          const skill3_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill3_1', tubeId: 'recTube3' });
          const skill3_2 = domainBuilder.buildTargetedSkill({ id: 'recSkill3_2', tubeId: 'recTube3' });
          const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1_1, skill1_2], competenceId: 'recCompetence1' });
          const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', skills: [skill2_1], competenceId: 'recCompetence2' });
          const tube3 = domainBuilder.buildTargetedTube({ id: 'recTube3', skills: [skill3_1, skill3_2], competenceId: 'recCompetence3' });
          const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1], areaId: 'recArea1' });
          const competence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', tubes: [tube2], areaId: 'recArea1' });
          const competence3 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence3', tubes: [tube3], areaId: 'recArea2' });
          const area1 = domainBuilder.buildTargetedArea({ id: 'recArea1', competences: [competence1, competence2] });
          const area2 = domainBuilder.buildTargetedArea({ id: 'recArea2', competences: [competence3] });
          const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
            skills: [skill1_1, skill1_2, skill2_1, skill3_1, skill3_2],
            tubes: [tube1, tube2, tube3],
            competences: [competence1, competence2, competence3],
            areas: [area1, area2],
          });
          const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 3,
            skillId: skill1_1.id,
            competenceId: competence1.id,
          });
          const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.INVALIDATED,
            earnedPix: 2,
            skillId: skill2_1.id,
            competenceId: competence2.id,
          });
          const knowledgeElement3 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 4,
            skillId: skill3_1.id,
            competenceId: competence3.id,
          });
          const knowledgeElement4 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 5,
            skillId: skill3_2.id,
            competenceId: competence3.id,
          });
          const participantKnowledgeElementsByCompetenceId = {
            'recCompetence1': [knowledgeElement1],
            'recCompetence2': [knowledgeElement2],
            'recCompetence3': [knowledgeElement3, knowledgeElement4],
          };
          const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfileWithLearningContent,
            stages: [],
            participantKnowledgeElementsByCompetenceId,
            campaignParticipationService,
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const cols = _computeExpectedColumnsIndex(campaign, organization, [], []);
          let currentColumn = cols.DETAILS_START;
          // First competence
          expect(csvLine[currentColumn++], '% maitrise de la competence').to.equal(0.5);
          expect(csvLine[currentColumn++], 'nb acquis compétence').to.equal(2);
          expect(csvLine[currentColumn++], 'nb acquis validés dans la compétence').to.equal(1);
          // Second competence
          expect(csvLine[currentColumn++], '% maitrise de la competence').to.equal(0);
          expect(csvLine[currentColumn++], 'nb acquis compétence').to.equal(1);
          expect(csvLine[currentColumn++], 'nb acquis validés dans la compétence').to.equal(0);
          // Third competence
          expect(csvLine[currentColumn++], '% maitrise de la competence').to.equal(1);
          expect(csvLine[currentColumn++], 'nb acquis compétence').to.equal(2);
          expect(csvLine[currentColumn++], 'nb acquis validés dans la compétence').to.equal(2);
          // First area
          expect(csvLine[currentColumn++], '% maitrise du domaine').to.equal(0.33);
          expect(csvLine[currentColumn++], 'nb acquis domaine').to.equal(3);
          expect(csvLine[currentColumn++], 'nb acquis validés du domaine').to.equal(1);
          // Second area
          expect(csvLine[currentColumn++], '% maitrise du domaine').to.equal(1);
          expect(csvLine[currentColumn++], 'nb acquis domaine').to.equal(2);
          expect(csvLine[currentColumn++], 'nb acquis validés du domaine').to.equal(2);
          // Target profile skills
          expect(csvLine[currentColumn++], 'statut acquis').to.equal('OK');
          expect(csvLine[currentColumn++], 'statut acquis').to.equal('Non testé');
          expect(csvLine[currentColumn++], 'statut acquis').to.equal('KO');
          expect(csvLine[currentColumn++], 'statut acquis').to.equal('OK');
          expect(csvLine[currentColumn++], 'statut acquis').to.equal('OK');

          expect(csvLine).to.have.lengthOf(currentColumn);
        });
      });

      context('when participation is not shared', function() {
        it('should show NA for each competence, area and skills', function() {
          // given
          const organization = domainBuilder.buildOrganization({ type: 'SUP' });
          const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: null });
          const skill1_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_1', tubeId: 'recTube1' });
          const skill1_2 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_2', tubeId: 'recTube1' });
          const skill2_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill2_1', tubeId: 'recTube2' });
          const skill3_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill3_1', tubeId: 'recTube3' });
          const skill3_2 = domainBuilder.buildTargetedSkill({ id: 'recSkill3_2', tubeId: 'recTube3' });
          const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1_1, skill1_2], competenceId: 'recCompetence1' });
          const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', skills: [skill2_1], competenceId: 'recCompetence2' });
          const tube3 = domainBuilder.buildTargetedTube({ id: 'recTube3', skills: [skill3_1, skill3_2], competenceId: 'recCompetence3' });
          const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1], areaId: 'recArea1' });
          const competence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', tubes: [tube2], areaId: 'recArea1' });
          const competence3 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence3', tubes: [tube3], areaId: 'recArea2' });
          const area1 = domainBuilder.buildTargetedArea({ id: 'recArea1', competences: [competence1, competence2] });
          const area2 = domainBuilder.buildTargetedArea({ id: 'recArea2', competences: [competence3] });
          const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
            skills: [skill1_1, skill1_2, skill2_1, skill3_1, skill3_2],
            tubes: [tube1, tube2, tube3],
            competences: [competence1, competence2, competence3],
            areas: [area1, area2],
          });
          const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 3,
            skillId: skill1_1.id,
            competenceId: competence1.id,
          });
          const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.INVALIDATED,
            earnedPix: 2,
            skillId: skill2_1.id,
            competenceId: competence2.id,
          });
          const knowledgeElement3 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 4,
            skillId: skill3_1.id,
            competenceId: competence3.id,
          });
          const knowledgeElement4 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 5,
            skillId: skill3_2.id,
            competenceId: competence3.id,
          });
          const participantKnowledgeElementsByCompetenceId = {
            'recCompetence1': [knowledgeElement1],
            'recCompetence2': [knowledgeElement2],
            'recCompetence3': [knowledgeElement3, knowledgeElement4],
          };
          const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfileWithLearningContent,
            stages: [],
            participantKnowledgeElementsByCompetenceId,
            campaignParticipationService,
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const cols = _computeExpectedColumnsIndex(campaign, organization, [], []);
          let currentColumn = cols.DETAILS_START;
          // First competence
          expect(csvLine[currentColumn++], '% maitrise de la competence').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis compétence').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis validés dans la compétence').to.equal('NA');
          // Second competence
          expect(csvLine[currentColumn++], '% maitrise de la competence').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis compétence').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis validés dans la compétence').to.equal('NA');
          // Third competence
          expect(csvLine[currentColumn++], '% maitrise de la competence').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis compétence').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis validés dans la compétence').to.equal('NA');
          // First area
          expect(csvLine[currentColumn++], '% maitrise du domaine').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis domaine').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis validés du domaine').to.equal('NA');
          // Second area
          expect(csvLine[currentColumn++], '% maitrise du domaine').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis domaine').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis validés du domaine').to.equal('NA');
          // Target profile skills
          expect(csvLine[currentColumn++], 'statut acquis').to.equal('NA');
          expect(csvLine[currentColumn++], 'statut acquis').to.equal('NA');
          expect(csvLine[currentColumn++], 'statut acquis').to.equal('NA');
          expect(csvLine[currentColumn++], 'statut acquis').to.equal('NA');
          expect(csvLine[currentColumn++], 'statut acquis').to.equal('NA');

          expect(csvLine).to.have.lengthOf(currentColumn);
        });
      });
    });

    context('when organization type is SCO', function() {
      context('when participation is shared', function() {
        it('should show details for each competence and area but not skills', function() {
          // given
          const organization = domainBuilder.buildOrganization({ type: 'SCO' });
          const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: new Date('2020-01-01') });
          const skill1_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_1', tubeId: 'recTube1' });
          const skill1_2 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_2', tubeId: 'recTube1' });
          const skill2_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill2_1', tubeId: 'recTube2' });
          const skill3_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill3_1', tubeId: 'recTube3' });
          const skill3_2 = domainBuilder.buildTargetedSkill({ id: 'recSkill3_2', tubeId: 'recTube3' });
          const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1_1, skill1_2], competenceId: 'recCompetence1' });
          const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', skills: [skill2_1], competenceId: 'recCompetence2' });
          const tube3 = domainBuilder.buildTargetedTube({ id: 'recTube3', skills: [skill3_1, skill3_2], competenceId: 'recCompetence3' });
          const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1], areaId: 'recArea1' });
          const competence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', tubes: [tube2], areaId: 'recArea1' });
          const competence3 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence3', tubes: [tube3], areaId: 'recArea2' });
          const area1 = domainBuilder.buildTargetedArea({ id: 'recArea1', competences: [competence1, competence2] });
          const area2 = domainBuilder.buildTargetedArea({ id: 'recArea2', competences: [competence3] });
          const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
            skills: [skill1_1, skill1_2, skill2_1, skill3_1, skill3_2],
            tubes: [tube1, tube2, tube3],
            competences: [competence1, competence2, competence3],
            areas: [area1, area2],
          });
          const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 3,
            skillId: skill1_1.id,
            competenceId: competence1.id,
          });
          const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.INVALIDATED,
            earnedPix: 2,
            skillId: skill2_1.id,
            competenceId: competence2.id,
          });
          const knowledgeElement3 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 4,
            skillId: skill3_1.id,
            competenceId: competence3.id,
          });
          const knowledgeElement4 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 5,
            skillId: skill3_2.id,
            competenceId: competence3.id,
          });
          const participantKnowledgeElementsByCompetenceId = {
            'recCompetence1': [knowledgeElement1],
            'recCompetence2': [knowledgeElement2],
            'recCompetence3': [knowledgeElement3, knowledgeElement4],
          };
          const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfileWithLearningContent,
            stages: [],
            participantKnowledgeElementsByCompetenceId,
            campaignParticipationService,
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const cols = _computeExpectedColumnsIndex(campaign, organization, [], []);
          let currentColumn = cols.DETAILS_START;
          // First competence
          expect(csvLine[currentColumn++], '% maitrise de la competence').to.equal(0.5);
          expect(csvLine[currentColumn++], 'nb acquis compétence').to.equal(2);
          expect(csvLine[currentColumn++], 'nb acquis validés dans la compétence').to.equal(1);
          // Second competence
          expect(csvLine[currentColumn++], '% maitrise de la competence').to.equal(0);
          expect(csvLine[currentColumn++], 'nb acquis compétence').to.equal(1);
          expect(csvLine[currentColumn++], 'nb acquis validés dans la compétence').to.equal(0);
          // Third competence
          expect(csvLine[currentColumn++], '% maitrise de la competence').to.equal(1);
          expect(csvLine[currentColumn++], 'nb acquis compétence').to.equal(2);
          expect(csvLine[currentColumn++], 'nb acquis validés dans la compétence').to.equal(2);
          // First area
          expect(csvLine[currentColumn++], '% maitrise du domaine').to.equal(0.33);
          expect(csvLine[currentColumn++], 'nb acquis domaine').to.equal(3);
          expect(csvLine[currentColumn++], 'nb acquis validés du domaine').to.equal(1);
          // Second area
          expect(csvLine[currentColumn++], '% maitrise du domaine').to.equal(1);
          expect(csvLine[currentColumn++], 'nb acquis domaine').to.equal(2);
          expect(csvLine[currentColumn++], 'nb acquis validés du domaine').to.equal(2);

          expect(csvLine).to.have.lengthOf(currentColumn);
        });
      });

      context('when participation is not shared', function() {
        it('should show NA for each competence and area but not skills', function() {
          // given
          const organization = domainBuilder.buildOrganization({ type: 'SCO' });
          const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: null });
          const skill1_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_1', tubeId: 'recTube1' });
          const skill1_2 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_2', tubeId: 'recTube1' });
          const skill2_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill2_1', tubeId: 'recTube2' });
          const skill3_1 = domainBuilder.buildTargetedSkill({ id: 'recSkill3_1', tubeId: 'recTube3' });
          const skill3_2 = domainBuilder.buildTargetedSkill({ id: 'recSkill3_2', tubeId: 'recTube3' });
          const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1_1, skill1_2], competenceId: 'recCompetence1' });
          const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', skills: [skill2_1], competenceId: 'recCompetence2' });
          const tube3 = domainBuilder.buildTargetedTube({ id: 'recTube3', skills: [skill3_1, skill3_2], competenceId: 'recCompetence3' });
          const competence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube1], areaId: 'recArea1' });
          const competence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', tubes: [tube2], areaId: 'recArea1' });
          const competence3 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence3', tubes: [tube3], areaId: 'recArea2' });
          const area1 = domainBuilder.buildTargetedArea({ id: 'recArea1', competences: [competence1, competence2] });
          const area2 = domainBuilder.buildTargetedArea({ id: 'recArea2', competences: [competence3] });
          const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
            skills: [skill1_1, skill1_2, skill2_1, skill3_1, skill3_2],
            tubes: [tube1, tube2, tube3],
            competences: [competence1, competence2, competence3],
            areas: [area1, area2],
          });
          const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 3,
            skillId: skill1_1.id,
            competenceId: competence1.id,
          });
          const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.INVALIDATED,
            earnedPix: 2,
            skillId: skill2_1.id,
            competenceId: competence2.id,
          });
          const knowledgeElement3 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 4,
            skillId: skill3_1.id,
            competenceId: competence3.id,
          });
          const knowledgeElement4 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 5,
            skillId: skill3_2.id,
            competenceId: competence3.id,
          });
          const participantKnowledgeElementsByCompetenceId = {
            'recCompetence1': [knowledgeElement1],
            'recCompetence2': [knowledgeElement2],
            'recCompetence3': [knowledgeElement3, knowledgeElement4],
          };
          const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfileWithLearningContent,
            stages: [],
            participantKnowledgeElementsByCompetenceId,
            campaignParticipationService,
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const cols = _computeExpectedColumnsIndex(campaign, organization, [], []);
          let currentColumn = cols.DETAILS_START;
          // First competence
          expect(csvLine[currentColumn++], '% maitrise de la competence').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis compétence').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis validés dans la compétence').to.equal('NA');
          // Second competence
          expect(csvLine[currentColumn++], '% maitrise de la competence').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis compétence').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis validés dans la compétence').to.equal('NA');
          // Third competence
          expect(csvLine[currentColumn++], '% maitrise de la competence').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis compétence').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis validés dans la compétence').to.equal('NA');
          // First area
          expect(csvLine[currentColumn++], '% maitrise du domaine').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis domaine').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis validés du domaine').to.equal('NA');
          // Second area
          expect(csvLine[currentColumn++], '% maitrise du domaine').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis domaine').to.equal('NA');
          expect(csvLine[currentColumn++], 'nb acquis validés du domaine').to.equal('NA');

          expect(csvLine).to.have.lengthOf(currentColumn);
        });
      });

      context('division', function() {
        it('displays the division column', function() {
          const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: true });
          const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ createdAt: new Date('2020-01-01'), isCompleted: false, division: '4eme1' });
          const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfileWithLearningContent,
            stages: [],
            participantKnowledgeElementsByCompetenceId: {
              [targetProfileWithLearningContent.competences[0].id]: [],
            },
            campaignParticipationService,
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const cols = _computeExpectedColumnsIndex(campaign, organization, [], []);
          expect(csvLine[cols.DIVISION]).to.equal('4eme1');
        });
      });
    });

    context('when campaign has bagdes', function() {
      context('when participation is not shared', function() {
        it('should not show badges acquired or not', function() {
          // given
          const organization = domainBuilder.buildOrganization();
          const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: null });
          const badge = 'badge title';
          const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent({ badges: [badge] });
          const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfileWithLearningContent,
            stages: [],
            participantKnowledgeElementsByCompetenceId: {
              [targetProfileWithLearningContent.competences[0].id]: [],
            },
            acquiredBadges: [badge],
            campaignParticipationService,
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const cols = _computeExpectedColumnsIndex(campaign, organization, [badge], []);
          const EMPTY_CONTENT = 'NA';
          expect(csvLine[cols.BADGE], 'badge').to.equal(EMPTY_CONTENT);
        });
      });

      context('when participation is shared', function() {
        it('should show badges acquired', function() {
          // given
          const organization = domainBuilder.buildOrganization();
          const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: new Date('2020-01-01') });
          const badge = domainBuilder.buildBadge({ title: 'badge title' });
          const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent({ badges: [badge] });
          const knowledgeElement = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 3,
            skillId: targetProfileWithLearningContent.skills[0].id,
            competenceId: targetProfileWithLearningContent.competences[0].id,
          });
          const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfileWithLearningContent,
            stages: [],
            participantKnowledgeElementsByCompetenceId: {
              [targetProfileWithLearningContent.competences[0].id]: [knowledgeElement],
            },
            acquiredBadges: [badge.title],
            campaignParticipationService,
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const cols = _computeExpectedColumnsIndex(campaign, organization, [badge], []);
          expect(csvLine[cols.BADGE], 'badge').to.equal('Oui');
        });

        it('should show badges not acquired', function() {
          // given
          const organization = domainBuilder.buildOrganization();
          const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: new Date('2020-01-01') });
          const badge = 'badge title';
          const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent({ badges: [badge] });
          const knowledgeElement = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 3,
            skillId: targetProfileWithLearningContent.skills[0].id,
            competenceId: targetProfileWithLearningContent.competences[0].id,
          });
          const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfileWithLearningContent,
            stages: [],
            participantKnowledgeElementsByCompetenceId: {
              [targetProfileWithLearningContent.competences[0].id]: [knowledgeElement],
            },
            acquiredBadges: [],
            campaignParticipationService,
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const cols = _computeExpectedColumnsIndex(campaign, organization, [badge], []);
          expect(csvLine[cols.BADGE], 'badge').to.equal('Non');
        });
      });
    });

    context('when there are stages', function() {
      context('when participation is shared', function() {
        context('when some stages have been reached', function() {
          it('tells highest stage reached', function() {
            // given
            const organization = domainBuilder.buildOrganization();
            const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
            const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: new Date('2020-01-01') });
            const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_1', tubeId: 'recTube1' });
            const skill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_2', tubeId: 'recTube1' });
            const skill3 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_3', tubeId: 'recTube1' });
            const tube = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1, skill2, skill3], competenceId: 'recCompetence1' });
            const competence = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube], areaId: 'recArea1' });
            const area = domainBuilder.buildTargetedArea({ id: 'recArea1', competences: [competence] });
            const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
              skills: [skill1, skill2, skill3],
              tubes: [tube],
              competences: [competence],
              areas: [area],
            });
            targetProfileWithLearningContent.stages = [
              domainBuilder.buildStage({ threshold: 33 }),
              domainBuilder.buildStage({ threshold: 66 }),
              domainBuilder.buildStage({ threshold: 99 }),
            ];
            const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: 3,
              skillId: skill1.id,
              competenceId: competence.id,
            });
            const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: 2,
              skillId: skill2.id,
              competenceId: competence.id,
            });
            const knowledgeElement3 = domainBuilder.buildKnowledgeElement({
              status: KnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 4,
              skillId: skill3.id,
              competenceId: competence.id,
            });
            const participantKnowledgeElementsByCompetenceId = {
              'recCompetence1': [knowledgeElement1, knowledgeElement2, knowledgeElement3],
            };
            const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
              organization,
              campaign,
              campaignParticipationInfo,
              targetProfileWithLearningContent,
              participantKnowledgeElementsByCompetenceId,
              campaignParticipationService,
              translate,
            });

            // when
            const csvLine = campaignAssessmentCsvLine.toCsvLine();

            // then
            const cols = _computeExpectedColumnsIndex(campaign, organization, [], targetProfileWithLearningContent.stages);
            expect(csvLine[cols.STAGE_REACHED]).to.equal(2);
          });
        });

        context('when all stages have been reached', function() {
          it('tells that last stage has been reached', function() {
            // given
            const organization = domainBuilder.buildOrganization();
            const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
            const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: new Date('2020-01-01') });
            const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_1', tubeId: 'recTube1' });
            const skill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_2', tubeId: 'recTube1' });
            const skill3 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_3', tubeId: 'recTube1' });
            const tube = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1, skill2, skill3], competenceId: 'recCompetence1' });
            const competence = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube], areaId: 'recArea1' });
            const area = domainBuilder.buildTargetedArea({ id: 'recArea1', competences: [competence] });
            const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
              skills: [skill1, skill2, skill3],
              tubes: [tube],
              competences: [competence],
              areas: [area],
            });
            targetProfileWithLearningContent.stages = [
              domainBuilder.buildStage({ threshold: 33 }),
              domainBuilder.buildStage({ threshold: 66 }),
              domainBuilder.buildStage({ threshold: 99 }),
            ];
            const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: 3,
              skillId: skill1.id,
              competenceId: competence.id,
            });
            const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: 2,
              skillId: skill2.id,
              competenceId: competence.id,
            });
            const knowledgeElement3 = domainBuilder.buildKnowledgeElement({
              status: KnowledgeElement.StatusType.VALIDATED,
              earnedPix: 4,
              skillId: skill3.id,
              competenceId: competence.id,
            });
            const participantKnowledgeElementsByCompetenceId = {
              'recCompetence1': [knowledgeElement1, knowledgeElement2, knowledgeElement3],
            };
            const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
              organization,
              campaign,
              campaignParticipationInfo,
              targetProfileWithLearningContent,
              participantKnowledgeElementsByCompetenceId,
              campaignParticipationService,
              translate,
            });

            // when
            const csvLine = campaignAssessmentCsvLine.toCsvLine();

            // then
            const cols = _computeExpectedColumnsIndex(campaign, organization, [], targetProfileWithLearningContent.stages);
            expect(csvLine[cols.STAGE_REACHED]).to.equal(3);
          });
        });
      });

      context('when participation is not shared', function() {
        it('gives NA as stage reached', function() {
          // given
          const organization = domainBuilder.buildOrganization();
          const campaign = domainBuilder.buildCampaign({ idPixLabel: null });
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: null });
          const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_1', tubeId: 'recTube1' });
          const skill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_2', tubeId: 'recTube1' });
          const skill3 = domainBuilder.buildTargetedSkill({ id: 'recSkill1_3', tubeId: 'recTube1' });
          const tube = domainBuilder.buildTargetedTube({ id: 'recTube1', skills: [skill1, skill2, skill3], competenceId: 'recCompetence1' });
          const competence = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', tubes: [tube], areaId: 'recArea1' });
          const area = domainBuilder.buildTargetedArea({ id: 'recArea1', competences: [competence] });
          const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
            skills: [skill1, skill2, skill3],
            tubes: [tube],
            competences: [competence],
            areas: [area],
          });
          targetProfileWithLearningContent.stages = [
            domainBuilder.buildStage({ threshold: 30 }),
            domainBuilder.buildStage({ threshold: 60 }),
          ];
          const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 3,
            skillId: skill1.id,
            competenceId: competence.id,
          });
          const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 2,
            skillId: skill2.id,
            competenceId: competence.id,
          });
          const knowledgeElement3 = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.INVALIDATED,
            earnedPix: 4,
            skillId: skill3.id,
            competenceId: competence.id,
          });
          const participantKnowledgeElementsByCompetenceId = {
            'recCompetence1': [knowledgeElement1, knowledgeElement2, knowledgeElement3],
          };
          const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfileWithLearningContent,
            participantKnowledgeElementsByCompetenceId,
            campaignParticipationService,
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const cols = _computeExpectedColumnsIndex(campaign, organization, [], targetProfileWithLearningContent.stages);
          expect(csvLine[cols.STAGE_REACHED]).to.equal('NA');
        });
      });
    });
  });
});
