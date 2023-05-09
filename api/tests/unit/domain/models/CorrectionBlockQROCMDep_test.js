import { CorrectionBlockQROCMDep } from '../../../../lib/domain/models/CorrectionBlockQROCMDep.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | CorrectionBlockQROCMDep', function () {
  describe('#constructor', function () {
    describe('when not passing parameters', function () {
      it('should have a validated key that equals false', function () {
        const correctionBlock = new CorrectionBlockQROCMDep();
        expect(correctionBlock.validated).to.equal(false);
      });

      it('should have a alternativeSolutions key which is an empty array', function () {
        const correctionBlock = new CorrectionBlockQROCMDep();
        expect(correctionBlock.alternativeSolutions).to.have.length(0);
      });
    });

    describe('when passing parameters', function () {
      describe('validated param', function () {
        it('should throw if is null', function () {
          expect(() => new CorrectionBlockQROCMDep(null)).to.throw();
        });

        it('should throw if is not a boolean', function () {
          expect(() => new CorrectionBlockQROCMDep([])).to.throw();
        });

        it('should set internal property', function () {
          const correctionBlock = new CorrectionBlockQROCMDep(true);
          expect(correctionBlock.validated).to.be.true;
        });
      });

      describe('alternativeSolutions param', function () {
        it('should throw if is null', function () {
          expect(() => new CorrectionBlockQROCMDep(true, null)).to.throw();
        });

        it('should throw if is not an array', function () {
          expect(() => new CorrectionBlockQROCMDep(true, 'not-array')).to.throw();
        });

        it('should throw if contains anything else than string', function () {
          expect(() => new CorrectionBlockQROCMDep(true, ['not-array', 1])).to.throw();
        });

        it('should copy array in alternativeSolutions if is an array of strings', function () {
          const correctionBlock = new CorrectionBlockQROCMDep(true, ['azeaze']);
          expect(correctionBlock.alternativeSolutions).to.have.length(1);
        });
      });
    });
  });

  describe('set alternativeSolutions', function () {
    let correctionBlock;
    beforeEach(function () {
      correctionBlock = new CorrectionBlockQROCMDep();
    });

    it('should throw if is null', function () {
      expect(() => {
        correctionBlock.alternativeSolutions = null;
      }).to.throw();
    });

    it('should throw if is not an array', function () {
      expect(() => {
        correctionBlock.alternativeSolutions = 'not-array';
      }).to.throw();
    });

    it('should throw if contains anything else than string', function () {
      expect(() => {
        correctionBlock.alternativeSolutions = ['not-array', 1];
      }).to.throw();
    });

    it('should throw if contains undefined', function () {
      expect(() => {
        correctionBlock.alternativeSolutions = ['not-array', undefined];
      }).to.throw();
    });

    it('should throw if contains null', function () {
      expect(() => {
        correctionBlock.alternativeSolutions = ['not-array', null];
      }).to.throw();
    });

    it('should copy array in alternativeSolutions if is an array of strings', function () {
      correctionBlock.alternativeSolutions = ['azeaze'];
      expect(correctionBlock.alternativeSolutions).to.have.length(1);
    });
  });
});
