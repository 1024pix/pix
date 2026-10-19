import { Gauge, Registry } from '@prometheus-io/client';
import { expect } from 'chai';

import { registerMemoryMetrics } from '../../../../../src/shared/infrastructure/metrics/memory-metrics.js';

describe('Shared | Unit | Infrastructure | Metrics | memory-metrics', function () {
  const MB = 1024 * 1024;

  let registry;
  let createGauge;

  beforeEach(function () {
    registry = new Registry();
    createGauge = (configuration) => new Gauge({ ...configuration, registers: [registry] });
  });

  function valuesByType(metric) {
    return Object.fromEntries(metric.values.map(({ labels, value }) => [labels.type, value]));
  }

  it('exposes the memory breakdown, swap included, as one gauge per memory type', async function () {
    // given
    const gauge = registerMemoryMetrics({
      createGauge,
      getMemoryBreakdown: async () => ({
        rss: 480 * MB,
        heapTotal: 270 * MB,
        heapUsed: 160 * MB,
        heapPhysicalTotal: 260 * MB,
        external: 40 * MB,
        VmRSS: 481 * MB,
        RssAnon: 420 * MB,
        RssFile: 60 * MB,
        VmSwap: 50 * MB,
        nativeUnaccounted: 120 * MB,
      }),
    });

    // when
    const metric = await gauge.get();

    // then
    expect(metric.name).to.equal('process_memory_bytes');
    expect(valuesByType(metric)).to.deep.equal({
      rss: 481 * MB,
      rss_anon: 420 * MB,
      rss_file: 60 * MB,
      swap: 50 * MB,
      heap_used: 160 * MB,
      heap_physical: 260 * MB,
      external: 40 * MB,
      native_unaccounted: 120 * MB,
    });
  });

  it('only exposes what Node measures itself when /proc is not available', async function () {
    // given
    const gauge = registerMemoryMetrics({
      createGauge,
      getMemoryBreakdown: async () => ({
        rss: 480 * MB,
        heapUsed: 160 * MB,
        heapPhysicalTotal: 260 * MB,
        external: 40 * MB,
        nativeUnaccounted: undefined,
      }),
    });

    // when
    const metric = await gauge.get();

    // then
    expect(valuesByType(metric)).to.deep.equal({
      heap_used: 160 * MB,
      heap_physical: 260 * MB,
      external: 40 * MB,
    });
  });
});
