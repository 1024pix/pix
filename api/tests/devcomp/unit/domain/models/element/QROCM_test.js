import { expect } from 'chai';

import { QROCM } from '../../../../../../src/devcomp/domain/models/element/QROCM.js';

describe('Unit | Devcomp | Domain | Models | Element | QROCM', function () {
  describe('#constructor', function () {
    it('should create a QROCM and keep attributes', function () {
      // given
      const proposal = Symbol('block');
      const feedbacks = { valid: Symbol('valid-feedback'), invalid: Symbol('invalid-feedback') };

      // when
      const qrocm = new QROCM({
        id: '1',
        instruction: '',
        locales: ['fr-FR'],
        proposals: [proposal],
        feedbacks,
      });

      // then
      expect(qrocm.id).to.equal('1');
      expect(qrocm.instruction).to.equal('');
      expect(qrocm.type).to.equal('qrocm');
      expect(qrocm.locales).to.deep.equal(['fr-FR']);
      expect(qrocm.proposals).to.deep.equal([proposal]);
    });
  });
});
