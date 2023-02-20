import Tube from '../../../../lib/domain/models/Tube';
import { expect, domainBuilder } from '../../../test-helper';

describe('Unit | Domain | Models | Tube', function () {
  describe('#constructor', function () {
    it('should have a name from skills', function () {
      // given
      const skills = [domainBuilder.buildSkill({ name: '@web3' }), domainBuilder.buildSkill({ name: '@web2' })];

      // when
      const tube = new Tube({ skills });

      // then
      expect(tube.name).to.equal('web');
    });

    it('should have a name from constructor', function () {
      // given
      const skills = [domainBuilder.buildSkill({ name: '@web3' })];

      // when
      const tube = new Tube({ skills, name: 'tubeName' });

      // then
      expect(tube.name).to.equal('tubeName');
    });

    it('should not have a name when skills list is empty and name is not provided', function () {
      // when
      const tube = new Tube({});

      // then
      expect(tube.name).to.equal('');
    });
  });

  describe('#getEasierThan()', function () {
    it('should return the skill itself if it is alone within its tube', function () {
      // given
      const skill = domainBuilder.buildSkill({ name: '@url', difficulty: 1 });
      const skills = [skill];
      const tube = domainBuilder.buildTube({ skills });

      // when
      const easierSkills = tube.getEasierThan(skill);

      // then
      expect(easierSkills).to.be.deep.equal(skills);
    });

    it('should return url1 and url3 when requesting skills easier than url3 within url1-3-5', function () {
      // given
      const url1 = domainBuilder.buildSkill({ name: '@url1', difficulty: 1 });
      const url3 = domainBuilder.buildSkill({ name: '@url3', difficulty: 3 });
      const url5 = domainBuilder.buildSkill({ name: '@url5', difficulty: 5 });
      const skills = [url1, url3, url5];
      const tube = domainBuilder.buildTube({ skills });

      // when
      const easierSkills = tube.getEasierThan(url3);

      // then
      expect(easierSkills).to.be.deep.equal([url1, url3]);
    });
  });

  describe('#getHarderThan()', function () {
    it('should return the skill itself if it is alone within its tube', function () {
      // given
      const skill = domainBuilder.buildSkill({ name: '@url', difficulty: 1 });
      const skills = [skill];
      const tube = domainBuilder.buildTube({ skills });

      // when
      const easierSkills = tube.getHarderThan(skill);

      // then
      expect(easierSkills).to.be.deep.equal(skills);
    });

    it('should return url3 and url5 when requesting skills harder than url3 within url1-3-5', function () {
      // given
      const url1 = domainBuilder.buildSkill({ name: '@url1', difficulty: 1 });
      const url3 = domainBuilder.buildSkill({ name: '@url3', difficulty: 3 });
      const url5 = domainBuilder.buildSkill({ name: '@url5', difficulty: 5 });
      const skills = [url1, url3, url5];
      const tube = domainBuilder.buildTube({ skills });

      // when
      const easierSkills = tube.getHarderThan(url3);

      // then
      expect(easierSkills).to.be.deep.equal([url3, url5]);
    });
  });

  describe('#addSkill()', function () {
    it('should add skill to the list of skills', function () {
      // given
      const skillWeb1 = domainBuilder.buildSkill({ name: '@web1' });
      const skillWeb2 = domainBuilder.buildSkill({ name: '@web2' });
      const tube = domainBuilder.buildTube({ skills: [skillWeb1] });

      // when
      tube.addSkill(skillWeb2);

      // then
      expect(tube.skills).to.be.deep.equal([skillWeb1, skillWeb2]);
    });

    it('should not add skill if skill is already present to the list of skills', function () {
      // given
      const skillWeb1 = domainBuilder.buildSkill({ name: '@web1' });
      const tube = domainBuilder.buildTube({ skills: [skillWeb1] });

      // when
      tube.addSkill(skillWeb1);

      // then
      expect(tube.skills).to.be.deep.equal([skillWeb1]);
    });
  });
});
