import Mocha from 'mocha';

/**
 * Permet d'exécuter les tests dans un ordre aléatoire permettant d'identifier les
 * problèmes d'isolation des tests.
 *
 * Exemple d'exécution avec une seed aléatoire :
 * npm run test:api:unit -- --require ./tests/test-random.js --bail
 *
 * Exemple d'exécution avec une seed fixe, nombre flottant: 0 < seed < 1 :
 * SEED=0.12243342423 npm run test:api:unit -- --require ./tests/test-random.js --bail
 */

const run = Mocha.prototype.run;
const each = Mocha.Suite.prototype.eachTest;

const SEED = Number.parseFloat(process.env.SEED) || Math.random();

// eslint-disable-next-line no-console
console.log(`Seed: ${SEED}`);

Mocha.prototype.run = function () {
  shuffle(this.files);
  return run.apply(this, arguments);
};

Mocha.Suite.prototype.eachTest = function () {
  shuffle(this.tests);
  shuffle(this.suites);
  return each.apply(this, arguments);
};

function shuffle(array) {
  if (array == null || !array.length) return;

  let index = -1;
  const length = array.length;
  const lastIndex = length - 1;
  while (++index < length) {
    const rand = index + Math.floor(SEED * (lastIndex - index + 1));
    const value = array[rand];
    array[rand] = array[index];
    array[index] = value;
  }
}
