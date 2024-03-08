import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { settled } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Sessions::JuryComment', function (hooks) {
  setupRenderingTest(hooks);

  module('when there is no comment', function () {
    module('when current user is not allowed to comment', function () {
      test('it should not render the form section', async function (assert) {
        // given
        class SessionStub extends Service {
          hasAccessToCertificationActionsScope = false;
        }
        this.owner.register('service:accessControl', SessionStub);

        this.author = null;
        this.date = null;
        this.comment = null;

        // when
        const screen = await render(
          hbs`<Sessions::JuryComment @author={{this.author}} @date={{this.date}} @comment={{this.comment}} />`,
        );

        // then
        assert.dom(screen.queryByRole('textbox', { name: 'Texte du commentaire' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Enregistrer' })).doesNotExist();
      });
    });

    module('when current user is allowed to comment', function () {
      test('it renders an empty comment form', async function (assert) {
        // given
        class SessionStub extends Service {
          hasAccessToCertificationActionsScope = true;
        }
        this.owner.register('service:accessControl', SessionStub);

        this.author = null;
        this.date = null;
        this.comment = null;

        // when
        const screen = await render(
          hbs`<Sessions::JuryComment @author={{this.author}} @date={{this.date}} @comment={{this.comment}} />`,
        );

        // then
        assert.dom(screen.getByText("Commentaire de l'équipe Certification")).exists();
        assert.dom(screen.getByRole('textbox', { name: 'Texte du commentaire' })).hasValue('');
        assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
        assert.dom(screen.queryByRole('Annuler')).doesNotExist();
      });

      module('when the form is submitted', function () {
        module('when form submission succeeds', function () {
          test('it calls onFormSubmit callback and exits edit mode', async function (assert) {
            // given
            class SessionStub extends Service {
              hasAccessToCertificationActionsScope = true;
            }
            this.owner.register('service:accessControl', SessionStub);

            this.author = null;
            this.date = null;
            this.comment = null;
            this.onFormSubmit = sinon.stub().callsFake((comment) => {
              this.set('comment', comment);
              return new Promise((resolve) => resolve());
            });

            // when
            const screen = await render(hbs`<Sessions::JuryComment
  @author={{this.author}}
  @date={{this.date}}
  @comment={{this.comment}}
  @onFormSubmit={{this.onFormSubmit}}
/>`);
            await fillByLabel('Texte du commentaire', 'Un nouveau commentaire');
            await clickByName('Enregistrer');

            // then
            assert.ok(this.onFormSubmit.calledWith('Un nouveau commentaire'));
            assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
            assert.dom(screen.getByRole('button', { name: 'Supprimer' })).exists();
          });
        });

        module('when form submission fails', function () {
          test('it stays in edit mode', async function (assert) {
            // given
            class SessionStub extends Service {
              hasAccessToCertificationActionsScope = true;
            }
            this.owner.register('service:accessControl', SessionStub);

            this.author = null;
            this.date = null;
            this.comment = null;
            this.onFormSubmit = sinon.stub().rejects();

            // when
            const screen = await render(hbs`<Sessions::JuryComment
  @author={{this.author}}
  @date={{this.date}}
  @comment={{this.comment}}
  @onFormSubmit={{this.onFormSubmit}}
/>`);
            await fillByLabel('Texte du commentaire', 'Un nouveau commentaire');
            await clickByName('Enregistrer');

            // then
            assert.ok(this.onFormSubmit.calledWith('Un nouveau commentaire'));
            assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
          });
        });
      });
    });
  });

  module('when there is a comment', function () {
    test('it renders the comment', async function (assert) {
      // given
      class SessionStub extends Service {
        hasAccessToCertificationActionsScope = true;
      }
      this.owner.register('service:accessControl', SessionStub);

      this.author = 'Vernon Sanders Law';
      this.date = new Date('2021-06-21T14:30:21Z');
      this.comment =
        "L'expérience est un professeur cruel car elle vous fait passer l'examen, avant de vous expliquer la leçon.";

      // when
      const screen = await render(
        hbs`<Sessions::JuryComment @author={{this.author}} @date={{this.date}} @comment={{this.comment}} />`,
      );

      // then
      assert.dom(screen.getByText("Commentaire de l'équipe Certification")).exists();
      assert.dom(screen.getByText('Vernon Sanders Law')).exists();
      assert.dom(screen.getByText(_formatDate('2021-06-21T14:30:21Z'))).exists();
      assert
        .dom(
          screen.getByText(
            "L'expérience est un professeur cruel car elle vous fait passer l'examen, avant de vous expliquer la leçon.",
          ),
        )
        .exists();
      assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Supprimer' })).exists();
    });

    module('when current user is not allowed to comment', function () {
      test('it should not render actions buttons section', async function (assert) {
        // given
        class SessionStub extends Service {
          hasAccessToCertificationActionsScope = false;
        }
        this.owner.register('service:accessControl', SessionStub);

        this.author = 'Vernon Sanders Law';
        this.date = new Date('2021-06-21T14:30:21Z');
        this.comment =
          "L'expérience est un professeur cruel car elle vous fait passer l'examen, avant de vous expliquer la leçon.";

        // when
        const screen = await render(
          hbs`<Sessions::JuryComment @author={{this.author}} @date={{this.date}} @comment={{this.comment}} />`,
        );

        // then

        assert.dom(screen.queryByRole('button', { name: 'Modifier' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Supprimer' })).doesNotExist();
      });
    });

    module('when current user is allowed to comment', function () {
      module('when the "Modifier" button is clicked', function () {
        test('it renders a prefilled form', async function (assert) {
          // given
          class SessionStub extends Service {
            hasAccessToCertificationActionsScope = true;
          }
          this.owner.register('service:accessControl', SessionStub);

          this.author = 'Vernon Sanders Law';
          this.date = new Date('2021-06-21T14:30:21Z');
          this.comment =
            "L'expérience est un professeur cruel car elle vous fait passer l'examen, avant de vous expliquer la leçon.";

          // when
          const screen = await render(
            hbs`<Sessions::JuryComment @author={{this.author}} @date={{this.date}} @comment={{this.comment}} />`,
          );
          await clickByName('Modifier');

          // then
          assert
            .dom(screen.getByLabelText('Texte du commentaire'))
            .hasValue(
              "L'expérience est un professeur cruel car elle vous fait passer l'examen, avant de vous expliquer la leçon.",
            );
          assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
          assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
        });
      });

      module('when the "Annuler" button is clicked', function () {
        test('it exits edit mode and renders the comment', async function (assert) {
          // given
          class SessionStub extends Service {
            hasAccessToCertificationActionsScope = true;
          }
          this.owner.register('service:accessControl', SessionStub);

          this.author = 'Vernon Sanders Law';
          this.date = new Date('2021-06-21T14:30:21Z');
          this.comment =
            "L'expérience est un professeur cruel car elle vous fait passer l'examen, avant de vous expliquer la leçon.";

          // when
          const screen = await render(
            hbs`<Sessions::JuryComment @author={{this.author}} @date={{this.date}} @comment={{this.comment}} />`,
          );
          await clickByName('Modifier');
          await clickByName('Annuler');

          // then
          assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
          assert.dom(screen.getByRole('button', { name: 'Supprimer' })).exists();
        });

        test('it should keep the comment unchanged', async function (assert) {
          // given
          class SessionStub extends Service {
            hasAccessToCertificationActionsScope = true;
          }
          this.owner.register('service:accessControl', SessionStub);

          this.author = 'Serge Gainsbourg';
          this.date = new Date('2021-06-21T14:30:21Z');
          this.comment = 'Qui promène son chien est au bout de la laisse.';

          // when
          const screen = await render(
            hbs`<Sessions::JuryComment @author={{this.author}} @date={{this.date}} @comment={{this.comment}} />`,
          );
          await clickByName('Modifier');
          await fillByLabel('Texte du commentaire', 'Qui promène son chat est au bout de la laisse.');
          await clickByName('Annuler');

          // then
          assert.dom(screen.getByText('Qui promène son chien est au bout de la laisse.')).exists();
        });
      });

      module('when the "Supprimer" button is clicked', function () {
        test('it opens a confirmation modal', async function (assert) {
          // given
          class SessionStub extends Service {
            hasAccessToCertificationActionsScope = true;
          }
          this.owner.register('service:accessControl', SessionStub);

          this.author = 'Frederic Brown';
          this.date = new Date('2006-11-21T15:32:12Z');
          this.comment =
            'Le dernier homme sur la Terre était assis tout seul dans une pièce. Il y eut un coup à la porte…';

          // when
          const screen = await render(
            hbs`<Sessions::JuryComment @author={{this.author}} @date={{this.date}} @comment={{this.comment}} />`,
          );
          await clickByName('Supprimer');

          // then
          assert.dom(screen.getByText('Voulez-vous vraiment supprimer le commentaire de Frederic Brown ?')).exists();
        });

        module('when the confirmation modal "Confirmer" button is clicked', function () {
          module('when the deletion succeeds', function () {
            test('it calls the onDeleteButtonClicked callback and closes the modal', async function (assert) {
              // given
              class SessionStub extends Service {
                hasAccessToCertificationActionsScope = true;
              }
              this.owner.register('service:accessControl', SessionStub);

              this.author = 'Frederic Brown';
              this.date = new Date('2006-11-21T15:32:12Z');
              this.comment =
                'Le dernier homme sur la Terre était assis tout seul dans une pièce. Il y eut un coup à la porte…';
              this.onDeleteButtonClicked = sinon.stub().callsFake(() => {
                this.set('comment', null);
                return new Promise((resolve) => resolve());
              });

              // when
              const screen = await render(hbs`<Sessions::JuryComment
  @author={{this.author}}
  @date={{this.date}}
  @comment={{this.comment}}
  @onDeleteButtonClicked={{this.onDeleteButtonClicked}}
/>`);
              await clickByName('Supprimer');

              await screen.findByRole('dialog');

              await clickByName('Confirmer');

              // then
              assert.ok(this.onDeleteButtonClicked.calledOnce);

              // assert
              //  .dom(screen.queryByText('Voulez-vous vraiment supprimer le commentaire de Frederic Brown ?'))
              //  .doesNotExist();
              assert
                .dom(
                  screen.queryByText(
                    'Le dernier homme sur la Terre était assis tout seul dans une pièce. Il y eut un coup à la porte…',
                  ),
                )
                .doesNotExist();
              assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
            });
          });

          module('when the deletion fails', function () {
            test('it keeps the comment and the modal open', async function (assert) {
              // given
              class SessionStub extends Service {
                hasAccessToCertificationActionsScope = true;
              }
              this.owner.register('service:accessControl', SessionStub);

              this.author = 'Frederic Brown';
              this.date = new Date('2006-11-21T15:32:12Z');
              this.comment =
                'Le dernier homme sur la Terre était assis tout seul dans une pièce. Il y eut un coup à la porte…';
              this.onDeleteButtonClicked = sinon.stub().rejects();

              // when
              const screen = await render(hbs`<Sessions::JuryComment
  @author={{this.author}}
  @date={{this.date}}
  @comment={{this.comment}}
  @onDeleteButtonClicked={{this.onDeleteButtonClicked}}
/>`);
              await clickByName('Supprimer');

              await screen.findByRole('dialog');

              await clickByName('Confirmer');

              // then
              assert.ok(this.onDeleteButtonClicked.calledOnce);
              assert
                .dom(screen.getByText('Voulez-vous vraiment supprimer le commentaire de Frederic Brown ?'))
                .exists();
              assert
                .dom(
                  screen.getByText(
                    'Le dernier homme sur la Terre était assis tout seul dans une pièce. Il y eut un coup à la porte…',
                  ),
                )
                .exists();
              assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
              assert.dom(screen.getByRole('button', { name: 'Supprimer' })).exists();
            });
          });
        });

        module('when the confirmation modal "Annuler" button is clicked', function () {
          test('it does not call the onDeleteButtonClicked callback and closes the modal', async function (assert) {
            // given
            class SessionStub extends Service {
              hasAccessToCertificationActionsScope = true;
            }
            this.owner.register('service:accessControl', SessionStub);

            this.author = 'Frederic Brown';
            this.date = new Date('2006-11-21T15:32:12Z');
            this.comment =
              'Le dernier homme sur la Terre était assis tout seul dans une pièce. Il y eut un coup à la porte…';
            this.onDeleteButtonClicked = sinon.stub();

            // when
            const screen = await render(hbs`<Sessions::JuryComment
  @author={{this.author}}
  @date={{this.date}}
  @comment={{this.comment}}
  @onDeleteButtonClicked={{this.onDeleteButtonClicked}}
/>`);
            await clickByName('Supprimer');

            await screen.findByRole('dialog');

            await clickByName('Annuler');

            // then
            assert.ok(this.onDeleteButtonClicked.notCalled);
            //assert
            //  .dom(screen.queryByText('Voulez-vous vraiment supprimer le commentaire de Frederic Brown ?'))
            //  .doesNotExist();
            assert
              .dom(
                screen.getByText(
                  'Le dernier homme sur la Terre était assis tout seul dans une pièce. Il y eut un coup à la porte…',
                ),
              )
              .exists();
            assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
            assert.dom(screen.getByRole('button', { name: 'Supprimer' })).exists();
          });
        });
      });

      module("when the component's arguments change", function () {
        test('it renders the updated comment', async function (assert) {
          // given
          class SessionStub extends Service {
            hasAccessToCertificationActionsScope = true;
          }
          this.owner.register('service:accessControl', SessionStub);

          const yesterday = '2021-06-21T14:30:21Z';
          const today = '2021-07-21T14:30:21Z';
          this.author = 'Vernon Sanders Law';
          this.date = new Date(yesterday);
          this.comment =
            "L'expérience est un professeur cruel car elle vous fait passer l'examen, avant de vous expliquer la leçon.";

          // when
          const screen = await render(
            hbs`<Sessions::JuryComment @author={{this.author}} @date={{this.date}} @comment={{this.comment}} />`,
          );
          this.set('author', 'XXXX');
          this.set('date', new Date(today));
          this.set('comment', 'Saperlipopette, quelle experience!');
          await settled();

          // then
          assert.dom(screen.getByText('XXXX')).exists();
          assert.dom(screen.getByText(_formatDate(today))).exists();
          assert.dom(screen.getByText('Saperlipopette, quelle experience!')).exists();
        });
      });
    });
  });
});

function _formatDate(dateString) {
  return dayjs(dateString).format('DD/MM/YYYY à HH:mm');
}
