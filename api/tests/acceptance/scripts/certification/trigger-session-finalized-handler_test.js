const { expect, databaseBuilder, knex, sinon } = require('../../../test-helper');
const main = require('../../../../scripts/certification/trigger-session-finalized-handler');
const logger = require('../../../../lib/infrastructure/logger');

describe('Acceptance | Scripts | trigger-session-finalized-handler', function () {
  this.timeout(5000);
  beforeEach(async function () {
    databaseBuilder.factory.buildCertificationCenter({ id: 55, name: 'Super centre' });
    await databaseBuilder.commit();
    sinon.stub(logger, 'info');
    sinon.stub(logger, 'error');
  });

  afterEach(function () {
    return knex('finalized-sessions').delete();
  });

  it('should leave untouched finalized-session rows that are not affected by the script', async function () {
    // given
    _buildNotFinalizedSession({ id: 1 });
    _buildAlreadyPublishedSessionThatUsedToBeNotPublishable({ id: 2 });
    _buildAssignedSessionThatUsedToBeNotPublishable({ id: 3 });
    await databaseBuilder.commit();

    // when
    await main();

    // then
    const finalizedSessions = await knex('finalized-sessions')
      .select('sessionId', 'isPublishable')
      .orderBy('sessionId');
    expect(finalizedSessions).to.deep.equal([
      { sessionId: 2, isPublishable: false },
      { sessionId: 3, isPublishable: false },
    ]);
  });

  it('should reevaluates publishability for finalized sessions that are not assigned neither published', async function () {
    // given
    _buildFinalizedSessionWithEndTestScreensNotSeenByExaminerWithoutSupervisorAccess({ id: 1 });
    _buildFinalizedSessionWithEndTestScreensNotSeenByExaminerWithSupervisorAccess({ id: 2 });
    _buildFinalizedSessionWithJustifiedAbortedTests({ id: 3 });
    _buildFinalizedSessionWithUnjustifiedAbortedTests({ id: 4 });
    await databaseBuilder.commit();

    // when
    await main();

    // then
    const finalizedSessions = await knex('finalized-sessions')
      .select('sessionId', 'isPublishable')
      .orderBy('sessionId');
    expect(finalizedSessions).to.deep.equal([
      { sessionId: 1, isPublishable: false },
      { sessionId: 2, isPublishable: true },
      { sessionId: 3, isPublishable: true },
      { sessionId: 4, isPublishable: false },
    ]);
  });
});

function _buildNotFinalizedSession({ id }) {
  databaseBuilder.factory.buildSession({
    id,
    finalizedAt: null,
    certificationCenterId: 55,
    certificationCenter: 'Super centre',
    hasExaminerGlobalComment: null,
    supervisorPassword: 'PIX12',
    assignedCertificationOfficerId: null,
  });
  _buildCompleteCertification({
    sessionId: id,
    hasSeenEndTestScreen: true,
    abortReason: null,
    completedAt: new Date(),
    hasSupervisorAccess: true,
  });
}

function _buildAlreadyPublishedSessionThatUsedToBeNotPublishable({ id }) {
  databaseBuilder.factory.buildSession({
    id,
    finalizedAt: new Date('2020-01-01'),
    publishedAt: new Date('2020-01-02'),
    certificationCenterId: 55,
    certificationCenter: 'Super centre',
    hasExaminerGlobalComment: null,
    supervisorPassword: 'PIX12',
    assignedCertificationOfficerId: null,
  });
  databaseBuilder.factory.buildFinalizedSession({
    sessionId: id,
    certificationCenterName: 'Super centre',
    finalizedAt: new Date('2020-01-01'),
    publishedAt: new Date('2020-01-02'),
    isPublishable: false,
  });
  _buildCompleteCertification({
    sessionId: id,
    hasSeenEndTestScreen: true,
    abortReason: null,
    completedAt: new Date(),
    hasSupervisorAccess: true,
  });
}

function _buildAssignedSessionThatUsedToBeNotPublishable({ id }) {
  databaseBuilder.factory.buildUser({ id: 123 });
  databaseBuilder.factory.buildSession({
    id,
    finalizedAt: new Date('2020-01-01'),
    publishedAt: null,
    certificationCenterId: 55,
    certificationCenter: 'Super centre',
    hasExaminerGlobalComment: null,
    supervisorPassword: 'PIX12',
    assignedCertificationOfficerId: 123,
  });
  databaseBuilder.factory.buildFinalizedSession({
    sessionId: id,
    certificationCenterName: 'Super centre',
    finalizedAt: new Date('2020-01-01'),
    publishedAt: null,
    isPublishable: false,
  });
  _buildCompleteCertification({
    sessionId: id,
    hasSeenEndTestScreen: true,
    abortReason: null,
    completedAt: new Date(),
    hasSupervisorAccess: true,
  });
}

function _buildFinalizedSessionWithEndTestScreensNotSeenByExaminerWithoutSupervisorAccess({ id }) {
  databaseBuilder.factory.buildSession({
    id,
    finalizedAt: new Date('2020-01-01'),
    publishedAt: null,
    certificationCenterId: 55,
    certificationCenter: 'Super centre',
    hasExaminerGlobalComment: null,
    supervisorPassword: null,
    assignedCertificationOfficerId: null,
  });
  databaseBuilder.factory.buildFinalizedSession({
    sessionId: id,
    certificationCenterName: 'Super centre',
    finalizedAt: new Date('2020-01-01'),
    publishedAt: null,
    isPublishable: false,
  });
  _buildCompleteCertification({
    sessionId: id,
    hasSeenEndTestScreen: false,
    abortReason: null,
    completedAt: new Date(),
    hasSupervisorAccess: false,
  });
}

function _buildFinalizedSessionWithEndTestScreensNotSeenByExaminerWithSupervisorAccess({ id }) {
  databaseBuilder.factory.buildSession({
    id,
    finalizedAt: new Date('2020-01-01'),
    publishedAt: null,
    certificationCenterId: 55,
    certificationCenter: 'Super centre',
    hasExaminerGlobalComment: null,
    supervisorPassword: 'PIX12',
    assignedCertificationOfficerId: null,
  });
  databaseBuilder.factory.buildFinalizedSession({
    sessionId: id,
    certificationCenterName: 'Super centre',
    finalizedAt: new Date('2020-01-01'),
    publishedAt: null,
    isPublishable: false,
  });
  _buildCompleteCertification({
    sessionId: id,
    hasSeenEndTestScreen: false,
    abortReason: null,
    completedAt: new Date(),
    hasSupervisorAccess: true,
  });
}

function _buildFinalizedSessionWithJustifiedAbortedTests({ id }) {
  databaseBuilder.factory.buildSession({
    id,
    finalizedAt: new Date('2020-01-01'),
    publishedAt: null,
    certificationCenterId: 55,
    certificationCenter: 'Super centre',
    hasExaminerGlobalComment: null,
    supervisorPassword: 'PIX12',
    assignedCertificationOfficerId: null,
  });
  databaseBuilder.factory.buildFinalizedSession({
    sessionId: id,
    certificationCenterName: 'Super centre',
    finalizedAt: new Date('2020-01-01'),
    publishedAt: null,
    isPublishable: false,
  });
  _buildCompleteCertification({
    sessionId: id,
    hasSeenEndTestScreen: false,
    abortReason: 'candidate reason',
    completedAt: null,
    hasSupervisorAccess: true,
  });
}

function _buildFinalizedSessionWithUnjustifiedAbortedTests({ id }) {
  databaseBuilder.factory.buildSession({
    id,
    finalizedAt: new Date('2020-01-01'),
    publishedAt: null,
    certificationCenterId: 55,
    certificationCenter: 'Super centre',
    hasExaminerGlobalComment: null,
    supervisorPassword: 'PIX12',
    assignedCertificationOfficerId: null,
  });
  databaseBuilder.factory.buildFinalizedSession({
    sessionId: id,
    certificationCenterName: 'Super centre',
    finalizedAt: new Date('2020-01-01'),
    publishedAt: null,
    isPublishable: false,
  });
  _buildCompleteCertification({
    sessionId: id,
    hasSeenEndTestScreen: false,
    abortReason: null,
    completedAt: null,
    hasSupervisorAccess: true,
  });
}

function _buildCompleteCertification({
  sessionId,
  hasSeenEndTestScreen,
  completedAt,
  abortReason,
  hasSupervisorAccess,
}) {
  const userId = databaseBuilder.factory.buildUser().id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    lastName: `Robert${userId}`,
    hasSeenEndTestScreen,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2020-02-01'),
    completedAt,
    isPublished: false,
    isV2Certification: true,
    sessionId,
    userId,
    isCancelled: false,
    abortReason,
  }).id;
  if (hasSupervisorAccess) {
    databaseBuilder.factory.buildSupervisorAccess({
      sessionId,
      userId,
      authorizedAt: new Date(),
    });
  }
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId,
    userId,
    type: 'certification',
    state: completedAt ? 'completed' : 'started',
    campaignParticipationId: null,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2020-02-01'),
  }).id;
  if (completedAt) {
    databaseBuilder.factory.buildAssessmentResult({
      pixScore: 456,
      status: 'validated',
      commentForJury: null,
      commentForCandidate: null,
      commentForOrganization: null,
      juryId: null,
      assessmentId,
      createdAt: new Date('2020-02-01'),
    });
  }
}
