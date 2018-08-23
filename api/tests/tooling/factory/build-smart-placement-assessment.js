const faker = require('faker');
const SmartPlacementAssessment = require('../../../lib/domain/models/SmartPlacementAssessment');

const buildSkillCollection = require('./build-skill-collection');
const buildSmartPlacementAnswer = require('./build-smart-placement-answer');
const buildSmartPlacementKnowledgeElement = require('./build-smart-placement-knowledge-element');
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
  const knowledgeElement1 = buildSmartPlacementKnowledgeElement({ answerId: answer1.id, skillId: skill1.name });

  initialValues[id] = {
    answers: [answer1],
    knowledgeElements: [knowledgeElement1],
    targetProfile,
  };

  return initialValues[id];
}

module.exports = function buildSmartPlacementAssessment({
  id = faker.random.number(),
  createdAt = '2017-10-10',
  state = SmartPlacementAssessment.State.COMPLETED,
  userId = faker.random.number(),
  answers = initialValuesForId(id).answers,
  knowledgeElements = initialValuesForId(id).knowledgeElements,
  targetProfile = initialValuesForId(id).targetProfile,
} = {}) {
  return new SmartPlacementAssessment({
    id,
    createdAt,
    state,
    userId,
    answers,
    knowledgeElements,
    targetProfile,
  });
};
