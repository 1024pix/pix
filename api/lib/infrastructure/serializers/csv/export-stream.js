const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');
const csvSerializer = require('./csv-serializer');
const constants = require('../../constants');

class ExportStream {

  constructor(outputStream, organization, campaign, allPixCompetences) {
    this.stream = outputStream;
    this.organization = organization;
    this.campaign = campaign;
    this.idPixLabel = campaign.idPixLabel;
    this.allPixCompetences = allPixCompetences;
  }

  export(headers, campaignParticipationResultData, placementProfile) {
    const csvLine = this._createOneLineOfCSV({
      headers,
      organization: this.organization,
      campaign: this.campaign,
      campaignParticipationResultData,
      placementProfile,

      participantFirstName: campaignParticipationResultData.participantFirstName,
      participantLastName: campaignParticipationResultData.participantLastName,
      studentNumber: campaignParticipationResultData.studentNumber,
    });

    return csvLine;
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

  _createHeaderOfCSV() {
    const EMPTY_ARRAY = [];
    const displayStudentNumber = this.organization.isSup && this.organization.isManagingStudents;
    return [
      { title: 'Nom de l\'organisation', property: 'organizationName' },
      { title: 'ID Campagne', property: 'campaignId' },
      { title: 'Nom de la campagne', property: 'campaignName' },
      { title: 'Nom du Participant', property: 'participantLastName' },
      { title: 'Prénom du Participant', property: 'participantFirstName' },

      ...(displayStudentNumber ? [{ title: 'Numéro Étudiant', property: 'studentNumber' }] : EMPTY_ARRAY),

      ...(this.idPixLabel ? [ { title: this.idPixLabel, property: 'participantExternalId' } ] : EMPTY_ARRAY),

      { title: 'Envoi (O/N)', property: 'isShared' },
      { title: 'Date de l\'envoi', property: 'sharedAt' },
      { title: 'Nombre de pix total', property: 'totalEarnedPix' },
      { title: 'Certifiable (O/N)', property: 'isCertifiable' },
      { title: 'Nombre de compétences certifiables', property: 'certifiableCompetencesCount' },

      ...(_.flatMap(this.allPixCompetences, (competence) => [
        { title: `Niveau pour la compétence ${competence.name}`, property: `competence_${competence.id}_level` },
        { title: `Nombre de pix pour la compétence ${competence.name}`, property: `competence_${competence.id}_earnedPix` },
      ])),
    ];
  }

}

module.exports = ExportStream;
