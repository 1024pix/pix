import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | challenge statement', function() {

  setupTest();

  describe('[CP] #challengeEmbedDocument', function() {
    it('should return a JSON object with the challenge embedded document when the challenge has a valid one', function() {
      // given
      const challenge = EmberObject.create({
        hasValidEmbedDocument: true,
        embedUrl: 'https://challenge-embed.url',
        embedTitle: 'Challenge embed document title',
        embedHeight: 300,
        id: 'rec_123'
      });

      const component = createGlimmerComponent('component:challenge-statement', { challenge });

      // when
      const challengeEmbedDocument = component.challengeEmbedDocument;

      // then
      expect(challengeEmbedDocument).to.deep.equal({
        url: 'https://challenge-embed.url',
        title: 'Challenge embed document title',
        height: 300
      });
    });

    it('should return "undefined" when the challenge does not have a (valid) embedded document', function() {
      // given
      const challenge = EmberObject.create({
        hasValidEmbedDocument: false
      });

      const component = createGlimmerComponent('component:challenge-statement', { challenge });

      // when
      const challengeEmbedDocument = component.challengeEmbedDocument;

      // then
      expect(challengeEmbedDocument).to.be.undefined;
    });
  });

});
