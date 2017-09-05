const _ = require('../../infrastructure/utils/lodash-utils');

function _countResult(about, desiredResult) {
  return _.reduce(about, function(sum, o) {
    return sum + (o.result === desiredResult ? 1 : 0);
  }, 0);
}

module.exports = {

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
