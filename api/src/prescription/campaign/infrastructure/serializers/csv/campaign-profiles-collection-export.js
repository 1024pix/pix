import bluebird from 'bluebird';
import _ from 'lodash';

import {
  CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING,
  CONCURRENCY_HEAVY_OPERATIONS,
} from '../../../../../../lib/infrastructure/constants.js';
import * as csvSerializer from '../../../../../shared/infrastructure/serializers/csv/csv-serializer.js';
import { CampaignProfilesCollectionResultLine } from '../../exports/campaigns/campaign-profiles-collection-result-line.js';
class CampaignProfilesCollectionExport {
  constructor(outputStream, organization, campaign, competences, translate) {
    this.stream = outputStream;
    this.organization = organization;
    this.campaign = campaign;
    this.idPixLabel = campaign.idPixLabel;
    this.competences = competences;
    this.translate = translate;
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

    return bluebird.map(
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

    const header = [
      this.translate('campaign-export.common.organization-name'),
      this.translate('campaign-export.common.campaign-id'),
      this.translate('campaign-export.common.campaign-code'),
      this.translate('campaign-export.common.campaign-name'),
      this.translate('campaign-export.common.participant-lastname'),
      this.translate('campaign-export.common.participant-firstname'),
      displayGroup && this.translate('campaign-export.common.participant-group'),
      displayDivision && this.translate('campaign-export.common.participant-division'),
      displayStudentNumber && this.translate('campaign-export.common.participant-student-number'),
      this.idPixLabel,
      this.translate('campaign-export.profiles-collection.is-sent'),
      this.translate('campaign-export.profiles-collection.sent-on'),
      this.translate('campaign-export.profiles-collection.pix-score'),
      this.translate('campaign-export.profiles-collection.is-certifiable'),
      this.translate('campaign-export.profiles-collection.certifiable-skills'),
      ...this._competenceColumnHeaders(),
    ];

    // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
    // - https://en.wikipedia.org/wiki/Byte_order_mark
    // - https://stackoverflow.com/a/38192870
    return '\uFEFF' + csvSerializer.serializeLine(_.compact(header));
  }

  async _getUsersPlacementProfiles(campaignParticipationResultDataChunk, placementProfileService) {
    const userIdsAndDates = campaignParticipationResultDataChunk.map(({ userId, sharedAt }) => {
      return { userId, sharedAt };
    });

    const placementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
      userIdsAndDates,
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

      const line = new CampaignProfilesCollectionResultLine(
        this.campaign,
        this.organization,
        campaignParticipationResultData,
        this.competences,
        placementProfile,
        this.translate,
      );

      return line.toCsvLine();
    });

    return csvLines.join('');
  }

  _competenceColumnHeaders() {
    return _.flatMap(this.competences, (competence) => [
      this.translate('campaign-export.profiles-collection.skill-level', { name: competence.name }),
      this.translate('campaign-export.profiles-collection.skill-ranking', { name: competence.name }),
    ]);
  }
}

export { CampaignProfilesCollectionExport };
