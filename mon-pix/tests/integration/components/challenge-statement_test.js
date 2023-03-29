import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import Service from '@ember/service';
import { click, find, findAll } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ChallengeStatement', function (hooks) {
  setupIntlRenderingTest(hooks);

  function addChallengeToContext(component, challenge) {
    component.set('challenge', challenge);
  }

  function addAssessmentToContext(component, assessment) {
    component.set('assessment', assessment);
  }

  function renderChallengeStatement() {
    return render(hbs`<ChallengeStatement
                          @challenge={{this.challenge}}
                          @assessment={{this.assessment}}/>`);
  }

  hooks.beforeEach(function () {
    class currentUser extends Service {
      user = {
        hasSeenFocusedChallengeTooltip: false,
      };
    }

    this.owner.unregister('service:currentUser');
    this.owner.register('service:currentUser', currentUser);
  });

  /*
   * Instruction
   * ------------------------------------------------
   */

  module('Instruction section:', function () {
    // Inspired from: https://github.com/emberjs/ember-mocha/blob/0790a78d7464655fee0c103d2fa960fa53a056ca/tests/setup-component-test-test.js#L118-L122
    test('should render challenge instruction if it exists', async function (assert) {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        instruction: 'La consigne de mon test',
        id: 'rec_challenge',
      });

      // when
      await renderChallengeStatement(this);

      // then
      assert.strictEqual(find('.challenge-statement-instruction__text').textContent.trim(), 'La consigne de mon test');
    });

    test('should render a tag for focused challenge with tooltip', async function (assert) {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        instruction: 'La consigne de mon test',
        id: 'rec_challenge',
        focused: true,
      });

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('.tooltip__tag').exists();
    });

    test('should render a tag for other challenge with tooltip', async function (assert) {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        instruction: 'La consigne de mon test',
        id: 'rec_challenge',
        focused: false,
      });

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('.tooltip__tag').exists();
    });

    test('should not render challenge instruction if it does not exist', async function (assert) {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {});

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('.challenge-statement-instruction__text').doesNotExist();
    });

    test('should add title "destination (Ouverture d\'une nouvelle fenêtre)" to external links', async function (assert) {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        id: 'recigAYl5bl96WGXj',
        instruction: 'Cliquer sur les liens [lien 1](https://monlien1.com) et [lien 2](https://monlien2.com)',
      });

      // when
      const screen = await render(
        hbs`<ChallengeStatement @challenge={{this.challenge}} @assessment={{this.assessment}}/>`
      );

      // then
      assert
        .dom(screen.getByRole('link', { name: `lien 1 (${this.intl.t('navigation.external-link-title')})` }))
        .exists();
      assert
        .dom(screen.getByRole('link', { name: `lien 2 (${this.intl.t('navigation.external-link-title')})` }))
        .exists();
    });

    test('should display a specific style', async function (assert) {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        instruction: 'La consigne de mon test',
        id: 'rec_challenge',
        type: 'QROC',
        focused: true,
      });

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('.tooltip__tag--focused').exists();
      assert.dom('.tooltip__tag--regular').doesNotExist();
    });

    test('should not display focused challenges specific style', async function (assert) {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        instruction: 'La consigne de mon test',
        id: 'rec_challenge',
        type: 'QROC',
        focused: false,
      });

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('.tooltip__tag--regular').exists();
      assert.dom('.tooltip__tag--focused').doesNotExist();
    });

    test('should have a screen reader only warning if challenge has an embed', async function (assert) {
      // given
      addChallengeToContext(this, {
        hasValidEmbedDocument: true,
        id: 'rec_challenge',
        instruction: 'La consigne de mon test',
      });
      addAssessmentToContext(this, { id: '267845' });

      // when
      await renderChallengeStatement(this);

      // then
      assert.ok(
        find('.challenge-statement__instruction-section > .sr-only').textContent.includes(
          this.intl.t('pages.challenge.statement.sr-only.embed')
        )
      );
    });

    test('should have a screen reader only warning if challenge has an alternative instruction', async function (assert) {
      // given
      addChallengeToContext(this, {
        id: 'rec_challenge',
        instruction: 'La consigne de mon test',
        alternativeInstruction: 'La consigne alternative de mon test',
      });
      addAssessmentToContext(this, { id: '267845' });

      // when
      await renderChallengeStatement(this);

      // then
      assert.ok(
        find('.challenge-statement__instruction-section > .sr-only').textContent.includes(
          this.intl.t('pages.challenge.statement.sr-only.alternative-instruction')
        )
      );
    });
  });

  /*
   * Alternative instruction
   * ------------------------------------------------
   */

  module('Alternative instruction section:', function () {
    test('should hide alternative instruction zone if no alternative instruction', async function (assert) {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        id: 'recigAYl5bl96WGXj',
        instruction: 'La consigne de mon test',
        alternativeInstruction: '',
      });

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('.challenge-statement__alternative-instruction').doesNotExist();
    });

    test('should show alternative instruction zone if there is an alternative instruction', async function (assert) {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        id: 'recigAYl5bl96WGXj',
        instruction: 'La consigne de mon test',
        alternativeInstruction: 'La consigne alternative de mon test',
      });

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('.challenge-statement__alternative-instruction').exists();
    });

    test('should display alternative instruction text on button click', async function (assert) {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        id: 'recigAYl5bl96WGXj',
        instruction: 'La consigne de mon test',
        alternativeInstruction: 'La consigne alternative de mon test',
      });

      // when
      await renderChallengeStatement(this);
      await click('.challenge-statement__alternative-instruction button');

      // then
      assert.dom('.challenge-statement__alternative-instruction-text').exists();
    });

    test('should hide alternative instruction text on second button click', async function (assert) {
      // given
      addAssessmentToContext(this, { id: '267845' });
      addChallengeToContext(this, {
        id: 'recigAYl5bl96WGXj',
        instruction: 'La consigne de mon test',
        alternativeInstruction: 'La consigne alternative de mon test',
      });

      // when
      await renderChallengeStatement(this);
      await click('.challenge-statement__alternative-instruction button');
      await click('.challenge-statement__alternative-instruction button');

      // then
      assert.dom('.challenge-statement__alternative-instruction-text').doesNotExist();
    });
  });

  /*
   * Illustration
   * ------------------------------------------------
   */

  module('Illustration section', function () {
    test('should display challenge illustration (and alt) if it exists', async function (assert) {
      // given
      const challenge = {
        illustrationUrl: '/images/pix-logo.svg',
        illustrationAlt: 'texte alternatif',
        id: 'rec_challenge',
      };
      addChallengeToContext(this, challenge);
      addAssessmentToContext(this, { id: '267845' });

      // when
      await renderChallengeStatement(this);

      // then
      assert.ok(find('.challenge-illustration__loaded-image').src.includes(challenge.illustrationUrl));
      assert.strictEqual(find('.challenge-illustration__loaded-image').alt, challenge.illustrationAlt);
    });

    test('should not display challenge illustration if it does not exist', async function (assert) {
      // given
      addChallengeToContext(this, {});
      addAssessmentToContext(this, { id: '267845' });

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('challenge-statement__illustration-section').doesNotExist();
    });
  });

  /*
   * Attachments
   * ------------------------------------------------
   */

  module('Attachments section:', function () {
    module('if challenge has no file', function () {
      test('should not display attachements section', async function (assert) {
        addChallengeToContext(this, {
          attachments: [],
          hasAttachment: false,
          id: 'rec_challenge',
        });
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement(this);

        // then
        assert.dom('.challenge-statement__attachments-section').doesNotExist();
      });
    });

    module('if challenge has only one file', function () {
      test('should display only one link button', async function (assert) {
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
        await renderChallengeStatement(this);

        // then
        assert.dom('.challenge-statement__action-link').exists();
        assert.strictEqual(find('.challenge-statement__action-link').href, 'http://challenge.file.url/');
      });
    });

    module('if challenge has multiple files', function () {
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
        attachments: [
          'http://dl.airtable.com/EL9k935vQQS1wAGIhcZU_PIX_parchemin.ppt',
          'http://dl.airtable.com/VGAwZSilQji6Spm9C9Tf_PIX_parchemin.odp',
        ],
        id: 'rec_challenge',
      };

      test('should display as many radio button as attachments', async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement(this);

        // then
        assert.dom('.challenge-statement__file-option_input').exists({ count: challenge.attachments.length });
      });

      test('should display radio buttons with right label', async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement(this);

        // then
        assert.strictEqual(findAll('.challenge-statement__file-option-label')[0].textContent.trim(), 'fichier .docx');
        assert.strictEqual(findAll('.challenge-statement__file-option-label')[1].textContent.trim(), 'fichier .odt');
      });

      test('should select first attachment as default selected radio button', async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement(this);

        // then
        assert.true(findAll('.challenge-statement__file-option_input')[0].checked);
        assert.false(findAll('.challenge-statement__file-option_input')[1].checked);
      });

      test('should select first attachment as default selected radio button when QROC', async function (assert) {
        // given
        addChallengeToContext(this, challengeQROC);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement(this);

        // then
        assert.true(findAll('.challenge-statement__file-option_input')[0].checked);
        assert.false(findAll('.challenge-statement__file-option_input')[1].checked);
      });

      test('should display attachements paragraph text', async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement(this);

        // then
        assert.strictEqual(
          find('span[data-test-id="challenge-statement__text-content"]').textContent.trim(),
          'Choisissez le type de fichier que vous voulez utiliser'
        );
      });

      test('should display help icon next to attachements paragraph', async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement(this);

        // then
        assert.dom('.challenge-statement__help-icon').exists();
      });

      test('should display instructions regarding downloading issues', async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, { id: '267845' });

        // when
        await renderChallengeStatement(this);
        // then
        assert.dom('.challenge-statement__action-help').exists();
      });
    });
  });

  /*
   * Embed simulator
   * ------------------------------------------------
   */

  module('Embed simulator section:', function () {
    test('should be displayed when the challenge has a valid Embed object', async function (assert) {
      // given
      addChallengeToContext(this, { hasValidEmbedDocument: true, id: 'rec_challenge' });
      addAssessmentToContext(this, { id: '267845' });

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('.challenge-embed-simulator').exists();
    });

    test('should not be displayed when the challenge does not have a valid Embed object', async function (assert) {
      // given
      addChallengeToContext(this, { hasValidEmbedDocument: false, id: 'rec_challenge' });
      addAssessmentToContext(this, { id: '267845' });

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('.challenge-embed-simulator').doesNotExist();
    });
  });
});
