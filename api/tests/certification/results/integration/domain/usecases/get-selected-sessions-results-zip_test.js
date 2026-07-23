import JSZip from 'jszip';
import sinon from 'sinon';

import { usecases } from '../../../../../../src/certification/results/domain/usecases/index.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Certification | Results | UseCase | get-selected-sessions-results-zip', function () {
  let clock;
  const now = new Date('2026-05-01');

  beforeEach(async function () {
    clock = sinon.useFakeTimers({
      now,
      toFake: ['Date'],
    });
  });

  afterEach(async function () {
    clock.restore();
  });

  it('returns a ZIP file with expected CSVs in it', async function () {
    // given
    const i18n = getI18n('fr');
    const session1 = databaseBuilder.factory.buildSession({ date: '2026-01-01' });
    const certifCourse1 = databaseBuilder.factory.buildCertificationCourse({ sessionId: session1.id });
    databaseBuilder.factory.buildAssessmentResult({ certificationCourseId: certifCourse1.id });

    const session2 = databaseBuilder.factory.buildSession({ date: '2026-02-02' });
    const certifCourse2 = databaseBuilder.factory.buildCertificationCourse({ sessionId: session2.id });
    databaseBuilder.factory.buildAssessmentResult({ certificationCourseId: certifCourse2.id });

    const sessionWithNoResult = databaseBuilder.factory.buildSession({ date: '2026-03-03' });

    await databaseBuilder.commit();

    // when
    const { filename, content } = await usecases.getSelectedSessionsResultsZip({
      sessionIds: [session1.id, session2.id, sessionWithNoResult.id],
      i18n,
    });

    // then
    expect(filename).to.equal('pix-sessions-results-1777593600000.zip');

    const archive = await JSZip.loadAsync(content);
    expect(Object.keys(archive.files)).to.deep.equal([
      `20260101_1530_resultats_session_${session1.id}.csv`,
      `20260202_1530_resultats_session_${session2.id}.csv`,
    ]);
  });
});
