const _ = require('lodash');

const FinalizedSessionBookshelf = require('../data/finalized-session');

module.exports = {

  async save(finalizedSession) {
    return await new FinalizedSessionBookshelf(_toDTO(finalizedSession)).save();
  },

};

function _toDTO(finalizedSession) {
  return _.omit(
    {
      ...finalizedSession,
      date: finalizedSession.sessionDate,
      time: finalizedSession.sessionTime,
    },
    ['sessionDate', 'sessionTime'],
  );
}
