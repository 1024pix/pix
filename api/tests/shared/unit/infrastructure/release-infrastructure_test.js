import sinon from 'sinon';

import { createReleaseInfrastructure } from '../../../../src/shared/infrastructure/release-infrastructure.js';
import { expect } from '../../../test-helper.js';

describe('Shared | Unit | Infrastructure | release-infrastructure', function () {
  let dependencies;

  beforeEach(function () {
    dependencies = {
      jobClient: { isInitialized: true, stop: sinon.stub().resolves() },
      databaseConnectionRegistry: { disconnect: sinon.stub().resolves() },
      closePubSub: sinon.stub().resolves(),
      quitAllStorages: sinon.stub().resolves(),
      quitMutex: sinon.stub().resolves(),
      redisMonitor: { quit: sinon.stub().resolves() },
      stopPushingMetrics: sinon.stub().resolves(),
      logger: { info: sinon.stub(), error: sinon.stub() },
    };
  });

  it('releases all resources in order: jobs, databases, pubsub, storages, mutex, monitor, metrics', async function () {
    // given
    const releaseInfrastructure = createReleaseInfrastructure(dependencies);

    // when
    await releaseInfrastructure();

    // then
    sinon.assert.callOrder(
      dependencies.jobClient.stop,
      dependencies.databaseConnectionRegistry.disconnect,
      dependencies.closePubSub,
      dependencies.quitAllStorages,
      dependencies.quitMutex,
      dependencies.redisMonitor.quit,
      dependencies.stopPushingMetrics,
    );
  });

  it('does not stop the jobs client when it has not been initialized', async function () {
    // given
    dependencies.jobClient.isInitialized = false;
    const releaseInfrastructure = createReleaseInfrastructure(dependencies);

    // when
    await releaseInfrastructure();

    // then
    expect(dependencies.jobClient.stop).not.to.have.been.called;
    expect(dependencies.databaseConnectionRegistry.disconnect).to.have.been.calledOnce;
  });

  it('releases remaining resources and logs the error when a release fails', async function () {
    // given
    const disconnectError = new AggregateError([new Error('boom')], 'Some database connections failed to close.');
    dependencies.databaseConnectionRegistry.disconnect.rejects(disconnectError);
    const releaseInfrastructure = createReleaseInfrastructure(dependencies);

    // when
    await releaseInfrastructure();

    // then
    expect(dependencies.logger.error).to.have.been.calledWithMatch(
      { err: disconnectError },
      'Failed to release database connections.',
    );
    expect(dependencies.closePubSub).to.have.been.calledOnce;
    expect(dependencies.quitAllStorages).to.have.been.calledOnce;
    expect(dependencies.quitMutex).to.have.been.calledOnce;
    expect(dependencies.redisMonitor.quit).to.have.been.calledOnce;
    expect(dependencies.stopPushingMetrics).to.have.been.calledOnce;
  });

  it('does not reject even when every release fails', async function () {
    // given
    dependencies.jobClient.stop.rejects(new Error('jobs'));
    dependencies.databaseConnectionRegistry.disconnect.rejects(new Error('databases'));
    dependencies.closePubSub.rejects(new Error('pubsub'));
    dependencies.quitAllStorages.rejects(new Error('storages'));
    dependencies.quitMutex.rejects(new Error('mutex'));
    dependencies.redisMonitor.quit.rejects(new Error('monitor'));
    dependencies.stopPushingMetrics.rejects(new Error('metrics'));
    const releaseInfrastructure = createReleaseInfrastructure(dependencies);

    // when / then
    await expect(releaseInfrastructure()).to.be.fulfilled;
    expect(dependencies.logger.error).to.have.callCount(7);
  });

  it('is idempotent: a second call releases nothing again', async function () {
    // given
    const releaseInfrastructure = createReleaseInfrastructure(dependencies);
    await releaseInfrastructure();

    // when
    await releaseInfrastructure();

    // then
    expect(dependencies.jobClient.stop).to.have.been.calledOnce;
    expect(dependencies.databaseConnectionRegistry.disconnect).to.have.been.calledOnce;
    expect(dependencies.closePubSub).to.have.been.calledOnce;
    expect(dependencies.quitAllStorages).to.have.been.calledOnce;
    expect(dependencies.quitMutex).to.have.been.calledOnce;
    expect(dependencies.redisMonitor.quit).to.have.been.calledOnce;
    expect(dependencies.stopPushingMetrics).to.have.been.calledOnce;
  });
});
