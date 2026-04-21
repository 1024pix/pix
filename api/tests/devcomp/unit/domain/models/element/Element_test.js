import { Image } from '../../../../../../src/devcomp/domain/models/element/Image.js';
import { QCM } from '../../../../../../src/devcomp/domain/models/element/QCM.js';
import { QCU } from '../../../../../../src/devcomp/domain/models/element/QCU.js';
import { QROCM } from '../../../../../../src/devcomp/domain/models/element/QROCM.js';
import { Text } from '../../../../../../src/devcomp/domain/models/element/Text.js';

describe('Unit | Devcomp | Domain | Models | Element', function () {
  describe('#isAnswerable', function () {
    it('should instanciate answerable elements', function () {
      // Given
      const qcu = new QCU({
        id: '123',
        instruction: 'instruction',
        locales: ['fr-FR'],
        proposals: [Symbol('proposal1'), Symbol('proposal2')],
        solution: 'proposal1',
      });

      const qcmProposal1 = Symbol('proposal1');
      const qcm = new QCM({
        id: '1',
        instruction: '',
        locales: ['fr-FR'],
        proposals: [{ id: qcmProposal1 }],
        feedbacks: { valid: '', invalid: '' },
        solutions: [qcmProposal1],
      });

      const qrocm = new QROCM({
        id: '1',
        instruction: '',
        locales: ['fr-FR'],
        proposals: [Symbol('block')],
        feedbacks: { valid: '', invalid: '' },
      });

      const answerableElements = [qcu, qcm, qrocm];

      // Then
      answerableElements.forEach((element) => expect(element.isAnswerable).to.be.true);
    });

    it('should instanciate non answerable elements', function () {
      // Given
      const text = new Text({ id: 'id', content: 'content', tag: ' ' });
      const image = new Image({
        id: 'id',
        url: 'https://assets.pix.org/modules/placeholder-details.svg',
        alt: 'alt',
        alternativeText: 'alternativeText',
      });

      const nonAnswerableElements = [text, image];

      // Then
      nonAnswerableElements.forEach((element) => expect(element.isAnswerable).to.be.false);
    });
  });
});
