const csvSerializer = require('../../serializers/csv/csv-serializer.js');
const moment = require('moment');

const EMPTY_ARRAY = [];

class CampaignProfilesCollectionResultLine {
  constructor(campaign, organization, campaignParticipationResult, competences, placementProfile, translate) {
    this.organization = organization;
    this.campaign = campaign;
    this.campaignParticipationResult = campaignParticipationResult;
    this.competences = competences;
    this.placementProfile = placementProfile;
    this.translate = translate;

    this.notShared = translate('campaign-export.common.not-available');
  }

  toCsvLine() {
    const line = [
      this.organization.name,
      this.campaign.id,
      this.campaign.name,
      this.campaignParticipationResult.participantLastName,
      this.campaignParticipationResult.participantFirstName,
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

    return csvSerializer.serializeLine(line);
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
    return this.campaignParticipationResult.isShared
      ? this._yesOrNo(this.placementProfile.isCertifiable())
      : this.notShared;
  }

  _getIdPixLabelColumn() {
    return this.campaign.idPixLabel ? [this.campaignParticipationResult.participantExternalId] : EMPTY_ARRAY;
  }

  _getStudentNumberColumn() {
    if (this.organization.isSup && this.organization.isManagingStudents) {
      return [this.campaignParticipationResult.studentNumber || ''];
    }

    return EMPTY_ARRAY;
  }

  _getSharedAtColumn() {
    return this.campaignParticipationResult.isShared
      ? moment.utc(this.campaignParticipationResult.sharedAt).format('YYYY-MM-DD')
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
    return this.translate(`campaign-export.common.${value ? 'yes' : 'no'}`);
  }

  _competenceColumns() {
    const columns = [];
    this.competences.forEach((competence) => {
      const { estimatedLevel, pixScore } = this.placementProfile.userCompetences.find(({ id }) => id === competence.id);

      if (this.campaignParticipationResult.isShared) {
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

module.exports = CampaignProfilesCollectionResultLine;
