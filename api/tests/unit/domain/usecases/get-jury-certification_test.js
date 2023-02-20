import { sinon, expect, domainBuilder } from '../../../test-helper';
import getJuryCertification from '../../../../lib/domain/usecases/get-jury-certification';

describe('Unit | Usecase | get-jury-certification', function () {
  it('should return the jury certification', async function () {
    // given
    const expectedJuryCertification = domainBuilder.buildJuryCertification({ certificationCourseId: 777 });
    const juryCertificationRepository = { get: sinon.stub() };
    juryCertificationRepository.get.withArgs(123).resolves(expectedJuryCertification);

    // when
    const juryCertification = await getJuryCertification({
      certificationCourseId: 123,
      juryCertificationRepository,
    });

    // then
    expect(juryCertification).to.deepEqualInstance(expectedJuryCertification);
  });
});
