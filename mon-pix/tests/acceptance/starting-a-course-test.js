import { currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import demoData from '../../mirage/data/demo';

describe('Acceptance | Starting a course', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(async function() {
    defaultScenario(this.server);
  });

  it('should be able to start a test directly from the course endpoint', async function() {
    await visitWithAbortedTransition(`/courses/${demoData.demoCourseId}`);
    expect(currentURL().startsWith('/assessments/'));
  });
});
