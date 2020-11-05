const _ = require('lodash');
const bluebird = require('bluebird');
const csvSerializer = require('./csv-serializer');
const constants = require('../../constants');
const CampaignProfileCollectionResultLine = require('../../exports/campaigns/campaign-profile-collection-result-line');

class CampaignProfileCollectionExport {

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
    const displayDivision = this.organization.isSco;
    const header = [
      'Nom de l\'organisation',
      'ID Campagne',
      'Nom de la campagne',
      'Nom du Participant',
      'Prénom du Participant',
      displayDivision && 'Classe',
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

      const line = new CampaignProfileCollectionResultLine(this.campaign, this.organization, campaignParticipationResultData, this.competences, placementProfile);
      csvLines = csvLines.concat(line.toCsvLine());
    }
    return csvLines;
  }

  _competenceColumnHeaders(competencesList) {
    return _.flatMap(competencesList, (competence) => [
      `Niveau pour la compétence ${competence.name}`,
      `Nombre de pix pour la compétence ${competence.name}`,
    ]);
  }
}

module.exports = CampaignProfileCollectionExport;
