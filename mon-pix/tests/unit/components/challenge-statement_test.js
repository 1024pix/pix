import { module, test } from 'qunit';
import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | challenge statement', function (hooks) {
  setupTest(hooks);

  module('[CP] #challengeEmbedDocument', function () {
    test('should return a JSON object with the challenge embedded document when the challenge has a valid one', function (assert) {
      // given
      const challenge = EmberObject.create({
        hasValidEmbedDocument: true,
        embedUrl: 'https://challenge-embed.url',
        embedTitle: 'Challenge embed document title',
        embedHeight: 300,
        id: 'rec_123',
      });

      const component = createGlimmerComponent('component:challenge-statement', { challenge });

      // when
      const challengeEmbedDocument = component.challengeEmbedDocument;

      // then
      assert.deepEqual(challengeEmbedDocument, {
        url: 'https://challenge-embed.url',
        title: 'Challenge embed document title',
        height: 300,
      });
    });

    test('should return "undefined" when the challenge does not have a (valid) embedded document', function (assert) {
      // given
      const challenge = EmberObject.create({
        hasValidEmbedDocument: false,
      });

      const component = createGlimmerComponent('component:challenge-statement', { challenge });

      // when
      const challengeEmbedDocument = component.challengeEmbedDocument;

      // then
      assert.notOk(challengeEmbedDocument);
    });
  });

  module('#orderedAttachments', function () {
    test('should return empty array if no attachments', function (assert) {
      // given
      const challenge = EmberObject.create({});
      const component = createGlimmerComponent('component:challenge-statement', { challenge });

      // when
      const orderedAttachments = component.orderedAttachments;

      // then
      assert.strictEqual(orderedAttachments.length, 0);
    });

    test('should return files using the preferred formats first, then the others', function (assert) {
      // given
      const attachments = ['https://dl.airtable.com/test.odp', 'https://dl.airtable.com/test.docx'];
      const challenge = EmberObject.create({ attachments });
      const component = createGlimmerComponent('component:challenge-statement', { challenge });

      // when
      const orderedAttachments = component.orderedAttachments;

      // then
      assert.strictEqual(orderedAttachments.length, attachments.length);
      assert.ok(orderedAttachments[0].includes('docx'));
      assert.ok(orderedAttachments[1].includes('odp'));
    });

    test('should return the attachments ordered alphabetically in each group', function (assert) {
      // given
      const attachments = [
        'https://dl.airtable.com/test1.ods',
        'https://dl.airtable.com/test2.odp',
        'https://dl.airtable.com/test3.pptx',
        'https://dl.airtable.com/test6.docx',
      ];
      const challenge = EmberObject.create({ attachments });
      const component = createGlimmerComponent('component:challenge-statement', { challenge });

      // when
      const orderedAttachments = component.orderedAttachments;

      // then
      assert.strictEqual(orderedAttachments.length, attachments.length);
      assert.ok(orderedAttachments[0].includes('docx'));
      assert.ok(orderedAttachments[1].includes('pptx'));
      assert.ok(orderedAttachments[2].includes('odp'));
      assert.ok(orderedAttachments[3].includes('ods'));
    });
  });
});
