import { QAB } from '../../../../../../../src/devcomp/domain/models/element/qab/QAB.js';
import { QABCard } from '../../../../../../../src/devcomp/domain/models/element/qab/QABCard.js';

describe('Unit | Devcomp | Domain | Models | Element | QAB', function () {
  describe('#constructor', function () {
    it('should instanciate a QAB with right properties', function () {
      // Given & When
      const qab = new QAB({
        id: 'a4e36fa9-dc56-4fd3-a7f2-708cf94b1728',
        type: 'qab',
        instruction: 'instruction',
        cards: [
          {
            id: 'f2a601fa-a5a2-4c75-90bf-74977acb89b4',
            image: {
              url: 'https://assets.pix.org/jambes.png',
              altText: 'Des jambes',
            },
            text: 'Un texte',
            proposalA: 'Vrai',
            proposalB: 'Faux',
            solution: 'B',
          },
          {
            id: '5b8b0820-f3f4-4566-b9b4-fcfb2228908e',
            image: {
              url: '',
              altText: '',
            },
            text: 'Un autre texte',
            proposalA: 'Vrai',
            proposalB: 'Faux',
            solution: 'A',
          },
        ],
        feedback: {
          diagnosis: '<p>Continuez comme ça !</p>',
        },
      });

      // Then
      expect(qab.id).equal('a4e36fa9-dc56-4fd3-a7f2-708cf94b1728');
      expect(qab.type).equal('qab');
      expect(qab.instruction).equal('instruction');
      expect(qab.isAnswerable).equal(true);
      expect(qab.cards).deep.equal([
        new QABCard({
          id: 'f2a601fa-a5a2-4c75-90bf-74977acb89b4',
          image: {
            url: 'https://assets.pix.org/jambes.png',
            altText: 'Des jambes',
          },
          text: 'Un texte',
          proposalA: 'Vrai',
          proposalB: 'Faux',
          solution: 'B',
        }),
        new QABCard({
          id: '5b8b0820-f3f4-4566-b9b4-fcfb2228908e',
          image: {
            url: '',
            altText: '',
          },
          text: 'Un autre texte',
          proposalA: 'Vrai',
          proposalB: 'Faux',
          solution: 'A',
        }),
      ]);
      expect(qab.feedback).deep.equal({
        diagnosis: '<p>Continuez comme ça !</p>',
      });
    });
  });
});
