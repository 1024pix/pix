import { expect } from '../../test-helper.js';
import { buildForbiddenRules } from '../../tooling/dependency-cruiser-generator.js';

describe('Unit | Tooling | Dependency cruiser generator', function () {
  describe('Context dependency rules', function () {
    it('builds context dependency rule for contexts', function () {
      const contexts = [
        { name: 'shared', dependsOn: [] },
        { name: 'banner', dependsOn: ['shared'] },
      ];

      const rules = buildForbiddenRules(contexts);

      expect(rules).to.deep.equal([
        {
          name: 'shared-no-context',
          severity: 'error',
          from: { path: '^src/shared' },
          to: { path: '^src/(?!shared)' },
        },
        {
          name: 'banner-no-context',
          severity: 'error',
          from: { path: '^src/banner' },
          to: { path: '^src/(?!banner|shared)' },
        },
      ]);
    });
  });

  describe('Forbidden circular rule', function () {
    it('builds forbidden circular rule for contexts', function () {
      const contexts = [
        { name: 'shared', circular: 'forbidden' },
        { name: 'banner', circular: 'forbidden' },
      ];

      const rules = buildForbiddenRules(contexts);

      expect(rules).to.deep.equal([
        {
          name: 'no-circular',
          severity: 'error',
          from: { path: '^src/(banner|shared)/' },
          to: { circular: true },
        },
      ]);
    });

    it('does not builds forbidden circular rule if none defined', function () {
      const contexts = [{ name: 'shared' }, { name: 'banner' }];

      const rules = buildForbiddenRules(contexts);

      expect(rules).to.deep.equal([]);
    });
  });
});
