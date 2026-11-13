import { expect } from 'chai';

import { Expand } from '../../../../../../src/devcomp/domain/models/element/Expand.js';

describe('Unit | Devcomp | Domain | Models | Element | Expand', function () {
  describe('#constructor', function () {
    it('should create a valid Expand object', function () {
      // given
      const attributes = {
        id: '39f28a81-290c-440c-b8b9-1762112fbde3',
        content: '<p> My Content </p>',
        title: 'Expand title',
      };

      // when
      const result = new Expand(attributes);

      // then
      expect(result.id).to.equal(attributes.id);
      expect(result.content).to.equal(attributes.content);
      expect(result.title).to.equal(attributes.title);
      expect(result.type).to.equal('expand');
    });
  });
});
