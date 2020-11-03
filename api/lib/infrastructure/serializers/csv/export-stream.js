const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');
const csvSerializer = require('./csv-serializer');
const constants = require('../../constants');
const EMPTY_ARRAY = [];

class ExportStream {

  constructor(outputStream, organization, campaign, allPixCompetences) {
    this.stream = outputStream;
    this.organization = organization;
    this.campaign = campaign;
    this.idPixLabel = campaign.idPixLabel;
    this.allPixCompetences = allPixCompetences;
  }

  export(campaignParticipationResultDatas, placementProfileService) {

    // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
    // - https://en.wikipedia.org/wiki/Byte_order_mark
    // - https://stackoverflow.com/a/38192870
    this.stream.write(this._buildHeader());

    const campaignParticipationResultDataChunks = _.chunk(campaignParticipationResultDatas, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);

    return bluebird.map(campaignParticipationResultDataChunks, async (campaignParticipationResultDataChunk) => {
      const placementProfiles = await this.getUsersPlacementProfiles(campaignParticipationResultDataChunk, placementProfileService);

      let csvLines = '';
      for (const placementProfile of placementProfiles) {
        const campaignParticipationResultData = campaignParticipationResultDatas.find(({ userId }) =>  userId === placementProfile.userId);
        const csvLine = this._createOneLineOfCSV({
          campaignParticipationResultData,
          placementProfile,
        });
        csvLines = csvLines.concat(csvLine);
      }

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
      ...(displayStudentNumber ? ['Numéro Étudiant'] : []),
      ...(this.idPixLabel ? [ this.idPixLabel] : []),
      'Envoi (O/N)',
      'Date de l\'envoi',
      'Nombre de pix total',
      'Certifiable (O/N)',
      'Nombre de compétences certifiables',
      ...(_.flatMap(this.allPixCompetences, (competence) => [
        `Niveau pour la compétence ${competence.name}`,
        `Nombre de pix pour la compétence ${competence.name}`,
      ])),
    ];

    return '\uFEFF' + csvSerializer.serializeLine(header);
  }

  async getUsersPlacementProfiles(campaignParticipationResultDataChunk, placementProfileService) {
    const userIdsAndDates = {};
    campaignParticipationResultDataChunk.forEach(({ userId, sharedAt }) => userIdsAndDates[userId] = sharedAt);

    const placementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
      userIdsAndDates,
      competences: this.allPixCompetences,
      allowExcessPixAndLevels: false,
    });

    return placementProfiles;
  }

  _buildLines(placementProfiles, campaignParticipationResultDatas) {
    let csvLines = '';
    for (const placementProfile of placementProfiles) {
      const campaignParticipationResultData = campaignParticipationResultDatas.find(({ userId }) => userId === placementProfile.userId);
      const csvLine = this._createOneLineOfCSV({
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

  _createOneLineOfCSV({
    campaignParticipationResultData,
    placementProfile,
  }) {
    const displayStudentNumber = this.organization.isSup && this.organization.isManagingStudents;
    const totalEarnedPix = this._computeTotalEarnPix(placementProfile.userCompetences);
    const line =  [
      this.organization.name,
      this.campaign.id,
      this.campaign.name,
      campaignParticipationResultData.participantLastName,
      campaignParticipationResultData.participantFirstName,
      ...(displayStudentNumber ? [campaignParticipationResultData.studentNumber] : EMPTY_ARRAY),

      ...(this.idPixLabel ? [ campaignParticipationResultData.participantExternalId] : EMPTY_ARRAY),

      this._yesOrNo(campaignParticipationResultData.isShared),
      campaignParticipationResultData.isShared ? moment.utc(campaignParticipationResultData.sharedAt).format('YYYY-MM-DD') : 'NA',
      campaignParticipationResultData.isShared ? totalEarnedPix : 'NA',
      campaignParticipationResultData.isShared ? this._yesOrNo(placementProfile.isCertifiable()) : 'NA',
      campaignParticipationResultData.isShared ? placementProfile.getCertifiableCompetencesCount() : 'NA',
      ...(_.flatMap(this.allPixCompetences, (competence) => {
        if (campaignParticipationResultData.isShared) {
          const userCompetence = placementProfile.userCompetences.find(({ id }) => id === competence.id);
          return [ userCompetence.estimatedLevel, userCompetence.pixScore];
        }
        return ['NA', 'NA'];
      })),
    ];

    return csvSerializer.serializeLine(line);
  }

  _computeTotalEarnPix(userCompetences) {
    let totalEarnedPix = 0;
    userCompetences.forEach(({ pixScore }) => {
      totalEarnedPix += pixScore;
    });

    return totalEarnedPix;
  }

  _yesOrNo(value) {
    return value ? 'Oui' : 'Non';
  }
}

module.exports = ExportStream;
