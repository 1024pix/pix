const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');
const csvSerializer = require('./csv-serializer');
const constants = require('../../constants');
const EMPTY_ARRAY = [];
const NOT_SHARED = 'NA';

class ExportStream {

  constructor(outputStream, organization, campaign, competences) {
    this.stream = outputStream;
    this.organization = organization;
    this.campaign = campaign;
    this.idPixLabel = campaign.idPixLabel;
    this.competences = competences;
  }

  export(campaignParticipationResultDatas, placementProfileService) {

    // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
    // - https://en.wikipedia.org/wiki/Byte_order_mark
    // - https://stackoverflow.com/a/38192870
    this.stream.write(this._buildHeader());

    const campaignParticipationResultDataChunks = _.chunk(campaignParticipationResultDatas, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);

    return bluebird.map(campaignParticipationResultDataChunks, async (campaignParticipationResultDataChunk) => {
      const placementProfiles = await this._getUsersPlacementProfiles(campaignParticipationResultDataChunk, placementProfileService);
      const csvLines = this._buildLines(placementProfiles, campaignParticipationResultDatas);

      this.stream.write(csvLines);
    });
  }

  _buildHeader() {
    const displayStudentNumber = this.organization.isSup && this.organization.isManagingStudents;
    const header = [
      'Nom de l\'organisation',
      'ID Campagne',
      'Nom de la campagne',
      'Nom du Participant',
      'Prénom du Participant',
      displayStudentNumber && 'Numéro Étudiant',
      this.idPixLabel,
      'Envoi (O/N)',
      'Date de l\'envoi',
      'Nombre de pix total',
      'Certifiable (O/N)',
      'Nombre de compétences certifiables',
      ...(this._competenceColumnHeaders(this.competences)),
    ];

    return '\uFEFF' + csvSerializer.serializeLine(_.compact(header));
  }

  async _getUsersPlacementProfiles(campaignParticipationResultDataChunk, placementProfileService) {
    const userIdsAndDates = {};
    campaignParticipationResultDataChunk.forEach(({ userId, sharedAt }) => userIdsAndDates[userId] = sharedAt);

    const placementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
      userIdsAndDates,
      competences: this.competences,
      allowExcessPixAndLevels: false,
    });

    return placementProfiles;
  }

  _buildLines(placementProfiles, campaignParticipationResultDatas) {
    let csvLines = '';
    for (const placementProfile of placementProfiles) {
      const campaignParticipationResultData = campaignParticipationResultDatas.find(({ userId }) => userId === placementProfile.userId);
      const csvLine = this._buildLine({
        campaignParticipationResultData,
        placementProfile,

        participantFirstName: campaignParticipationResultData.participantFirstName,
        participantLastName: campaignParticipationResultData.participantLastName,
        studentNumber: campaignParticipationResultData.studentNumber,
      });
      csvLines = csvLines.concat(csvLine);
    }
    return csvLines;
  }

  _buildLine({ campaignParticipationResultData, placementProfile }) {
    const line =  [
      this.organization.name,
      this.campaign.id,
      this.campaign.name,
      campaignParticipationResultData.participantLastName,
      campaignParticipationResultData.participantFirstName,
      ...(this._getStudentNumberColumn(campaignParticipationResultData)),
      ...(this._getIdPixLabelColumn(campaignParticipationResultData)),
      this._yesOrNo(campaignParticipationResultData.isShared),
      this._getSharedAtColumn(campaignParticipationResultData),
      this._getTotalEarnedPixColumn(placementProfile.userCompetences, campaignParticipationResultData.isShared),
      this._getIsCertifiableColumn(placementProfile, campaignParticipationResultData.isShared),
      this._getCompetencesCountColumn(placementProfile, campaignParticipationResultData.isShared),
      ...this._competenceColumns(this.competences, placementProfile.userCompetences, campaignParticipationResultData.isShared),
    ];

    return csvSerializer.serializeLine(line);
  }

  _getCompetencesCountColumn(placementProfile, isShared) {
    return isShared ? placementProfile.getCertifiableCompetencesCount() : NOT_SHARED;
  }

  _getIsCertifiableColumn(placementProfile, isShared) {
    return isShared ? this._yesOrNo(placementProfile.isCertifiable()) : NOT_SHARED;
  }

  _getIdPixLabelColumn(campaignParticipationResultData) {
    return this.idPixLabel ? [campaignParticipationResultData.participantExternalId] : EMPTY_ARRAY;
  }

  _getStudentNumberColumn(campaignParticipationResultData) {
    const displayStudentNumber = this.organization.isSup && this.organization.isManagingStudents;

    return displayStudentNumber ? [campaignParticipationResultData.studentNumber] : EMPTY_ARRAY;
  }

  _getSharedAtColumn(campaignParticipationResultData) {
    return campaignParticipationResultData.isShared ? moment.utc(campaignParticipationResultData.sharedAt).format('YYYY-MM-DD') : NOT_SHARED;
  }

  _getTotalEarnedPixColumn(userCompetences, isShared) {
    let totalEarnedPix = NOT_SHARED;
    if (isShared)  {
      totalEarnedPix = 0;
      userCompetences.forEach(({ pixScore }) => {
        totalEarnedPix += pixScore;
      });
    }

    return totalEarnedPix;
  }

  _yesOrNo(value) {
    return value ? 'Oui' : 'Non';
  }

  _competenceColumns(competencesList, userCompetences, isShared) {
    const columns = [];
    competencesList.forEach((competence) => {
      const { estimatedLevel, pixScore } = userCompetences.find(({ id }) => id === competence.id);

      if (isShared) {
        columns.push(estimatedLevel, pixScore);
      } else {
        columns.push(NOT_SHARED, NOT_SHARED);
      }
    });

    return columns;
  }

  _competenceColumnHeaders(competencesList) {
    return _.flatMap(competencesList, (competence) => [
      `Niveau pour la compétence ${competence.name}`,
      `Nombre de pix pour la compétence ${competence.name}`,
    ]);
  }
}

module.exports = ExportStream;
