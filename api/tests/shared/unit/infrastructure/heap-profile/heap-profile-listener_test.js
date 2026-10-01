import { expect } from 'chai';
import sinon from 'sinon';

import { startHeapProfileListener } from '../../../../../src/shared/infrastructure/heap-profile/heap-profile-listener.js';

describe('Shared | Unit | Infrastructure | HeapProfile | heap-profile-listener', function () {
  let logger, requestTopic, resultTopic, recordProfile, dependencies;

  function publishRequest(request) {
    return requestTopic.subscribe.firstCall.args[0](request);
  }

  beforeEach(function () {
    logger = {
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
      debug: sinon.stub(),
    };
    requestTopic = { subscribe: sinon.stub(), publish: sinon.stub() };
    resultTopic = { subscribe: sinon.stub(), publish: sinon.stub() };
    recordProfile = sinon.stub().resolves({ status: 'done', profile: 'H4sIAAAA', samples: 12 });
    dependencies = {
      enabled: true,
      maxRequestAge: 30_000,
      containerName: 'web-2',
      requestTopic,
      resultTopic,
      recordProfile,
      now: () => 1_000_000,
      logger,
    };
  });

  it('does not subscribe when the feature is disabled', function () {
    // when
    startHeapProfileListener({ ...dependencies, enabled: false });

    // then
    expect(requestTopic.subscribe).to.not.have.been.called;
  });

  it('profiles and publishes the result when the container is targeted', async function () {
    // given
    startHeapProfileListener(dependencies);

    // when
    await publishRequest({
      requestId: 'abc',
      containers: 'web-2',
      durationMs: 60_000,
      samplingInterval: 65_536,
      includeCollected: true,
      reason: 'fuite',
      requestedAt: 1_000_000,
    });

    // then
    expect(recordProfile).to.have.been.calledOnce;
    expect(recordProfile.firstCall.firstArg).to.include({
      durationMs: 60_000,
      samplingInterval: 65_536,
      includeCollected: true,
      reason: 'fuite',
    });
    expect(resultTopic.publish).to.have.been.calledOnceWithExactly({
      status: 'done',
      profile: 'H4sIAAAA',
      samples: 12,
      requestId: 'abc',
      container: 'web-2',
    });
  });

  it('publishes the start of the window, so the script knows the request was taken', async function () {
    // given
    recordProfile.callsFake(async ({ onStarted }) => {
      await onStarted({ status: 'started', durationMs: 60_000 });
      return { status: 'done' };
    });
    startHeapProfileListener(dependencies);

    // when
    await publishRequest({
      requestId: 'abc',
      containers: 'web-2',
      durationMs: 60_000,
      requestedAt: 1_000_000,
    });

    // then
    expect(resultTopic.publish.firstCall.firstArg).to.deep.equal({
      status: 'started',
      durationMs: 60_000,
      requestId: 'abc',
      container: 'web-2',
    });
    expect(resultTopic.publish.secondCall.firstArg).to.deep.equal({
      status: 'done',
      requestId: 'abc',
      container: 'web-2',
    });
  });

  it('ignores a request targeting another container', async function () {
    // given
    startHeapProfileListener(dependencies);

    // when
    await publishRequest({
      requestId: 'abc',
      containers: 'web-3',
      requestedAt: 1_000_000,
    });

    // then
    expect(recordProfile).to.not.have.been.called;
    expect(resultTopic.publish).to.not.have.been.called;
  });

  it('ignores a request older than the maximum request age', async function () {
    // given
    startHeapProfileListener(dependencies);

    // when
    await publishRequest({
      requestId: 'abc',
      containers: 'all',
      requestedAt: 900_000,
    });

    // then
    expect(recordProfile).to.not.have.been.called;
    expect(logger.warn).to.have.been.calledOnce;
  });
});
