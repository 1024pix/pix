import { expect, databaseBuilder, knex, sinon } from '../../../test-helper.js';
import { updatePixCertificationStatus } from '../../../../scripts/certification/fill-pix-certification-status-column-in-certification-courses-table.js';
import { status } from '../../../../src/shared/domain/models/AssessmentResult.js';

const OLD_UPDATED_AT = new Date('2020-01-01');
const NEW_UPDATED_AT = new Date('2022-02-02');

describe('Integration | Scripts | Certification | fill-pix-certification-status-column-in-certification', function () {
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now: NEW_UPDATED_AT, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#updatePixCertificationStatus', function () {
    it('do what expected', async function () {
      // given
      const logProgessionStub = sinon.stub();
      _buildAlreadyFilledPixCertificationStatus({
        id: 1,
        assessmentResultStatus: status.VALIDATED,
        pixCertificationStatus: status.REJECTED,
      });
      _buildNotPublished({
        id: 2,
        assessmentResultStatus: status.VALIDATED,
      });
      _buildPublishedAndError({ id: 3 });
      _buildPublishedAndValidated({ id: 4 });
      _buildPublishedAndRejected({ id: 5 });
      await databaseBuilder.commit();

      // when
      await updatePixCertificationStatus({ count: 10, concurrency: 1, logProgression: logProgessionStub });

      // then
      const certificationDTOs = await knex('certification-courses')
        .select('pixCertificationStatus', 'updatedAt')
        .orderBy('id');
      expect(certificationDTOs[0]).to.deep.equal({
        pixCertificationStatus: status.REJECTED,
        updatedAt: OLD_UPDATED_AT,
      });
      expect(certificationDTOs[1]).to.deep.equal({ pixCertificationStatus: null, updatedAt: OLD_UPDATED_AT });
      expect(certificationDTOs[2]).to.deep.equal({ pixCertificationStatus: null, updatedAt: OLD_UPDATED_AT });
      expect(certificationDTOs[3]).to.deep.equal({
        pixCertificationStatus: status.VALIDATED,
        updatedAt: NEW_UPDATED_AT,
      });
      expect(certificationDTOs[4]).to.deep.equal({
        pixCertificationStatus: status.REJECTED,
        updatedAt: NEW_UPDATED_AT,
      });
    });
  });
});

function _buildAlreadyFilledPixCertificationStatus({ id, assessmentResultStatus, pixCertificationStatus }) {
  _buildCertification({
    id,
    assessmentResultStatus,
    pixCertificationStatus,
    isPublished: true,
  });
}

function _buildNotPublished({ id, assessmentResultStatus }) {
  _buildCertification({ id, assessmentResultStatus, pixCertificationStatus: null, isPublished: false });
}

function _buildPublishedAndError({ id }) {
  _buildCertification({ id, assessmentResultStatus: status.ERROR, pixCertificationStatus: null, isPublished: true });
}

function _buildPublishedAndValidated({ id }) {
  _buildCertification({
    id,
    assessmentResultStatus: status.VALIDATED,
    pixCertificationStatus: null,
    isPublished: true,
  });
}

function _buildPublishedAndRejected({ id }) {
  _buildCertification({ id, assessmentResultStatus: status.REJECTED, pixCertificationStatus: null, isPublished: true });
}

function _buildCertification({ id, assessmentResultStatus, isPublished, pixCertificationStatus }) {
  databaseBuilder.factory.buildCertificationCourse({
    id,
    isPublished,
    pixCertificationStatus,
    updatedAt: OLD_UPDATED_AT,
  });
  databaseBuilder.factory.buildAssessment({ id, certificationCourseId: id });
  if (assessmentResultStatus) {
    // not the latest
    databaseBuilder.factory.buildAssessmentResult({
      assessmentId: id,
      createdAt: new Date('2020-01-01'),
      status: status.VALIDATED,
    });
    // the latest
    databaseBuilder.factory.buildAssessmentResult({
      assessmentId: id,
      createdAt: new Date('2021-01-01'),
      status: assessmentResultStatus,
    });
  }
}
