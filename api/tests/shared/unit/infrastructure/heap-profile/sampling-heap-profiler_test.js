import { expect } from 'chai';

import { startSampling } from '../../../../../src/shared/infrastructure/heap-profile/sampling-heap-profiler.js';

describe('Shared | Unit | Infrastructure | HeapProfile | sampling-heap-profiler', function () {
  it('returns the allocation profile of the window', async function () {
    // given
    const sampling = await startSampling({ samplingInterval: 512 * 1024, includeCollected: true });

    // when
    const profile = await sampling.stop();

    // then
    expect(profile).to.have.property('head');
  });
});
