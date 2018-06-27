const faker = require('faker');
const SmartPlacementAssessment = require('../../lib/domain/models/SmartPlacementAssessment');

const buildSkillCollection = require('./build-skill-collection');
const buildSmartPlacementAnswer = require('./build-smart-placement-answer');
const buildSmartPlacementKnowledgeElement = require('./build-smart-placement-knowledge-element');
const buildTargetProfile = require('./build-target-profile');

function initialValues() {

  const skills = buildSkillCollection();
  const [skill1] = skills;
  const targetProfile = buildTargetProfile({ skills });

  const answer1 = buildSmartPlacementAnswer();
  const knowledgeElement1 = buildSmartPlacementKnowledgeElement({ answerId: answer1.id, skillId: skill1.name });

  return {
    answers: [answer1],
    knowledgeElements: [knowledgeElement1],
    targetProfile,
  };
}

module.exports = function buildSmartPlacementAssessment({
  id = faker.random.number(),
  state = SmartPlacementAssessment.State.COMPLETED,
  answers = initialValues().answers,
  knowledgeElements = initialValues().knowledgeElements,
  targetProfile = initialValues().targetProfile,
} = {}) {
  return new SmartPlacementAssessment({
    id,
    state,
    answers,
    knowledgeElements,
    targetProfile,
  });
};
