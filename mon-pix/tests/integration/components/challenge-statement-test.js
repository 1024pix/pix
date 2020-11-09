import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | ChallengeStatement', function() {

  setupIntlRenderingTest();

  function addChallengeToContext(component, challenge) {
    component.set('challenge', challenge);
  }

  function addAssessmentToContext(component, assessment) {
    component.set('assessment', assessment);
  }

  function renderChallengeStatement() {
    return render(hbs`<ChallengeStatement @challenge={{this.challenge}} @assessment={{this.assessment}} />`);
  }

  /*
   * Instruction
   * ------------------------------------------------
   */

  describe('Instruction section:', function() {

    let clock;
    const februaryTheFifth = new Date(2017, 1, 5);

    beforeEach(() => {
      clock = sinon.useFakeTimers(februaryTheFifth);
    });

    afterEach(() => {
      clock.restore();
    });

    // Inspired from: https://github.com/emberjs/ember-mocha/blob/0790a78d7464655fee0c103d2fa960fa53a056ca/tests/setup-component-test-test.js#L118-L122
    it('should render challenge instruction if it exists', async function() {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        instruction: 'La consigne de mon test',
        id: 'rec_challenge',
      });

      // when
      await renderChallengeStatement();

      // then
      expect(find('.challenge-statement__instruction').textContent.trim()).to.equal('La consigne de mon test');
    });

    it('should not render challenge instruction if it does not exist', async function() {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {});

      // when
      await renderChallengeStatement();

      // then
      expect(find('.challenge-statement__instruction')).to.not.exist;
    });

    it('should replace ${EMAIL} by a generated email', async function() {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        id: 'recigAYl5bl96WGXj',
        instruction: 'Veuillez envoyer un email à l\'adresse ${EMAIL} pour valider cette épreuve',
      });

      // when
      await renderChallengeStatement();

      // then
      expect(find('.challenge-statement__instruction').textContent.trim())
        .to.equal('Veuillez envoyer un email à l\'adresse recigAYl5bl96WGXj-267845-0502@pix-infra.ovh pour valider cette épreuve');
    });
  });

  /*
   * Alternative instruction
   * ------------------------------------------------
   */

  describe('Alternative instruction section:', function() {

    it('should hide alternative instruction zone if no alternative instruction', async function() {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        id: 'recigAYl5bl96WGXj',
        instruction: 'La consigne de mon test',
        alternativeInstruction: '',
      });

      // when
      await renderChallengeStatement();

      // then
      expect(find('.challenge-statement__alternative-instruction')).to.not.exist;
    });

    it('should show alternative instruction zone if there is an alternative instruction', async function() {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        id: 'recigAYl5bl96WGXj',
        instruction: 'La consigne de mon test',
        alternativeInstruction: 'La consigne alternative de mon test',
      });

      // when
      await renderChallengeStatement();

      // then
      expect(find('.challenge-statement__alternative-instruction')).to.exist;
    });

    it('should display alternative instruction text on button click', async function() {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        id: 'recigAYl5bl96WGXj',
        instruction: 'La consigne de mon test',
        alternativeInstruction: 'La consigne alternative de mon test',
      });

      // when
      await renderChallengeStatement();
      await click('.challenge-statement__alternative-instruction button');

      // then
      expect(find('.challenge-statement__alternative-instruction-text')).to.exist;
    });

    it('should hide alternative instruction text on second button click', async function() {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        id: 'recigAYl5bl96WGXj',
        instruction: 'La consigne de mon test',
        alternativeInstruction: 'La consigne alternative de mon test',
      });

      // when
      await renderChallengeStatement();
      await click('.challenge-statement__alternative-instruction button');
      await click('.challenge-statement__alternative-instruction button');

      // then
      expect(find('.challenge-statement__alternative-instruction-text')).to.not.exist;
    });

  });

  /*
   * Illustration
   * ------------------------------------------------
   */

  describe('Illustration section', function() {
    it('should display challenge illustration (and alt) if it exists', async function() {
      // given
      const challenge = {
        illustrationUrl: '/images/pix-logo.svg',
        illustrationAlt: 'texte alternatif',
        id: 'rec_challenge',
      };
      addChallengeToContext(this, challenge);
      addAssessmentToContext(this, { id: '267845' });

      // when
      await renderChallengeStatement();

      // then
      expect(find('.challenge-illustration__loaded-image').src).to.contains(challenge.illustrationUrl);
      expect(find('.challenge-illustration__loaded-image').alt).to.equal(challenge.illustrationAlt);
    });

    it('should not display challenge illustration if it does not exist', async function() {
      // given
      addChallengeToContext(this, {});
      addAssessmentToContext(this, { id: '267845' });

      // when
      await renderChallengeStatement();

      // then
      expect(find('challenge-statement__illustration-section')).to.not.exist;
    });
  });

  /*
   * Attachments
   * ------------------------------------------------
   */

  describe('Attachments section:', function() {

    describe('if challenge has no file', function() {

      it('should not display attachements section', async function() {
        addChallengeToContext(this, {
          attachments: [],
          hasAttachment: false,
          id: 'rec_challenge',
        });
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement();

        // then
        expect(find('.challenge-statement__attachments-section')).to.not.exist;
      });
    });

    describe('if challenge has only one file', function() {

      it('should display only one link button', async function() {
        // given
        addChallengeToContext(this, {
          attachments: ['http://challenge.file.url'],
          hasAttachment: true,
          hasSingleAttachment: true,
          hasMultipleAttachments: false,
          id: 'rec_challenge',
        });
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement();

        // then
        expect(find('.challenge-statement__action-link')).to.exist;
        expect(find('.challenge-statement__action-link').href).to.equal('http://challenge.file.url/');
      });

    });

    describe('if challenge has multiple files', function() {

      const file1 = 'http://file.1.docx';
      const file2 = 'file.2.odt';
      const challenge = {
        attachments: [file1, file2],
        hasAttachment: true,
        hasSingleAttachment: false,
        hasMultipleAttachments: true,
        id: 'rec_challenge',
      };

      const challengeQROC = {
        instruction: 'Dans la présentation à télécharger, un mot est caché sous le parchemin. Trouvez-le !',
        hasInternetAllowed: false,
        hasSingleAttachment: false,
        hasAttachment: true,
        hasMultipleAttachments: true,
        attachments: ['http://dl.airtable.com/EL9k935vQQS1wAGIhcZU_PIX_parchemin.ppt', 'http://dl.airtable.com/VGAwZSilQji6Spm9C9Tf_PIX_parchemin.odp'],
        id: 'rec_challenge',
      };

      it('should display as many radio button as attachments', async function() {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement();

        // then
        expect(findAll('.challenge-statement__file-option_input')).to.have.lengthOf(challenge.attachments.length);
      });

      it('should display radio buttons with right label', async function() {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement();

        // then
        expect(findAll('.challenge-statement__file-option-label')[0].textContent.trim()).to.equal('fichier .docx');
        expect(findAll('.challenge-statement__file-option-label')[1].textContent.trim()).to.equal('fichier .odt');

      });

      it('should select first attachment as default selected radio button', async function() {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement();

        // then
        expect(findAll('.challenge-statement__file-option_input')[0].checked).to.be.true;
        expect(findAll('.challenge-statement__file-option_input')[1].checked).to.be.false;
      });

      it('should select first attachment as default selected radio button when QROC', async function() {
        // given
        addChallengeToContext(this, challengeQROC);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement();

        // then
        expect(findAll('.challenge-statement__file-option_input')[0].checked).to.be.true;
        expect(findAll('.challenge-statement__file-option_input')[1].checked).to.be.false;
      });

      it('should display attachements paragraph text', async function() {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement();

        // then
        expect(find('.challenge-statement__text-content').textContent.trim()).to.equal('Choisissez le type de fichier que vous voulez utiliser');
      });

      it('should display help icon next to attachements paragraph', async function() {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement();

        // then
        expect(find('.challenge-statement__help-icon')).to.exist;
      });

      it('should display instructions regarding downloading issues', async function() {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement();
        // then
        expect(find('.challenge-statement__action-help')).to.exist;
      });

    });

  });

  /*
   * Embed simulator
   * ------------------------------------------------
   */

  describe('Embed simulator section:', function() {

    it('should be displayed when the challenge has a valid Embed object', async function() {
      // given
      addChallengeToContext(this, { hasValidEmbedDocument: true, id: 'rec_challenge' });
      addAssessmentToContext(this, { id: '267845' });

      // when
      await renderChallengeStatement();

      // then
      expect(find('.challenge-embed-simulator')).to.exist;
    });

    it('should not be displayed when the challenge does not have a valid Embed object', async function() {
      // given
      addChallengeToContext(this, { hasValidEmbedDocument: false, id: 'rec_challenge' });
      addAssessmentToContext(this, { id: '267845' });

      // when
      await renderChallengeStatement();

      // then
      expect(find('.challenge-embed-simulator')).to.not.exist;
    });
  });
});
