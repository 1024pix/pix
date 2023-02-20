import { expect } from '../../../test-helper';
import Competence from '../../../../lib/domain/models/Competence';

describe('Unit | Domain | Models | Competence', function () {
  describe('@reference', function () {
    it('should return the concatenation of competence index and name', function () {
      // given
      const competence = new Competence({ index: '1.1', name: "Mener une recherche et une veille d'information" });

      // when
      const result = competence.reference;

      // then
      expect(result).to.equal("1.1 Mener une recherche et une veille d'information");
    });
  });
});
