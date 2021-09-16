import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import moment from 'moment';
import sinon from 'sinon';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import queryByLabel from '../../../helpers/extended-ember-test-helpers/query-by-label';
import getByLabel from '../../../helpers/extended-ember-test-helpers/get-by-label';

module('Integration | Component | Sessions::JuryComment', function(hooks) {
  setupRenderingTest(hooks);

  module('when there is no comment', function() {
    test('it renders an empty comment form', async function(assert) {
      // given
      this.author = null;
      this.date = null;
      this.comment = null;

      // when
      await render(hbs`
        <Sessions::JuryComment
          @author={{this.author}}
          @date={{this.date}}
          @comment={{this.comment}}
        />
      `);

      // then
      assert.dom(getByLabel('Texte du commentaire')).exists();
      assert.dom(getByLabel('Texte du commentaire')).hasValue('');
      assert.dom(getByLabel('Enregistrer')).exists();
      assert.dom(queryByLabel('Annuler')).doesNotExist();
    });

    module('when the form is submitted', function() {
      module('when form submission succeeds', function() {
        test('it calls onFormSubmit callback and exits edit mode', async function(assert) {
          // given
          this.author = null;
          this.date = null;
          this.comment = null;
          this.onFormSubmit = sinon.stub().resolves();

          // when
          await render(hbs`
          <Sessions::JuryComment
            @author={{this.author}}
            @date={{this.date}}
            @comment={{this.comment}}
            @onFormSubmit={{this.onFormSubmit}}
          />
        `);
          await fillInByLabel('Texte du commentaire', 'Un nouveau commentaire');
          await clickByLabel('Enregistrer');

          // then
          assert.ok(this.onFormSubmit.calledWith('Un nouveau commentaire'));
          assert.ok(_isNotInEditMode());
        });
      });

      module('when form submission fails', function() {
        test('it stays in edit mode', async function(assert) {
          // given
          this.author = null;
          this.date = null;
          this.comment = null;
          this.onFormSubmit = sinon.stub().rejects();

          // when
          await render(hbs`
          <Sessions::JuryComment
            @author={{this.author}}
            @date={{this.date}}
            @comment={{this.comment}}
            @onFormSubmit={{this.onFormSubmit}}
          />
        `);
          await fillInByLabel('Texte du commentaire', 'Un nouveau commentaire');
          await clickByLabel('Enregistrer');

          // then
          assert.ok(this.onFormSubmit.calledWith('Un nouveau commentaire'));
          assert.ok(_isInEditMode());
        });
      });
    });
  });

  module('when there is a comment', function() {
    test('it renders the comment', async function(assert) {
      // given
      this.author = 'Vernon Sanders Law';
      this.date = new Date('2021-06-21T14:30:21Z');
      this.comment = 'L\'expérience est un professeur cruel car elle vous fait passer l\'examen, avant de vous expliquer la leçon.';
      const expectedDate = moment(this.date).format('DD/MM/YYYY à HH:mm');

      // when
      await render(hbs`
        <Sessions::JuryComment
          @author={{this.author}}
          @date={{this.date}}
          @comment={{this.comment}}
        />
      `);

      // then
      assert.contains('Commentaire de l\'équipe Certification');
      assert.contains('Vernon Sanders Law');
      assert.contains(expectedDate);
      assert.contains('L\'expérience est un professeur cruel car elle vous fait passer l\'examen, avant de vous expliquer la leçon.');
      assert.dom(getByLabel('Modifier')).exists();
      assert.dom(getByLabel('Supprimer')).exists();
    });

    module('when the "Modifier" button is clicked', function() {
      test('it renders a prefilled form', async function(assert) {
        // given
        this.author = 'Vernon Sanders Law';
        this.date = new Date('2021-06-21T14:30:21Z');
        this.comment = 'L\'expérience est un professeur cruel car elle vous fait passer l\'examen, avant de vous expliquer la leçon.';

        // when
        await render(hbs`
          <Sessions::JuryComment
            @author={{this.author}}
            @date={{this.date}}
            @comment={{this.comment}}
          />
        `);
        await clickByLabel('Modifier');

        // then
        assert.dom(getByLabel('Texte du commentaire')).exists();
        assert.dom(getByLabel('Texte du commentaire')).hasValue('L\'expérience est un professeur cruel car elle vous fait passer l\'examen, avant de vous expliquer la leçon.');
        assert.dom(getByLabel('Enregistrer')).exists();
        assert.dom(getByLabel('Annuler')).exists();
      });
    });

    module('when the "Annuler" button is clicked', function() {
      test('it exits edit mode and renders the comment', async function(assert) {
        // given
        this.author = 'Vernon Sanders Law';
        this.date = new Date('2021-06-21T14:30:21Z');
        this.comment = 'L\'expérience est un professeur cruel car elle vous fait passer l\'examen, avant de vous expliquer la leçon.';

        // when
        await render(hbs`
          <Sessions::JuryComment
            @author={{this.author}}
            @date={{this.date}}
            @comment={{this.comment}}
          />
        `);
        await clickByLabel('Modifier');
        await clickByLabel('Annuler');

        // then
        assert.ok(_isNotInEditMode());
      });

      test('it should keep the comment unchanged', async function(assert) {
        // given
        this.author = 'Serge Gainsbourg';
        this.date = new Date('2021-06-21T14:30:21Z');
        this.comment = 'Qui promène son chien est au bout de la laisse.';

        // when
        await render(hbs`
          <Sessions::JuryComment
            @author={{this.author}}
            @date={{this.date}}
            @comment={{this.comment}}
          />
        `);
        await clickByLabel('Modifier');
        await fillInByLabel('Texte du commentaire', 'Qui promène son chat est au bout de la laisse.');
        await clickByLabel('Annuler');

        // then
        assert.contains('Qui promène son chien est au bout de la laisse.');
      });
    });

    module('when the "Supprimer" button is clicked', function() {
      test('it calls the onDeleteButtonClicked callback', async function(assert) {
        // given
        this.author = 'Frederic Brown';
        this.date = new Date('2006-11-21T15:32:12Z');
        this.comment = 'Le dernier homme sur la Terre était assis tout seul dans une pièce. Il y eut un coup à la porte…';
        this.onDeleteButtonClicked = sinon.stub();

        // when
        await render(hbs`
          <Sessions::JuryComment
            @author={{this.author}}
            @date={{this.date}}
            @comment={{this.comment}}
            @onDeleteButtonClicked={{this.onDeleteButtonClicked}}
          />
        `);
        await clickByLabel('Supprimer');

        // then
        assert.ok(this.onDeleteButtonClicked.calledOnce);
      });
    });
  });
});

async function _isInEditMode() {
  try {
    await getByLabel('Enregistrer');
    return true;
  } catch (_error) {
    throw new Error('Component should be in edit mode, but it is not.');
  }
}

async function _isNotInEditMode() {
  try {
    await getByLabel('Modifier');
    return true;
  } catch (_error) {
    throw new Error('Component should not be in edit mode, but it is.');
  }
}
