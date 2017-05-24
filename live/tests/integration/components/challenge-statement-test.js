import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | ChallengeStatement', function() {

  setupComponentTest('challenge-statement', {
    integration: true
  });

  function addChallengeToContext(component, challenge) {
    component.set('challenge', challenge);
  }

  function renderChallengeStatement(component) {
    component.render(hbs`{{challenge-statement challenge=challenge}}`);
  }

  /*
   * Instruction
   * ------------------------------------------------
   */

  describe('Instruction section:', function() {

    // Inspired from: https://github.com/emberjs/ember-mocha/blob/0790a78d7464655fee0c103d2fa960fa53a056ca/tests/setup-component-test-test.js#L118-L122
    it('should render challenge instruction if it exists', function() {
      // given
      addChallengeToContext(this, {
        instruction: 'La consigne de mon test'
      });

      // when
      renderChallengeStatement(this);

      // then
      expect(Ember.$.trim(this.$('.challenge-statement__instruction').text())).to.equal('La consigne de mon test');
    });

    it('should not render challenge instruction if it does not exist', function() {
      // given
      addChallengeToContext(this, {});

      // when
      renderChallengeStatement(this);

      // then
      expect(this.$('.challenge-statement__instruction')).to.have.lengthOf(0);
    });

  });

  /*
   * Illustration
   * ------------------------------------------------
   */

  describe('Illustration section', function() {
    it('should display challenge illustration (and alt) if it exists', function() {
      // given
      addChallengeToContext(this, {
        illustrationUrl: 'http://challenge.illustration.url'
      });

      // when
      renderChallengeStatement(this);

      // then
      const $illustration = this.$('.challenge-statement__illustration');
      expect($illustration.prop('src')).to.equal('http://challenge.illustration.url/');
      expect($illustration.prop('alt')).to.equal('Illustration de l\'épreuve');
    });

    it('should not display challenge illustration if it does not exist', function() {
      // given
      addChallengeToContext(this, {});

      // when
      renderChallengeStatement(this);

      // then
      expect(this.$('.challenge-statement__illustration')).to.have.lengthOf(0);
    });
  });

  /*
   * Attachments
   * ------------------------------------------------
   */

  describe('Attachments section:', function() {

    describe('if challenge has no file', function() {

      it('should not display attachements section', function() {
        addChallengeToContext(this, {
          attachments: [],
          hasAttachment: false
        });

        // when
        renderChallengeStatement(this);

        // then
        expect(this.$('.challenge-statement__attachments-section')).to.have.lengthOf(0);
      });
    });

    describe('if challenge has only one file', function() {

      it('should display only one link button', function() {
        // given
        addChallengeToContext(this, {
          attachments: ['http://challenge.file.url'],
          hasAttachment: true,
          hasSingleAttachment: true,
          hasMultipleAttachments: false
        });

        // when
        renderChallengeStatement(this);

        // then
        const $downloadLink = this.$('.challenge-statement__action-link');
        expect($downloadLink).to.have.lengthOf(1);
        expect($downloadLink.prop('href')).to.equal('http://challenge.file.url/');
      });

    });

    describe('if challenge has multiple files', function() {

      const file1 = 'http://file.1.docx';
      const file2 = 'file.2.odt';
      const challenge = {
        attachments: [file1, file2],
        hasAttachment: true,
        hasSingleAttachment: false,
        hasMultipleAttachments: true
      };

      const challengeQROC = {
        instruction : 'Dans la présentation à télécharger, un mot est caché sous le parchemin. Trouvez-le !',
        hasInternetAllowed : false,
        hasSingleAttachment: false,
        hasAttachment: true,
        hasMultipleAttachments: true,
        attachments: ['http://dl.airtable.com/EL9k935vQQS1wAGIhcZU_PIX_parchemin.ppt', 'http://dl.airtable.com/VGAwZSilQji6Spm9C9Tf_PIX_parchemin.odp']
      };

      it('should display as many radio button as attachments', function() {
        // given
        addChallengeToContext(this, challenge);

        // when
        renderChallengeStatement(this);

        // then
        expect(this.$('.challenge-statement__file-option_input')).to.have.lengthOf(challenge.attachments.length);
      });

      it('should display radio buttons with right label', function() {
        // given
        addChallengeToContext(this, challenge);

        // when
        renderChallengeStatement(this);

        // then
        expect(this.$('.challenge-statement__file-option-label').get(0).textContent.trim()).to.equal('fichier .docx');
        expect(this.$('.challenge-statement__file-option-label').get(1).textContent.trim()).to.equal('fichier .odt');

      });

      it('should select first attachment as default selected radio buton', function() {
        // given
        addChallengeToContext(this, challenge);

        // when
        renderChallengeStatement(this);

        // then
        const $firstRadioButton = this.$('.challenge-statement__file-option_input')[0];
        const $secondRadioButton = this.$('.challenge-statement__file-option_input')[1];
        expect($firstRadioButton.checked).to.be.true;
        expect($secondRadioButton.checked).to.be.false;
      });

      it('should select first attachment as default selected radio button', function() {
        // given
        addChallengeToContext(this, challengeQROC);

        // when
        renderChallengeStatement(this);

        // then
        const $firstRadioButton = this.$('.challenge-statement__file-option_input')[0];
        const $secondRadioButton = this.$('.challenge-statement__file-option_input')[1];
        expect($firstRadioButton.checked).to.be.true;
        expect($secondRadioButton.checked).to.be.false;
      });

      it('should display attachements paragraph text', function() {
        // given
        addChallengeToContext(this, challenge);

        // when
        renderChallengeStatement(this);

        // then
        expect(this.$('.challenge-statement__text-content').text().trim()).to.equal('Choisissez le type de fichier que vous voulez utiliser');
      });

      it('should display help icon next to attachements paragraph', function() {
        // given
        addChallengeToContext(this, challenge);

        // when
        renderChallengeStatement(this);

        // then
        expect(this.$('.challenge-statement__help-icon')).to.have.lengthOf(1);
      });

    });

  });

});
