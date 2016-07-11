import { test } from 'qunit';
import moduleForAcceptance from 'pix-live/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | assessment id');

test('when visiting /assessments/xxx', function(assert) {
  let challenge = server.create('challenge');
  let assessment = server.create('assessment', { challenges: [challenge]});

  visit(`/assessments/${assessment.id}`);

  andThen(function() {
    assert.equal(currentURL(), `/assessments/${assessment.id}`);
  });
});



