import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | Challenge', function() {

  setupModelTest('challenge', {
    needs: ['model:course']
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('Computed property #hasAttachment', function() {

    it('Should be true when challenge has at least one attachment file', function() {
      Ember.run(() => {
        // given
        const store = this.store();
        const challenge = store.createRecord('challenge', { attachments: ['file.url'] });

        // when
        const hasAttachment = challenge.get('hasAttachment');

        // then
        expect(hasAttachment).to.be.true;
      });

    });

    it('Should be false when challenge has multiple attachment files', function() {
      Ember.run(() => {
        // given
        const store = this.store();
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
      Ember.run(() => {
        // given
        const store = this.store();
        const challenge = store.createRecord('challenge', { attachments: ['file.url'] });

        // when
        const hasSingleAttachment = challenge.get('hasSingleAttachment');

        // then
        expect(hasSingleAttachment).to.be.true;
      });

    });

    it('Should be false when challenge has multiple attachment files', function() {
      Ember.run(() => {
        // given
        const store = this.store();
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
      Ember.run(() => {
        // given
        const store = this.store();
        const challenge = store.createRecord('challenge', { attachments: [] });

        // when
        const hasMultipleAttachments = challenge.get('hasMultipleAttachments');

        // then
        expect(hasMultipleAttachments).to.be.false;
      });

    });

    it('Should be false when challenge has only one attachment file', function() {
      Ember.run(() => {
        // given
        const store = this.store();
        const challenge = store.createRecord('challenge', { attachments: ['file.url'] });

        // when
        const hasMultipleAttachments = challenge.get('hasMultipleAttachments');

        // then
        expect(hasMultipleAttachments).to.be.false;
      });

    });

    it('Should be true when challenge has multiple attachments files', function() {
      Ember.run(() => {
        // given
        const store = this.store();
        const challenge = store.createRecord('challenge', { attachments: ['file.url', 'file.1.url', 'file.2.url'] });

        // when
        const hasMultipleAttachments = challenge.get('hasMultipleAttachments');

        // then
        expect(hasMultipleAttachments).to.be.true;
      });
    });

  });

});
