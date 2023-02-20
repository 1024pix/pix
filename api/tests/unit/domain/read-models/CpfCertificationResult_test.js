import { expect, domainBuilder } from '../../../test-helper';

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

  context('#countryCode', function () {
    context('when birth insee code is null', function () {
      it('should return null', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthINSEECode: null });

        // when
        const countryCode = cpfCertificationResult.countryCode;

        // then
        expect(countryCode).to.be.null;
      });
    });

    context('when birth insee code does not start by "99"', function () {
      it('should return null', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthINSEECode: '75115' });

        // when
        const countryCode = cpfCertificationResult.countryCode;

        // then
        expect(countryCode).to.be.null;
      });
    });

    context('when birth insee code starts by "99"', function () {
      it('should return the 3 last characters', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthINSEECode: '99250' });

        // when
        const countryCode = cpfCertificationResult.countryCode;

        // then
        expect(countryCode).to.equal('250');
      });
    });
  });

  context('#postalCode', function () {
    context('when birth postal code is null', function () {
      it('should return null', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthPostalCode: null });

        // when
        const postalCode = cpfCertificationResult.postalCode;

        // then
        expect(postalCode).to.be.null;
      });
    });

    context('when birth postal code equals "NULL"', function () {
      it('should return null', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthPostalCode: 'NULL' });

        // when
        const postalCode = cpfCertificationResult.postalCode;

        // then
        expect(postalCode).to.be.null;
      });
    });

    context('when birth postal code length is greater than 5', function () {
      it('should return null', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthPostalCode: '154640' });

        // when
        const postalCode = cpfCertificationResult.postalCode;

        // then
        expect(postalCode).to.be.null;
      });
    });

    context('when birth postal code length is lower than 5', function () {
      it('should return null', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthPostalCode: '99' });

        // when
        const postalCode = cpfCertificationResult.postalCode;

        // then
        expect(postalCode).to.be.null;
      });
    });

    context('when birth postal code is not "NULL" and has the right length', function () {
      it('should return the birth postal code', function () {
        // given
        const cpfCertificationResult = domainBuilder.buildCpfCertificationResult({ birthPostalCode: '75115' });

        // when
        const postalCode = cpfCertificationResult.postalCode;

        // then
        expect(postalCode).to.equal('75115');
      });
    });
  });
});
