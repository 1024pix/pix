import { expect } from 'chai';

import {
  isCloseEnough,
  isCloseEnoughToOneOf,
} from '../../../../../src/shared/domain/services/string-similarity-service.js';

describe('Shared | Unit | Domain | Services | string-similarity', function () {
  describe('#isCloseEnough', function () {
    it('returns true for two identical strings', function () {
      // when
      const result = isCloseEnough('Dupont', 'Dupont');

      // then
      expect(result).to.be.true;
    });

    it('returns true when the ratio is below the default threshold', function () {
      // when
      const result = isCloseEnough('Dupont', 'Dupond');

      // then
      expect(result).to.be.true;
    });

    it('returns false when the ratio exceeds the default threshold', function () {
      // when
      const result = isCloseEnough('Dupont', 'Martin');

      // then
      expect(result).to.be.false;
    });

    it('takes into account a stricter custom threshold', function () {
      // when
      const result = isCloseEnough('John', 'Jon', 0.1);

      // then
      expect(result).to.be.false;
    });

    it('takes into account a more permissive custom threshold', function () {
      // when
      const result = isCloseEnough('Dupont', 'Martin', 1);

      // then
      expect(result).to.be.true;
    });

    context('edge cases', function () {
      it('returns true for two empty strings', function () {
        // when
        const result = isCloseEnough('', '');

        // then
        expect(result).to.be.true;
      });

      it('returns false for an empty string compared to a non-empty one', function () {
        // when
        const result = isCloseEnough('', 'Dupont');

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#isCloseEnoughToOneOf', function () {
    it('returns true when at least one reference is close enough', function () {
      // given
      const references = ['Martin', 'Dupond', 'Durand'];

      // when
      const result = isCloseEnoughToOneOf('Dupont', references);

      // then
      expect(result).to.be.true;
    });

    it('returns false when no reference is close enough', function () {
      // given
      const references = ['Martin', 'Durand'];

      // when
      const result = isCloseEnoughToOneOf('Dupont', references);

      // then
      expect(result).to.be.false;
    });

    it('relies on the closest reference', function () {
      // given
      const references = ['Xyz', 'Dupond', 'Abcdef'];

      // when
      const result = isCloseEnoughToOneOf('Dupont', references);

      // then
      expect(result).to.be.true;
    });

    it('takes into account a custom threshold', function () {
      // given
      const references = ['Martin', 'Dupond'];

      // when
      const result = isCloseEnoughToOneOf('Dupont', references, 0.1);

      // then
      expect(result).to.be.false;
    });

    it('returns true when one of the references is identical', function () {
      // given
      const references = ['Martin', 'Dupont', 'Durand'];

      // when
      const result = isCloseEnoughToOneOf('Dupont', references);

      // then
      expect(result).to.be.true;
    });
  });
});
