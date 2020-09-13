const { expect, domainBuilder } = require('../../../../test-helper');
const CampaignAssessmentCsvLine = require('../../../../../lib/infrastructure/utils/CampaignAssessmentCsvLine');
const campaignParticipationService = require('../../../../../lib/domain/services/campaign-participation-service');
const KnowledgeElement = require('../../../../../lib/domain/models/KnowledgeElement');

const ORGANIZATION_NAME_COLUMN = 0;
const CAMPAIGN_ID_COLUMN = 1;
const CAMPAIGN_NAME_COLUMN = 2;
const TARGET_PROFLILE_NAME_COLUMN = 3;
const PARTICIPANT_LAST_NAME_COLUMN = 4;
const PARTICIPANT_FIRST_NAME_COLUMN = 5;
const EXTERNAL_ID_OR_STUDENT_NUMBER_COLUMN = 6;
const PARTICIPATION_CREATED_AT_COLUMN = 7;
const PARTICIPATION_IS_SHARED_COLUMN = 8;
const PARTICIPATION_SHARED_AT_COLUMN = 9;
const PARTICIPATION_PROGRESSION_COLUMN = 10;
const OTHER_COLUMNS = 11;

describe('Integration | Infrastructure | Utils | CampaignAssessmentCsvLine', () => {

  describe('#toCsvLine', () => {

    it('should return common info', () => {
      // given
      const campaignInfo = domainBuilder.buildCampaignInfo({ idPixLabel: null, organizationIsManagingStudents: false });
      const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ createdAt: new Date('2020-01-01'), isCompleted: false });
      const skill = domainBuilder.buildSkill({ id: 'recSkill', competenceId: 'recCompetence1' });
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });
      const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
        campaignInfo,
        competences: [],
        campaignParticipationInfo,
        targetProfile,
        participantKnowledgeElements: [],
        campaignParticipationService,
      });

      // when
      const csvLine = campaignAssessmentCsvLine.toCsvLine();

      // then
      expect(csvLine[ORGANIZATION_NAME_COLUMN], 'organization name').to.equal(campaignInfo.organizationName);
      expect(csvLine[CAMPAIGN_ID_COLUMN], 'campaign id').to.equal(campaignInfo.id);
      expect(csvLine[CAMPAIGN_NAME_COLUMN], 'campaign name').to.equal(campaignInfo.name);
      expect(csvLine[TARGET_PROFLILE_NAME_COLUMN], 'target profile name').to.equal(targetProfile.name);
      expect(csvLine[PARTICIPANT_LAST_NAME_COLUMN], 'participant last name').to.equal(campaignParticipationInfo.participantLastName);
      expect(csvLine[PARTICIPANT_FIRST_NAME_COLUMN], 'participant first name').to.equal(campaignParticipationInfo.participantFirstName);
      expect(csvLine[PARTICIPATION_CREATED_AT_COLUMN], 'participant created at').to.equal('2020-01-01');
      expect(csvLine[PARTICIPATION_PROGRESSION_COLUMN], 'participation progression').to.equal(0);
    });

    context('on external id column', () => {
      it('should write the student number when organization is of type SUP and campaign is restricted', () => {
        // given
        const campaignInfo = domainBuilder.buildCampaignInfo({ idPixLabel: null, organizationType: 'SUP', organizationIsManagingStudents: true });
        const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ studentNumber: 'someStudentNumber' });
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [] });
        const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
          campaignInfo,
          competences: [],
          campaignParticipationInfo,
          targetProfile,
          participantKnowledgeElements: [],
          campaignParticipationService,
        });

        // when
        const csvLine = campaignAssessmentCsvLine.toCsvLine();

        // then
        expect(csvLine[EXTERNAL_ID_OR_STUDENT_NUMBER_COLUMN], 'student number').to.equal(campaignParticipationInfo.studentNumber);
      });

      it('should write the participantExternalId when campaign has an idPixLabel', () => {
        // given
        const campaignInfo = domainBuilder.buildCampaignInfo({ idPixLabel: 'I Have One !', organizationIsManagingStudents: false });
        const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ participantExternalId: 'someParticipantExternalId' });
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [] });
        const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
          campaignInfo,
          competences: [],
          campaignParticipationInfo,
          targetProfile,
          participantKnowledgeElements: [],
          campaignParticipationService,
        });

        // when
        const csvLine = campaignAssessmentCsvLine.toCsvLine();

        // then
        expect(csvLine[EXTERNAL_ID_OR_STUDENT_NUMBER_COLUMN], 'external id').to.equal(campaignParticipationInfo.participantExternalId);
      });
    });

    context('when participation is not shared', () => {
      it('should show appropriate content for not shared participation', () => {
        // given
        const campaignInfo = domainBuilder.buildCampaignInfo();
        const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: null });
        const skill1_1 = domainBuilder.buildSkill({ id: 'recSkill1_1', competenceId: 'recCompetence1' });
        const skill2_1 = domainBuilder.buildSkill({ id: 'recSkill2_1', competenceId: 'recCompetence2' });
        const skill2_2 = domainBuilder.buildSkill({ id: 'recSkill2_2', competenceId: 'recCompetence2' });
        const area1 = domainBuilder.buildArea();
        const area2 = domainBuilder.buildArea();
        const competence1 = domainBuilder.buildCompetence({ id: 'recCompetence1', skillIds: ['recSkill1_1', 'recSkill1_2_not_targeted'], area: area1 });
        const competence2 = domainBuilder.buildCompetence({ id: 'recCompetence2', skillIds: ['recSkill2_1', 'recSkill2_2'], area: area2 });
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1_1, skill2_1, skill2_2] });
        const areas = [area1, area2];
        const competences = [competence1, competence2];
        const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
          campaignInfo,
          competences,
          campaignParticipationInfo,
          targetProfile,
          participantKnowledgeElements: [],
          campaignParticipationService,
        });

        // when
        const csvLine = campaignAssessmentCsvLine.toCsvLine();

        // then
        const EMPTY_CONTENT = 'NA';
        expect(csvLine[PARTICIPATION_IS_SHARED_COLUMN], 'is shared').to.equal('Non');
        expect(csvLine[PARTICIPATION_SHARED_AT_COLUMN], 'shared at').to.equal(EMPTY_CONTENT);
        expect(csvLine[PARTICIPATION_PROGRESSION_COLUMN], 'participation progression').to.equal(EMPTY_CONTENT);

        let currentColumn = OTHER_COLUMNS;
        const STAT_COLUMNS_COUNT = 3;
        for (let i = 0; i < competences.length; ++i) {
          expect(csvLine[currentColumn + i], '% maitrise de la competence').to.equal(EMPTY_CONTENT);
          expect(csvLine[currentColumn + i + 1], 'nb acquis compétence').to.equal(EMPTY_CONTENT);
          expect(csvLine[currentColumn + i + 2], 'nb acquis validés dans la compétence').to.equal(EMPTY_CONTENT);
        }
        currentColumn = currentColumn + competences.length * STAT_COLUMNS_COUNT;

        for (let i = 0; i < areas.length; ++i) {
          expect(csvLine[currentColumn + i], '% maitrise du domaine').to.equal(EMPTY_CONTENT);
          expect(csvLine[currentColumn + i + 1], 'nb acquis domaine').to.equal(EMPTY_CONTENT);
          expect(csvLine[currentColumn + i + 2], 'nb acquis validés dans le domaine').to.equal(EMPTY_CONTENT);
        }
        currentColumn = currentColumn + areas.length * STAT_COLUMNS_COUNT;

        for (let i = 0; i < targetProfile.skills.length; ++i) {
          expect(csvLine[currentColumn + i], 'statut acquis').to.equal(EMPTY_CONTENT);
        }
        currentColumn = currentColumn + targetProfile.skills.length;

        expect(csvLine).to.have.lengthOf(currentColumn);
      });
    });

    context('when participation is shared', () => {
      it('should show appropriate content for shared participation', () => {
        // given
        const campaignInfo = domainBuilder.buildCampaignInfo();
        const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: new Date('2020-01-01') });
        const skill1_1 = domainBuilder.buildSkill({ id: 'recSkill1_1', competenceId: 'recCompetence1' });
        const skill1_2 = domainBuilder.buildSkill({ id: 'recSkill1_2', competenceId: 'recCompetence1' });
        const skill2_1 = domainBuilder.buildSkill({ id: 'recSkill2_1', competenceId: 'recCompetence2' });
        const skill3_1 = domainBuilder.buildSkill({ id: 'recSkill3_1', competenceId: 'recCompetence3' });
        const skill3_2 = domainBuilder.buildSkill({ id: 'recSkill3_2', competenceId: 'recCompetence3' });
        const area1 = domainBuilder.buildArea();
        const area2 = domainBuilder.buildArea();
        const competence1 = domainBuilder.buildCompetence({ id: 'recCompetence1', skillIds: ['recSkill1_1', 'recSkill1_2', 'recNotTargeted'], area: area1 });
        const competence2 = domainBuilder.buildCompetence({ id: 'recCompetence2', skillIds: ['recSkill2_1'], area: area1 });
        const competence3 = domainBuilder.buildCompetence({ id: 'recCompetence3', skillIds: ['recSkill3_1', 'recSkill3_2'], area: area2 });
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1_1, skill1_2, skill2_1, skill3_1, skill3_2] });
        const competences = [competence1, competence2, competence3];
        const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          earnedPix: skill1_1.pixValue,
          skillId: skill1_1.id,
          competenceId: skill1_1.competenceId,
        });
        const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.INVALIDATED,
          earnedPix: skill2_1.pixValue,
          skillId: skill2_1.id,
          competenceId: skill2_1.competenceId,
        });
        const knowledgeElement3 = domainBuilder.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          earnedPix: skill3_1.pixValue,
          skillId: skill3_1.id,
          competenceId: skill3_1.competenceId,
        });
        const knowledgeElement4 = domainBuilder.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          earnedPix: skill3_2.pixValue,
          skillId: skill3_2.id,
          competenceId: skill3_2.competenceId,
        });
        const participantKnowledgeElements = [ knowledgeElement1, knowledgeElement2, knowledgeElement3, knowledgeElement4 ];
        const campaignAssessmentCsvLine = new CampaignAssessmentCsvLine({
          campaignInfo,
          competences,
          campaignParticipationInfo,
          targetProfile,
          participantKnowledgeElements,
          campaignParticipationService,
        });

        // when
        const csvLine = campaignAssessmentCsvLine.toCsvLine();

        // then
        expect(csvLine[PARTICIPATION_IS_SHARED_COLUMN], 'is shared').to.equal('Oui');
        expect(csvLine[PARTICIPATION_SHARED_AT_COLUMN], 'shared at').to.equal('2020-01-01');
        expect(csvLine[PARTICIPATION_PROGRESSION_COLUMN], 'participation progression').to.equal(0.6);

        let currentColumn = OTHER_COLUMNS;
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
        expect(csvLine[currentColumn++], 'nb acquis validés dans le domaine').to.equal(1);
        // Second area
        expect(csvLine[currentColumn++], '% maitrise du domaine').to.equal(1);
        expect(csvLine[currentColumn++], 'nb acquis domaine').to.equal(2);
        expect(csvLine[currentColumn++], 'nb acquis validés dans le domaine').to.equal(2);
        // Target profile skills
        expect(csvLine[currentColumn++], 'statut acquis').to.equal('OK');
        expect(csvLine[currentColumn++], 'statut acquis').to.equal('Non testé');
        expect(csvLine[currentColumn++], 'statut acquis').to.equal('KO');
        expect(csvLine[currentColumn++], 'statut acquis').to.equal('OK');
        expect(csvLine[currentColumn++], 'statut acquis').to.equal('OK');

        expect(csvLine).to.have.lengthOf(currentColumn);
      });
    });
  });
});
