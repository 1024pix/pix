import { sinon } from '../../test-helper.js';
import { _forTestOnly } from '../../../lib/domain/events/index.js';

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

export { buildEventDispatcherAndHandlersForTest };
