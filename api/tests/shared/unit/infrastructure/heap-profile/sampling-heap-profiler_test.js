import { expect } from 'chai';

import {
  SamplingAlreadyInProgressError,
  startSampling,
} from '../../../../../src/shared/infrastructure/heap-profile/sampling-heap-profiler.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Shared | Unit | Infrastructure | HeapProfile | sampling-heap-profiler', function () {
  it('refuses a second window while one is open, then accepts one once it is closed', async function () {
    // given
    const sampling = await startSampling({ samplingInterval: 512 * 1024 });

    try {
      // when
      const error = await catchErr(startSampling)({ samplingInterval: 512 * 1024 });

      // then
      expect(error).to.be.instanceOf(SamplingAlreadyInProgressError);
    } finally {
      await sampling.stop();
    }

    const nextSampling = await startSampling({ samplingInterval: 512 * 1024 });
    const profile = await nextSampling.stop();
    expect(profile).to.have.property('head');
  });

  it('keeps the lock of a window opened after a second stop of a closed one', async function () {
    // given
    const firstSampling = await startSampling({ samplingInterval: 512 * 1024 });
    await firstSampling.stop();
    const secondSampling = await startSampling({ samplingInterval: 512 * 1024 });

    try {
      // when
      await firstSampling.stop().catch(() => undefined);
      const error = await catchErr(startSampling)({ samplingInterval: 512 * 1024 });

      // then
      expect(error).to.be.instanceOf(SamplingAlreadyInProgressError);
    } finally {
      await secondSampling.stop();
    }
  });
});
