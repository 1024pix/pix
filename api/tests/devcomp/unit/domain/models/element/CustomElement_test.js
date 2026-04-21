import { CustomElement } from '../../../../../../src/devcomp/domain/models/element/CustomElement.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Element | CustomElement', function () {
  describe('#constructor', function () {
    it('should create a valid CustomElement object', function () {
      // given
      const attributes = {
        id: '5ce0ddf1-8620-43b5-9e43-cd9b2ffaca17',
        title: 'Mon POI qcu image',
        functionalInstruction: 'Sélectionner une image',
        instruction: 'Instruction',
        tagName: 'qcu-image',
        props: {
          name: "Liste d'applications",
          maxChoicesPerLine: 3,
          imageChoicesSize: 'icon',
          choices: [
            {
              name: 'Google',
              image: {
                width: 534,
                height: 544,
                loading: 'lazy',
                decoding: 'async',
                src: 'https://epreuves.pix.fr/_astro/Google.B1bcY5Go_1BynY8.svg',
              },
            },
            {
              name: 'LibreOffice Writer',
              image: {
                width: 205,
                height: 246,
                loading: 'lazy',
                decoding: 'async',
                src: 'https://epreuves.pix.fr/_astro/writer.3bR8N2DK_Z1iWuJ9.webp',
              },
            },
            {
              name: 'Explorateur',
              image: {
                width: 128,
                height: 128,
                loading: 'lazy',
                decoding: 'async',
                src: 'https://epreuves.pix.fr/_astro/windows-file-explorer.CnF8MYwI_23driA.webp',
              },
            },
            {
              name: 'Geogebra',
              image: {
                width: 640,
                height: 640,
                loading: 'lazy',
                decoding: 'async',
                src: 'https://epreuves.pix.fr/_astro/geogebra.CZH9VYqc_19v4nj.webp',
              },
            },
          ],
        },
      };

      // when
      const result = new CustomElement(attributes);

      // then
      expect(result.id).to.equal(attributes.id);
      expect(result.title).to.equal(attributes.title);
      expect(result.functionalInstruction).to.equal(attributes.functionalInstruction);
      expect(result.instruction).to.equal(attributes.instruction);
      expect(result.tagName).to.equal(attributes.tagName);
      expect(result.props).to.deep.equal(attributes.props);
      expect(result.type).to.equal('custom');
    });
  });

  describe('A CustomElement without a tagName', function () {
    it('should throw an error', function () {
      const attributes = {
        id: '5ce0ddf1-8620-43b5-9e43-cd9b2ffaca17',
        instruction: 'Instruction',
      };
      // when
      const error = catchErrSync(() => new CustomElement(attributes))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The tagName is required for a CustomElement element');
    });
  });

  describe('A CustomElement without props', function () {
    it('should throw an error', function () {
      const attributes = {
        id: '5ce0ddf1-8620-43b5-9e43-cd9b2ffaca17',
        instruction: 'Instruction',
        tagName: 'qcu-image',
      };
      // when
      const error = catchErrSync(() => new CustomElement(attributes))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The props are required for a CustomElement element');
    });
  });
});
