import { currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import visitWithAbortedTransition from '../helpers/visit';

describe('Acceptance | Starting a course', function() {
  setupApplicationTest();
  setupMirage();
  let demoCourse;

  beforeEach(async function() {
    server.createList('challenge', 3, 'forDemo');
    demoCourse = server.create('course', { nbChallenges: 3 });
  });

  it('should be able to start a test directly from the course endpoint', async function() {
    await visitWithAbortedTransition(`/courses/${demoCourse.id}`);
    expect(currentURL().startsWith('/assessments/'));
  });
});
