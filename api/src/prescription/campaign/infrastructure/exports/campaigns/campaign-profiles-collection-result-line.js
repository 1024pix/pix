import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);

import { serializeLine } from '../../../../../shared/infrastructure/helpers/csv.js';
import { getI18n } from '../../../../../shared/infrastructure/i18n/i18n.js';

const EMPTY_ARRAY = [];

class CampaignProfilesCollectionResultLine {
  constructor({
    campaign,
    organization,
    campaignParticipationResult,
    competences,
    placementProfile,
    locale,
    additionalHeaders,
  }) {
    this.organization = organization;
    this.campaign = campaign;
    this.campaignParticipationResult = campaignParticipationResult;
    this.competences = competences;
    this.placementProfile = placementProfile;
    this.i18n = getI18n(locale);
    this.additionalHeaders = additionalHeaders;

    this.notShared = this.i18n.__('campaign-export.common.not-available');
  }

  toCsvLine() {
    const line = [
      this.organization.name,
      this.campaign.id,
      this.campaign.code,
      this.campaign.name,
      this.campaignParticipationResult.participantLastName,
      this.campaignParticipationResult.participantFirstName,
      ...this.#makeAdditionalInfos(),
      ...this._getGroupColumn(),
      ...this._getDivisionColumn(),
      ...this._getStudentNumberColumn(),
      ...this._getIdPixLabelColumn(),
      this._yesOrNo(this.campaignParticipationResult.isShared),
      this._getSharedAtColumn(),
      this._getTotalEarnedPixColumn(),
      this._getIsCertifiableColumn(),
      this._getCompetencesCountColumn(),
      ...this._competenceColumns(),
    ];

    return serializeLine(line);
  }

  #makeAdditionalInfos() {
    if (!this.additionalHeaders) return [];

    return this.additionalHeaders.map((header) => this.campaignParticipationResult.additionalInfos[header.columnName]);
  }

  _getDivisionColumn() {
    if (this.organization.isSco && this.organization.isManagingStudents) {
      return [this.campaignParticipationResult.division || ''];
    }

    return EMPTY_ARRAY;
  }

  _getCompetencesCountColumn() {
    return this.campaignParticipationResult.isShared
      ? this.placementProfile.getCertifiableCompetencesCount()
      : this.notShared;
  }

  _getIsCertifiableColumn() {
    if (this.campaignParticipationResult.isShared) {
      return this._yesOrNo(this.placementProfile.isCertifiable());
    }

    return this.notShared;
  }

  _getIdPixLabelColumn() {
    return this.campaign.externalIdLabel ? [this.campaignParticipationResult.participantExternalId] : EMPTY_ARRAY;
  }

  _getStudentNumberColumn() {
    if (this.organization.isSup && this.organization.isManagingStudents) {
      return [this.campaignParticipationResult.studentNumber || ''];
    }

    return EMPTY_ARRAY;
  }

  _getSharedAtColumn() {
    return this.campaignParticipationResult.isShared
      ? dayjs.utc(this.campaignParticipationResult.sharedAt).tz('Europe/Paris').format('DD/MM/YYYY HH:mm')
      : this.notShared;
  }

  _getTotalEarnedPixColumn() {
    let totalEarnedPix = this.notShared;
    if (this.campaignParticipationResult.isShared) {
      totalEarnedPix = this.campaignParticipationResult.pixScore;
    }

    return totalEarnedPix;
  }

  _yesOrNo(value) {
    return this.i18n.__(`campaign-export.common.${value ? 'yes' : 'no'}`);
  }

  _competenceColumns() {
    const columns = [];
    this.competences.forEach((competence) => {
      if (this.campaignParticipationResult.isShared) {
        const { estimatedLevel, pixScore } = this.placementProfile.userCompetences.find(
          ({ id }) => id === competence.id,
        );
        columns.push(estimatedLevel, pixScore);
      } else {
        columns.push(this.notShared, this.notShared);
      }
    });

    return columns;
  }

  _getGroupColumn() {
    if (this.organization.isSup && this.organization.isManagingStudents) {
      return [this.campaignParticipationResult.group || ''];
    }

    return EMPTY_ARRAY;
  }
}

export { CampaignProfilesCollectionResultLine };
