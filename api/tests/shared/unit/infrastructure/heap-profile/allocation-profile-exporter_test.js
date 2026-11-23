import { expect } from 'chai';
import sinon from 'sinon';

import {
  createAllocationProfileExporter,
  HEAP_PROFILE_EXPORT_FEATURE_TOGGLE,
  startAllocationProfileExport,
} from '../../../../../src/shared/infrastructure/heap-profile/allocation-profile-exporter.js';

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
      getContainerSelector: () => 'web-3',
      startSampling: sinon.stub().resolves({ stop }),
      encode: sinon.stub().returns(new Uint8Array([1, 2, 3])),
      compress: sinon.stub().resolves(Buffer.from('gzipped')),
      fetch: sinon.stub().resolves({ ok: true, status: 204 }),
      wait: sinon.stub().callsFake(async (delay) => {
        clock += delay;
      }),
      now: () => clock,
      logger: { info: sinon.stub(), warn: sinon.stub(), debug: sinon.stub(), error: sinon.stub() },
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

  [
    { selector: '', label: 'is empty' },
    { selector: 'web-2,worker-3', label: 'does not target the container' },
  ].forEach(({ selector, label }) => {
    it(`neither samples nor exports while the feature toggle selector ${label}`, async function () {
      // given
      dependencies.getContainerSelector = () => selector;
      const exportWindow = createAllocationProfileExporter(dependencies);

      // when
      await exportWindow();

      // then
      expect(dependencies.startSampling).not.to.have.been.called;
      expect(dependencies.fetch).not.to.have.been.called;
      expect(dependencies.wait).to.have.been.calledOnceWith(30_000);
    });
  });

  it('reads the feature toggle selector again on every window', async function () {
    // given
    let selector = '';
    dependencies.getContainerSelector = () => selector;
    const exportWindow = createAllocationProfileExporter(dependencies);
    await exportWindow();

    // when
    selector = 'web';
    await exportWindow();

    // then
    expect(dependencies.startSampling).to.have.been.calledOnce;
    expect(dependencies.fetch).to.have.been.calledOnce;
  });

  it('skips the window without throwing when the profiler does not start', async function () {
    // given
    dependencies.startSampling.rejects(new Error('inspector indisponible'));
    const exportWindow = createAllocationProfileExporter(dependencies);

    // when
    await exportWindow();

    // then
    expect(dependencies.fetch).not.to.have.been.called;
    expect(dependencies.wait).to.have.been.calledOnceWith(30_000);
    expect(dependencies.logger.warn).to.have.been.calledOnce;
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

  it('does not profile outside Scalingo, where no container can be targeted', async function () {
    // given
    dependencies.containerName = undefined;
    dependencies.getContainerSelector = () => 'all';
    const exportWindow = createAllocationProfileExporter(dependencies);

    // when
    await exportWindow();

    // then
    expect(dependencies.startSampling).not.to.have.been.called;
  });

  describe('#startAllocationProfileExport', function () {
    it('does not read the feature toggle when no endpoint is configured', async function () {
      // given
      const loadFeatureToggles = sinon.stub();

      // when
      await startAllocationProfileExport({
        serviceName: 'pix-api',
        endpoint: undefined,
        loadFeatureToggles,
        logger: dependencies.logger,
      });

      // then
      expect(loadFeatureToggles).not.to.have.been.called;
    });

    it('does not start when the feature toggle cannot be read', async function () {
      // given
      const loadFeatureToggles = sinon.stub().rejects(new Error('redis indisponible'));

      // when
      await startAllocationProfileExport({ ...dependencies, loadFeatureToggles });

      // then
      expect(dependencies.logger.error).to.have.been.calledOnce;
      expect(dependencies.startSampling).not.to.have.been.called;
    });

    it('starts the loop with the feature toggle as container selector', async function () {
      // given
      const use = sinon.stub().returns({ value: 'web-3' });
      const featureToggles = { use };
      // la boucle ne s'arrête jamais : la seconde fenêtre reste en attente
      dependencies.wait.onSecondCall().returns(new Promise(() => undefined));
      // eslint-disable-next-line no-unused-vars
      const { getContainerSelector, ...rest } = dependencies;

      // when
      await startAllocationProfileExport({ ...rest, loadFeatureToggles: async () => featureToggles });
      await new Promise((resolve) => setImmediate(resolve));

      // then
      expect(use).to.have.been.calledOnceWith(HEAP_PROFILE_EXPORT_FEATURE_TOGGLE);
      expect(dependencies.startSampling).to.have.been.called;
      expect(dependencies.fetch).to.have.been.calledOnce;
    });
  });
});
