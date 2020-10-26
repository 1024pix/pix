import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | enrolled-candidates', function(hooks) {
  setupRenderingTest(hooks);

  const CERTIFICATION_CANDIDATES_TABLE = 'certification-candidates-table tbody';
  const CERTIFICATION_CANDIDATES_ACTION_DELETE = 'certification-candidates-actions';
  const DELETE_BUTTON_DOM = 'certification-candidates-actions__delete-button';
  const DELETE_BUTTON_DOM_DISABLED = `${DELETE_BUTTON_DOM}--disabled`;

  test('it display candidates with delete disabled button if linked', async function(assert) {
    const certificationCandidates = [
      { birthdate: new Date() },
      { birthdate: new Date(), isLinked: true },
      { birthdate: new Date() },
    ];

    this.set('certificationCandidates', certificationCandidates);

    // Template block usage:
    await render(hbs`
      <EnrolledCandidates @sessionId="1" @certificationCandidates={{certificationCandidates}}>
      </EnrolledCandidates>
    `);

    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE} tr`).isVisible({ count: 3 });
    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE} tr .${CERTIFICATION_CANDIDATES_ACTION_DELETE} button`).isVisible({ count: 3 });

    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE} tr:nth-child(1) .${CERTIFICATION_CANDIDATES_ACTION_DELETE} button`).hasClass(DELETE_BUTTON_DOM);
    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE} tr:nth-child(2) .${CERTIFICATION_CANDIDATES_ACTION_DELETE} button`).hasClass(DELETE_BUTTON_DOM_DISABLED);
    assert.dom(`.${CERTIFICATION_CANDIDATES_TABLE} tr:nth-child(3) .${CERTIFICATION_CANDIDATES_ACTION_DELETE} button`).hasClass(DELETE_BUTTON_DOM);
  });
});
