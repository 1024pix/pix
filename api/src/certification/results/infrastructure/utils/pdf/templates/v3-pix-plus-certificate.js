/**
 * @typedef {import ('../../../../domain/models/v3/Certificate.js').Certificate} Certificate
 */
import path from 'node:path';
import * as url from 'node:url';

import dayjs from 'dayjs';

import { config } from '../../../../../../shared/config.js';
import { CERTIFICATE_LABEL_CONTEXTS } from '../../../../domain/models/v3/CertificateMeshLevel.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * @param {object} params
 * @param {import('pdfkit')} params.pdf
 * @param {Certificate} params.data
 * @param {Function} params.translate
 * @param {Map<string, Buffer>} params.imageCache
 */
export default async function generateV3PixPlusCertificateTemplate({ pdf, data, translate, imageCache }) {
  // Global
  pdf.image(path.resolve(__dirname, 'assets/v3-pix-plus-background.jpg'), 0, 0, {
    width: pdf.page.width,
    height: pdf.page.height,
  });

  const pixPlusLogo = {
    DROIT: 'pix-plus-droit.png',
    PRO_SANTE: 'pix-plus-pro-sante.png',
    EDU_1ER_DEGRE: 'pix-plus-edu.png',
    EDU_2ND_DEGRE: 'pix-plus-edu.png',
    EDU_CPE: 'pix-plus-edu.png',
  }[data.certificationFramework];

  if (pixPlusLogo) {
    pdf.image(path.resolve(__dirname, `assets/${pixPlusLogo}`), 40, 10, {
      width: 110,
      height: 110,
    });
  }

  // Main content
  pdf
    .font('Nunito-Bold')
    .fontSize(29)
    .fillColor('#253858')
    .text(translate('certification.certificate.v3.main-content.title-pix-plus'), 82, 150, { width: 380 })
    .moveUp(0.1);
  pdf
    .font('Nunito-Bold')
    .fontSize(29)
    .fillColor('#253858')
    .text(_formatText(translate(`certification.certificate.v3.pix-plus-labels.${data.certificationFramework}`)), {
      width: 380,
    })
    .moveDown(0.05);
  pdf
    .font('Roboto-Regular')
    .fontSize(11)
    .text(
      _formatText(
        translate('certification.certificate.v3.main-content.certification-center', {
          certificationCenter: data.certificationCenter,
        }),
      ),
      {
        width: 380,
        lineGap: 2,
      },
    )
    .moveDown(1.25);
  pdf
    .font('Roboto-Regular')
    .fontSize(11)
    .text(translate('certification.certificate.v3.main-content.delivered-at.label'));
  pdf
    .font('Nunito-Bold')
    .fontSize(22)
    .text(`${data.firstName} ${data.lastName.toUpperCase()}`, { width: 380, lineGap: -7 })
    .moveDown(0.25);

  const birthdate = dayjs(data.birthdate).format('DD/MM/YYYY');
  const deliveredAt = dayjs(data.deliveredAt).format('DD/MM/YYYY');

  pdf
    .font('Roboto-Regular')
    .fontSize(11)
    .text(
      _formatText(
        translate('certification.certificate.v3.main-content.birth', {
          birthdate,
          birthplace: data.birthplace,
        }),
      ),
    );
  pdf
    .font('Roboto-Regular')
    .fontSize(11)
    .text(
      _formatText(
        translate('certification.certificate.v3.main-content.delivered-at.date', {
          deliveredAt,
        }),
      ),
      82,
      364,
    );
  pdf
    .font('Roboto-Regular')
    .fontSize(10)
    .fillColor('#6b778b')
    .text(translate('certification.certificate.v3.main-content.signature'), 82, 440);

  // QR code
  pdf.font('Roboto-Medium').fontSize(11).fillColor('#5e6c84').text(data.verificationCode, 142, 467).moveDown(0.25);
  pdf
    .font('Roboto-Regular')
    .fontSize(8.25)
    .text(translate('certification.certificate.v3.qr-code-content.explanation'), {
      continued: true,
      width: 137,
    })
    .text(translate('certification.certificate.v3.qr-code-content.link.label'), {
      link: translate('certification.certificate.v3.qr-code-content.link.url'),
    });

  // Result
  if (data.globalLevel) {
    const globalLevelLabel = data.globalLevel.getLevelLabel(translate);

    if (data.globalLevel.meshLevel === 'LEVEL_ADMISSIBLE') {
      pdf.image(path.resolve(__dirname, 'assets/badges/pix-plus-edu-admissible.png'), 594, 80, {
        width: 120,
        height: 120,
      });

      pdf
        .roundedRect(
          652 - (pdf.widthOfString(globalLevelLabel) * 2) / 2,
          202,
          pdf.widthOfString(globalLevelLabel) * 2,
          24,
          24,
        )
        .fill('#B9D8CD');
      pdf
        .font('Roboto-Regular')
        .fontSize(12)
        .fillColor('#004726')
        .text(globalLevelLabel, 652 - (pdf.widthOfString(globalLevelLabel) * 2) / 2, 207, {
          width: pdf.widthOfString(globalLevelLabel) * 2,
          align: 'center',
        });
    } else {
      const framework = data.certificationFramework.toLowerCase();
      const level = data.globalLevel.meshLevel.replace('LEVEL_', '').toLowerCase();
      const badgeUrl = `${config.assetsManager.url}/badges-certifies/v3/${framework}/${level}.png`;
      const badgeBuffer = await _fetchImage(badgeUrl, imageCache);
      if (badgeBuffer) {
        pdf.image(badgeBuffer, 594, 80, {
          width: 120,
          height: 120,
        });
      }
    }

    const globalLevelSummary = data.globalLevel.getSummaryLabel(translate, CERTIFICATE_LABEL_CONTEXTS.USER);
    const globalLevelDescription = data.globalLevel.getDescriptionLabel(translate, CERTIFICATE_LABEL_CONTEXTS.USER);
    pdf
      .font('Roboto-Medium')
      .fontSize(11)
      .fillColor('#253858')
      .text(translate('certification.certificate.v3.score-content.level-explanation.user'), 530, 250, {
        width: 250,
      })
      .moveDown(0.5)
      .font('Roboto-Medium')
      .fontSize(9.5)
      .text(globalLevelSummary)
      .moveDown(0.5)
      .font('Roboto-Regular')
      .fontSize(9.5)
      .text(globalLevelDescription, { lineGap: 5 });
  }
}

async function _fetchImage(url, imageCache) {
  if (imageCache.has(url)) return imageCache.get(url);

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    imageCache.set(url, buffer);
    return buffer;
  } catch {
    return null;
  }
}

function _formatText(content) {
  return content.replaceAll('&#x2F;', '/').replaceAll('&#39;', "'");
}
