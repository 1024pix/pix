import _ from 'lodash';

import {
  CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING,
  CONCURRENCY_HEAVY_OPERATIONS,
} from '../../../../../shared/infrastructure/constants.js';
import * as csvSerializer from '../../../../../shared/infrastructure/serializers/csv/csv-serializer.js';
import { PromiseUtils } from '../../../../../shared/infrastructure/utils/promise-utils.js';
import { CampaignAssessmentResultLine } from '../../exports/campaigns/campaign-assessment-result-line.js';

class CampaignAssessmentExport {
  constructor({
    outputStream,
    organization,
    targetProfile,
    learningContent,
    stageCollection,
    campaign,
    translate,
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
    this.translate = translate;
    this.additionalHeaders = additionalHeaders;
  }

  export(
    campaignParticipationInfos,
    knowledgeElementRepository,
    badgeAcquisitionRepository,
    stageAcquisitionRepository,
    knowledgeElementSnapshotRepository,
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

        const csvLines = await Promise.all(
          campaignParticipationInfoChunk.map((campaignParticipationInfo) =>
            this.#buildCSVLineForParticipation({
              acquiredBadges,
              acquiredStages,
              campaignParticipationInfo,
              campaignParticipationInfoChunk,
              knowledgeElementRepository,
              knowledgeElementSnapshotRepository,
              sharedParticipations,
            }),
          ),
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
      this.translate('campaign-export.common.organization-name'),
      this.translate('campaign-export.common.campaign-id'),
      this.translate('campaign-export.common.campaign-code'),
      this.translate('campaign-export.common.campaign-name'),
      this.translate('campaign-export.assessment.target-profile-name'),
      this.translate('campaign-export.common.participant-lastname'),
      this.translate('campaign-export.common.participant-firstname'),
      ...extraHeaders,
      ...(displayDivision ? [this.translate('campaign-export.common.participant-division')] : []),
      ...(forSupStudents ? [this.translate('campaign-export.common.participant-group')] : []),
      ...(forSupStudents ? [this.translate('campaign-export.common.participant-student-number')] : []),
      ...(this.campaign.externalIdLabel ? [this.campaign.externalIdLabel] : []),

      ...(this.campaign.isAssessment ? [this.translate('campaign-export.assessment.progress')] : []),
      this.translate('campaign-export.assessment.started-on'),
      this.translate('campaign-export.assessment.is-shared'),
      this.translate('campaign-export.assessment.shared-on'),

      ...(this.stageCollection.hasStage
        ? [this.translate('campaign-export.assessment.success-rate', { value: this.stageCollection.totalStages - 1 })]
        : []),

      ..._.flatMap(this.targetProfile.badges, (badge) => [
        this.translate('campaign-export.assessment.thematic-result-name', { name: badge.title }),
      ]),

      this.translate('campaign-export.assessment.mastery-percentage-target-profile'),

      ...this.#competenceColumnHeaders(),
      ...this.#areaColumnHeaders(),

      ...(this.organization.showSkills ? this.learningContent.skillNames : []),
    ];

    // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
    // - https://en.wikipedia.org/wiki/Byte_order_mark
    // - https://stackoverflow.com/a/38192870
    return '\uFEFF' + csvSerializer.serializeLine(_.compact(headers));
  }

  #competenceColumnHeaders() {
    return _.flatMap(this.competences, (competence) => [
      this.translate('campaign-export.assessment.skill.mastery-percentage', { name: competence.name }),
      this.translate('campaign-export.assessment.skill.total-items', { name: competence.name }),
      this.translate('campaign-export.assessment.skill.items-successfully-completed', { name: competence.name }),
    ]);
  }

  #areaColumnHeaders() {
    return _.flatMap(this.areas, (area) => [
      this.translate('campaign-export.assessment.competence-area.mastery-percentage', { name: area.title }),
      this.translate('campaign-export.assessment.competence-area.total-items', { name: area.title }),
      this.translate('campaign-export.assessment.competence-area.items-successfully-completed', { name: area.title }),
    ]);
  }

  async #buildCSVLineForParticipation({
    campaignParticipationInfo,
    campaignParticipationInfoChunk,
    knowledgeElementRepository,
    knowledgeElementSnapshotRepository,
    sharedParticipations,
    acquiredStages,
    acquiredBadges,
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
      participantKnowledgeElementsByCompetenceId: await this.#getParticipantKnowledgeElementsByCompetenceId({
        campaignParticipationInfo,
        campaignParticipationInfoChunk,
        knowledgeElementRepository,
        knowledgeElementSnapshotRepository,
        sharedParticipations,
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
      translate: this.translate,
    }).toCsvLine();
  }

  async #getParticipantKnowledgeElementsByCompetenceId({
    campaignParticipationInfo,
    campaignParticipationInfoChunk,
    knowledgeElementRepository,
    knowledgeElementSnapshotRepository,
    sharedParticipations,
  }) {
    let participantKnowledgeElementsByCompetenceId = [];
    if (campaignParticipationInfo.isShared) {
      const sharedKnowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementSnapshotRepository.findCampaignParticipationKnowledgeElementSnapshots(
          sharedParticipations.map(({ campaignParticipationId }) => campaignParticipationId),
        );
      const sharedResultInfo = sharedKnowledgeElementsByUserIdAndCompetenceId.find(
        (knowledElementForSharedParticipation) => {
          const sameParticipationId =
            campaignParticipationInfo.campaignParticipationId ===
            knowledElementForSharedParticipation.campaignParticipationId;

          return sameParticipationId;
        },
      );

      participantKnowledgeElementsByCompetenceId = this.learningContent.getKnowledgeElementsGroupedByCompetence(
        sharedResultInfo.knowledgeElements,
      );
    } else if (campaignParticipationInfo.isCompleted === false) {
      const startedParticipations = campaignParticipationInfoChunk.filter(
        ({ isShared, isCompleted }) => !isShared && !isCompleted,
      );
      const othersKnowledgeElementsByUserIdAndCompetenceId = await knowledgeElementRepository.findUniqByUserIds({
        userIds: startedParticipations.map(({ userId }) => userId),
      });
      const othersResultInfo = othersKnowledgeElementsByUserIdAndCompetenceId.find(
        (knowledElementForOtherParticipation) =>
          campaignParticipationInfo.userId === knowledElementForOtherParticipation.userId,
      );
      participantKnowledgeElementsByCompetenceId = this.learningContent.getKnowledgeElementsGroupedByCompetence(
        othersResultInfo.knowledgeElements,
      );
    }
    return participantKnowledgeElementsByCompetenceId;
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
