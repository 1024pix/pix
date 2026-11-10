import { DomainError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Element } from './Element.ts';

class Image extends Element {
  static #VALID_HOSTNAME = 'assets.pix.org';

  /**
   * @param{object} params
   * @param{string} params.id
   * @param{string} params.url
   * @param{string} params.alt
   * @param{string} params.alternativeText
   * @param{string} [params.legend]
   * @param{string} [params.licence]
   * @param{import('../../../../shared/domain/models/PixAssetImageInfos.js').PixAssetImageInfos} [params.infos]
   * @param{number} [params.maxWidth]
   */
  constructor({ id, url, alt, alternativeText, legend, licence, infos, maxWidth }) {
    super({ id, type: 'image' });

    assertNotNullOrUndefined(url, 'The URL is required for an image');
    if (!URL.canParse(url)) {
      throw new DomainError('The URL must be a valid URL for an image');
    }

    assertNotNullOrUndefined(alt, 'The alt text is required for an image');
    assertNotNullOrUndefined(alternativeText, 'The alternative text is required for an image');

    this.url = url;
    this.alt = alt;
    this.alternativeText = alternativeText;
    this.legend = legend;
    this.licence = licence;
    this.infos = infos;
    this.maxWidth = maxWidth;

    if (URL.parse(url).hostname !== Image.#VALID_HOSTNAME) {
      throw new DomainError('The image URL must be from "assets.pix.org"');
    }
  }
}

export { Image };
