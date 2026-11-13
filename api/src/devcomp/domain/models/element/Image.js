import { Element } from './Element.js';

class Image extends Element {
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

    this.url = url;
    this.alt = alt;
    this.alternativeText = alternativeText;
    this.legend = legend;
    this.licence = licence;
    this.infos = infos;
    this.maxWidth = maxWidth;
  }
}

export { Image };
