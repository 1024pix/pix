import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | Challenge', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const model = store.createRecord('challenge');
    expect(model).to.be.ok;
  });

  describe('Computed property #hasAttachment', function() {

    it('Should be true when challenge has at least one attachment file', function() {
      run(() => {
        // given
        const challenge = store.createRecord('challenge', { attachments: ['file.url'] });

        // when
        const hasAttachment = challenge.get('hasAttachment');

        // then
        expect(hasAttachment).to.be.true;
      });

    });

    it('Should be false when challenge has multiple attachment files', function() {
      run(() => {
        // given
        const challenge = store.createRecord('challenge', { attachments: [] });

        // when
        const hasAttachment = challenge.get('hasAttachment');

        // then
        expect(hasAttachment).to.be.false;
      });
    });

  });

  describe('Computed property #hasSingleAttachment', function() {

    it('Should be true when challenge has only one attachment file', function() {
      run(() => {
        // given
        const challenge = store.createRecord('challenge', { attachments: ['file.url'] });

        // when
        const hasSingleAttachment = challenge.get('hasSingleAttachment');

        // then
        expect(hasSingleAttachment).to.be.true;
      });

    });

    it('Should be false when challenge has multiple attachment files', function() {
      run(() => {
        // given
        const challenge = store.createRecord('challenge', { attachments: ['file.url', 'file.1.url', 'file.2.url'] });

        // when
        const hasSingleAttachment = challenge.get('hasSingleAttachment');

        // then
        expect(hasSingleAttachment).to.be.false;
      });
    });

  });

  describe('Computed property #hasMultipleAttachments', function() {

    it('Should be false when challenge has no attachment file', function() {
      run(() => {
        // given
        const challenge = store.createRecord('challenge', { attachments: [] });

        // when
        const hasMultipleAttachments = challenge.get('hasMultipleAttachments');

        // then
        expect(hasMultipleAttachments).to.be.false;
      });

    });

    it('Should be false when challenge has only one attachment file', function() {
      run(() => {
        // given
        const challenge = store.createRecord('challenge', { attachments: ['file.url'] });

        // when
        const hasMultipleAttachments = challenge.get('hasMultipleAttachments');

        // then
        expect(hasMultipleAttachments).to.be.false;
      });

    });

    it('Should be true when challenge has multiple attachments files', function() {
      run(() => {
        // given
        const challenge = store.createRecord('challenge', { attachments: ['file.url', 'file.1.url', 'file.2.url'] });

        // when
        const hasMultipleAttachments = challenge.get('hasMultipleAttachments');

        // then
        expect(hasMultipleAttachments).to.be.true;
      });
    });

  });

  describe('Computed property #hasValidEmbedDocument', function() {

    let embedOptions;

    beforeEach(() => {
      embedOptions = {
        embedUrl: 'https://embed.url',
        embedTitle: 'Embed title',
        embedHeight: '600'
      };
    });

    it('should be true when embed data (URL, title and height) are defined', function() {
      // given
      const challenge = store.createRecord('challenge', embedOptions);

      // when
      const hasValidEmbedDocument = challenge.get('hasValidEmbedDocument');

      // then
      expect(hasValidEmbedDocument).to.be.true;
    });

    it('should be false when embed URL is missing', function() {
      // given
      delete embedOptions.embedUrl;
      const challenge = store.createRecord('challenge', embedOptions);

      // when
      const hasValidEmbedDocument = challenge.get('hasValidEmbedDocument');

      // then
      expect(hasValidEmbedDocument).to.be.false;
    });

    it('should be false when embed URL is not secured (HTTPS)', function() {
      // given
      embedOptions.embedUrl = 'http://unsecured.url';
      const challenge = store.createRecord('challenge', embedOptions);

      // when
      const hasValidEmbedDocument = challenge.get('hasValidEmbedDocument');

      // then
      expect(hasValidEmbedDocument).to.be.false;
    });

    it('should be false when embed title is missing', function() {
      // given
      delete embedOptions.embedTitle;
      const challenge = store.createRecord('challenge', embedOptions);

      // when
      const hasValidEmbedDocument = challenge.get('hasValidEmbedDocument');

      // then
      expect(hasValidEmbedDocument).to.be.false;
    });

    it('should be false when embed height is missing', function() {
      // given
      delete embedOptions.embedHeight;
      const challenge = store.createRecord('challenge', embedOptions);

      // when
      const hasValidEmbedDocument = challenge.get('hasValidEmbedDocument');

      // then
      expect(hasValidEmbedDocument).to.be.false;
    });
  });
});
