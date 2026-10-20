import { expect } from 'chai';

import { createMemoryBreakdown } from '../../../../../src/shared/infrastructure/heap-profile/memory-breakdown.js';

describe('Shared | Unit | Infrastructure | HeapProfile | memory-breakdown', function () {
  const MB = 1024 * 1024;

  const PROC_STATUS = [
    'Name:\tnode',
    'VmRSS:\t  491520 kB',
    'RssAnon:\t  430080 kB',
    'RssFile:\t   61440 kB',
    'RssShmem:\t       0 kB',
    'VmSwap:\t    2048 kB',
    'Threads:\t11',
  ].join('\n');

  let dependencies;

  beforeEach(function () {
    dependencies = {
      memoryUsage: () => ({
        rss: 480 * MB,
        heapTotal: 270 * MB,
        heapUsed: 160 * MB,
        external: 40 * MB,
        arrayBuffers: 30 * MB,
      }),
      getHeapSpaceStatistics: () => [
        { space_name: 'old_space', physical_space_size: 220 * MB },
        { space_name: 'new_space', physical_space_size: 30 * MB },
        { space_name: 'code_space', physical_space_size: 10 * MB },
      ],
      readProcStatus: async () => PROC_STATUS,
    };
  });

  it('breaks the RSS down into heap, external memory, mapped files and unaccounted native memory', async function () {
    // given
    const getMemoryBreakdown = createMemoryBreakdown(dependencies);

    // when
    const breakdown = await getMemoryBreakdown();

    // then
    expect(breakdown).to.deep.equal({
      rss: 480 * MB,
      heapTotal: 270 * MB,
      heapUsed: 160 * MB,
      heapPhysicalTotal: 260 * MB,
      heapPhysical: {
        old_space: 220 * MB,
        new_space: 30 * MB,
        code_space: 10 * MB,
      },
      external: 40 * MB,
      arrayBuffers: 30 * MB,
      VmRSS: 480 * MB,
      RssAnon: 420 * MB,
      RssFile: 60 * MB,
      RssShmem: 0,
      VmSwap: 2 * MB,
      threads: 11,
      nativeUnaccounted: 120 * MB,
    });
  });

  it('settles for what Node measures itself when /proc is not available', async function () {
    // given
    const getMemoryBreakdown = createMemoryBreakdown({
      ...dependencies,
      readProcStatus: async () => undefined,
    });

    // when
    const breakdown = await getMemoryBreakdown();

    // then
    expect(breakdown).to.include({
      rss: 480 * MB,
      heapPhysicalTotal: 260 * MB,
      external: 40 * MB,
      nativeUnaccounted: undefined,
    });
    expect(breakdown).not.to.have.property('RssAnon');
  });

  it('reads the actual process memory by default', async function () {
    // given
    const getMemoryBreakdown = createMemoryBreakdown();

    // when
    const breakdown = await getMemoryBreakdown();

    // then
    expect(breakdown.rss).to.be.above(0);
    expect(breakdown.heapPhysicalTotal).to.be.above(0);
  });
});
