import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | challenge statement', function () {
  setupTest();

  describe('[CP] #challengeEmbedDocument', function () {
    it('should return a JSON object with the challenge embedded document when the challenge has a valid one', function () {
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
      expect(challengeEmbedDocument).to.deep.equal({
        url: 'https://challenge-embed.url',
        title: 'Challenge embed document title',
        height: 300,
      });
    });

    it('should return "undefined" when the challenge does not have a (valid) embedded document', function () {
      // given
      const challenge = EmberObject.create({
        hasValidEmbedDocument: false,
      });

      const component = createGlimmerComponent('component:challenge-statement', { challenge });

      // when
      const challengeEmbedDocument = component.challengeEmbedDocument;

      // then
      expect(challengeEmbedDocument).to.be.undefined;
    });
  });

  describe('#orderedAttachments', () => {
    it('should return empty array if no attachments', () => {
      // given
      const challenge = EmberObject.create({});
      const component = createGlimmerComponent('component:challenge-statement', { challenge });

      // when
      const orderedAttachments = component.orderedAttachments;

      // then
      expect(orderedAttachments.length).to.equal(0);
    });

    it('should return files using the preferred formats first, then the others', () => {
      // given
      const attachments = ['https://dl.airtable.com/test.odp', 'https://dl.airtable.com/test.docx'];
      const challenge = EmberObject.create({ attachments });
      const component = createGlimmerComponent('component:challenge-statement', { challenge });

      // when
      const orderedAttachments = component.orderedAttachments;

      // then
      expect(orderedAttachments.length).to.equal(attachments.length);
      expect(orderedAttachments[0]).to.contains('docx');
      expect(orderedAttachments[1]).to.contains('odp');
    });

    it('should return the attachments ordered alphabetically in each group', () => {
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
      expect(orderedAttachments.length).to.equal(attachments.length);
      expect(orderedAttachments[0]).to.contain('docx');
      expect(orderedAttachments[1]).to.contain('pptx');
      expect(orderedAttachments[2]).to.contain('odp');
      expect(orderedAttachments[3]).to.contain('ods');
    });
  });
});
