import { expect } from 'chai';

import { Section } from '../../../../../../src/devcomp/domain/models/module/Section.js';

describe('Unit | Devcomp | Domain | Models | Module | Section', function () {
  describe('#constructor', function () {
    it('should create a section and keep attributes', function () {
      // given
      const id = 1;
      const type = 'practise';
      const grains = [Symbol('text')];

      // when
      const section = new Section({ id, type, grains });

      // then
      expect(section.id).to.equal(id);
      expect(section.type).to.equal(type);
      expect(section.grains).to.have.lengthOf(grains.length);
    });
  });
});
