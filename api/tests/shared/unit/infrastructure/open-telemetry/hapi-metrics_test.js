import { metrics } from '@opentelemetry/api';
import sinon from 'sinon';

import { instrumentActiveRequestsCount } from '../../../../../src/shared/infrastructure/open-telemetry/hapi-tracing.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Infrastructure | OpenTelemetry | hapi-metrics', function () {
  let meterStub, recordStub;
  beforeEach(function () {
    recordStub = sinon.stub();
    meterStub = {
      createHistogram: sinon.stub().returns({ record: recordStub }),
    };
    sinon.stub(metrics, 'getMeter').returns(meterStub);
  });

  afterEach(function () {
    metrics.getMeter.restore();
  });

  it('registers a histogram for active requests count', async function () {
    // given
    let startRequest, endRequest;
    const req = {},
      h = {};
    const hapiServer = {
      ext: sinon.stub().callsFake((event, cb) => {
        if (event === 'onRequest') startRequest = cb.bind(null, req, h);
        if (event === 'onPostResponse') endRequest = cb.bind(null, req, h);
      }),
    };

    // when
    instrumentActiveRequestsCount(hapiServer);
    startRequest();
    startRequest();
    endRequest();
    startRequest();
    endRequest();
    endRequest();

    // then
    expect(meterStub.createHistogram).to.have.been.calledWith('hapi.activeRequests', { unit: 'request' });
    expect(recordStub.getCalls().flatMap(({ args }) => args)).to.deep.equal([1, 2, 2]);
  });
});
