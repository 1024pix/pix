import { expect } from 'chai';

import { summarizeAllocationSites } from '../../../../../src/shared/infrastructure/heap-profile/heap-profile-summary.js';

describe('Shared | Unit | Infrastructure | HeapProfile | heap-profile-summary', function () {
  function callFrame(functionName, lineNumber = 0, url = 'file:///app/index.js') {
    return { functionName, url, lineNumber };
  }

  it('sums the sizes of a site reached through several call paths', function () {
    // given un même `push` atteint par deux chemins, plus un site plus gros
    const profile = {
      head: {
        callFrame: callFrame('(root)'),
        selfSize: 0,
        children: [
          {
            callFrame: callFrame('handler', 10),
            selfSize: 0,
            children: [{ callFrame: callFrame('push', 41), selfSize: 300 }],
          },
          {
            callFrame: callFrame('job', 20),
            selfSize: 5_000,
            children: [{ callFrame: callFrame('push', 41), selfSize: 200 }],
          },
        ],
      },
    };

    // when
    const sites = summarizeAllocationSites(profile);

    // then
    expect(sites).to.deep.equal([
      { site: 'job (file:///app/index.js:21)', bytes: 5_000 },
      { site: 'push (file:///app/index.js:42)', bytes: 500 },
    ]);
  });

  it('keeps only the biggest sites, and names the nameless ones', function () {
    // given
    const profile = {
      head: {
        callFrame: callFrame('(root)'),
        selfSize: 0,
        children: [
          { callFrame: callFrame('', 0, ''), selfSize: 10 },
          { callFrame: callFrame('petit', 1), selfSize: 20 },
          { callFrame: callFrame('gros', 2), selfSize: 30 },
        ],
      },
    };

    // when
    const sites = summarizeAllocationSites(profile, { limit: 2 });

    // then
    expect(sites).to.deep.equal([
      { site: 'gros (file:///app/index.js:3)', bytes: 30 },
      { site: 'petit (file:///app/index.js:2)', bytes: 20 },
    ]);

    // and a nameless frame is still reported when it makes the cut
    expect(summarizeAllocationSites(profile, { limit: 3 }).at(-1)).to.deep.equal({
      site: '(anonyme) (natif:1)',
      bytes: 10,
    });
  });
});
