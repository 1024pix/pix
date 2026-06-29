import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
// eslint-disable-next-line no-restricted-imports
import { click, find, findAll } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ChallengeStatement from 'mon-pix/components/challenge-statement';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService } from '../../helpers/service-stubs';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | ChallengeStatement', function (hooks) {
  setupIntlRenderingTest(hooks);

  const state = {};

  function addChallengeToContext(_component, challenge) {
    state.challenge = challenge;
  }

  function addAssessmentToContext(_component, assessment) {
    state.assessment = assessment;
  }

  function renderChallengeStatement() {
    return render(
      <template><ChallengeStatement @challenge={{state.challenge}} @assessment={{state.assessment}} /></template>,
    );
  }

  hooks.beforeEach(function () {
    delete state.challenge;
    delete state.assessment;
    stubCurrentUserService(this.owner);
    this.store = this.owner.lookup('service:store');
  });

  /*
   * Instruction
   * ------------------------------------------------
   */

  module('Instruction section:', function () {
    // Inspired from: https://github.com/emberjs/ember-mocha/blob/0790a78d7464655fee0c103d2fa960fa53a056ca/tests/setup-component-test-test.js#L118-L122
    test('should render challenge instruction if it exists', async function (assert) {
      // given
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
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
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
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
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
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
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
      addChallengeToContext(this, {});

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('.challenge-statement-instruction__text').doesNotExist();
    });

    test('should add title "destination (Ouverture d\'une nouvelle fenêtre)" to external links', async function (assert) {
      // given
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
      addChallengeToContext(this, {
        id: 'recigAYl5bl96WGXj',
        instruction: 'Cliquer sur les liens [lien 1](https://monlien1.com) et [lien 2](https://monlien2.com)',
      });

      // when
      const screen = await render(
        <template><ChallengeStatement @challenge={{state.challenge}} @assessment={{state.assessment}} /></template>,
      );

      // then
      const link1 = screen.queryByRole('link', { name: 'lien 1' });
      const link2 = screen.queryByRole('link', { name: 'lien 2' });
      assert.dom(link1).exists();
      assert.dom(link2).exists();
      assert.dom(link1).hasAttribute('title', `lien 1 (${t('navigation.external-link-title')})`);
      assert.dom(link2).hasAttribute('title', `lien 2 (${t('navigation.external-link-title')})`);
    });

    test('should display a specific style', async function (assert) {
      // given
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
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
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
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
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
      addChallengeToContext(this, {
        hasValidEmbedDocument: true,
        id: 'rec_challenge',
        instruction: 'La consigne de mon test',
      });

      // when
      await renderChallengeStatement(this);

      // then
      assert.ok(
        find('.challenge-statement__instructions-and-text-to-speech-container > .sr-only').textContent.includes(
          t('pages.challenge.statement.sr-only.embed'),
        ),
      );
    });

    test('should have a screen reader only warning if challenge has an alternative instruction', async function (assert) {
      // given
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
      addChallengeToContext(this, {
        id: 'rec_challenge',
        instruction: 'La consigne de mon test',
        alternativeInstruction: 'La consigne alternative de mon test',
      });

      // when
      await renderChallengeStatement(this);

      // then
      assert.ok(
        find('.challenge-statement__instruction-section > .sr-only').textContent.includes(
          t('pages.challenge.statement.sr-only.alternative-instruction'),
        ),
      );
    });

    /*
     * Vocalisation
     * ------------------------------------------------
     */

    module('Text to speech button:', function () {
      module('when FT_ENABLE_TEXT_TO_SPEECH_BUTTON is enabled', function (hooks) {
        hooks.beforeEach(async function () {
          const featureToggles = this.owner.lookup('service:featureToggles');
          sinon.stub(featureToggles, 'featureToggles').value({ isTextToSpeechButtonEnabled: true });
        });

        module('when the assessment is not a certification', function () {
          module('when text to speech button is activated', function () {
            test('it should render the text to speech button', async function (assert) {
              // given
              addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
              addChallengeToContext(this, {
                instruction: 'La consigne du test avec un bouton de lecture à haute voix',
                id: 'rec_challenge1',
                locales: ['fr'],
              });

              // when
              const screen = await render(
                <template>
                  <ChallengeStatement
                    @challenge={{state.challenge}}
                    @assessment={{state.assessment}}
                    @isTextToSpeechActivated={{true}}
                  />
                </template>,
              );

              // then
              assert
                .dom(
                  screen.getByRole('button', {
                    name: t('pages.challenge.statement.text-to-speech.play'),
                  }),
                )
                .exists();
            });

            module('when the text to speech has started', function () {
              test('it should display a stop button', async function (assert) {
                // given
                addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
                addChallengeToContext(this, {
                  instruction: "Test d'intégration vocalisation",
                  id: 'rec_challenge1',
                  locales: ['fr'],
                });
                const screen = await render(
                  <template>
                    <ChallengeStatement
                      @challenge={{state.challenge}}
                      @assessment={{state.assessment}}
                      @isTextToSpeechActivated={{true}}
                    />
                  </template>,
                );

                // when
                await click(
                  screen.getByRole('button', {
                    name: t('pages.challenge.statement.text-to-speech.play'),
                  }),
                );

                // then
                assert
                  .dom(
                    screen.getByRole('button', {
                      name: t('pages.challenge.statement.text-to-speech.stop'),
                    }),
                  )
                  .exists();
              });
            });

            module('when user clicks on text-to-speech button', function () {
              test('should push analytics event', async function (assert) {
                // given
                addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
                addChallengeToContext(this, {
                  instruction: "Test d'intégration vocalisation",
                  id: 'rec_challenge4',
                  locales: ['fr'],
                });
                const trackEvent = sinon.stub();

                class MetricsStubService extends Service {
                  trackEvent = trackEvent;
                }
                this.owner.register('service:pix-metrics', MetricsStubService);

                const screen = await render(
                  <template>
                    <ChallengeStatement
                      @challenge={{state.challenge}}
                      @assessment={{state.assessment}}
                      @isTextToSpeechActivated={{true}}
                    />
                  </template>,
                );

                // when
                await click(screen.getByRole('button', { name: t('pages.challenge.statement.text-to-speech.play') }));

                // then
                assert.ok(
                  trackEvent.calledWithExactly("Clic sur le bouton de lecture d'épreuve : play", {
                    category: 'Vocalisation',
                    disabled: true,
                    action: "Lecture d'une épreuve",
                  }),
                  'trackEvent should be called with correct arguments for non-certification',
                );
              });
            });
          });

          module('when text to speech button is deactivated', function () {
            test('it should not render the text to speech button', async function (assert) {
              // given
              addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
              addChallengeToContext(this, {
                instruction: 'La consigne du test avec un bouton de lecture à haute voix',
                id: 'rec_challenge1',
                locales: ['fr'],
              });

              // when
              const screen = await render(
                <template>
                  <ChallengeStatement
                    @challenge={{state.challenge}}
                    @assessment={{state.assessment}}
                    @isTextToSpeechActivated={{false}}
                  />
                </template>,
              );

              // then
              assert
                .dom(
                  screen.queryByRole('button', {
                    name: t('pages.challenge.statement.text-to-speech.play'),
                  }),
                )
                .doesNotExist();
            });
          });
        });

        module('when the assessment is a certification', function () {
          test('it should not render the text to speech button when certification is not adjusted for accessibility', async function (assert) {
            // given
            const certificationCourse = this.store.createRecord('certification-course', {
              id: 'cert123',
              isAdjustedForAccessibility: false,
            });
            const assessment = this.store.createRecord('assessment', {
              id: '267567',
              type: 'CERTIFICATION',
              certificationCourse,
            });
            addAssessmentToContext(this, assessment);

            addChallengeToContext(this, {
              instruction: 'La consigne du test avec un bouton de lecture à haute voix',
              id: 'rec_challenge1',
              locales: ['fr'],
            });

            // when
            const screen = await render(
              <template>
                <ChallengeStatement
                  @challenge={{state.challenge}}
                  @assessment={{state.assessment}}
                  @isTextToSpeechActivated={{true}}
                />
              </template>,
            );

            // then
            assert
              .dom(
                screen.queryByRole('button', {
                  name: t('pages.challenge.statement.text-to-speech.play'),
                }),
              )
              .doesNotExist();
          });

          test('it should render the text to speech button when certification is adjusted for accessibility', async function (assert) {
            // given
            const certificationCourse = this.store.createRecord('certification-course', {
              id: 'cert123',
              isAdjustedForAccessibility: true,
            });
            const assessment = this.store.createRecord('assessment', {
              id: '267567',
              type: 'CERTIFICATION',
              certificationCourse,
            });
            addAssessmentToContext(this, assessment);

            addChallengeToContext(this, {
              instruction: 'La consigne du test avec un bouton de lecture à haute voix',
              id: 'rec_challenge1',
              locales: ['fr'],
            });

            // when
            const screen = await render(
              <template>
                <ChallengeStatement
                  @challenge={{state.challenge}}
                  @assessment={{state.assessment}}
                  @isTextToSpeechActivated={{true}}
                />
              </template>,
            );

            // then
            assert
              .dom(
                screen.getByRole('button', {
                  name: t('pages.challenge.statement.text-to-speech.play'),
                }),
              )
              .exists();
          });

          module('when user clicks on text-to-speech button', function (hooks) {
            hooks.beforeEach(function () {
              window.sessionStorage.removeItem('certifCandidateStorage');
            });

            hooks.afterEach(function () {
              window.sessionStorage.removeItem('certifCandidateStorage');
            });

            test('should push analytics event only once', async function (assert) {
              // given
              const trackEvent = sinon.stub();
              class MetricsStubService extends Service {
                trackEvent = trackEvent;
              }
              this.owner.register('service:pix-metrics', MetricsStubService);

              const certificationCourse = this.store.createRecord('certification-course', {
                id: 'cert123',
                isAdjustedForAccessibility: true,
              });

              const assessment = this.store.createRecord('assessment', {
                id: '267567',
                type: 'CERTIFICATION',
                certificationCourse,
              });
              addAssessmentToContext(this, assessment);

              addChallengeToContext(this, {
                instruction: 'La consigne du test avec un bouton de lecture à haute voix',
                id: 'rec_challenge1',
                locales: ['fr'],
              });

              const screen = await render(
                <template>
                  <ChallengeStatement
                    @challenge={{state.challenge}}
                    @assessment={{state.assessment}}
                    @isTextToSpeechActivated={{true}}
                  />
                </template>,
              );

              // when
              await click(screen.getByRole('button', { name: t('pages.challenge.statement.text-to-speech.play') }));

              assert.ok(
                trackEvent.calledWithExactly('certifChallengeTextToSpeech'),
                'Analytics event should be pushed on first click',
              );

              trackEvent.resetHistory();

              await click(screen.getByRole('button', { name: t('pages.challenge.statement.text-to-speech.stop') }));
              await click(screen.getByRole('button', { name: t('pages.challenge.statement.text-to-speech.play') }));

              assert.notOk(
                trackEvent.calledWithExactly('certifChallengeTextToSpeech'),
                'Analytics event should NOT be pushed on subsequent clicks',
              );
            });
          });
        });
      });

      module('when FT_ENABLE_TEXT_TO_SPEECH_BUTTON is disabled', function (hooks) {
        hooks.beforeEach(async function () {
          const featureToggles = this.owner.lookup('service:featureToggles');
          sinon.stub(featureToggles, 'featureToggles').value({ isTextToSpeechButtonEnabled: false });
        });

        module('when the assessment is not a certification', function () {
          module('when text to speech button is activated', function () {
            test('it should not render the text to speech button', async function (assert) {
              // given
              addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267567' }));
              addChallengeToContext(this, {
                instruction: 'La consigne du test avec un bouton de lecture à haute voix',
                id: 'rec_challenge1',
                locales: ['fr'],
              });

              // when
              const screen = await render(
                <template>
                  <ChallengeStatement
                    @challenge={{state.challenge}}
                    @assessment={{state.assessment}}
                    @isTextToSpeechActivated={{true}}
                  />
                </template>,
              );

              // then
              assert
                .dom(
                  screen.queryByRole('button', {
                    name: t('pages.challenge.statement.text-to-speech.play'),
                  }),
                )
                .doesNotExist();
            });
          });

          module('when text to speech button is deactivated', function () {
            test('it should not render the text to speech button', async function (assert) {
              // given
              addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267567' }));
              addChallengeToContext(this, {
                instruction: 'La consigne du test avec un bouton de lecture à haute voix',
                id: 'rec_challenge1',
                locales: ['fr'],
              });

              // when
              const screen = await render(
                <template>
                  <ChallengeStatement
                    @challenge={{state.challenge}}
                    @assessment={{state.assessment}}
                    @isTextToSpeechActivated={{false}}
                  />
                </template>,
              );

              // then
              assert
                .dom(
                  screen.queryByRole('button', {
                    name: t('pages.challenge.statement.text-to-speech.play'),
                  }),
                )
                .doesNotExist();
            });
          });
        });
      });

      module('when the browers speech synthesis is disabled', function () {
        test('it should not display text to speech button', async function (assert) {
          // given
          addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267567' }));
          addChallengeToContext(this, {
            instruction: 'La consigne du test avec un bouton de lecture à haute voix',
            id: 'rec_challenge1',
            locales: ['fr'],
          });
          const speechSynthesis = window.speechSynthesis;
          delete window.speechSynthesis;

          // when
          const screen = await render(
            <template>
              <ChallengeStatement
                @challenge={{state.challenge}}
                @assessment={{state.assessment}}
                @isTextToSpeechActivated={{true}}
              />
            </template>,
          );

          // then
          assert
            .dom(
              screen.queryByRole('button', {
                name: t('pages.challenge.statement.text-to-speech.play'),
              }),
            )
            .doesNotExist();

          window.speechSynthesis = speechSynthesis;
        });
      });
    });
  });

  /*
   * Alternative instruction
   * ------------------------------------------------
   */

  module('Alternative instruction section:', function () {
    test('should hide alternative instruction zone if no alternative instruction', async function (assert) {
      // given
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
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
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
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
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
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
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));
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
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

      // when
      await renderChallengeStatement(this);

      // then
      assert.ok(find('.challenge-illustration__loaded-image').src.includes(challenge.illustrationUrl));
      assert.strictEqual(find('.challenge-illustration__loaded-image').alt, challenge.illustrationAlt);
    });

    test('should not display challenge illustration if it does not exist', async function (assert) {
      // given
      addChallengeToContext(this, {});
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

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
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

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
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

        // when
        const screen = await renderChallengeStatement(this);

        // then
        const downloadLink = await screen.getByRole('link', { name: 'Télécharger' });
        assert.dom(downloadLink).hasAttribute('href', 'http://challenge.file.url');
        assert.dom(downloadLink).doesNotHaveAttribute('target');
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
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

        // when
        await renderChallengeStatement(this);

        // then
        assert.dom('.challenge-statement__file-option_input').exists({ count: challenge.attachments.length });
      });

      test('should display radio buttons with right label', async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

        // when
        await renderChallengeStatement(this);

        // then
        assert.strictEqual(findAll('.challenge-statement__file-option-label')[0].textContent.trim(), 'fichier .docx');
        assert.strictEqual(findAll('.challenge-statement__file-option-label')[1].textContent.trim(), 'fichier .odt');
      });

      test('should display attachments using the preferred formats first, then the others', async function (assert) {
        // given
        addChallengeToContext(this, {
          attachments: ['https://dl.airtable.com/test.odp', 'https://dl.airtable.com/test.docx'],
          hasAttachment: true,
          hasSingleAttachment: false,
          hasMultipleAttachments: true,
          id: 'rec_challenge',
        });
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

        // when
        await renderChallengeStatement(this);

        // then
        const labels = findAll('.challenge-statement__file-option-label');
        assert.strictEqual(labels[0].textContent.trim(), 'fichier .docx');
        assert.strictEqual(labels[1].textContent.trim(), 'fichier .odp');
      });

      test('should display the attachments ordered alphabetically in each group', async function (assert) {
        // given
        addChallengeToContext(this, {
          attachments: [
            'https://dl.airtable.com/test1.ods',
            'https://dl.airtable.com/test2.odp',
            'https://dl.airtable.com/test3.pptx',
            'https://dl.airtable.com/test6.docx',
          ],
          hasAttachment: true,
          hasSingleAttachment: false,
          hasMultipleAttachments: true,
          id: 'rec_challenge',
        });
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

        // when
        await renderChallengeStatement(this);

        // then
        const labels = findAll('.challenge-statement__file-option-label');
        assert.strictEqual(labels[0].textContent.trim(), 'fichier .docx');
        assert.strictEqual(labels[1].textContent.trim(), 'fichier .pptx');
        assert.strictEqual(labels[2].textContent.trim(), 'fichier .odp');
        assert.strictEqual(labels[3].textContent.trim(), 'fichier .ods');
      });

      test('should select first attachment as default selected radio button', async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

        // when
        await renderChallengeStatement(this);

        // then
        assert.true(findAll('.challenge-statement__file-option_input')[0].checked);
        assert.false(findAll('.challenge-statement__file-option_input')[1].checked);
      });

      test('should select first attachment as default selected radio button when QROC', async function (assert) {
        // given
        addChallengeToContext(this, challengeQROC);
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

        // when
        await renderChallengeStatement(this);

        // then
        assert.true(findAll('.challenge-statement__file-option_input')[0].checked);
        assert.false(findAll('.challenge-statement__file-option_input')[1].checked);
      });

      test('should display attachements paragraph text', async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

        // when
        await renderChallengeStatement(this);

        // then
        assert.strictEqual(
          find('span[data-test-id="challenge-statement__text-content"]').textContent.trim(),
          'Choisissez le type de fichier que vous voulez utiliser',
        );
      });

      test('should display help icon next to attachements paragraph', async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

        // when
        await renderChallengeStatement(this);

        // then
        assert.dom('.challenge-statement__help-icon').exists();
      });

      test('should display instructions regarding downloading issues', async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

        // when
        await renderChallengeStatement(this);
        // then
        assert.dom('.challenge-statement__action-help').exists();
      });

      test("should display one link button with default attachment's url", async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

        // when
        const screen = await renderChallengeStatement(this);

        // then
        const downloadLink = await screen.getByRole('link', { name: 'Télécharger' });
        assert.dom(downloadLink).hasAttribute('href', 'http://file.1.docx');
        assert.dom(downloadLink).doesNotHaveAttribute('target');
      });

      test("should update link button href with checked attachment's url", async function (assert) {
        // given
        addChallengeToContext(this, challenge);
        addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

        // when
        const screen = await renderChallengeStatement(this);
        const radio = await screen.getByRole('radio', { name: 'fichier .odt' });
        radio.click();

        // wait for DOM update
        await new Promise((res) => setTimeout(res, 0));

        // then
        const downloadLink = await screen.getByRole('link', { name: 'Télécharger' });
        assert.dom(downloadLink).hasAttribute('href', 'file.2.odt');
        assert.dom(downloadLink).doesNotHaveAttribute('target');
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
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('.challenge-embed-simulator').exists();
    });

    test('should pass the embed document url, title and height to the simulator', async function (assert) {
      // given
      addChallengeToContext(this, {
        hasValidEmbedDocument: true,
        embedUrl: 'https://challenge-embed.url',
        embedTitle: 'Challenge embed document title',
        embedHeight: 300,
        id: 'rec_123',
      });
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

      // when
      await renderChallengeStatement(this);

      // then
      const iframe = find('.embed__iframe');
      assert.strictEqual(iframe.getAttribute('src'), 'https://challenge-embed.url');
      assert.strictEqual(iframe.getAttribute('title'), 'Challenge embed document title');
      assert.ok(iframe.getAttribute('style').includes('height: 300px'));
    });

    test('should not be displayed when the challenge does not have a valid Embed object', async function (assert) {
      // given
      addChallengeToContext(this, { hasValidEmbedDocument: false, id: 'rec_challenge' });
      addAssessmentToContext(this, this.store.createRecord('assessment', { id: '267845' }));

      // when
      await renderChallengeStatement(this);

      // then
      assert.dom('.challenge-embed-simulator').doesNotExist();
    });
  });
});
