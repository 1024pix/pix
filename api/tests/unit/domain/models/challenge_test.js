const { describe, it, expect } = require('../../../test-helper');
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

});
