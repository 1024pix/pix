import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { expect } from 'chai';

const execFileAsync = promisify(execFile);

// un environnement minimal, sans rien hériter de celui des tests
const PATH = '/usr/local/bin:/usr/bin:/bin';

const WRAPPER = fileURLToPath(new URL('../../../scripts/with-malloc-tuning.sh', import.meta.url));

/**
 * Lance le wrapper avec un environnement maîtrisé, et rend la valeur de la
 * variable `name` vue par la commande enveloppée.
 */
async function variableSeenBy(name, env) {
  const { stdout } = await execFileAsync('sh', [WRAPPER, 'sh', '-c', `printf %s "\${${name}-non posé}"`], {
    env: { PATH, ...env },
  });
  return stdout;
}

const arenaMaxSeenBy = (env) => variableSeenBy('MALLOC_ARENA_MAX', env);
const ldPreloadSeenBy = (env) => variableSeenBy('LD_PRELOAD', env);

describe('Unit | Scripts | with-malloc-tuning', function () {
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
      const arenaMax = await arenaMaxSeenBy({
        CONTAINER: container,
        MALLOC_ARENA_MAX_CONTAINERS: selector,
      });

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
    const arenaMax = await arenaMaxSeenBy({
      MALLOC_ARENA_MAX_CONTAINERS: 'all',
    });

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

  describe('jemalloc', function () {
    let directory, jemalloc;

    beforeEach(async function () {
      // le wrapper ne vérifie que la présence du fichier, pas son contenu
      directory = await mkdtemp(join(tmpdir(), 'with-malloc-tuning-'));
      jemalloc = join(directory, 'libjemalloc.so.2');
      await writeFile(jemalloc, '');
    });

    afterEach(async function () {
      await rm(directory, { recursive: true, force: true });
    });

    it('preloads jemalloc on the targeted containers', async function () {
      // when
      const ldPreload = await ldPreloadSeenBy({
        CONTAINER: 'web-2',
        JEMALLOC_CONTAINERS: 'web-%2',
        JEMALLOC_PATH: jemalloc,
      });

      // then
      expect(ldPreload).to.equal(jemalloc);
    });

    it('leaves the other containers on glibc malloc', async function () {
      // when
      const ldPreload = await ldPreloadSeenBy({
        CONTAINER: 'web-3',
        JEMALLOC_CONTAINERS: 'web-%2',
        JEMALLOC_PATH: jemalloc,
      });

      // then
      expect(ldPreload).to.equal('non posé');
    });

    it('looks for the library installed by the apt buildpack by default', async function () {
      // given
      const home = join(directory, 'app');
      const lib = join(home, '.apt/usr/lib/x86_64-linux-gnu');
      await execFileAsync('mkdir', ['-p', lib]);
      await writeFile(join(lib, 'libjemalloc.so.2'), '');

      // when
      const ldPreload = await ldPreloadSeenBy({
        CONTAINER: 'web-1',
        JEMALLOC_CONTAINERS: 'web',
        HOME: home,
      });

      // then
      expect(ldPreload).to.equal(join(lib, 'libjemalloc.so.2'));
    });

    it('keeps the libraries already preloaded', async function () {
      // when
      const ldPreload = await ldPreloadSeenBy({
        CONTAINER: 'web-1',
        JEMALLOC_CONTAINERS: 'web',
        JEMALLOC_PATH: jemalloc,
        LD_PRELOAD: '/lib/other.so',
      });

      // then
      expect(ldPreload).to.equal(`${jemalloc} /lib/other.so`);
    });

    it('starts on glibc malloc when the library is missing', async function () {
      // when
      const { stdout, stderr } = await execFileAsync(
        'sh',
        [WRAPPER, 'sh', '-c', 'printf %s "${LD_PRELOAD-non posé}"'],
        {
          env: {
            PATH,
            CONTAINER: 'web-1',
            JEMALLOC_CONTAINERS: 'web',
            JEMALLOC_PATH: join(directory, 'absente.so'),
          },
        },
      );

      // then
      expect(stdout).to.equal('non posé');
      expect(stderr).to.contain('jemalloc introuvable');
    });

    it('does not set MALLOC_ARENA_MAX, which jemalloc ignores, on a container targeted by both', async function () {
      // when
      const arenaMax = await arenaMaxSeenBy({
        CONTAINER: 'web-2',
        JEMALLOC_CONTAINERS: 'web-2',
        JEMALLOC_PATH: jemalloc,
        MALLOC_ARENA_MAX_CONTAINERS: 'web',
      });

      // then
      expect(arenaMax).to.equal('non posé');
    });
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
