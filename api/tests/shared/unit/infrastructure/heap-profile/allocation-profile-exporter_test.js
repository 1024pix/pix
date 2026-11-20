import { expect } from 'chai';
import sinon from 'sinon';

import { createAllocationProfileExporter } from '../../../../../src/shared/infrastructure/heap-profile/allocation-profile-exporter.js';
import { SamplingAlreadyInProgressError } from '../../../../../src/shared/infrastructure/heap-profile/sampling-heap-profiler.js';

describe('Shared | Unit | Infrastructure | HeapProfile | allocation-profile-exporter', function () {
  const PROFILE = { head: { callFrame: { functionName: '(root)' }, selfSize: 0, children: [] } };

  let dependencies, stop, clock;

  beforeEach(function () {
    clock = Date.parse('2026-11-20T10:00:00Z');
    stop = sinon.stub().resolves(PROFILE);
    dependencies = {
      serviceName: 'pix-api',
      endpoint: 'http://collector:4040/v1/pprof',
      windowDuration: 30_000,
      samplingInterval: 524_288,
      containerName: 'web-3',
      isDataExportEnabled: () => true,
      startSampling: sinon.stub().resolves({ stop }),
      encode: sinon.stub().returns(new Uint8Array([1, 2, 3])),
      compress: sinon.stub().resolves(Buffer.from('gzipped')),
      fetch: sinon.stub().resolves({ ok: true, status: 204 }),
      wait: sinon.stub().callsFake(async (delay) => {
        clock += delay;
      }),
      now: () => clock,
      logger: { info: sinon.stub(), warn: sinon.stub(), debug: sinon.stub() },
    };
  });

  it('samples a window including collected objects, then pushes it to the collector', async function () {
    // given
    const exportWindow = createAllocationProfileExporter(dependencies);

    // when
    await exportWindow();

    // then
    expect(dependencies.startSampling).to.have.been.calledOnceWith({
      samplingInterval: 524_288,
      includeCollected: true,
    });
    expect(dependencies.wait).to.have.been.calledOnceWith(30_000, undefined, { ref: false });
    expect(stop).to.have.been.calledOnce;
    expect(dependencies.encode).to.have.been.calledOnceWith(PROFILE, {
      startedAt: Date.parse('2026-11-20T10:00:00Z'),
      durationMs: 30_000,
      samplingInterval: 524_288,
    });
    expect(dependencies.fetch).to.have.been.calledOnce;
    const [url, request] = dependencies.fetch.firstCall.args;
    expect(url).to.equal('http://collector:4040/v1/pprof');
    expect(request.method).to.equal('POST');
    expect(request.body).to.deep.equal(Buffer.from('gzipped'));
    expect(request.headers).to.deep.equal({
      'content-type': 'application/octet-stream',
      'content-encoding': 'gzip',
      'x-service-name': 'pix-api',
      'x-scalingo-container': 'web-3',
    });
  });

  it('neither samples nor exports while the OpenTelemetry data export is disabled', async function () {
    // given
    dependencies.isDataExportEnabled = () => false;
    const exportWindow = createAllocationProfileExporter(dependencies);

    // when
    await exportWindow();

    // then
    expect(dependencies.startSampling).not.to.have.been.called;
    expect(dependencies.fetch).not.to.have.been.called;
    expect(dependencies.wait).to.have.been.calledOnceWith(30_000);
  });

  it('skips the window when an on-demand profile holds the profiler', async function () {
    // given
    dependencies.startSampling.rejects(new SamplingAlreadyInProgressError());
    const exportWindow = createAllocationProfileExporter(dependencies);

    // when
    await exportWindow();

    // then
    expect(dependencies.fetch).not.to.have.been.called;
    expect(dependencies.wait).to.have.been.calledOnceWith(30_000);
    expect(dependencies.logger.warn).not.to.have.been.called;
  });

  it('logs a collector refusal without throwing', async function () {
    // given
    dependencies.fetch.resolves({ ok: false, status: 400 });
    const exportWindow = createAllocationProfileExporter(dependencies);

    // when
    await exportWindow();

    // then
    expect(dependencies.logger.warn).to.have.been.calledOnce;
    expect(dependencies.logger.warn.firstCall.args[0]).to.include({ status: 400 });
  });

  it('disarms the profiler and does not throw when the window is interrupted', async function () {
    // given
    dependencies.wait.rejects(new Error('interrompu'));
    const exportWindow = createAllocationProfileExporter(dependencies);

    // when
    await exportWindow();

    // then
    expect(stop).to.have.been.calledOnce;
    expect(dependencies.fetch).not.to.have.been.called;
    expect(dependencies.logger.warn).to.have.been.calledOnce;
  });

  it('omits the container header outside Scalingo', async function () {
    // given
    dependencies.containerName = undefined;
    const exportWindow = createAllocationProfileExporter(dependencies);

    // when
    await exportWindow();

    // then
    expect(dependencies.fetch.firstCall.args[1].headers).not.to.have.property('x-scalingo-container');
  });
});
