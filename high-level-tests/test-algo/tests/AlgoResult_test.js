const { expect } = require('chai');
const { describe, it } = require('mocha');
const AlgoResult = require('../AlgoResult');

describe('AlgoResult', () => {

  describe('#skillNames', () => {
    it('should return unique names of the skills', () => {
      // given
      const algoResult = new AlgoResult();
      const challenge1 = { skills: [{ name: 'skill1' }] };
      const challenge2 = { skills: [{ name: 'skill2' }] };
      const challenge3 = { skills: [{ name: 'skill2' }] };
      algoResult.addChallenge(challenge1);
      algoResult.addChallenge(challenge2);
      algoResult.addChallenge(challenge3);

      // when
      const skillNames = algoResult.skillNames;

      // expect
      expect(skillNames).to.be.deep.equal(new Set(['skill1', 'skill2']));
    });
  });
});
