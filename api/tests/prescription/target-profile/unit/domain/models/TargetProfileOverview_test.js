import { TargetProfileOverview } from '../../../../../../src/prescription/target-profile/domain/models/TargetProfileOverview.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Prescription | Domain | Models | TargetProfileOverview', function () {
  let framework;

  beforeEach(function () {
    framework = domainBuilder.buildFramework({
      id: 'framework1',
      areas: [
        domainBuilder.buildArea({
          id: 'area1',
          competences: [
            domainBuilder.buildCompetence({
              id: 'comp1',
              tubes: [
                domainBuilder.buildTube({
                  id: 'tube1.1',
                  skills: [domainBuilder.buildSkill({ difficulty: 2 }), domainBuilder.buildSkill({ difficulty: 1 })],
                }),
              ],
            }),
            domainBuilder.buildCompetence({
              id: 'comp2',
              tubes: [
                domainBuilder.buildTube({
                  id: 'tube2.1',
                  skills: [domainBuilder.buildSkill({ difficulty: 2 }), domainBuilder.buildSkill({ difficulty: 4 })],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  describe('#constructor', function () {
    it('initializes targetProfile overview properties', function () {
      // given & when
      const badge = domainBuilder.buildBadge();
      const targetProfile = new TargetProfileOverview({
        id: 'id',
        badges: [badge],
        category: 'category',
        description: 'description',
        imageUrl: 'imageUrl',
        internalName: 'internalName',
        isSimplifiedAccess: 'isSimplifiedAccess',
        name: 'name',
        outdated: 'outdated',
        frameworks: [framework],
      });

      // then
      expect(targetProfile).deep.equal({
        id: 'id',
        badges: [badge],
        category: 'category',
        description: 'description',
        imageUrl: 'imageUrl',
        internalName: 'internalName',
        isSimplifiedAccess: 'isSimplifiedAccess',
        name: 'name',
        outdated: 'outdated',
        frameworks: [framework],
      });
    });
  });

  describe('#level', function () {
    it('returns 0 if no tubes', function () {
      const targetProfile = new TargetProfileOverview({
        id: 'id',
        category: 'category',
        description: 'description',
        estimatedTime: 4,
        imageUrl: 'imageUrl',
        internalName: 'internalName',
        isSimplifiedAccess: 'isSimplifiedAccess',
        name: 'name',
        outdated: 'outdated',
      });
      expect(targetProfile.level).equal(0);
    });

    it('returns average tubes level', function () {
      const targetProfile = new TargetProfileOverview({
        id: 'id',
        category: 'category',
        description: 'description',
        estimatedTime: 4,
        imageUrl: 'imageUrl',
        internalName: 'internalName',
        isSimplifiedAccess: 'isSimplifiedAccess',
        name: 'name',
        outdated: 'outdated',
        frameworks: [framework],
      });
      expect(targetProfile.level).equal(3);
    });
  });
});
