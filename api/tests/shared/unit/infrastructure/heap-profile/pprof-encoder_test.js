import { expect } from 'chai';
import { Profile } from 'pprof-format';

import { encodeAllocationProfileAsPprof } from '../../../../../src/shared/infrastructure/heap-profile/pprof-encoder.js';

describe('Shared | Unit | Infrastructure | HeapProfile | pprof-encoder', function () {
  const callFrame = (functionName, url = '', lineNumber = -1) => ({ functionName, url, lineNumber, columnNumber: 0 });

  const PROFILE = {
    head: {
      callFrame: callFrame('(root)'),
      selfSize: 0,
      children: [
        {
          callFrame: callFrame('getResults', 'file:///app/src/prescription/usecases/get-results.js', 9),
          selfSize: 1_000,
          children: [
            {
              callFrame: callFrame('from'),
              selfSize: 60_000_000,
              children: [],
            },
            {
              callFrame: callFrame('', 'file:///app/node_modules/knex/lib/runner.js', 41),
              selfSize: 0,
              children: [],
            },
          ],
        },
      ],
    },
  };

  function decode(profile) {
    const pprof = Profile.decode(
      encodeAllocationProfileAsPprof(profile, {
        startedAt: Date.parse('2026-11-20T10:00:00Z'),
        durationMs: 30_000,
        samplingInterval: 524_288,
        rootPath: '/app',
      }),
    );
    const string = (index) => pprof.stringTable.strings[Number(index)];
    const functionName = (locationId) => {
      const location = pprof.location.find(({ id }) => Number(id) === Number(locationId));
      const fn = pprof.function.find(({ id }) => Number(id) === Number(location.line[0].functionId));
      return string(fn.name);
    };
    return {
      pprof,
      string,
      samples: pprof.sample.map((sample) => ({
        stack: sample.locationId.map(functionName),
        bytes: Number(sample.value[0]),
      })),
    };
  }

  it('turns each allocating node into a sample whose stack goes from the node up to the root', function () {
    // when
    const { samples } = decode(PROFILE);

    // then
    expect(samples).to.have.deep.members([
      { stack: ['getResults (src/prescription/usecases/get-results.js:10)'], bytes: 1_000 },
      { stack: ['from', 'getResults (src/prescription/usecases/get-results.js:10)'], bytes: 60_000_000 },
    ]);
  });

  it('describes the samples as allocated bytes over the window', function () {
    // when
    const { pprof, string } = decode(PROFILE);

    // then
    expect(pprof.sampleType.map(({ type, unit }) => [string(type), string(unit)])).to.deep.equal([
      ['alloc_space', 'bytes'],
    ]);
    expect(Number(pprof.period)).to.equal(524_288);
    expect(BigInt(pprof.timeNanos)).to.equal(BigInt(Date.parse('2026-11-20T10:00:00Z')) * 1_000_000n);
    expect(BigInt(pprof.durationNanos)).to.equal(30_000_000_000n);
  });

  it('names anonymous functions and keeps paths outside the application root', function () {
    // given
    const profile = {
      head: {
        callFrame: callFrame('(root)'),
        selfSize: 0,
        children: [
          {
            callFrame: callFrame('', 'file:///usr/lib/node/lib.js', 0),
            selfSize: 10,
            children: [],
          },
        ],
      },
    };

    // when
    const { samples } = decode(profile);

    // then
    expect(samples).to.deep.equal([{ stack: ['(anonymous) (/usr/lib/node/lib.js:1)'], bytes: 10 }]);
  });
});
