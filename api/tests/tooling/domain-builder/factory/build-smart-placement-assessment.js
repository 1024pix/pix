const faker = require('faker');
const SmartPlacementAssessment = require('../../../../lib/domain/models/SmartPlacementAssessment');

const buildCampaignParticipation = require('./build-campaign-participation');
const buildSkillCollection = require('./build-skill-collection');
const buildSmartPlacementAnswer = require('./build-smart-placement-answer');
const buildKnowledgeElement = require('./build-knowledge-element');
const buildTargetProfile = require('./build-target-profile');

const initialValues = {};

function initialValuesForId(id) {

  if (initialValues[id]) {
    return initialValues[id];
  }

  const skills = buildSkillCollection();
  const [skill1] = skills;
  const targetProfile = buildTargetProfile({ skills });

  const answer1 = buildSmartPlacementAnswer();
  const knowledgeElement1 = buildKnowledgeElement({ answerId: answer1.id, skillId: skill1.name });
  const campaignParticipation = buildCampaignParticipation();

  initialValues[id] = {
    answers: [answer1],
    knowledgeElements: [knowledgeElement1],
    targetProfile,
    campaignParticipation
  };

  return initialValues[id];
}

module.exports = function buildSmartPlacementAssessment({
  id = faker.random.number(),
  createdAt = new Date('2017-10-10T01:02:03Z'),
  state = SmartPlacementAssessment.State.COMPLETED,
  userId = faker.random.number(),
  answers = initialValuesForId(id).answers,
  knowledgeElements = initialValuesForId(id).knowledgeElements,
  targetProfile = initialValuesForId(id).targetProfile,
  campaignParticipation = initialValuesForId(id).campaignParticipation
} = {}) {
  return new SmartPlacementAssessment({
    id,
    createdAt,
    state,
    userId,
    answers,
    knowledgeElements,
    targetProfile,
    campaignParticipation,
  });
};
