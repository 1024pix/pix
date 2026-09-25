/**
 * @typedef {import ('../../../../domain/models/v3/Certificate.js').Certificate} Certificate
 */
import path from 'node:path';
import * as url from 'node:url';

import dayjs from 'dayjs';

import { ComplementaryCertificationKeys } from '../../../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { CERTIFICATE_LABEL_CONTEXTS } from '../../../../domain/models/v3/CertificateMeshLevel.js';
import generateV3CompetencesTemplate from './v3-certificate-competences.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const __badgesDirname = url.fileURLToPath(new URL('../badges/', import.meta.url));

/**
 * @param {object} params
 * @param {Certificate} params.data
 */
export default function generateV3CertificateTemplate({ pdf, data, translate }) {
  // Global
  pdf.image(path.resolve(__dirname, 'assets/v3-core-background.jpg'), 0, 0, {
    width: pdf.page.width,
    height: pdf.page.height,
  });

  // Main content
  pdf
    .font('Nunito-Bold')
    .fontSize(45)
    .fillColor('#253858')
    .text(translate('certification.certificate.v3.main-content.title'), 82, 150, { width: 380 });
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
    .moveDown(0.5);
  pdf
    .font('Roboto-Regular')
    .fontSize(11)
    .text(translate('certification.certificate.v3.main-content.delivered-at.label'), 82, 249)
    .moveDown(0.5);
  pdf
    .font('Nunito-Bold')
    .fontSize(25)
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

  // QR code content
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

  // Score content
  pdf
    .font('Nunito-Bold')
    .fontSize(35)
    .fillColor('#253858')
    .text(data.pixScore, 611, 99, {
      width: 84,
      align: 'center',
    })
    .moveDown(0.05);
  pdf.font('Roboto-Regular').fontSize(16).fillColor('#5e6c84').text(data.maxReachableScore, {
    width: 84,
    align: 'center',
  });

  const globalLevel = data.globalLevel;

  if (data.globalLevel) {
    pdf
      .font('Roboto-Regular')
      .fontSize(11)
      .fillColor('#6b778b')
      .text(translate('certification.certificate.v3.score-content.global-level'), 550, 195, {
        width: 205,
        align: 'center',
      });

    const globalLevelLabel = globalLevel.getLevelLabel(translate);
    pdf
      .roundedRect(
        652 - (pdf.widthOfString(globalLevelLabel) * 2) / 2,
        212,
        pdf.widthOfString(globalLevelLabel) * 2,
        24,
        24,
      )
      .fill('#6712FF');
    pdf
      .font('Nunito-Bold')
      .fontSize(14)
      .fillColor('#FFFFFF')
      .text(globalLevelLabel, 652 - (pdf.widthOfString(globalLevelLabel) * 2) / 2, 214, {
        width: pdf.widthOfString(globalLevelLabel) * 2,
        align: 'center',
      });

    const globalLevelSummary = globalLevel.getSummaryLabel(translate, CERTIFICATE_LABEL_CONTEXTS.USER);
    const globalLevelDescription = globalLevel.getDescriptionLabel(translate, CERTIFICATE_LABEL_CONTEXTS.USER);
    pdf
      .font('Nunito-Bold')
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
      .text(globalLevelDescription);
  }

  if (data.acquiredComplementaryCertification) {
    pdf
      .font('Nunito-Bold')
      .fontSize(11)
      .fillColor('#253858')
      .text(translate('certification.certificate.v3.complementary-content.title'), 530, 470, {
        width: 250,
      });
    pdf.image(path.resolve(__badgesDirname, `${ComplementaryCertificationKeys.CLEA}.png`), 628, 490, {
      width: 50,
      height: 50,
    });
  }

  if (data.resultCompetenceTree) {
    generateV3CompetencesTemplate({ pdf, data, translate });
  }
}

function _formatText(content) {
  return content.replaceAll('&#x2F;', '/').replaceAll('&#39;', "'");
}
