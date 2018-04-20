const { expect, sinon } = require('../../../test-helper');
const Certification = require('../../../../lib/domain/models/Certification');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | find-completed-user-certifications', () => {

  const certificationRepository = {};

  beforeEach(() => {
    certificationRepository.findByUserId = sinon.stub();
  });

  it('should return all the needed informations about certifications', function() {
    // given
    const userId = 1;
    const certification = new Certification({ date: '14/08/2018', certificationCenter: 'Université du Pix' });
    certificationRepository.findByUserId.resolves([certification]);

    // when
    const promise = usecases.findCompletedUserCertifications({ userId, certificationRepository });

    // then
    return promise.then((certifications) => {
      expect(certificationRepository.findByUserId).to.have.been.calledWith(userId);
      expect(certifications[0].date).to.equal('14/08/2018');
      expect(certifications[0].certificationCenter).to.equal('Université du Pix');
    });
  });

});
