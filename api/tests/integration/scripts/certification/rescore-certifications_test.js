import { RescoreCertificationScript } from '../../../../scripts/certification/rescore-certifications.js';
import CertificationRescoredByScript from '../../../../src/certification/session-management/domain/events/CertificationRescoredByScript.js';
import { createTempFile, expect, sinon } from '../../../test-helper.js';

describe('Integration | Scripts | Certification | rescore-certfication', function () {
  it('should parse input file', async function () {
    const script = new RescoreCertificationScript();
    const { options } = script.metaInfo;
    const file = 'certification-courses-ids-to-rescore.csv';
    const data = 'certificationCourseId\n1\n2\n3\n';
    const csvFilePath = await createTempFile(file, data);

    const parsedData = await options.file.coerce(csvFilePath);

    expect(parsedData).to.deep.equals([
      { certificationCourseId: 1 },
      { certificationCourseId: 2 },
      { certificationCourseId: 3 },
    ]);
  });

  it('should call the rescoring service for each certification course ids', async function () {
    // given
    const file = [{ certificationCourseId: 1 }, { certificationCourseId: 2 }];
    const logger = { info: sinon.spy(), error: sinon.spy() };
    const handlersAsServices = { handleCertificationRescoring: sinon.stub() };
    const script = new RescoreCertificationScript(handlersAsServices);

    // when
    await script.handle({ logger, options: { file } });

    // then
    expect(handlersAsServices.handleCertificationRescoring).to.have.been.calledTwice;
    expect(handlersAsServices.handleCertificationRescoring).to.have.been.calledWithExactly({
      event: new CertificationRescoredByScript({ certificationCourseId: 1 }),
    });
    expect(handlersAsServices.handleCertificationRescoring).to.have.been.calledWithExactly({
      event: new CertificationRescoredByScript({ certificationCourseId: 2 }),
    });
  });
});
