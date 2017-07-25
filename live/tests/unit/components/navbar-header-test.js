import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | Navar Header Component', function() {
  setupTest('component:navbar-header', {});

  describe('#isUserLogged', function() {
    [
      { given: '', expected: false },
      { given: ' ', expected: false },
      { given: null, expected: false },
      { given: undefined, expected: false },
      { given: { firstName: 'FHI' }, expected: true }
    ].forEach(({ given, expected }) => {
      it(`should return ${expected}, when "${given}" provided`, function() {
        // given
        const component = this.subject();
        // when
        component.set('user', given);
        // then
        expect(component.get('isUserLogged')).to.equal(expected);
      });

    });
  });
});
