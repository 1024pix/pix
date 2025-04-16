import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/mirage';
import { module, test } from 'qunit';

module('Acceptance | Starting a course', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let demoCourse;

  hooks.beforeEach(async function () {
    this.server.createList('challenge', 3, 'forDemo');
    demoCourse = this.server.create('course', { nbChallenges: 3 });
  });

  test('should be able to start a test directly from the course endpoint', async function (assert) {
    await visit(`/courses/${demoCourse.id}`);
    assert.ok(currentURL().startsWith('/assessments/'));
  });
});
