const { expect } = require('../../../test-helper');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Skill = require('../../../../lib/domain/models/Skill');

describe('Unit | Domain | Models | Challenge', () => {

  describe('#hasSkill', () => {

    it('should return false when the skill is not known', () => {
      // given
      const challenge = new Challenge();

      // when
      const result = challenge.hasSkill(new Skill('@recherche1'));

      // then
      expect(result).to.be.false;
    });

    it('should return true when the skill is known', () => {
      // given
      const challenge = new Challenge();
      challenge.skills.push(new Skill('@recherche1'));

      // when
      const result = challenge.hasSkill(new Skill('@recherche1'));

      // then
      expect(result).to.be.true;
    });
  });

  describe('#addSkill', () => {

    it('should add a skill', () => {
      // given
      const skill = new Skill('@web3');
      const challenge = new Challenge();

      // when
      challenge.addSkill(skill);

      // then
      expect(challenge.skills).to.have.lengthOf(1);
      expect(challenge.skills[0]).to.equal(skill);
    });

  });

  describe('#isPublished', () => {

    let challenge;

    beforeEach(() => {
      challenge = new Challenge();
    });

    [
      { status: 'validé', expectedResult: true },
      { status: 'validé sans test', expectedResult: true },
      { status: 'proposé', expectedResult: false },
      { status: 'pré-validé', expectedResult: true },
      { status: 'archive', expectedResult: false }
    ].forEach((testCase) => {
      it(`should return ${testCase.expectedResult} when the status is "${testCase.status}"`, () => {
        // given
        challenge.status = testCase.status;

        // when
        const result = challenge.isPublished();

        // then
        expect(result).to.equal(testCase.expectedResult);
      });
    });
  });

  describe('#hardestSkill', function() {
    it('should exist', function() {
      // given
      const url1 = new Skill({ name: '@url1' });
      const challenge = new Challenge();
      challenge.addSkill(url1);

      // then
      expect(challenge.hardestSkill).to.exist;
    });

    it('should be web5 if challenge requires url1 and web5', function() {
      // given
      const web5 = new Skill({ name: '@web5' });
      const url1 = new Skill({ name: '@url1' });
      const challenge = new Challenge();
      challenge.addSkill(url1);
      challenge.addSkill(web5);

      // then
      expect(challenge.hardestSkill).to.equal(web5);
    });
  });

});
