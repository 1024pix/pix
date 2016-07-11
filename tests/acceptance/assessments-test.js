import { test } from 'qunit';
import moduleForAcceptance from 'pix-live/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | assessments');

test('visiting /assessments', function(assert) {

  let assessments = server.createList('assessments', 10);

  visit('/assessments');

  andThen(function() {
    assert.equal(currentURL(), '/assessments');
    assert.equal(find('.assessment-summary').length, assessments.length);
    assert.equal(find('.assessment-title:first').text().trim(), assessments[0].attrs.title);
  });
});
