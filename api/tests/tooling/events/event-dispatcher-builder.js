const { sinon } = require('../../test-helper');
const { _forTestOnly } = require('../../../lib/domain/events/index.js');

function buildEventDispatcherAndHandlersForTest() {
  const handlerStubs = {};
  Object.keys(_forTestOnly.handlers).forEach((h) => {
    handlerStubs[h] = sinon.stub();
  });

  return {
    handlerStubs,
    eventDispatcher: _forTestOnly.buildEventDispatcher(handlerStubs),
  };
}

module.exports = buildEventDispatcherAndHandlersForTest;
