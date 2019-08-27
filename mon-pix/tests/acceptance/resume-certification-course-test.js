import { currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateAsSimpleUser } from '../helpers/testing';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { challengeIds } from '../../mirage/data/challenges/challenge-ids';

describe('Acceptance | Resume a certification course', function() {
  setupApplicationTest();
  setupMirage();
  const certificationCourseId = 'certification-course-id';
  const assessmentId = 'assessment-id';

  beforeEach(async function() {
    defaultScenario(this.server);
    this.server.create('course', {
      id: certificationCourseId,
      type: 'CERTIFICATION',
    });
    this.server.create('assessment', {
      id: assessmentId,
      courseId: certificationCourseId,
      state: 'started',
      type: 'CERTIFICATION',
    });
    await authenticateAsSimpleUser();
    await visitWithAbortedTransition('/profil');
  });

  it('should be able to start a test directly from the course endpoint', async function() {
    await visitWithAbortedTransition('/certifications/certification-course-id');
    expect(currentURL()).to.be.equal(`/assessments/assessment-id/challenges/${challengeIds[0]}`);
  });
});
