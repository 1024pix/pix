import { Grain } from '../../../../../src/devcomp/domain/models/Grain.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Grain', function () {
  describe('#constructor', function () {
    it('should create a grain and keep attributes', function () {
      // when
      const grain = new Grain({ id: 'id', title: 'title', description: 'description' });

      // then
      expect(grain.id).to.equal('id');
      expect(grain.title).to.equal('title');
      expect(grain.description).to.equal('description');
    });
  });
});
