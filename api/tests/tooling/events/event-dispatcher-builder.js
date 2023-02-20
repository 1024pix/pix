import { sinon } from '../../test-helper';
import { _forTestOnly } from '../../../lib/domain/events';

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

export default buildEventDispatcherAndHandlersForTest;
