import { expect, catchErr, sinon } from '../../test-helper';
import {
  buildCountries,
  checkTransformUnicity,
} from '../../../scripts/certification/import-certification-cpf-countries';
import { noop } from 'lodash/noop';

describe('Unit | Scripts | import-certification-cpf-countries.js', function () {
  beforeEach(function () {
    sinon.stub(console, 'error').callsFake(noop);
  });

  describe('#buildCountries', function () {
    context('Allowed countries type', function () {
      it('should return countries with type 1', function () {
        // given
        const csvData = [{ ACTUAL: '1', LIBCOG: 'PORTUGAL' }];

        // when
        const countries = buildCountries({ csvData });

        // then
        expect(countries).not.to.be.empty;
      });

      it('should return countries with type 4', function () {
        // given
        const csvData = [{ ACTUAL: '4', LIBCOG: 'PORTUGAL' }];

        // when
        const countries = buildCountries({ csvData });

        // then
        expect(countries).not.to.be.empty;
      });
    });

    context('Ignored countries type', function () {
      it('should not return countries with type 2', function () {
        // given
        const csvData = [{ ACTUAL: '2' }];

        // when
        const countries = buildCountries({ csvData });

        // then
        expect(countries).to.be.empty;
      });

      it('should not return countries with type 3', function () {
        // given
        const csvData = [{ ACTUAL: '3' }];

        // when
        const countries = buildCountries({ csvData });

        // then
        expect(countries).to.be.empty;
      });
    });

    context('When ACTUAL is 1 and COG is XXXX', function () {
      it('should set the code as 99100', function () {
        // given
        const csvData = [{ ACTUAL: '1', COG: 'XXXXX', LIBCOG: 'FRANCE' }];

        // when
        const countries = buildCountries({ csvData });

        // then
        expect(countries[0].code).to.equal('99100');
      });
    });

    it('should return countries with their alternatives', function () {
      // given
      const csvData = [
        { LIBCOG: 'PAYS-BAS', LIBENR: 'ROYAUME DES PAYS-BAS', COG: '99135', ACTUAL: '1' },
        { LIBCOG: 'ESPAGNE', LIBENR: "ROYAUME D'ESPAGNE", COG: '99134', ACTUAL: '1' },
      ];

      // when
      const countries = buildCountries({ csvData });

      // then
      expect(countries).to.deep.equal([
        {
          code: '99135',
          commonName: 'PAYS-BAS',
          originalName: 'PAYS-BAS',
          matcher: 'AABPSSY',
        },
        {
          code: '99135',
          commonName: 'PAYS-BAS',
          originalName: 'ROYAUME DES PAYS-BAS',
          matcher: 'AAABDEEMOPRSSSUYY',
        },
        {
          code: '99134',
          commonName: 'ESPAGNE',
          originalName: 'ESPAGNE',
          matcher: 'AEEGNPS',
        },
        {
          code: '99134',
          commonName: 'ESPAGNE',
          originalName: "ROYAUME D'ESPAGNE",
          matcher: 'AADEEEGMNOPRSUY',
        },
      ]);
    });

    it('should return one occurence of a country if its alternative is the same as its common', function () {
      // given
      const csvData = [{ LIBCOG: 'PAYS-BAS', LIBENR: 'PAYS-BAS', COG: '99135', ACTUAL: '1' }];

      // when
      const countries = buildCountries({ csvData });

      // then
      expect(countries).to.deep.equal([
        {
          code: '99135',
          commonName: 'PAYS-BAS',
          originalName: 'PAYS-BAS',
          matcher: 'AABPSSY',
        },
      ]);
    });
  });

  describe('#checkTransformUnicity', function () {
    describe('#when there are no conflicts', function () {
      it('should not throw an error', async function () {
        const countries = [
          {
            code: '99141',
            commonName: 'REPUBLIQUE DEMOCRATIQUE ALLEMANDE',
            originalName: 'RÉPUBLIQUE DÉMOCRATIQUE ALLEMANDE',
            matcher: 'AAABCDDEEEEEEIILLLMMNOPQQRRTUUU',
          },
          {
            code: '990000',
            commonName: 'AU PAYS DE CANDY',
            originalName: 'AU PAYS DE CANDY',
            matcher: 'AAACDDENPSUYY',
          },
          {
            code: '990000',
            commonName: 'AU PAYS DE CANDY',
            originalName: 'COMME DANS TOUT LES PAYS',
            matcher: 'AACDEELMMNOOPSSSTTUY',
          },
        ];
        const error = checkTransformUnicity(countries);

        // then
        expect(error).to.be.undefined;
        // eslint-disable-next-line no-console
        expect(console.error).not.to.have.been.called;
      });
    });

    describe('#when there are conflicts', function () {
      it('should throw an error', async function () {
        const countries = [
          {
            code: '99140',
            commonName: 'REPUBLIQUE DEMOCRATIQUE ALLEMANDE',
            originalName: 'RÉPUBLIQUE DÉMOCRATIQUE ALLEMANDE',
            matcher: 'AAABCDDEEEEEEIILLLMMNOPQQRRTUUU',
          },
          {
            code: '99141',
            commonName: 'ALLEMAGNE',
            originalName: 'RÉPUBLIQUE DÉMOCRATIQUE ALLEMANDE',
            matcher: 'AAABCDDEEEEEEIILLLMMNOPQQRRTUUU',
          },
          {
            code: '990000',
            commonName: 'AU PAYS DE CANDY',
            originalName: 'LA LA LA COMME DANS TOUT LES PAYS',
            matcher: 'AAAAACDEELLLLMMNOOPSSSTTUY',
          },
          {
            code: '990001',
            commonName: 'AU PAYS DE CANDY',
            originalName: 'COMME DANS TOUT LES PAYS LA LA LA',
            matcher: 'AAAAACDEELLLLMMNOOPSSSTTUY',
          },
        ];
        const error = await catchErr(checkTransformUnicity)(countries);

        // then
        expect(error).to.be.instanceOf(Error);
        // eslint-disable-next-line no-console
        expect(console.error.getCall(0)).to.have.been.calledWithExactly(
          'CONFLICT: 99140,99141 RÉPUBLIQUE DÉMOCRATIQUE ALLEMANDE,RÉPUBLIQUE DÉMOCRATIQUE ALLEMANDE'
        );
        // eslint-disable-next-line no-console
        expect(console.error.getCall(1)).to.have.been.calledWithExactly(
          'CONFLICT: 990000,990001 LA LA LA COMME DANS TOUT LES PAYS,COMME DANS TOUT LES PAYS LA LA LA'
        );
      });
    });
  });
});
