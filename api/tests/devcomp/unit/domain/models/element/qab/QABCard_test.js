import { QABCard } from '../../../../../../../src/devcomp/domain/models/element/qab/QABCard.js';

describe('Unit | Devcomp | Domain | Models | Element | QABCard', function () {
  describe('#constructor', function () {
    it('should instanciate a QABCard with right properties', function () {
      // Given & When
      const qabCard = new QABCard({
        id: 'f2a601fa-a5a2-4c75-90bf-74977acb89b4',
        image: {
          url: 'https://assets.pix.org/jambes.png',
          altText: 'Des jambes',
        },
        text: 'Un texte',
        proposalA: 'Vrai',
        proposalB: 'Faux',
        solution: 'B',
      });

      // Then
      expect(qabCard.id).equal('f2a601fa-a5a2-4c75-90bf-74977acb89b4');
      expect(qabCard.image).to.deep.equal({
        url: 'https://assets.pix.org/jambes.png',
        altText: 'Des jambes',
      });
      expect(qabCard.text).equal('Un texte');
      expect(qabCard.proposalA).equal('Vrai');
      expect(qabCard.proposalB).equal('Faux');
      expect(qabCard.solution).equal('B');
    });
  });
});
