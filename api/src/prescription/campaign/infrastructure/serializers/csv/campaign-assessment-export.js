import _ from 'lodash';

import * as improvementService from '../../../../../evaluation/domain/services/improvement-service.js';
import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../../shared/constants.js';
import { KnowledgeState } from '../../../../../shared/domain/models/KnowledgeState.js';
import { serializeLine } from '../../../../../shared/infrastructure/helpers/csv.js';
import { getI18n } from '../../../../../shared/infrastructure/i18n/i18n.js';
import { PromiseUtils } from '../../../../../shared/infrastructure/utils/promise-utils.js';
import { CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING } from '../../../domain/constants.js';
import { CampaignAssessmentResultLine } from '../../exports/campaigns/campaign-assessment-result-line.js';

class CampaignAssessmentExport {
  constructor({
    outputStream,
    organization,
    targetProfile,
    learningContent,
    stageCollection,
    campaign,
    locale,
    additionalHeaders = [],
  }) {
    this.stream = outputStream;
    this.organization = organization;
    this.campaign = campaign;
    this.targetProfile = targetProfile;
    this.learningContent = learningContent;
    this.stageCollection = stageCollection;
    this.externalIdLabel = campaign.externalIdLabel;
    this.competences = learningContent.competences;
    this.areas = learningContent.areas;
    this.locale = locale;
    this.i18n = getI18n(locale);
    this.additionalHeaders = additionalHeaders;
  }

  export(
    {
      campaignParticipationInfos,
      knowledgeStateForParticipationService,
      badgeAcquisitionRepository,
      stageAcquisitionRepository,
    },
    constants = {
      CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING,
      CONCURRENCY_HEAVY_OPERATIONS,
    },
  ) {
    this.stream.write(this.#buildHeader());
    const campaignParticipationInfoChunks = _.chunk(
      campaignParticipationInfos,
      constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING,
    );
    return PromiseUtils.map(
      campaignParticipationInfoChunks,
      async (campaignParticipationInfoChunk) => {
        const sharedParticipations = campaignParticipationInfoChunk.filter(({ isShared }) => isShared);

        const acquiredBadges = await this.#getAcquiredBadgesByCampaignParticipations({
          campaignParticipationInfoChunk: sharedParticipations,
          badgeAcquisitionRepository,
        });
        const acquiredStages = await this.#getAcquiredStagesByCampaignParticipations({
          campaignParticipationInfoChunk: sharedParticipations,
          stageAcquisitionRepository,
        });

        const sharedKnowledgeStates = await knowledgeStateForParticipationService.findByUsersOrCampaignParticipationIds(
          {
            participationInfos: sharedParticipations.map(({ campaignParticipationId }) => {
              return { campaignParticipationId };
            }),
            fetchFromSnapshot: true,
          },
        );

        const startedParticipations = campaignParticipationInfoChunk.filter(
          ({ isShared, isCompleted }) => !isShared && !isCompleted,
        );

        const startedKnowledgeStates =
          await knowledgeStateForParticipationService.findByUsersOrCampaignParticipationIds({
            participationInfos: startedParticipations.map(({ userId, campaignParticipationId }) => {
              return { userId, campaignParticipationId };
            }),
            fetchFromSnapshot: this.campaign.isExam,
          });

        const csvLines = campaignParticipationInfoChunk.map((campaignParticipationInfo) =>
          this.#buildCSVLineForParticipation({
            acquiredBadges,
            acquiredStages,
            campaignParticipationInfo,
            campaignParticipationInfoChunk,
            sharedKnowledgeStates,
            startedKnowledgeStates,
          }),
        );
        this.stream.write(csvLines.join(''));
      },
      { concurrency: CONCURRENCY_HEAVY_OPERATIONS },
    );
  }

  #buildHeader() {
    const forSupStudents = this.organization.isSup && this.organization.isManagingStudents;
    const displayDivision = this.organization.isSco && this.organization.isManagingStudents;

    const extraHeaders = this.additionalHeaders.map((header) => header.columnName);

    const headers = [
      this.i18n.__('campaign-export.common.organization-name'),
      this.i18n.__('campaign-export.common.campaign-id'),
      this.i18n.__('campaign-export.common.campaign-code'),
      this.i18n.__('campaign-export.common.campaign-name'),
      this.i18n.__('campaign-export.assessment.target-profile-name'),
      this.i18n.__('campaign-export.common.participant-lastname'),
      this.i18n.__('campaign-export.common.participant-firstname'),
      ...extraHeaders,
      ...(displayDivision ? [this.i18n.__('campaign-export.common.participant-division')] : []),
      ...(forSupStudents ? [this.i18n.__('campaign-export.common.participant-group')] : []),
      ...(forSupStudents ? [this.i18n.__('campaign-export.common.participant-student-number')] : []),
      ...(this.campaign.externalIdLabel ? [this.campaign.externalIdLabel] : []),

      this.i18n.__('campaign-export.assessment.progress'),
      this.i18n.__('campaign-export.assessment.started-on'),
      this.i18n.__('campaign-export.assessment.is-shared'),
      this.i18n.__('campaign-export.assessment.shared-on'),

      ...(this.stageCollection.hasStage
        ? [
            this.i18n.__('campaign-export.assessment.success-rate', {
              value: this.stageCollection.totalStages - 1,
            }),
          ]
        : []),

      ..._.flatMap(this.targetProfile.badges, (badge) => [
        this.i18n.__('campaign-export.assessment.thematic-result-name', {
          name: badge.title,
        }),
      ]),

      this.i18n.__('campaign-export.assessment.mastery-percentage-target-profile'),

      ...this.#competenceColumnHeaders(),
      ...this.#areaColumnHeaders(),

      ...(this.organization.showSkills ? this.learningContent.skillNames : []),
    ];

    // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
    // - https://en.wikipedia.org/wiki/Byte_order_mark
    // - https://stackoverflow.com/a/38192870
    return '\uFEFF' + serializeLine(headers.filter(Boolean));
  }

  #competenceColumnHeaders() {
    return _.flatMap(this.competences, (competence) => [
      this.i18n.__('campaign-export.assessment.skill.mastery-percentage', {
        name: competence.name,
      }),
      this.i18n.__('campaign-export.assessment.skill.total-items', {
        name: competence.name,
      }),
      this.i18n.__('campaign-export.assessment.skill.items-successfully-completed', { name: competence.name }),
    ]);
  }

  #areaColumnHeaders() {
    return _.flatMap(this.areas, (area) => [
      this.i18n.__('campaign-export.assessment.competence-area.mastery-percentage', { name: area.title }),
      this.i18n.__('campaign-export.assessment.competence-area.total-items', {
        name: area.title,
      }),
      this.i18n.__('campaign-export.assessment.competence-area.items-successfully-completed', { name: area.title }),
    ]);
  }

  #buildCSVLineForParticipation({
    campaignParticipationInfo,
    acquiredStages,
    acquiredBadges,
    sharedKnowledgeStates,
    startedKnowledgeStates,
  }) {
    return new CampaignAssessmentResultLine({
      organization: this.organization,
      campaign: this.campaign,
      campaignParticipationInfo,
      targetProfile: this.targetProfile,
      additionalHeaders: this.additionalHeaders,
      learningContent: this.learningContent,
      areas: this.areas,
      competences: this.competences,
      stageCollection: this.stageCollection,
      participantKnowledgeState: this.#getParticipantKnowledgeState({
        campaignParticipationInfo,
        sharedKnowledgeStates,
        startedKnowledgeStates,
      }),
      acquiredStages:
        acquiredStages &&
        acquiredStages.filter(
          (stage) => stage.campaignParticipationId === campaignParticipationInfo.campaignParticipationId,
        ),
      acquiredBadges:
        acquiredBadges && acquiredBadges[campaignParticipationInfo.campaignParticipationId]
          ? acquiredBadges[campaignParticipationInfo.campaignParticipationId].map((badge) => badge.title)
          : [],
      locale: this.locale,
    }).toCsvLine();
  }

  #getParticipantKnowledgeState({ campaignParticipationInfo, sharedKnowledgeStates, startedKnowledgeStates }) {
    if (!campaignParticipationInfo.userId) return new KnowledgeState();

    if (campaignParticipationInfo.isShared) {
      const sharedResultInfo = sharedKnowledgeStates.find(
        (stateForSharedParticipation) =>
          campaignParticipationInfo.campaignParticipationId === stateForSharedParticipation.campaignParticipationId,
      );

      return sharedResultInfo.knowledgeState;
    }

    if (campaignParticipationInfo.isCompleted === false) {
      const othersResultInfo = startedKnowledgeStates.find((stateForOtherParticipation) => {
        const assessmentValidation =
          !this.campaign.isExam && campaignParticipationInfo.userId === stateForOtherParticipation.userId;
        const examValidation =
          this.campaign.isExam &&
          campaignParticipationInfo.campaignParticipationId === stateForOtherParticipation.campaignParticipationId;

        return assessmentValidation || examValidation;
      });

      return improvementService.improveKnowledgeState({
        knowledgeState: othersResultInfo.knowledgeState,
        isFromCampaign: true,
        isImproving: true,
        createdAt: campaignParticipationInfo.createdAt,
      });
    }

    return new KnowledgeState();
  }

  #getAcquiredBadgesByCampaignParticipations({ campaignParticipationInfoChunk, badgeAcquisitionRepository }) {
    if (!this.targetProfile.hasBadges) return null;

    const campaignParticipationsIds = campaignParticipationInfoChunk.map((info) => info.campaignParticipationId);

    return badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({
      campaignParticipationsIds,
    });
  }

  #getAcquiredStagesByCampaignParticipations({ campaignParticipationInfoChunk, stageAcquisitionRepository }) {
    if (!this.stageCollection.hasStage) return null;

    const campaignParticipationsIds = campaignParticipationInfoChunk.map((info) => info.campaignParticipationId);

    return stageAcquisitionRepository.getByCampaignParticipations(campaignParticipationsIds);
  }
}

export { CampaignAssessmentExport };
