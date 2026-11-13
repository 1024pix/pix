import { expect } from 'chai';

import { Grain } from '../../../../../src/devcomp/domain/models/Grain.js';

describe('Unit | Devcomp | Domain | Models | Grain', function () {
  describe('#constructor', function () {
    it('should create a grain and keep attributes', function () {
      // given
      const id = 1;
      const title = 'Les adresses email';
      const components = [Symbol('component')];

      // when
      const grain = new Grain({ id, title, components });

      // then
      expect(grain.id).to.equal(id);
      expect(grain.title).to.equal(title);
      expect(grain.components).to.have.lengthOf(components.length);
    });

    describe('if a grain does not have components', function () {
      it('should not throw an error', function () {
        expect(() => new Grain({ id: 1, title: 'Les adresses mail', components: [] })).not.to.throw();
      });
    });
  });
});
