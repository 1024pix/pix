import { promisify } from 'node:util';
import { gunzip } from 'node:zlib';

import { expect } from 'chai';
import sinon from 'sinon';

import {
  createHeapProfileRecorder,
  PROFILE_STATUS,
  SKIP_REASON,
} from '../../../../../src/shared/infrastructure/heap-profile/heap-profile-recorder.js';

const gunzipAsync = promisify(gunzip);

describe('Shared | Unit | Infrastructure | HeapProfile | heap-profile-recorder', function () {
  const PROFILE = {
    head: {
      callFrame: {
        functionName: 'fuite',
        url: 'file:///app/index.js',
        lineNumber: 41,
      },
      selfSize: 2_048,
    },
    samples: [{ size: 2_048, nodeId: 1, ordinal: 1 }],
  };

  let logger, stop, startSampling, waitCalls, dependencies;

  beforeEach(function () {
    logger = {
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
      debug: sinon.stub(),
    };
    stop = sinon.stub().resolves(PROFILE);
    startSampling = sinon.stub().resolves({ stop });
    waitCalls = [];
    dependencies = {
      startSampling,
      getHeapStatistics: () => ({ used_heap_size: 1_000 }),
      getRss: () => 2_000,
      wait: (delay) => {
        waitCalls.push(delay);
        return Promise.resolve();
      },
      now: () => Date.parse('2026-09-30T08:30:00.000Z'),
      defaultDuration: 300_000,
      maxDuration: 1_800_000,
      defaultSamplingInterval: 512 * 1024,
      logger,
    };
  });

  it('profiles for the requested window and returns the gzipped profile', async function () {
    // given
    const recordHeapProfile = createHeapProfileRecorder(dependencies);

    // when
    const result = await recordHeapProfile({
      durationMs: 60_000,
      reason: 'fuite',
    });

    // then
    expect(startSampling).to.have.been.calledOnceWithExactly({
      samplingInterval: 512 * 1024,
      includeCollected: false,
    });
    expect(waitCalls).to.deep.equal([60_000]);
    expect(result.status).to.equal(PROFILE_STATUS.DONE);
    expect(result.samples).to.equal(1);
    expect(JSON.parse(await gunzipAsync(Buffer.from(result.profile, 'base64')))).to.deep.equal(PROFILE);
  });

  it('reports the heap and RSS measured on both sides of the window', async function () {
    // given
    const heapSizes = [1_000, 5_000];
    const rssSizes = [2_000, 9_000];
    const recordHeapProfile = createHeapProfileRecorder({
      ...dependencies,
      getHeapStatistics: () => ({ used_heap_size: heapSizes.shift() }),
      getRss: () => rssSizes.shift(),
    });

    // when
    const result = await recordHeapProfile({ durationMs: 60_000 });

    // then
    expect(result).to.include({
      heapUsedBefore: 1_000,
      heapUsedAfter: 5_000,
      rssBefore: 2_000,
      rssAfter: 9_000,
    });
  });

  it('falls back to the configured duration and sampling interval', async function () {
    // given
    const recordHeapProfile = createHeapProfileRecorder(dependencies);

    // when
    const result = await recordHeapProfile();

    // then
    expect(waitCalls).to.deep.equal([300_000]);
    expect(result).to.include({
      durationMs: 300_000,
      samplingInterval: 512 * 1024,
    });
  });

  it('caps a window longer than the maximum duration', async function () {
    // given
    const recordHeapProfile = createHeapProfileRecorder(dependencies);

    // when
    const result = await recordHeapProfile({ durationMs: 7_200_000 });

    // then
    expect(waitCalls).to.deep.equal([1_800_000]);
    expect(result.durationMs).to.equal(1_800_000);
  });

  it('asks V8 for the collected objects too when requested', async function () {
    // given
    const recordHeapProfile = createHeapProfileRecorder(dependencies);

    // when
    const result = await recordHeapProfile({
      durationMs: 60_000,
      includeCollected: true,
    });

    // then
    expect(startSampling).to.have.been.calledOnceWithExactly({
      samplingInterval: 512 * 1024,
      includeCollected: true,
    });
    expect(result.includeCollected).to.be.true;
  });

  it('skips a request while another window is open, V8 having a single profiler per process', async function () {
    // given
    const { promise: windowClosed, resolve: closeWindow } = Promise.withResolvers();
    const recordHeapProfile = createHeapProfileRecorder({
      ...dependencies,
      wait: () => windowClosed,
    });

    // when
    const firstProfile = recordHeapProfile({ durationMs: 60_000 });
    const secondResult = await recordHeapProfile({ durationMs: 60_000 });
    closeWindow();
    await firstProfile;

    // then
    expect(secondResult).to.deep.equal({
      status: PROFILE_STATUS.SKIPPED,
      skipReason: SKIP_REASON.IN_PROGRESS,
    });
    expect(startSampling).to.have.been.calledOnce;
  });

  it('accepts a new request once the previous window is closed', async function () {
    // given
    const recordHeapProfile = createHeapProfileRecorder(dependencies);

    // when
    await recordHeapProfile({ durationMs: 60_000 });
    const secondResult = await recordHeapProfile({ durationMs: 60_000 });

    // then
    expect(secondResult.status).to.equal(PROFILE_STATUS.DONE);
  });

  it('announces the start of the window before waiting for it', async function () {
    // given
    const onStarted = sinon.stub();
    const recordHeapProfile = createHeapProfileRecorder({
      ...dependencies,
      wait: () => {
        expect(onStarted).to.have.been.calledOnce;
        return Promise.resolve();
      },
    });

    // when
    await recordHeapProfile({ durationMs: 60_000, onStarted });

    // then
    expect(onStarted).to.have.been.calledOnceWithExactly({
      status: PROFILE_STATUS.STARTED,
      durationMs: 60_000,
      samplingInterval: 512 * 1024,
      includeCollected: false,
    });
  });

  it('reports a failure instead of throwing, and releases the lock', async function () {
    // given
    stop.rejects(new Error('V8 sampling heap profiler was not started.'));
    const recordHeapProfile = createHeapProfileRecorder(dependencies);

    // when
    const result = await recordHeapProfile({ durationMs: 60_000 });

    // then
    expect(result).to.deep.equal({
      status: PROFILE_STATUS.FAILED,
      error: 'V8 sampling heap profiler was not started.',
    });
    expect(logger.error).to.have.been.calledOnce;

    // and the lock is released
    stop.resolves(PROFILE);
    expect((await recordHeapProfile({ durationMs: 60_000 })).status).to.equal(PROFILE_STATUS.DONE);
  });

  it('disarms V8 profiler when the window is cut short, so the next request gets its own profile', async function () {
    // given une publication de l'accusé de démarrage qui échoue
    const recordHeapProfile = createHeapProfileRecorder(dependencies);
    const onStarted = sinon.stub().rejects(new Error('redis injoignable'));

    // when
    const result = await recordHeapProfile({ durationMs: 60_000, onStarted });

    // then
    expect(result.status).to.equal(PROFILE_STATUS.FAILED);
    expect(stop).to.have.been.calledOnce;

    // and the next request profiles its own window
    const nextResult = await recordHeapProfile({ durationMs: 60_000 });
    expect(nextResult.status).to.equal(PROFILE_STATUS.DONE);
    expect(startSampling).to.have.been.calledTwice;
  });

  it('refuses to publish a profile too large for a pub/sub message', async function () {
    // given
    const recordHeapProfile = createHeapProfileRecorder({
      ...dependencies,
      compress: async () => Buffer.alloc(5 * 1024 * 1024),
    });

    // when
    const result = await recordHeapProfile({ durationMs: 60_000 });

    // then
    expect(result.status).to.equal(PROFILE_STATUS.FAILED);
    expect(result.error).to.contain('au-delà de la limite');
    expect(result.profile).to.be.undefined;
  });
});
