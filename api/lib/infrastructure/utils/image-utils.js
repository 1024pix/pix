const sharp = require('sharp');
const logger = require('../logger');

async function scaleDownBase64FormattedImage({ originImage, height, width }) {
  try {
    const [format, uri] = originImage.split(';base64,');
    const imgBuffer = Buffer.from(uri, 'base64');
    const originSize = Buffer.byteLength(imgBuffer);
    const sharpImg = sharp(imgBuffer);
    const imgMetadata = await sharpImg.metadata();
    if (imgMetadata.width > width && imgMetadata.height > height) {
      sharpImg.resize({ height, width });
      const scaledDownBuffer = await sharpImg.toBuffer();
      const scaledDownSize = Buffer.byteLength(scaledDownBuffer);
      const scaledDownImage = `${format};base64,${scaledDownBuffer.toString('base64')}`;

      return {
        scaledDownImage,
        sizeDiff: originSize - scaledDownSize,
      };
    }
  } catch (err) {
    logger.trace('scaleDownBase64FormattedImage', 'error while scaling down image');
  }

  return {
    scaledDownImage: originImage,
    sizeDiff: -1,
  };
}

module.exports = {
  scaleDownBase64FormattedImage,
};
