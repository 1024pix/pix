import _ from 'lodash';

import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../../shared/constants.js';
import { serializeLine } from '../../../../../shared/infrastructure/helpers/csv.js';
import { getI18n } from '../../../../../shared/infrastructure/i18n/i18n.js';
import { PromiseUtils } from '../../../../../shared/infrastructure/utils/promise-utils.js';
import { CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING } from '../../../domain/constants.js';
import { CampaignProfilesCollectionResultLine } from '../../exports/campaigns/campaign-profiles-collection-result-line.js';

class CampaignProfilesCollectionExport {
  constructor({ outputStream, organization, campaign, competences, locale, additionalHeaders = [] }) {
    this.stream = outputStream;
    this.organization = organization;
    this.campaign = campaign;
    this.externalIdLabel = campaign.externalIdLabel;
    this.competences = competences;
    this.locale = locale;
    this.i18n = getI18n(locale);
    this.additionalHeaders = additionalHeaders;
  }

  export(
    campaignParticipationResultDatas,
    placementProfileService,
    constants = { CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING, CONCURRENCY_HEAVY_OPERATIONS },
  ) {
    this.stream.write(this._buildHeader());

    const campaignParticipationResultDataChunks = _.chunk(
      campaignParticipationResultDatas,
      constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING,
    );

    return PromiseUtils.map(
      campaignParticipationResultDataChunks,
      async (campaignParticipationResultDataChunk) => {
        const placementProfiles = await this._getUsersPlacementProfiles(
          campaignParticipationResultDataChunk,
          placementProfileService,
        );
        const csvLines = this._buildLines(placementProfiles, campaignParticipationResultDataChunk);

        this.stream.write(csvLines);
      },
      { concurrency: constants.CONCURRENCY_HEAVY_OPERATIONS },
    );
  }

  _buildHeader() {
    const displayStudentNumber = this.organization.isSup && this.organization.isManagingStudents;
    const displayGroup = this.organization.isSup && this.organization.isManagingStudents;
    const displayDivision = this.organization.isSco && this.organization.isManagingStudents;

    const extraHeaders = this.additionalHeaders.map((header) => header.columnName);

    const header = [
      this.i18n.__('campaign-export.common.organization-name'),
      this.i18n.__('campaign-export.common.campaign-id'),
      this.i18n.__('campaign-export.common.campaign-code'),
      this.i18n.__('campaign-export.common.campaign-name'),
      this.i18n.__('campaign-export.common.participant-lastname'),
      this.i18n.__('campaign-export.common.participant-firstname'),
      ...extraHeaders,
      displayGroup && this.i18n.__('campaign-export.common.participant-group'),
      displayDivision && this.i18n.__('campaign-export.common.participant-division'),
      displayStudentNumber && this.i18n.__('campaign-export.common.participant-student-number'),
      this.externalIdLabel,
      this.i18n.__('campaign-export.profiles-collection.is-sent'),
      this.i18n.__('campaign-export.profiles-collection.sent-on'),
      this.i18n.__('campaign-export.profiles-collection.pix-score'),
      this.i18n.__('campaign-export.profiles-collection.is-certifiable'),
      this.i18n.__('campaign-export.profiles-collection.certifiable-skills'),
      ...this._competenceColumnHeaders(),
    ];

    // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
    // - https://en.wikipedia.org/wiki/Byte_order_mark
    // - https://stackoverflow.com/a/38192870
    return '\uFEFF' + serializeLine(header.filter(Boolean));
  }

  async _getUsersPlacementProfiles(campaignParticipationResultDataChunk, placementProfileService) {
    const participations = campaignParticipationResultDataChunk.map(
      ({ id: campaignParticipationId, userId, sharedAt }) => {
        return { campaignParticipationId, userId, sharedAt };
      },
    );

    const placementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
      participations,
      competences: this.competences,
      allowExcessPixAndLevels: false,
    });

    return placementProfiles;
  }

  _buildLines(placementProfiles, campaignParticipationResultDatas) {
    const csvLines = campaignParticipationResultDatas.map((campaignParticipationResultData) => {
      const placementProfile = placementProfiles.find(({ userId, profileDate }) => {
        const sameUserId = campaignParticipationResultData.userId === userId;
        const sameDate =
          campaignParticipationResultData.sharedAt &&
          profileDate &&
          campaignParticipationResultData.sharedAt.getTime() === profileDate.getTime();

        return sameUserId && sameDate;
      });

      const line = new CampaignProfilesCollectionResultLine({
        campaign: this.campaign,
        organization: this.organization,
        campaignParticipationResult: campaignParticipationResultData,
        additionalHeaders: this.additionalHeaders,
        competences: this.competences,
        placementProfile,
        locale: this.locale,
      });

      return line.toCsvLine();
    });

    return csvLines.join('');
  }

  _competenceColumnHeaders() {
    return _.flatMap(this.competences, (competence) => [
      this.i18n.__('campaign-export.profiles-collection.skill-level', { name: competence.name }),
      this.i18n.__('campaign-export.profiles-collection.skill-ranking', { name: competence.name }),
    ]);
  }
}

export { CampaignProfilesCollectionExport };
