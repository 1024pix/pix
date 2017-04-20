const _ = require('../../infrastructure/utils/lodash-utils');

function _countResult(about, desiredResult) {
  return _.reduce(about, function (sum, o) {
    return sum + (o.result === desiredResult ? 1 : 0);
  }, 0);
}

const PIX_LEVELS_FROM_1_TO_8 = [ 1, 2, 3, 4, 5, 6, 7, 8 ];

function _initializeNbKnowledgeTagsByLevel() {
  const nbKnowledgeTagsByLevel = {};
  PIX_LEVELS_FROM_1_TO_8.forEach(level => {
    nbKnowledgeTagsByLevel[ level ] = 0;
  });
  return nbKnowledgeTagsByLevel;
}

function _mapChallengesById(challengesWithKnowledgeTags) {
  return challengesWithKnowledgeTags.reduce((challenges, challenge) => {
    challenges[ challenge.id ] = challenge;
    return challenges;
  }, {});
}

function _mapKnowledgeTags(challengesWithKnowledgeTags) {
  return challengesWithKnowledgeTags.reduce((knowledgeTags, challenge) => {
    challenge.knowledgeTags.forEach((knowledge) => {
      knowledgeTags[ knowledge ] = true;
    });
    return knowledgeTags;
  }, {});
}
function _mapNbKnowledgeTagsByLevel(knowledgeTagSet) {
  const nbKnowledgeTagsByLevel = _initializeNbKnowledgeTagsByLevel();
  for (const knowledgeTag in knowledgeTagSet) {
    const knowledgeLevel = parseInt(knowledgeTag.slice(-1));
    nbKnowledgeTagsByLevel[ knowledgeLevel ]++;
  }
  return nbKnowledgeTagsByLevel;
}
module.exports = {

  // TODO move to assessment-service
  getKnowledgeData(challengeList) {
    const challengesWithKnowledgeTags = challengeList.filter(challenge => !_.isEmpty(challenge.knowledgeTags));

    const challengesById = _mapChallengesById(challengesWithKnowledgeTags);
    const knowledgeTagSet = _mapKnowledgeTags(challengesWithKnowledgeTags);
    const nbKnowledgeTagsByLevel = _mapNbKnowledgeTagsByLevel(knowledgeTagSet);

    return {
      challengesById,
      knowledgeTagSet,
      nbKnowledgeTagsByLevel
    };
  },

  getRevalidationStatistics(oldAnswers, newAnswers) {

    const oldAnswersResult = _.map(oldAnswers, (o) => {
      return { id: o.id, result: o.attributes.result };
    });
    const newAnswersResult = _.map(newAnswers, (o) => {
      return { id: o.id, result: o.attributes.result };
    });

    const okNewCount = _countResult(newAnswersResult, 'ok');
    const koNewCount = _countResult(newAnswersResult, 'ko');
    const timedoutNewCount = _countResult(newAnswersResult, 'timedout');
    const partiallyNewCount = _countResult(newAnswersResult, 'partially');
    const abandNewCount = _countResult(newAnswersResult, 'aband');
    const unimplementedNewCount = _countResult(newAnswersResult, 'unimplemented');

    const okOldCount = _countResult(oldAnswersResult, 'ok');
    const koOldCount = _countResult(oldAnswersResult, 'ko');
    const timedoutOldCount = _countResult(oldAnswersResult, 'timedout');
    const partiallyOldCount = _countResult(oldAnswersResult, 'partially');
    const abandOldCount = _countResult(oldAnswersResult, 'aband');
    const unimplementedOldCount = _countResult(oldAnswersResult, 'unimplemented');

    const okDiff = okNewCount - okOldCount;
    const koDiff = koNewCount - koOldCount;
    const timedoutDiff = timedoutNewCount - timedoutOldCount;
    const abandDiff = abandNewCount - abandOldCount;
    const partiallyDiff = partiallyNewCount - partiallyOldCount;
    const unimplementedDiff = unimplementedNewCount - unimplementedOldCount;

    return {
      ok: okNewCount,
      okDiff: okDiff,
      ko: koNewCount,
      koDiff: koDiff,
      timedout: timedoutNewCount,
      timedoutDiff: timedoutDiff,
      aband: abandNewCount,
      abandDiff: abandDiff,
      partially: partiallyNewCount,
      partiallyDiff: partiallyDiff,
      unimplemented: unimplementedNewCount,
      unimplementedDiff: unimplementedDiff
    };

  }

};
