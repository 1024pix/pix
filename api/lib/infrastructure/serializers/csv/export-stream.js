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
    const headers = this._createHeaderOfCSV();

    // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
    // - https://en.wikipedia.org/wiki/Byte_order_mark
    // - https://stackoverflow.com/a/38192870
    const headerLine = '\uFEFF' + csvSerializer.serializeLine(this._buildHeader());
    this.stream.write(headerLine);

    const campaignParticipationResultDataChunks = _.chunk(campaignParticipationResultDatas, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);

    return bluebird.map(campaignParticipationResultDataChunks, async (campaignParticipationResultDataChunk) => {
      const userIdsAndDates = Object.fromEntries(campaignParticipationResultDataChunk.map((campaignParticipationResultData) => {
        return [
          campaignParticipationResultData.userId,
          campaignParticipationResultData.sharedAt,
        ];
      }));

      const placementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
        userIdsAndDates,
        competences: this.allPixCompetences,
        allowExcessPixAndLevels: false,
      });

      let csvLines = '';
      for (const placementProfile of placementProfiles) {
        const campaignParticipationResultData = campaignParticipationResultDatas.find(({ userId }) =>  userId === placementProfile.userId);
        const csvLine = this._createOneLineOfCSV({
          organization: this.organization,
          campaign: this.campaign,
          campaignParticipationResultData,
          placementProfile,

          participantFirstName: campaignParticipationResultData.participantFirstName,
          participantLastName: campaignParticipationResultData.participantLastName,
          studentNumber: campaignParticipationResultData.studentNumber,
        });
        csvLines = csvLines.concat(csvLine);
      }

      this.stream.write(csvLines);
    });
  }

  _getCommonColumns({
    organization,
    campaign,
    campaignParticipationResultData,
    participantFirstName,
    participantLastName,
    studentNumber,
  }) {
    const EMPTY_LINE = '';
    const displayStudentNumber = studentNumber && organization.isSup && organization.isManagingStudents;
    return {
      organizationName: organization.name,
      campaignId: campaign.id,
      campaignName: campaign.name,
      participantLastName,
      participantFirstName,
      studentNumber: displayStudentNumber ? studentNumber : EMPTY_LINE,
      isShared: campaignParticipationResultData.isShared ? 'Oui' : 'Non',
      ...(campaign.idPixLabel ? { participantExternalId: campaignParticipationResultData.participantExternalId } : {}),
    };
  }

  _getSharedColumns({
    campaignParticipationResultData,
    placementProfile,
  }) {
    const competenceStats = _.map(placementProfile.userCompetences, (userCompetence) => {

      return {
        id: userCompetence.id,
        earnedPix: userCompetence.pixScore,
        level: userCompetence.estimatedLevel,
      };
    });

    const lineMap = {
      sharedAt: moment.utc(campaignParticipationResultData.sharedAt).format('YYYY-MM-DD'),
      totalEarnedPix: _.sumBy(competenceStats, 'earnedPix'),
      isCertifiable: placementProfile.isCertifiable() ? 'Oui' : 'Non',
      certifiableCompetencesCount: placementProfile.getCertifiableCompetencesCount(),
    };

    let totalEarnedPix = 0;
    placementProfile.userCompetences.forEach(({ id, pixScore, estimatedLevel }) => {
      lineMap[`competence_${id}_level`] = estimatedLevel;
      lineMap[`competence_${id}_earnedPix`] = pixScore;
      totalEarnedPix += pixScore;
    });

    lineMap['totalEarnedPix'] = totalEarnedPix;

    return lineMap;
  }

  _createOneLineOfCSV({
    headers,
    organization,
    campaign,
    campaignParticipationResultData,
    placementProfile,
    participantFirstName,
    participantLastName,
    studentNumber,
  }) {
    const lineMap = this._getCommonColumns({
      organization,
      campaign,
      campaignParticipationResultData,

      participantFirstName,
      participantLastName,
      studentNumber,
    });

    if (campaignParticipationResultData.isShared) {
      _.assign(lineMap, this._getSharedColumns({
        campaignParticipationResultData,
        placementProfile,
      }));
    }

    const lineArray = headers.map(({ property }) => {
      return property in lineMap ? lineMap[property] : 'NA';
    });

    return csvSerializer.serializeLine(lineArray);
  }

  _buildHeader() {
    const displayStudentNumber = this.organization.isSup && this.organization.isManagingStudents;
    return [
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
  }

}

module.exports = ExportStream;
