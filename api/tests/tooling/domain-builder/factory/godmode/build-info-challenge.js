const InfoChallenge = require('../../../../../lib/domain/read-models/godmode/InfoChallenge');
const Challenge = require('../../../../../lib/domain/models/Challenge');

module.exports = function buildInfoChallenge(
  {
    id = 123,
    type = Challenge.Type.QCU,
    solution = 'ma solution',
    pixValue = 42,
    skillIds = 'recSkill1Id, recSkill2Id',
    skillNames = 'recSkill1Name, recSkill2Name',
    tubeIds = 'recTube1Id, recTube2Id',
    tubeNames = 'recTube1Name, recTube2Name',
    competenceIds = 'recCompetence1Id, recCompetence2Id',
    competenceNames = 'recCompetence1Name, recCompetence2Name',
    areaIds = 'recArea1Id, recArea2Id',
    areaNames = 'recArea1Name, recArea2Name',
  } = {}) {

  return new InfoChallenge({
    id,
    type,
    solution,
    pixValue,
    skillIds,
    skillNames,
    tubeIds,
    tubeNames,
    competenceIds,
    competenceNames,
    areaIds,
    areaNames,
  });
};
