import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { expect } from 'chai';

const execFileAsync = promisify(execFile);

// un environnement minimal, sans rien hériter de celui des tests
const PATH = '/usr/local/bin:/usr/bin:/bin';

const WRAPPER = fileURLToPath(new URL('../../../scripts/with-malloc-arena-max.sh', import.meta.url));

/**
 * Lance le wrapper avec un environnement maîtrisé, et rend la valeur de
 * `MALLOC_ARENA_MAX` vue par la commande enveloppée.
 */
async function arenaMaxSeenBy(env) {
  const { stdout } = await execFileAsync('sh', [WRAPPER, 'sh', '-c', 'printf %s "${MALLOC_ARENA_MAX-non posé}"'], {
    env: { PATH, ...env },
  });
  return stdout;
}

describe('Unit | Scripts | with-malloc-arena-max', function () {
  [
    { selector: 'web-2', container: 'web-2', expected: '2' },
    { selector: 'web-2', container: 'web-3', expected: 'non posé' },
    { selector: 'web-1', container: 'web-12', expected: 'non posé' },
    { selector: 'web-2,web-5', container: 'web-5', expected: '2' },
    { selector: 'web-2 web-5', container: 'web-5', expected: '2' },
    { selector: 'web', container: 'web-7', expected: '2' },
    { selector: 'web', container: 'worker-1', expected: 'non posé' },
    { selector: 'web-*', container: 'web-7', expected: '2' },
    { selector: 'web-%3', container: 'web-6', expected: '2' },
    { selector: 'web-%3', container: 'web-7', expected: 'non posé' },
    { selector: 'web-%0', container: 'web-6', expected: 'non posé' },
    { selector: 'all', container: 'worker-1', expected: '2' },
    { selector: '*', container: 'worker-1', expected: '2' },
  ].forEach(({ selector, container, expected }) => {
    it(`${selector} → ${container} : ${expected}`, async function () {
      // when
      const arenaMax = await arenaMaxSeenBy({ CONTAINER: container, MALLOC_ARENA_MAX_CONTAINERS: selector });

      // then
      expect(arenaMax).to.equal(expected);
    });
  });

  it('targets no container when the selector is not set', async function () {
    // when
    const arenaMax = await arenaMaxSeenBy({ CONTAINER: 'web-2' });

    // then
    expect(arenaMax).to.equal('non posé');
  });

  it('targets nothing outside Scalingo, where CONTAINER is not set', async function () {
    // when
    const arenaMax = await arenaMaxSeenBy({ MALLOC_ARENA_MAX_CONTAINERS: 'all' });

    // then
    expect(arenaMax).to.equal('non posé');
  });

  it('uses the configured number of arenas', async function () {
    // when
    const arenaMax = await arenaMaxSeenBy({
      CONTAINER: 'web-2',
      MALLOC_ARENA_MAX_CONTAINERS: 'web-2',
      MALLOC_ARENA_MAX_VALUE: '4',
    });

    // then
    expect(arenaMax).to.equal('4');
  });

  it('leaves a MALLOC_ARENA_MAX already set for every container untouched', async function () {
    // when
    const arenaMax = await arenaMaxSeenBy({
      CONTAINER: 'web-2',
      MALLOC_ARENA_MAX_CONTAINERS: 'web-2',
      MALLOC_ARENA_MAX: '8',
    });

    // then
    expect(arenaMax).to.equal('8');
  });

  it('passes the exit code of the wrapped command through', async function () {
    // when
    const error = await execFileAsync('sh', [WRAPPER, 'sh', '-c', 'exit 3'], {
      env: { PATH },
    }).catch((error) => error);

    // then
    expect(error.code).to.equal(3);
  });
});
