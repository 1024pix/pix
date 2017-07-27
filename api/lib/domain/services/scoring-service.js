const _ = require('../../infrastructure/utils/lodash-utils');

const OUTCOME_FROM_A_CORRECT_ANSWER = 1;
const OUTCOME_FROM_A_WRONG_ANSWER = 0;

function _getDifficultyOfKnowledge(knowledgeTag) {
  return parseInt(knowledgeTag.slice(-1));
}

function nextNode(node, direction) {
  return node.slice(0, -1) + (parseInt(node.slice(-1)) + direction);
}

function propagateKnowledge(knowledgeList, startNode, direction) {
  const nodeList = [];

  let node = startNode;
  let difficulty = parseInt(node.slice(-1));
  while (difficulty >= 1 && difficulty <= 8) {
    if(knowledgeList.hasOwnProperty(node)) {
      nodeList.push(node);
    }
    node = nextNode(node, direction);
    difficulty = parseInt(node.slice(-1));
  }
  return nodeList;
}

function _createPerformanceRecord(challenge, answer) {
  const knowledgeTags = challenge.knowledgeTags;
  const mainKnowledgeTag = knowledgeTags[0];
  const difficulty = _getDifficultyOfKnowledge(mainKnowledgeTag);

  const outcome = (answer.get('result') === 'ok') ? OUTCOME_FROM_A_CORRECT_ANSWER : OUTCOME_FROM_A_WRONG_ANSWER;

  return { difficulty, outcome };
}

function _evaluateAcquiredKnowledgeTagsByLevel(acquiredKnowledgeTags) {
  const nbAcquiredKnowledgeTagsByLevel = {};
  [1, 2, 3, 4, 5, 6, 7, 8].forEach(level => nbAcquiredKnowledgeTagsByLevel[level] = 0);

  acquiredKnowledgeTags.forEach(knowledgeTag => {
    const difficulty = _getDifficultyOfKnowledge(knowledgeTag);
    nbAcquiredKnowledgeTagsByLevel[difficulty]++;
  });

  return nbAcquiredKnowledgeTagsByLevel;
}

function getPerformanceStats(answers, knowledgeData) {

  const performanceHistory = [];
  const isAcquired = {};

  _.forEach(answers, answer => {
    const challenge = knowledgeData.challengesById[answer.get('challengeId')];
    if (challenge) {

      const knowledgeTags = challenge.knowledgeTags;
      const mainKnowledgeTag = knowledgeTags[0];

      if (answer.get('result') === 'ok') {
        const listOfAcquiredKnowledgeTags = propagateKnowledge(knowledgeData.knowledgeTagSet, mainKnowledgeTag, -1);
        listOfAcquiredKnowledgeTags.forEach(knowledgeTag => isAcquired[knowledgeTag] = true);
      } else {
        const listOfUnknownKnowledgeTags = propagateKnowledge(knowledgeData.knowledgeTagSet, mainKnowledgeTag, 1);
        listOfUnknownKnowledgeTags.forEach(knowledgeTag => isAcquired[knowledgeTag] = false);
      }

      const performanceRecord = _createPerformanceRecord(challenge, answer);
      performanceHistory.push(performanceRecord);
    }
  });

  const acquiredKnowledgeTags = [];
  const notAcquiredKnowledgeTags = [];

  _.forOwn(isAcquired, (value, knowledgeTag) => {
    if (value) {
      acquiredKnowledgeTags.push(knowledgeTag);
    } else {
      notAcquiredKnowledgeTags.push(knowledgeTag);
    }
  });

  const nbAcquiredKnowledgeTagsByLevel = _evaluateAcquiredKnowledgeTagsByLevel(acquiredKnowledgeTags);

  return {
    acquiredKnowledgeTags,
    notAcquiredKnowledgeTags,
    performanceHistory,
    nbAcquiredKnowledgeTagsByLevel
  };
}

function _add(a, b) {
  return a + b;
}

function computeDiagnosis(performanceStats, knowledgeData) {
  const firstFiveLevels = [1, 2, 3, 4, 5];
  let pixScore = 0;

  firstFiveLevels.forEach(level => {
    if (knowledgeData.nbKnowledgeTagsByLevel[level] > 0) {
      pixScore += performanceStats.nbAcquiredKnowledgeTagsByLevel[level] * 8 / knowledgeData.nbKnowledgeTagsByLevel[level];
    }
  });

  pixScore = Math.floor(pixScore);

  const nbAcquiredKnowledgeTags = firstFiveLevels.map(level => performanceStats.nbAcquiredKnowledgeTagsByLevel[level]).reduce(_add);
  const nbKnowledgeTags = firstFiveLevels.map(level => knowledgeData.nbKnowledgeTagsByLevel[level]).reduce(_add);

  const highestLevel = Math.max(...firstFiveLevels.filter(level => knowledgeData.nbKnowledgeTagsByLevel[level] > 0));

  let estimatedLevel = 0;
  if (nbAcquiredKnowledgeTags > 0) {
    estimatedLevel = Math.floor(nbAcquiredKnowledgeTags * highestLevel / nbKnowledgeTags);
  }

  return {
    estimatedLevel,
    pixScore
  };
}

module.exports = {
  nextNode,
  propagateKnowledge,
  getPerformanceStats,
  computeDiagnosis
};
