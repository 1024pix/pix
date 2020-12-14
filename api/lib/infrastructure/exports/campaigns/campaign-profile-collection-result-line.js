const csvSerializer = require('../../serializers/csv/csv-serializer');
const moment = require('moment');

const EMPTY_ARRAY = [];
const NOT_SHARED = 'NA';

class CampaignProfileCollectionResultLine {

  constructor(campaign, organization, campaignParticipationResult, competences, placementProfile) {
    this.organization = organization;
    this.campaign = campaign;
    this.campaignParticipationResult = campaignParticipationResult;
    this.competences = competences;
    this.placementProfile = placementProfile;
  }

  toCsvLine() {
    const line = [
      this.organization.name,
      this.campaign.id,
      this.campaign.name,
      this.campaignParticipationResult.participantLastName,
      this.campaignParticipationResult.participantFirstName,
      ...(this._getDivisionColumn()),
      ...(this._getStudentNumberColumn()),
      ...(this._getIdPixLabelColumn()),
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
    return this.campaignParticipationResult.isShared ? this.placementProfile.getCertifiableCompetencesCount() : NOT_SHARED;
  }

  _getIsCertifiableColumn() {
    return this.campaignParticipationResult.isShared ? this._yesOrNo(this.placementProfile.isCertifiable()) : NOT_SHARED;
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
    return this.campaignParticipationResult.isShared ? moment.utc(this.campaignParticipationResult.sharedAt).format('YYYY-MM-DD') : NOT_SHARED;
  }

  _getTotalEarnedPixColumn() {
    let totalEarnedPix = NOT_SHARED;
    if (this.campaignParticipationResult.isShared) {
      totalEarnedPix = 0;
      this.placementProfile.userCompetences.forEach(({ pixScore }) => {
        totalEarnedPix += pixScore;
      });
    }

    return totalEarnedPix;
  }

  _yesOrNo(value) {
    return value ? 'Oui' : 'Non';
  }

  _competenceColumns() {
    const columns = [];
    this.competences.forEach((competence) => {
      const { estimatedLevel, pixScore } = this.placementProfile.userCompetences.find(({ id }) => id === competence.id);

      if (this.campaignParticipationResult.isShared) {
        columns.push(estimatedLevel, pixScore);
      } else {
        columns.push(NOT_SHARED, NOT_SHARED);
      }
    });

    return columns;
  }
}

module.exports = CampaignProfileCollectionResultLine;
