import hashInt from 'hash-int';

class PseudoRandom {
  constructor(initialSeed) {
    this.seed = initialSeed;
  }

  _generateInt(min, max, seed) {
    const newSeed = hashInt(seed);
    return min + (newSeed % (max - min));
  }

  _run(method, ...args) {
    this.seed = hashInt(this.seed);

    return method(...args, this.seed);
  }

  binaryTreeRandom(probability, length) {
    if (length === 1) {
      return 0;
    }

    const randomValue = this._run(this._generateInt.bind(this), 0, 100);

    if (randomValue < probability) {
      return 0;
    }

    return 1 + this.binaryTreeRandom(probability, length - 1);
  }
}

const create = (seed) => {
  return new PseudoRandom(seed);
};

export { create };
