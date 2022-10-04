const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Read-Models | CpfCertificationResult', function () {
  context('#inseeCode', function () {
    context('when birth insee code is null', function () {
      it('should return null', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthINSEECode: null });

        // when
        const inseeCode = cpfCertificationResult.inseeCode;

        // then
        expect(inseeCode).to.be.null;
      });
    });

    context('when birth insee code equals "NULL"', function () {
      it('should return null', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthINSEECode: 'NULL' });

        // when
        const inseeCode = cpfCertificationResult.inseeCode;

        // then
        expect(inseeCode).to.be.null;
      });
    });

    context('when birth insee code length is greater than 5', function () {
      it('should return null', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthINSEECode: '154640' });

        // when
        const inseeCode = cpfCertificationResult.inseeCode;

        // then
        expect(inseeCode).to.be.null;
      });
    });

    context('when birth insee code length is lower than 5', function () {
      it('should return null', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthINSEECode: '99' });

        // when
        const inseeCode = cpfCertificationResult.inseeCode;

        // then
        expect(inseeCode).to.be.null;
      });
    });

    context('when birth insee code is not "NULL" and has the right length', function () {
      it('should return the birth insee code', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthINSEECode: '75115' });

        // when
        const inseeCode = cpfCertificationResult.inseeCode;

        // then
        expect(inseeCode).to.equal('75115');
      });
    });
  });
});
