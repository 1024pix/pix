import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | modulix-glossary', function (hooks) {
  setupTest(hooks);

  module('getDefinition', function () {
    test('it returns the definition of a glossary word', function (assert) {
      // given
      const modulixGlossary = this.owner.lookup('service:modulix-glossary');
      modulixGlossary.setEntries([{ words: ['chat'], definition: 'Un félin' }]);

      // when
      const definition = modulixGlossary.getDefinition('chat');

      // then
      assert.strictEqual(definition, 'Un félin');
    });

    test('it returns the same definition for every word of a glossary entry', function (assert) {
      // given
      const modulixGlossary = this.owner.lookup('service:modulix-glossary');
      modulixGlossary.setEntries([{ words: ['chat', 'chats', 'chaton'], definition: 'Un félin' }]);

      // when
      const definitions = ['chat', 'chats', 'chaton'].map((word) => modulixGlossary.getDefinition(word));

      // then
      assert.deepEqual(definitions, ['Un félin', 'Un félin', 'Un félin']);
    });

    test('it returns undefined when glossary is missing', function (assert) {
      // given
      const modulixGlossary = this.owner.lookup('service:modulix-glossary');
      modulixGlossary.setEntries(undefined);

      // when
      const definition = modulixGlossary.getDefinition('chat');

      // then
      assert.strictEqual(definition, undefined);
    });
  });

  module('open / close', function () {
    test('it keeps only one opened term', function (assert) {
      // given
      const modulixGlossary = this.owner.lookup('service:modulix-glossary');
      modulixGlossary.open('term-1');

      // when
      modulixGlossary.open('term-2');

      // then
      assert.false(modulixGlossary.isOpened('term-1'));
      assert.true(modulixGlossary.isOpened('term-2'));
    });

    test('it does not close another opened term', function (assert) {
      // given
      const modulixGlossary = this.owner.lookup('service:modulix-glossary');
      modulixGlossary.open('term-2');

      // when
      modulixGlossary.close('term-1');

      // then
      assert.true(modulixGlossary.isOpened('term-2'));
    });
  });
});
