import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import $ from 'jquery';

function visitTimedChallenge() {
  visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  click('.challenge-item-warning button');
}

describe('Acceptance | Download an attachment from a challenge', function() {

  let application;

  const $ATTACHMENT_LINK = $('.challenge-statement__action-link');

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('When the challenge has an attachment', function() {

    beforeEach(function() {
      visitTimedChallenge();
    });

    it('should have a way to download the attachment', function() {
      const $ATTACHMENT_LINK = findWithAssert('.challenge-statement__action-link');
      expect($ATTACHMENT_LINK.length).to.equal(1);
    });

    it('should expose the correct attachment link', function() {
      const $ATTACHMENT_LINK = $('.challenge-statement__action-link');
      expect($ATTACHMENT_LINK.text()).to.contain('Télécharger');
      expect($ATTACHMENT_LINK.attr('href')).to.equal('http://example_of_url');
    });

    it('should only have one file downloadable', function() {
      const $attachment = findWithAssert('.challenge-statement__action-link');
      expect($attachment.length).to.equal(1);
    });
  });

  describe('When the challenge does not contain an attachment', function() {

    beforeEach(function() {
      visit('/assessments/ref_assessment_id/challenges/ref_qroc_challenge_id');
    });

    it('should hide the download section for the attachment', function() {
      // We are in a challenge...
      findWithAssert('.challenge-item');

      // ... but attachment is hidden
      expect($ATTACHMENT_LINK.length).to.equal(0);
    });
  });

});
