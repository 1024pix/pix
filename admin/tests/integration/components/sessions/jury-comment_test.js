import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import moment from 'moment';

module('Integration | Component | Sessions::JuryComment', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    this.set('author', 'Vernon Sanders Law');
    this.set('date', new Date('2021-06-21T14:30:21Z'));
    this.set('comment', 'L\'expérience est un professeur cruel car elle vous fait passer l\'examen, avant de vous expliquer la leçon.');
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
    assert.dom('.jury-comment__author').hasText('Vernon Sanders Law');
    assert.dom('.jury-comment__date').hasText(expectedDate);
    assert.dom('.jury-comment__content').hasText('L\'expérience est un professeur cruel car elle vous fait passer l\'examen, avant de vous expliquer la leçon.');
  });
});
