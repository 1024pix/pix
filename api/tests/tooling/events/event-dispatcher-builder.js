import { sinon } from '../../test-helper.js';

function buildEventDispatcherAndHandlersForTest(_forTestOnly) {
  const handlerStubs = {};
  Object.keys(_forTestOnly.handlers).forEach((h) => {
    handlerStubs[h] = sinon.stub();
  });

  return {
    handlerStubs,
    eventDispatcher: _forTestOnly.buildEventDispatcher(handlerStubs),
  };
}

export { buildEventDispatcherAndHandlersForTest };
