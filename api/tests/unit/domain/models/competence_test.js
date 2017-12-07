const { describe, it, expect } = require('../../../test-helper');
const Competence = require('../../../../lib/domain/models/Competence');

describe('Unit | Domain | Models | Competence', () => {

  describe('@reference', () => {

    it('should return the concatenation of competence index and name', () => {
      // given
      const competence = new Competence({ index: '1.1', name: 'Mener une recherche et une veille d\'information' });

      // when
      const result = competence.reference;

      // then
      expect(result).to.equal('1.1 Mener une recherche et une veille d\'information');
    });
  });
});
