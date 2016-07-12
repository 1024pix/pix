import { test } from 'qunit';
import moduleForAcceptance from 'pix-live/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | assessment id');

test('when visiting /assessments/xxx', function(assert) {
  //let assessment = server.create('assessment');

  //visit(`/assessments/${assessment.id}`);
  visit('/assessments/1');

  andThen(function() {
    assert.equal(currentURL(), '/assessments/1');
  });
});



