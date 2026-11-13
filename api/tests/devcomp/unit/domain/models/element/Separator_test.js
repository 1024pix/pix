import { expect } from 'chai';

import { Separator } from '../../../../../../src/devcomp/domain/models/element/Separator.js';

describe('Unit | Devcomp | Domain | Models | Element | Separator', function () {
  describe('#constructor', function () {
    it('should create a separator and keep attributes', function () {
      // when
      const separator = new Separator({
        id: 'id',
      });

      // then
      expect(separator.id).to.equal('id');
      expect(separator.type).to.equal('separator');
    });
  });
});
