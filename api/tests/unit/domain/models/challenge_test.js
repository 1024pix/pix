const { expect } = require('../../../test-helper');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Skill = require('../../../../lib/domain/models/Skill');

describe('Unit | Domain | Models | Challenge', () => {

  describe('#hasSkill', () => {

    it('should return false when the skill is not known', () => {
      // Given
      const challenge = new Challenge();

      // When
      const result = challenge.hasSkill(new Skill('@recherche1'));

      // Then
      expect(result).to.be.false;
    });

    it('should return true when the skill is known', () => {
      // Given
      const challenge = new Challenge();
      challenge.skills.push(new Skill('@recherche1'));

      // When
      const result = challenge.hasSkill(new Skill('@recherche1'));

      // Then
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

});
