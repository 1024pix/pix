import { CampaignAssessmentResultLine } from '../../../../../../../src/prescription/campaign/infrastructure/exports/campaigns/campaign-assessment-result-line.js';
import { KnowledgeElement } from '../../../../../../../src/shared/domain/models/index.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';

describe('Unit | Infrastructure | Utils | CampaignAssessmentResultLine', function () {
  let translate;

  beforeEach(function () {
    translate = getI18n().__;
  });

  describe('#toCsvLine', function () {
    let organization, campaign, targetProfile, learningContent, stageCollection, areas, competences;
    const createdAt = new Date('2020-03-01T10:00:00Z');
    const createdAtFormated = '01/03/2020 11:00';
    const sharedAt = new Date('2020-04-01T10:00:00Z');
    const sharedAtFormated = '01/04/2020 12:00';

    beforeEach(function () {
      organization = domainBuilder.buildOrganization({ isManagingStudents: false });
      campaign = domainBuilder.prescription.campaign.buildCampaign.ofTypeAssessment({ externalIdLabel: null });
      targetProfile = domainBuilder.buildTargetProfile();
      learningContent = domainBuilder.buildLearningContent.withSimpleContent();
      areas = learningContent.areas;
      competences = learningContent.competences;
      stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
        campaignId: campaign.id,
        stages: [],
      });
    });

    describe('common participation case', function () {
      context('campaign of type EXAM', function () {
        it('should return shared info, on shared participation', function () {
          // given
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
            createdAt,
            sharedAt,
          });

          const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
            organization,
            campaign: domainBuilder.prescription.campaign.buildCampaign.ofTypeExam({ externalIdLabel: null }),
            campaignParticipationInfo,
            targetProfile,
            learningContent,
            competences,
            areas,
            stageCollection,
            participantKnowledgeElementsByCompetenceId: {
              [competences[0].id]: [],
            },
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          const csvExcpectedLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"${campaign.code}";` +
            `"${campaign.name}";` +
            `"${targetProfile.name}";` +
            `"${campaignParticipationInfo.participantLastName}";` +
            `"${campaignParticipationInfo.participantFirstName}";` +
            `"${createdAtFormated}";` +
            '"Oui";' +
            `"${sharedAtFormated}";` +
            '1;' +
            '0;' +
            '1;' +
            '0;' +
            '0;' +
            '1;' +
            '0' +
            '\n';

          // then
          expect(csvLine).to.equal(csvExcpectedLine);
        });

        it('should not return shared info, on participation not already shared', function () {
          // given
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
            createdAt,
            sharedAt: null,
            isCompleted: false,
          });

          const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
            organization,
            campaign: domainBuilder.prescription.campaign.buildCampaign.ofTypeExam({ externalIdLabel: null }),
            campaignParticipationInfo,
            targetProfile,
            learningContent,
            competences,
            areas,
            stageCollection,
            participantKnowledgeElementsByCompetenceId: {
              [competences[0].id]: [],
            },
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          const csvExcpectedLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"${campaign.code}";` +
            `"${campaign.name}";` +
            `"${targetProfile.name}";` +
            `"${campaignParticipationInfo.participantLastName}";` +
            `"${campaignParticipationInfo.participantFirstName}";` +
            `"${createdAtFormated}";` +
            '"Non";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA"' +
            '\n';

          // then
          expect(csvLine).to.equal(csvExcpectedLine);
        });
      });

      context('campaign of type ASSESSMENT', function () {
        it('should return shared info, on shared participation', function () {
          // given
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
            createdAt,
            sharedAt,
          });

          const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfile,
            learningContent,
            competences,
            areas,
            stageCollection,
            participantKnowledgeElementsByCompetenceId: {
              [competences[0].id]: [],
            },
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          const csvExcpectedLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"${campaign.code}";` +
            `"${campaign.name}";` +
            `"${targetProfile.name}";` +
            `"${campaignParticipationInfo.participantLastName}";` +
            `"${campaignParticipationInfo.participantFirstName}";` +
            '1;' +
            `"${createdAtFormated}";` +
            '"Oui";' +
            `"${sharedAtFormated}";` +
            '1;' +
            '0;' +
            '1;' +
            '0;' +
            '0;' +
            '1;' +
            '0' +
            '\n';

          // then
          expect(csvLine).to.equal(csvExcpectedLine);
        });

        it('should not return shared info, on participation not already shared', function () {
          // given
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
            createdAt,
            sharedAt: null,
            isCompleted: false,
          });

          const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfile,
            learningContent,
            competences,
            areas,
            stageCollection,
            participantKnowledgeElementsByCompetenceId: {
              [competences[0].id]: [],
            },
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          const csvExcpectedLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"${campaign.code}";` +
            `"${campaign.name}";` +
            `"${targetProfile.name}";` +
            `"${campaignParticipationInfo.participantLastName}";` +
            `"${campaignParticipationInfo.participantFirstName}";` +
            '0;' +
            `"${createdAtFormated}";` +
            '"Non";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA"' +
            '\n';

          // then
          expect(csvLine).to.equal(csvExcpectedLine);
        });
      });

      context('on additionalInfos info', function () {
        it('should write the additionalInfos when has associated headers', function () {
          // given
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
            participantExternalId: null,
            sharedAt: null,
            createdAt,
            additionalInfos: { hobby: 'genky', sport: 'volley', sleep: '8h' },
          });
          const additionalHeaders = [{ columnName: 'hobby' }, { columnName: 'sleep' }];
          const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
            organization,
            campaign,
            campaignParticipationInfo,
            additionalHeaders,
            targetProfile,
            learningContent,
            competences,
            areas,
            stageCollection,
            participantKnowledgeElementsByCompetenceId: {
              [competences[0].id]: [],
            },
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          const csvExcpectedLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"${campaign.code}";` +
            `"${campaign.name}";` +
            `"${targetProfile.name}";` +
            `"${campaignParticipationInfo.participantLastName}";` +
            `"${campaignParticipationInfo.participantFirstName}";` +
            `"genky";` +
            `"8h";` +
            '1;' +
            `"${createdAtFormated}";` +
            '"Non";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA"' +
            '\n';

          // then
          expect(csvLine).to.equal(csvExcpectedLine);
        });

        it('should not write the additionalHeaders when has no associated headers', function () {
          // given
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
            participantExternalId: null,
            createdAt,
            sharedAt: null,
            additionalInfos: { hobby: 'genky', sport: 'volley', sleep: '8h' },
          });
          const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
            organization,
            campaign,
            campaignParticipationInfo,
            additionalHeaders: [],
            targetProfile,
            learningContent,
            competences,
            areas,
            stageCollection,
            participantKnowledgeElementsByCompetenceId: {
              [competences[0].id]: [],
            },
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const csvExcpectedLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"${campaign.code}";` +
            `"${campaign.name}";` +
            `"${targetProfile.name}";` +
            `"${campaignParticipationInfo.participantLastName}";` +
            `"${campaignParticipationInfo.participantFirstName}";` +
            '1;' +
            `"${createdAtFormated}";` +
            '"Non";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA"' +
            '\n';

          // then
          expect(csvLine).to.equal(csvExcpectedLine);
        });
      });

      it('should write the participantExternalId when campaign has an externalIdLabel', function () {
        // given
        const campaign = domainBuilder.buildCampaign({ externalIdLabel: 'I Have One !' });
        const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
          participantExternalId: 'someParticipantExternalId',
          createdAt,
          sharedAt: null,
          isCompleted: false,
        });

        const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
          organization,
          campaign,
          campaignParticipationInfo,
          targetProfile,
          learningContent,
          competences,
          areas,
          stageCollection,
          participantKnowledgeElementsByCompetenceId: {
            [competences[0].id]: [],
          },
          translate,
        });

        // when
        const csvLine = campaignAssessmentCsvLine.toCsvLine();

        const csvExcpectedLine =
          `"${organization.name}";` +
          `${campaign.id};` +
          `"${campaign.code}";` +
          `"${campaign.name}";` +
          `"${targetProfile.name}";` +
          `"${campaignParticipationInfo.participantLastName}";` +
          `"${campaignParticipationInfo.participantFirstName}";` +
          `"${campaignParticipationInfo.participantExternalId}";` +
          '0;' +
          `"${createdAtFormated}";` +
          '"Non";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA";' +
          '"NA"' +
          '\n';

        // then
        expect(csvLine).to.equal(csvExcpectedLine);
      });

      context('when organization is SUP managingStudents', function () {
        it('should display group , student number before participantExternalId', function () {
          // given
          const organization = domainBuilder.buildOrganization({ type: 'SUP', isManagingStudents: true });
          const campaign = domainBuilder.buildCampaign({ externalIdLabel: 'I Have One !' });
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
            studentNumber: 'someStudentNumber',
            group: 'D3',
            participantExternalId: 'someParticipantExternalId',
            createdAt,
            sharedAt: null,
            isCompleted: false,
          });

          const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
            organization,
            campaign,
            areas: [],
            competences: [],
            campaignParticipationInfo,
            targetProfile,
            learningContent,
            stageCollection,
            participantKnowledgeElementsByCompetenceId: {
              [competences[0].id]: [],
            },
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const csvExpectedLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"${campaign.code}";` +
            `"${campaign.name}";` +
            `"${targetProfile.name}";` +
            `"${campaignParticipationInfo.participantLastName}";` +
            `"${campaignParticipationInfo.participantFirstName}";` +
            `"${campaignParticipationInfo.group}";` +
            `"${campaignParticipationInfo.studentNumber}";` +
            `"${campaignParticipationInfo.participantExternalId}";` +
            '0;' +
            `"${createdAtFormated}";` +
            '"Non";' +
            '"NA";' +
            '"NA"' +
            '\n';

          // then
          expect(csvLine).to.equal(csvExpectedLine);
        });
      });

      context('when organization is SCO managingStudents', function () {
        it('should display division before participantExternalId', function () {
          // given
          const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: true });
          const campaign = domainBuilder.buildCampaign({ externalIdLabel: 'I Have One !' });
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
            division: '6eme',
            participantExternalId: 'someParticipantExternalId',
            createdAt,
            sharedAt: null,
            isCompleted: false,
          });

          const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
            organization,
            campaign,
            areas: [],
            competences: [],
            campaignParticipationInfo,
            targetProfile,
            learningContent,
            stageCollection,
            participantKnowledgeElementsByCompetenceId: {
              [competences[0].id]: [],
            },
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const csvExcpectedLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"${campaign.code}";` +
            `"${campaign.name}";` +
            `"${targetProfile.name}";` +
            `"${campaignParticipationInfo.participantLastName}";` +
            `"${campaignParticipationInfo.participantFirstName}";` +
            `"${campaignParticipationInfo.division}";` +
            `"${campaignParticipationInfo.participantExternalId}";` +
            '0;' +
            `"${createdAtFormated}";` +
            '"Non";' +
            '"NA";' +
            '"NA"' +
            '\n';

          // then
          expect(csvLine).to.equal(csvExcpectedLine);
        });
      });
    });

    context('skill details', function () {
      let participantKnowledgeElementsByCompetenceId;

      beforeEach(function () {
        const skill1_2 = domainBuilder.buildSkill({ id: 'recSkill1_2', tubeId: 'recTube1' });
        const skill2_1 = domainBuilder.buildSkill({ id: 'recSkill2_1', tubeId: 'recTube2' });
        const skill3_1 = domainBuilder.buildSkill({ id: 'recSkill3_1', tubeId: 'recTube3' });
        const skill3_2 = domainBuilder.buildSkill({ id: 'recSkill3_2', tubeId: 'recTube3' });
        const skill1_1 = domainBuilder.buildSkill({ id: 'recSkill1_1', tubeId: 'recTube1' });
        const tube1 = domainBuilder.buildTube({
          id: 'recTube1',
          skills: [skill1_1, skill1_2],
          competenceId: 'recCompetence1',
        });
        const tube2 = domainBuilder.buildTube({
          id: 'recTube2',
          skills: [skill2_1],
          competenceId: 'recCompetence2',
        });
        const tube3 = domainBuilder.buildTube({
          id: 'recTube3',
          skills: [skill3_1, skill3_2],
          competenceId: 'recCompetence3',
        });
        const competence1 = domainBuilder.buildCompetence({
          id: 'recCompetence1',
          tubes: [tube1],
        });
        const competence2 = domainBuilder.buildCompetence({
          id: 'recCompetence2',
          tubes: [tube2],
        });
        const competence3 = domainBuilder.buildCompetence({
          id: 'recCompetence3',
          tubes: [tube3],
        });
        const area1 = domainBuilder.buildArea({ id: 'recArea1', competences: [competence1, competence2] });
        const area2 = domainBuilder.buildArea({ id: 'recArea2', competences: [competence3] });
        const framework = domainBuilder.buildFramework({ areas: [area1, area2] });

        learningContent = domainBuilder.buildLearningContent([framework]);

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

        participantKnowledgeElementsByCompetenceId = {
          recCompetence1: [knowledgeElement1],
          recCompetence2: [knowledgeElement2],
          recCompetence3: [knowledgeElement3, knowledgeElement4],
        };
      });

      context('when organization showSkills is true', function () {
        beforeEach(function () {
          organization = domainBuilder.buildOrganization({ showSkills: true });
        });

        context('when participation is shared', function () {
          it('should show details for each competence, area and skills', function () {
            // given
            const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
              sharedAt,
              createdAt,
            });

            const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
              organization,
              campaign,
              campaignParticipationInfo,
              targetProfile,
              learningContent,
              competences: learningContent.competences,
              areas: learningContent.areas,
              stageCollection,
              participantKnowledgeElementsByCompetenceId,
              translate,
            });

            // when
            const csvLine = campaignAssessmentCsvLine.toCsvLine();

            const csvExcpectedLine =
              `"${organization.name}";` +
              `${campaign.id};` +
              `"${campaign.code}";` +
              `"${campaign.name}";` +
              `"${targetProfile.name}";` +
              `"${campaignParticipationInfo.participantLastName}";` +
              `"${campaignParticipationInfo.participantFirstName}";` +
              '1;' +
              `"${createdAtFormated}";` +
              '"Oui";' +
              `"${sharedAtFormated}";` +
              '1;' +
              '0,5;' +
              '2;' +
              '1;' +
              '0;' +
              '1;' +
              '0;' +
              '1;' +
              '2;' +
              '2;' +
              '0,33;' +
              '3;' +
              '1;' +
              '1;' +
              '2;' +
              '2;' +
              '"OK";' +
              '"Non testé";' +
              '"KO";' +
              '"OK";' +
              '"OK"' +
              '\n';

            // then
            expect(csvLine).to.equal(csvExcpectedLine);
          });
        });

        context('when participation is not shared', function () {
          it('should show NA for each competence, area and skills', function () {
            // given
            const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
              sharedAt: null,
              createdAt,
            });

            const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
              organization,
              campaign,
              campaignParticipationInfo,
              targetProfile,
              learningContent,
              competences,
              areas,
              stageCollection,
              participantKnowledgeElementsByCompetenceId,
              translate,
            });

            // when
            const csvLine = campaignAssessmentCsvLine.toCsvLine();

            const csvExcpectedLine =
              `"${organization.name}";` +
              `${campaign.id};` +
              `"${campaign.code}";` +
              `"${campaign.name}";` +
              `"${targetProfile.name}";` +
              `"${campaignParticipationInfo.participantLastName}";` +
              `"${campaignParticipationInfo.participantFirstName}";` +
              '1;' +
              `"${createdAtFormated}";` +
              '"Non";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA";' +
              '"NA"' +
              '\n';

            // then
            expect(csvLine).to.equal(csvExcpectedLine);
          });
        });
      });
    });

    context('when campaign has bagdes', function () {
      context('when participation is not shared', function () {
        it('should not show badges acquired or not', function () {
          // given
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: null, createdAt });
          const badge = 'badge title';
          const targetProfile = domainBuilder.buildTargetProfile({ badges: [badge] });
          const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfile,
            learningContent,
            competences,
            areas,
            stageCollection,
            participantKnowledgeElementsByCompetenceId: {
              [competences[0].id]: [],
            },
            acquiredBadges: [badge],
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          // then
          const csvExcpectedLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"${campaign.code}";` +
            `"${campaign.name}";` +
            `"${targetProfile.name}";` +
            `"${campaignParticipationInfo.participantLastName}";` +
            `"${campaignParticipationInfo.participantFirstName}";` +
            '1;' +
            `"${createdAtFormated}";` +
            '"Non";' +
            `"NA";` +
            `"NA";` +
            `"NA";` +
            `"NA";` +
            `"NA";` +
            `"NA";` +
            `"NA";` +
            `"NA";` +
            `"NA"` +
            '\n';

          // then
          expect(csvLine).to.equal(csvExcpectedLine);
        });
      });

      context('when participation is shared', function () {
        it('should show badges acquired', function () {
          // given
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
            sharedAt,
            createdAt,
          });
          const badge = domainBuilder.buildBadge({ title: 'badge title' });
          const targetProfile = domainBuilder.buildTargetProfile({ badges: [badge] });
          const stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
            campaignId: campaign.id,
            stages: [],
          });
          const knowledgeElement = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 3,
            skillId: learningContent.skills[0].id,
            competenceId: learningContent.competences[0].id,
          });
          const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfile,
            learningContent,
            competences,
            areas,
            stageCollection,
            participantKnowledgeElementsByCompetenceId: {
              [competences[0].id]: [knowledgeElement],
            },
            acquiredBadges: [badge.title],
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          const csvExcpectedLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"${campaign.code}";` +
            `"${campaign.name}";` +
            `"${targetProfile.name}";` +
            `"${campaignParticipationInfo.participantLastName}";` +
            `"${campaignParticipationInfo.participantFirstName}";` +
            '1;' +
            `"${createdAtFormated}";` +
            '"Oui";' +
            `"${sharedAtFormated}";` +
            `"Oui";` +
            `1;` +
            `1;` +
            `1;` +
            `1;` +
            `1;` +
            `1;` +
            `1` +
            '\n';

          // then
          expect(csvLine).to.equal(csvExcpectedLine);
        });

        it('should show badges not acquired', function () {
          // given
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
            sharedAt,
            createdAt,
          });
          const badge = 'badge title';
          const targetProfile = domainBuilder.buildTargetProfile({ badges: [badge] });
          const knowledgeElement = domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 3,
            skillId: learningContent.skills[0].id,
            competenceId: learningContent.competences[0].id,
          });
          const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfile,
            learningContent,
            competences,
            areas,
            stageCollection,
            participantKnowledgeElementsByCompetenceId: {
              [competences[0].id]: [knowledgeElement],
            },
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          const csvExcpectedLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"${campaign.code}";` +
            `"${campaign.name}";` +
            `"${targetProfile.name}";` +
            `"${campaignParticipationInfo.participantLastName}";` +
            `"${campaignParticipationInfo.participantFirstName}";` +
            '1;' +
            `"${createdAtFormated}";` +
            '"Oui";' +
            `"${sharedAtFormated}";` +
            `"Non";` +
            `1;` +
            `1;` +
            `1;` +
            `1;` +
            `1;` +
            `1;` +
            `1` +
            '\n';

          // then
          expect(csvLine).to.equal(csvExcpectedLine);
        });
      });
    });

    context('when there are stages', function () {
      let learningContent, stageCollection, knowledgeElement1, knowledgeElement2, knowledgeElement3;

      beforeEach(function () {
        const skill1 = domainBuilder.buildSkill({ id: 'recSkill1_1', tubeId: 'recTube1' });
        const skill2 = domainBuilder.buildSkill({ id: 'recSkill1_2', tubeId: 'recTube1' });
        const skill3 = domainBuilder.buildSkill({ id: 'recSkill1_3', tubeId: 'recTube1' });
        const tube = domainBuilder.buildTube({
          id: 'recTube1',
          skills: [skill1, skill2, skill3],
          competenceId: 'recCompetence1',
        });
        const competence = domainBuilder.buildCompetence({
          id: 'recCompetence1',
          tubes: [tube],
        });
        const area = domainBuilder.buildArea({ id: 'recArea1', competences: [competence] });
        const framework = domainBuilder.buildFramework({ areas: [area] });
        learningContent = domainBuilder.buildLearningContent([framework]);
        stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
          campaignId: campaign.id,
          stages: [
            domainBuilder.buildStage({ threshold: 0 }),
            domainBuilder.buildStage({ threshold: 33 }),
            domainBuilder.buildStage({ threshold: 66 }),
            domainBuilder.buildStage({ threshold: 99 }),
          ],
        });
        knowledgeElement1 = domainBuilder.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          earnedPix: 3,
          skillId: skill1.id,
          competenceId: competence.id,
        });
        knowledgeElement2 = domainBuilder.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          earnedPix: 2,
          skillId: skill2.id,
          competenceId: competence.id,
        });
        knowledgeElement3 = domainBuilder.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.INVALIDATED,
          earnedPix: 4,
          skillId: skill3.id,
          competenceId: competence.id,
        });
      });
      context('when participation is shared', function () {
        context('when some stages have been reached', function () {
          it('tells highest stage reached', function () {
            // given
            const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
              sharedAt,
              createdAt,
              masteryRate: 0.7,
            });
            const participantKnowledgeElementsByCompetenceId = {
              recCompetence1: [knowledgeElement1],
            };
            const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
              organization,
              campaign,
              campaignParticipationInfo,
              targetProfile,
              learningContent,
              areas: learningContent.areas,
              competences: learningContent.competences,
              stageCollection,
              acquiredStages: [{ id: 1 }, { id: 2 }, { id: 3 }],
              participantKnowledgeElementsByCompetenceId,
              translate,
            });

            // when
            const csvLine = campaignAssessmentCsvLine.toCsvLine();

            const csvExcpectedLine =
              `"${organization.name}";` +
              `${campaign.id};` +
              `"${campaign.code}";` +
              `"${campaign.name}";` +
              `"${targetProfile.name}";` +
              `"${campaignParticipationInfo.participantLastName}";` +
              `"${campaignParticipationInfo.participantFirstName}";` +
              '1;' +
              `"${createdAtFormated}";` +
              '"Oui";' +
              `"${sharedAtFormated}";` +
              '2;' +
              '0,7;' +
              '0,33;' +
              '3;' +
              '1;' +
              '0,33;' +
              '3;' +
              '1' +
              '\n';

            // then
            expect(csvLine).to.equal(csvExcpectedLine);
          });
        });

        context('when all stages have been reached', function () {
          it('tells that last stage has been reached', function () {
            // given
            const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({
              sharedAt,
              createdAt,
            });
            const participantKnowledgeElementsByCompetenceId = {
              recCompetence1: [knowledgeElement1, knowledgeElement2, knowledgeElement3],
            };
            const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
              organization,
              campaign,
              campaignParticipationInfo,
              targetProfile,
              learningContent,
              competences: learningContent.competences,
              areas: learningContent.areas,
              stageCollection,
              acquiredStages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 3 }],
              participantKnowledgeElementsByCompetenceId,
              translate,
            });

            // when
            const csvLine = campaignAssessmentCsvLine.toCsvLine();

            const csvExcpectedLine =
              `"${organization.name}";` +
              `${campaign.id};` +
              `"${campaign.code}";` +
              `"${campaign.name}";` +
              `"${targetProfile.name}";` +
              `"${campaignParticipationInfo.participantLastName}";` +
              `"${campaignParticipationInfo.participantFirstName}";` +
              '1;' +
              `"${createdAtFormated}";` +
              '"Oui";' +
              `"${sharedAtFormated}";` +
              '3;' +
              '1;' +
              '0,67;' +
              '3;' +
              '2;' +
              '0,67;' +
              '3;' +
              '2' +
              '\n';

            // then
            expect(csvLine).to.equal(csvExcpectedLine);
          });
        });
      });

      context('when participation is not shared', function () {
        it('gives NA as stage reached', function () {
          // given
          const campaignParticipationInfo = domainBuilder.buildCampaignParticipationInfo({ sharedAt: null, createdAt });

          const participantKnowledgeElementsByCompetenceId = {
            recCompetence1: [knowledgeElement1, knowledgeElement2, knowledgeElement3],
          };
          const campaignAssessmentCsvLine = new CampaignAssessmentResultLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfile,
            learningContent,
            competences,
            areas,
            stageCollection,
            participantKnowledgeElementsByCompetenceId,
            translate,
          });

          // when
          const csvLine = campaignAssessmentCsvLine.toCsvLine();

          const csvExcpectedLine =
            `"${organization.name}";` +
            `${campaign.id};` +
            `"${campaign.code}";` +
            `"${campaign.name}";` +
            `"${targetProfile.name}";` +
            `"${campaignParticipationInfo.participantLastName}";` +
            `"${campaignParticipationInfo.participantFirstName}";` +
            '1;' +
            `"${createdAtFormated}";` +
            '"Non";' +
            `"NA";` +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA";' +
            '"NA"' +
            '\n';

          // then
          expect(csvLine).to.equal(csvExcpectedLine);
        });
      });
    });
  });
});
