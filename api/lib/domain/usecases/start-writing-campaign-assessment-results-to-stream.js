const _ = require('lodash');
const moment = require('moment');
const { Transform } = require('stream');

const { UserNotAuthorizedToGetCampaignResultsError, CampaignWithoutOrganizationError } = require('../errors');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');
const KnowledgeElement = require('../models/KnowledgeElement');

module.exports = async function startWritingCampaignAssessmentResultsToStream(
  {
    userId,
    campaignId,
    writableStream,
    campaignRepository,
    userRepository,
    targetProfileRepository,
    competenceRepository,
    campaignParticipationRepository,
    organizationRepository,
    knowledgeElementRepository,
    knowledgeElementSnapshotRepository,
    campaignCsvExportService,
  }) {

  const campaign = await campaignRepository.get(campaignId);

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  const [targetProfile, allCompetences, organization] = await Promise.all([
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
  ]);

  const competences = _extractCompetences(allCompetences, targetProfile.skills);

  //Create HEADER of CSV
  const headers = _createHeaderOfCSV(targetProfile.skills, competences, campaign.idPixLabel);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + csvSerializer.serializeLine(headers);

  writableStream.write(headerLine);

  const transformLine = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    async transform(chunk, encoding, callback) {
      const campaignParticipationResultData = _rowToResult(chunk);

      // lazy mode for KE snapshots
      const { userId, sharedAt } = campaignParticipationResultData;
      let { knowledgeElements } = campaignParticipationResultData;
      if (!knowledgeElements && sharedAt) {
        knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId, limitDate: sharedAt });
        knowledgeElementSnapshotRepository.save({ userId, date: sharedAt, knowledgeElements });
      }

      const csvLine = campaignCsvExportService.createOneCsvLine({
        organization,
        campaign,
        competences,
        campaignParticipationResultData,
        targetProfile,
        participantKnowledgeElements: knowledgeElements || [],
      });

      this.push(csvLine);
      callback();
    }
  });

  const stream = campaignParticipationRepository
    .findAssessmentResultDataByCampaignId(campaign.id)
    .stream({ highWaterMark: 10 }); // nb row streamed
  
  stream
    .pipe(transformLine)
    .pipe(writableStream);

  const fileName = `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;
  return { fileName, stream };
};

async function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if (_.isNil(organizationId)) {
    throw new CampaignWithoutOrganizationError(`Campaign without organization : ${organizationId}`);
  }

  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(
      `User does not have an access to the organization ${organizationId}`
    );
  }
}

function _createHeaderOfCSV(skills, competences, idPixLabel) {
  const areas = _extractAreas(competences);

  return [
    'Nom de l\'organisation',
    'ID Campagne',
    'Nom de la campagne',
    'Nom du Profil Cible',
    'Nom du Participant',
    'Prénom du Participant',

    ...(idPixLabel ? [idPixLabel] : []),

    '% de progression',
    'Date de début',
    'Partage (O/N)',
    'Date du partage',
    '% maitrise de l\'ensemble des acquis du profil',

    ...(_.flatMap(competences, (competence) => [
      `% de maitrise des acquis de la compétence ${competence.name}`,
      `Nombre d'acquis du profil cible dans la compétence ${competence.name}`,
      `Acquis maitrisés dans la compétence ${competence.name}`,
    ])),

    ...(_.flatMap(areas, (area) => [
      `% de maitrise des acquis du domaine ${area.title}`,
      `Nombre d'acquis du profil cible du domaine ${area.title}`,
      `Acquis maitrisés du domaine ${area.title}`,
    ])),

    ...(_.map(skills, 'name')),
  ];
}

function _extractCompetences(allCompetences, skills) {
  return _(skills)
    .map('competenceId')
    .uniq()
    .map((competenceId) => {
      const competence = _.find(allCompetences, { id: competenceId });
      if (!competence) {
        throw new Error(`Unknown competence ${competenceId}`);
      }
      return competence;
    })
    .value();
}

function _extractAreas(competences) {
  return _.uniqBy(competences.map((competence) => competence.area), 'code');
}

function _rowToResult(row) {
  return {
    id: row.id,
    createdAt: new Date(row.createdAt),
    isShared: Boolean(row.isShared),
    sharedAt: row.sharedAt ? new Date(row.sharedAt) : null,
    participantExternalId: row.participantExternalId,
    userId: row.userId,
    isCompleted: row.state === 'completed',
    participantFirstName: row.firstName,
    participantLastName: row.lastName,
    knowledgeElements: row.snapshot && row.snapshot.map((data) => new KnowledgeElement({
      ...data,
      createdAt: new Date(data.createdAt)
    })),
  };
}
