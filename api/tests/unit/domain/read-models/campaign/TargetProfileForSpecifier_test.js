const { expect, domainBuilder } = require('../../../../test-helper');
const TargetProfileForSpecifier = require('../../../../../lib/domain/read-models/campaign/TargetProfileForSpecifier');

describe('TargetProfileForSpecifier', function () {
  describe('#tubeCount', function () {
    it('returns the number of tubes', function () {
      const skills = [
        domainBuilder.buildSkill({ tubeId: 'tube1' }),
        domainBuilder.buildSkill({ tubeId: 'tube1' }),
        domainBuilder.buildSkill({ tubeId: 'tube2' }),
      ];

      const targetProfile = new TargetProfileForSpecifier({
        id: 1,
        name: 'name',
        skills: skills,
        thematicResults: [],
        hasStage: true,
        description: null,
      });

      expect(targetProfile.tubeCount).to.equal(2);
    });
  });

  describe('#thematicResultCount', function () {
    it('returns the number of thematic result', function () {
      const thematicResults = [domainBuilder.buildBadge(), domainBuilder.buildBadge()];
      const targetProfile = new TargetProfileForSpecifier({
        id: 1,
        name: 'name',
        skills: [],
        thematicResults,
        hasStage: true,
        description: null,
      });

      expect(targetProfile.thematicResultCount).to.equal(2);
    });
  });

  describe('#hasStage', function () {
    context('when hasStage is true', function () {
      it('returns true', function () {
        const targetProfile = new TargetProfileForSpecifier({
          id: 1,
          name: 'name',
          skills: [],
          thematicResults: [],
          hasStage: true,
          description: null,
        });

        expect(targetProfile.hasStage).to.equal(true);
      });
    });

    context('when hasStage is false', function () {
      it('returns false', function () {
        const targetProfile = new TargetProfileForSpecifier({
          id: 1,
          name: 'name',
          skills: [],
          thematicResults: [],
          hasStage: false,
          description: null,
        });

        expect(targetProfile.hasStage).to.equal(false);
      });
    });
  });

  describe('#name', function () {
    it('returns the name', function () {
      const targetProfile = new TargetProfileForSpecifier({
        id: 1,
        name: 'name',
        skills: [],
        thematicResults: [],
        hasStage: false,
        description: 'description',
      });

      expect(targetProfile.name).to.equal('name');
    });
  });

  describe('#description', function () {
    it('returns the description', function () {
      const targetProfile = new TargetProfileForSpecifier({
        id: 1,
        name: 'name',
        skills: [],
        thematicResults: [],
        hasStage: false,
        description: 'description',
      });

      expect(targetProfile.description).to.equal('description');
    });
  });

  describe('#category', function () {
    it('returns the category', function () {
      const targetProfile = new TargetProfileForSpecifier({
        id: 1,
        name: 'name',
        skills: [],
        thematicResults: [],
        hasStage: false,
        description: 'description',
        category: 'SUBJECT',
      });

      expect(targetProfile.category).to.equal('SUBJECT');
    });
  });
});
