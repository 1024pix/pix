import { ComponentElement } from '../../../../../src/devcomp/domain/models/component/ComponentElement.js';
import { ComponentStepper } from '../../../../../src/devcomp/domain/models/component/ComponentStepper.js';
import { Step } from '../../../../../src/devcomp/domain/models/component/Step.js';
import { Text } from '../../../../../src/devcomp/domain/models/element/Text.js';
import { Grain } from '../../../../../src/devcomp/domain/models/Grain.js';
import { Details } from '../../../../../src/devcomp/domain/models/module/Details.js';
import { Glossary } from '../../../../../src/devcomp/domain/models/module/Glossary.js';
import { Module } from '../../../../../src/devcomp/domain/models/module/Module.js';
import { Section } from '../../../../../src/devcomp/domain/models/module/Section.js';
import { highlightGlossaryWords } from '../../../../../src/devcomp/domain/services/GlossaryHighlighter.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Services | GlossaryHighlighter', function () {
  describe('#highlightGlossaryWords', function () {
    function buildModuleWithTextElement({ glossary, textContent }) {
      const textElement = new Text({ id: 'text-1', content: textContent, tag: ' ' });
      const component = new ComponentElement({ element: textElement });
      const grain = new Grain({ id: 'grain-1', title: 'Grain', components: [component] });
      const section = new Section({ id: 'section-1', type: 'question-yourself', grains: [grain] });
      const details = new Details({
        image: 'https://example.org/image.svg',
        description: '<p>desc</p>',
        duration: 5,
        level: 'novice',
        tabletSupport: 'comfortable',
        objectives: ['objectif'],
      });
      return new Module({
        id: 'module-1',
        shortId: 'ab12cd34',
        slug: 'test-module',
        title: 'Test',
        isBeta: false,
        sections: [section],
        details,
        version: 2,
        visibility: 'public',
        glossary,
      });
    }

    describe('when the module has no glossary', function () {
      it('should return the module unchanged', function () {
        // given
        const module = buildModuleWithTextElement({ glossary: [], textContent: '<p>Le chat ronronne.</p>' });

        // when
        highlightGlossaryWords(module);

        // then
        const content = module.sections[0].grains[0].components[0].element.content;
        expect(content).to.equal('<p>Le chat ronronne.</p>');
      });
    });

    describe('when the module has a glossary', function () {
      it('should wrap a matching word in a glossary button', function () {
        // given
        const glossary = [new Glossary({ word: 'chat', definition: '<p>Animal.</p>' })];
        const module = buildModuleWithTextElement({ glossary, textContent: '<p>Le chat ronronne.</p>' });

        // when
        highlightGlossaryWords(module);

        // then
        const content = module.sections[0].grains[0].components[0].element.content;
        expect(content).to.equal('<p>Le <button class="module-glossary-word">chat</button> ronronne.</p>');
      });

      it('should replace all occurrences of the word', function () {
        // given
        const glossary = [new Glossary({ word: 'chat', definition: '<p>Animal.</p>' })];
        const module = buildModuleWithTextElement({
          glossary,
          textContent: '<p>Le chat aime le chat.</p>',
        });

        // when
        highlightGlossaryWords(module);

        // then
        const content = module.sections[0].grains[0].components[0].element.content;
        expect(content).to.equal(
          '<p>Le <button class="module-glossary-word">chat</button> aime le <button class="module-glossary-word">chat</button>.</p>',
        );
      });

      it('should replace all glossary words in the same content', function () {
        // given
        const glossary = [
          new Glossary({ word: 'chat', definition: '<p>Animal.</p>' }),
          new Glossary({ word: 'ronron', definition: '<p>Son du chat.</p>' }),
        ];
        const module = buildModuleWithTextElement({
          glossary,
          textContent: '<p>Le chat fait ronron.</p>',
        });

        // when
        highlightGlossaryWords(module);

        // then
        const content = module.sections[0].grains[0].components[0].element.content;
        expect(content).to.equal(
          '<p>Le <button class="module-glossary-word">chat</button> fait <button class="module-glossary-word">ronron</button>.</p>',
        );
      });

      it('should be case-insensitive', function () {
        // given
        const glossary = [new Glossary({ word: 'chat', definition: '<p>Animal.</p>' })];
        const module = buildModuleWithTextElement({ glossary, textContent: '<p>Le Chat ronronne.</p>' });

        // when
        highlightGlossaryWords(module);

        // then
        const content = module.sections[0].grains[0].components[0].element.content;
        expect(content).to.equal('<p>Le <button class="module-glossary-word">Chat</button> ronronne.</p>');
      });

      it('should not replace partial word matches', function () {
        // given
        const glossary = [new Glossary({ word: 'chat', definition: '<p>Animal.</p>' })];
        const module = buildModuleWithTextElement({ glossary, textContent: '<p>Le chaton est mignon.</p>' });

        // when
        highlightGlossaryWords(module);

        // then
        const content = module.sections[0].grains[0].components[0].element.content;
        expect(content).to.equal('<p>Le chaton est mignon.</p>');
      });

      it('should not replace text inside HTML tags', function () {
        // given
        const glossary = [new Glossary({ word: 'chat', definition: '<p>Animal.</p>' })];
        const module = buildModuleWithTextElement({
          glossary,
          textContent: '<p class="chat">Voici un animal.</p>',
        });

        // when
        highlightGlossaryWords(module);

        // then
        const content = module.sections[0].grains[0].components[0].element.content;
        expect(content).to.equal('<p class="chat">Voici un animal.</p>');
      });

      it('should escape special regex characters in glossary words', function () {
        // given
        const glossary = [new Glossary({ word: 'C++', definition: '<p>Langage.</p>' })];
        const module = buildModuleWithTextElement({
          glossary,
          textContent: '<p>Le langage C++ est puissant.</p>',
        });

        // when
        highlightGlossaryWords(module);

        // then
        const content = module.sections[0].grains[0].components[0].element.content;
        expect(content).to.equal('<p>Le langage <button class="module-glossary-word">C++</button> est puissant.</p>');
      });

      describe('when the text element is inside a stepper', function () {
        it('should also replace matching words', function () {
          // given
          const glossary = [new Glossary({ word: 'chat', definition: '<p>Animal.</p>' })];
          const textElement = new Text({ id: 'text-stepper', content: '<p>Le chat est là.</p>', tag: ' ' });
          const step = new Step({ elements: [textElement] });
          const stepperComponent = new ComponentStepper({ steps: [step], instruction: '<p>Instruction</p>' });
          const grain = new Grain({ id: 'grain-1', title: 'Grain', components: [stepperComponent] });
          const section = new Section({ id: 'section-1', type: 'question-yourself', grains: [grain] });
          const details = new Details({
            image: 'https://example.org/image.svg',
            description: '<p>desc</p>',
            duration: 5,
            level: 'novice',
            tabletSupport: 'comfortable',
            objectives: ['objectif'],
          });
          const module = new Module({
            id: 'module-1',
            shortId: 'ab12cd34',
            slug: 'test-module',
            title: 'Test',
            isBeta: false,
            sections: [section],
            details,
            version: 2,
            visibility: 'public',
            glossary,
          });

          // when
          highlightGlossaryWords(module);

          // then
          const content = module.sections[0].grains[0].components[0].steps[0].elements[0].content;
          expect(content).to.equal('<p>Le <button class="module-glossary-word">chat</button> est là.</p>');
        });
      });
    });
  });
});
