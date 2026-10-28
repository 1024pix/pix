import { expect } from 'chai';

import { markGlossaryWords } from '../../../../../src/devcomp/domain/services/glossary-service.js';

describe('Unit | Devcomp | Domain | Services | glossary-service', function () {
  describe('#markGlossaryWords', function () {
    it('should return module untouched when glossary is empty', function () {
      // given
      const module = _buildModule({ glossary: [], elements: [{ type: 'text', content: '<p>Un chat</p>' }] });

      // when
      markGlossaryWords(module);

      // then
      expect(_firstElement(module).content).to.equal('<p>Un chat</p>');
    });

    it('should mark every occurrence of glossary words in text content', function () {
      // given
      const module = _buildModule({
        glossary: [{ word: 'chat', definition: 'Un félin' }],
        elements: [{ type: 'text', content: '<p>Un chat et un autre chat</p>' }],
      });

      // when
      markGlossaryWords(module);

      // then
      expect(_firstElement(module).content).to.equal(
        '<p>Un <span data-glossary-word="chat">chat</span> et un autre <span data-glossary-word="chat">chat</span></p>',
      );
    });

    it('should match case-insensitively and keep the glossary word as marker value', function () {
      // given
      const module = _buildModule({
        glossary: [{ word: 'réseau', definition: 'Des machines reliées' }],
        elements: [{ type: 'text', content: '<p>Réseau et RÉSEAU</p>' }],
      });

      // when
      markGlossaryWords(module);

      // then
      expect(_firstElement(module).content).to.equal(
        '<p><span data-glossary-word="réseau">Réseau</span> et <span data-glossary-word="réseau">RÉSEAU</span></p>',
      );
    });

    it('should only match whole words, including accented ones', function () {
      // given
      const module = _buildModule({
        glossary: [
          { word: 'clé', definition: 'Un objet' },
          { word: 'chat', definition: 'Un félin' },
        ],
        elements: [{ type: 'text', content: '<p>clés, clé. chaton, chats, chat</p>' }],
      });

      // when
      markGlossaryWords(module);

      // then
      expect(_firstElement(module).content).to.equal(
        '<p>clés, <span data-glossary-word="clé">clé</span>. chaton, chats, <span data-glossary-word="chat">chat</span></p>',
      );
    });

    it('should prefer the longest glossary word', function () {
      // given
      const module = _buildModule({
        glossary: [
          { word: 'réseau', definition: 'Des machines reliées' },
          { word: 'réseau social', definition: 'Une plateforme' },
        ],
        elements: [{ type: 'text', content: '<p>Un réseau social</p>' }],
      });

      // when
      markGlossaryWords(module);

      // then
      expect(_firstElement(module).content).to.equal(
        '<p>Un <span data-glossary-word="réseau social">réseau social</span></p>',
      );
    });

    it('should not mark words in tag attributes, links or buttons', function () {
      // given
      const module = _buildModule({
        glossary: [{ word: 'chat', definition: 'Un félin' }],
        elements: [
          {
            type: 'text',
            content: '<p title="chat"><a href="/chat">Mon <strong>chat</strong></a> <button>chat</button> chat</p>',
          },
        ],
      });

      // when
      markGlossaryWords(module);

      // then
      expect(_firstElement(module).content).to.equal(
        '<p title="chat"><a href="/chat">Mon <strong>chat</strong></a> <button>chat</button> <span data-glossary-word="chat">chat</span></p>',
      );
    });

    it('should mark words in instructions of elements and steppers', function () {
      // given
      const glossary = [{ word: 'chat', definition: 'Un félin' }];
      const qcu = { type: 'qcu', instruction: '<p>Le chat ?</p>', proposals: [{ content: 'chat' }] };
      const stepperElement = { type: 'qcm', instruction: '<p>Quel chat ?</p>' };
      const stepper = { type: 'stepper', instruction: '<p>Un chat</p>', steps: [{ elements: [stepperElement] }] };
      const module = {
        glossary,
        sections: [{ grains: [{ components: [{ type: 'element', element: qcu }, stepper] }] }],
      };

      // when
      markGlossaryWords(module);

      // then
      expect(qcu.instruction).to.equal('<p>Le <span data-glossary-word="chat">chat</span> ?</p>');
      expect(qcu.proposals[0].content).to.equal('chat');
      expect(stepper.instruction).to.equal('<p>Un <span data-glossary-word="chat">chat</span></p>');
      expect(stepperElement.instruction).to.equal('<p>Quel <span data-glossary-word="chat">chat</span> ?</p>');
    });

    it('should mark words in feedback diagnoses of elements, feedbacks and proposals', function () {
      // given
      const glossary = [{ word: 'chat', definition: 'Un félin' }];
      const qcmDeclarative = { type: 'qcm-declarative', feedback: { diagnosis: '<p>Un chat</p>' } };
      const qcm = {
        type: 'qcm',
        feedbacks: {
          valid: { state: 'Correct chat', diagnosis: '<p>Bravo chat</p>' },
          invalid: { state: 'Faux', diagnosis: '<p>Raté chat</p>' },
        },
      };
      const qcuDeclarative = {
        type: 'qcu-declarative',
        proposals: [{ content: 'chat', feedback: { diagnosis: '<p>Le chat</p>' } }],
      };
      const module = _buildModule({ glossary, elements: [qcmDeclarative, qcm, qcuDeclarative] });

      // when
      markGlossaryWords(module);

      // then
      expect(qcmDeclarative.feedback.diagnosis).to.equal('<p>Un <span data-glossary-word="chat">chat</span></p>');
      expect(qcm.feedbacks.valid).to.deep.equal({
        state: 'Correct chat',
        diagnosis: '<p>Bravo <span data-glossary-word="chat">chat</span></p>',
      });
      expect(qcm.feedbacks.invalid.diagnosis).to.equal('<p>Raté <span data-glossary-word="chat">chat</span></p>');
      expect(qcuDeclarative.proposals[0].content).to.equal('chat');
      expect(qcuDeclarative.proposals[0].feedback.diagnosis).to.equal(
        '<p>Le <span data-glossary-word="chat">chat</span></p>',
      );
    });

    it('should not mutate original feedback objects', function () {
      // given
      const originalFeedback = { diagnosis: '<p>Un chat</p>' };
      const element = { type: 'qcu', proposals: [{ content: 'Oui', feedback: originalFeedback }] };
      const module = _buildModule({ glossary: [{ word: 'chat', definition: 'Un félin' }], elements: [element] });

      // when
      markGlossaryWords(module);

      // then
      expect(originalFeedback.diagnosis).to.equal('<p>Un chat</p>');
      expect(element.proposals[0].feedback).not.to.equal(originalFeedback);
    });
  });
});

function _buildModule({ glossary, elements }) {
  return {
    glossary,
    sections: [{ grains: [{ components: elements.map((element) => ({ type: 'element', element })) }] }],
  };
}

function _firstElement(module) {
  return module.sections[0].grains[0].components[0].element;
}
