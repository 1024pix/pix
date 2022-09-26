const ComplementaryCertificationBadge = require('../../../../lib/domain/models/ComplementaryCertificationBadge');

module.exports = function buildComplementaryCertificationBadge({
  id = 123,
  label = 'Label par défaut',
  level = 1,
  imageUrl = 'url-image.fr',
  stickerUrl = 'https://images.pix.fr/skicker.pdf',
  certificateMessage,
  temporaryCertificateMessage,
} = {}) {
  return new ComplementaryCertificationBadge({
    id,
    label,
    level,
    imageUrl,
    stickerUrl,
    certificateMessage,
    temporaryCertificateMessage,
  });
};
