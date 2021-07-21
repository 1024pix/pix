const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const pdfLibFontkit = require('@pdf-lib/fontkit');
const moment = require('moment');
const startCase = require('lodash/startCase');
const sortBy = require('lodash/sortBy');
const sharp = require('sharp');

const fonts = {
  openSansBold: 'OpenSans-Bold.ttf',
  openSansSemiBold: 'OpenSans-SemiBold.ttf',
  robotoMedium: 'Roboto-Medium.ttf',
  robotoMonoRegular: 'RobotoMono-Regular.ttf',
};

const images = {
  clea: 'clea',
  pixPlusDroit: 'pixPlusDroit',
};

function formatDate(date) {
  return moment(date).locale('fr').format('LL');
}

function _renderScore(data, page, embeddedFonts) {
  const scoreFontSize = 24;
  const scoreFont = embeddedFonts.openSansBold;
  const score = data.pixScore.toString();
  const scoreWidth = scoreFont.widthOfTextAtSize(score, scoreFontSize);

  page.drawText(score, {
    x: 105 - scoreWidth / 2,
    y: 675,
    font: embeddedFonts.openSansBold,
    size: scoreFontSize,
  });
}

function _drawMaxScore(data, page, font, fontSize, rgb) {
  const maxScore = data.maxReachableScore.toString() + '*';
  const maxScoreWidth = font.widthOfTextAtSize(maxScore, fontSize);

  page.drawText(maxScore, {
    x: 105 - maxScoreWidth / 2, y: 659,
    font: font,
    size: fontSize,
    color: rgb(0 / 255, 45 / 255, 80 / 255),
  });
}

function _drawMaxLevel(data, page, font, fontSize, rgb) {
  const maxLevel = `(niveaux sur ${data.maxReachableLevelOnCertificationDate})`;

  page.drawText(maxLevel, {
    x: 159, y: 608,
    font: font,
    size: fontSize,
    color: rgb(80 / 255, 95 / 255, 121 / 255),
  });
}

function _drawFooter(data, page, font, fontSize, rgb) {
  const maxReachableLevelIndication = `* À la date d’obtention de cette certification, le nombre maximum de pix atteignable était de ${data.maxReachableScore}, correspondant au niveau ${data.maxReachableLevelOnCertificationDate}.`;

  page.drawText(maxReachableLevelIndication, {
    x: 55, y: 46,
    font: font,
    size: fontSize,
    color: rgb(42 / 255, 64 / 255, 99 / 255),
  });

  if (data.maxReachableLevelOnCertificationDate < 8) {
    const absoluteMaxLevelindication = 'Lorsque les 8 niveaux du référentiel Pix seront disponibles, ce nombre maximum sera de 1024 pix.';
    page.drawText(absoluteMaxLevelindication, {
      x: 55, y: 35,
      font: font,
      size: fontSize,
      color: rgb(42 / 255, 64 / 255, 99 / 255),
    });
  }
}

function _drawHeaderUserInfo(data, page, font, fontSize, rgb) {
  const fullName = `${startCase(data.firstName)} ${startCase(data.lastName)}`;
  const birthplaceInfo = data.birthplace ? ` à ${data.birthplace}` : '';
  const birthInfo = formatDate(data.birthdate) + birthplaceInfo;
  const certifCenter = data.certificationCenter;
  const certifDate = formatDate(data.deliveredAt);
  [
    [230, 712, fullName],
    [269, 695.5, birthInfo],
    [257, 680, certifCenter],
    [208, 663.5, certifDate],
  ].forEach(([x, y, text]) => {
    page.drawText(text, {
      x, y,
      font: font,
      size: fontSize,
      color: rgb(26 / 255, 64 / 255, 109 / 255),
    });
  });
}

function _drawVerificationCode(data, page, font, fontSize, rgb) {
  const code = data.verificationCode;
  const verificationCodeCoordinates = { x: 410, y: 560 };

  page.drawText(code, {
    ...verificationCodeCoordinates,
    font: font,
    size: fontSize,
    color: rgb(1, 1, 1),
  });
}

async function _drawComplementaryCertifications(pdfDoc, data, page, embeddedImages) {
  let yCoordinate = data.hasAcquiredCleaCertification() ? 400 : 385;
  const stepY = -110;

  if (data.hasAcquiredCleaCertification()) {
    const pngImage = embeddedImages[images.clea];
    page.drawImage(pngImage, {
      x: 400,
      y: yCoordinate,
    });
    yCoordinate += stepY;
  }

  if (data.hasAcquiredPixPlusDroitCertification()) {
    const pngImage = embeddedImages[images.pixPlusDroit];
    page.drawImage(pngImage, {
      x: 390,
      y: yCoordinate,
    });
  }
}

function _drawCompetencesDetails(data, page, font, fontSize, rgb) {
  const competencesLevelCoordinates = [
    556, 532, 508,
    452, 428, 404, 380,
    324, 300, 276, 252,
    196, 172, 148,
    92, 68,
  ];
  const sortedCompetenceTree = sortBy(data.resultCompetenceTree.areas, 'code');
  sortedCompetenceTree.forEach((area) => {
    area.resultCompetences.forEach((competence) => {
      const y = competencesLevelCoordinates.shift();
      if (competence.level > 0) {
        page.drawText(competence.level.toString(), {
          x: 291, y: y + 5,
          font: font,
          size: fontSize,
          color: rgb(37 / 255, 56 / 255, 88 / 255),
        });
      } else {
        page.drawRectangle({
          x: 65,
          y,
          width: 210,
          height: 18,
          color: rgb(1, 1, 1),
          opacity: 0.5,
        });
      }
    });
  });
}

async function _render({ templateDocument, pdfDocument, certificate, rgb, embeddedFonts, embeddedImages }) {

  const page = await _copyPageFromTemplateIntoDocument(pdfDocument, templateDocument);

  const headerFont = embeddedFonts.openSansBold;
  const levelFont = embeddedFonts.robotoMedium;
  const maxScoreFont = embeddedFonts.openSansSemiBold;
  const maxLevelFont = embeddedFonts.openSansSemiBold;
  const footerFont = embeddedFonts.openSansBold;
  const codeFont = embeddedFonts.robotoMonoRegular;

  const headerFontSize = 9;
  const footerFontSize = 7;
  const levelFontSize = 9;
  const codeFontSize = 11;
  const maxScoreFontSize = 9;
  const maxLevelFontSize = 7;

  _renderScore(certificate, page, embeddedFonts);
  _drawHeaderUserInfo(certificate, page, headerFont, headerFontSize, rgb);
  _drawCompetencesDetails(certificate, page, levelFont, levelFontSize, rgb);
  _drawFooter(certificate, page, footerFont, footerFontSize, rgb);
  _drawMaxScore(certificate, page, maxScoreFont, maxScoreFontSize, rgb);
  _drawMaxLevel(certificate, page, maxLevelFont, maxLevelFontSize, rgb);
  _drawVerificationCode(certificate, page, codeFont, codeFontSize, rgb);

  if (certificate.hasAcquiredAnyComplementaryCertifications) {
    await _drawComplementaryCertifications(pdfDocument, certificate, page, embeddedImages);
  }
  pdfDocument.addPage(page);
}

async function getCertificationAttestationPdfBuffer({
  certificate,
  fileSystem = fs.promises,
  pdfWriter = PDFDocument,
  bufferFromBytes = Buffer.from,
  imageUtils = sharp,
  dirname = __dirname,
  fontkit = pdfLibFontkit,
} = {}) {
  const generatedPdfDoc = await _initializeNewPDFDocument(pdfWriter, fontkit);
  const embeddedFonts = await _embedFonts(generatedPdfDoc, fileSystem, dirname);
  const embeddedImages = await _embedImages(generatedPdfDoc, certificate, imageUtils);

  const templatePdfDoc = await _getTemplatePDFDocument(certificate, dirname, fileSystem, pdfWriter);

  await _render({ templateDocument: templatePdfDoc, pdfDocument: generatedPdfDoc, certificate, rgb, embeddedFonts, embeddedImages });

  const pdfBytes = await generatedPdfDoc.save();
  const file = bufferFromBytes(pdfBytes);

  const formateDeliveryDate = moment(certificate.deliveredAt).format('YYYYMMDD');
  const fileName = `attestation-pix-${formateDeliveryDate}.pdf`;

  return {
    file,
    fileName,
  };
}

async function _copyPageFromTemplateIntoDocument(pdfDocument, templatePdfDocument) {
  const pages = await pdfDocument.copyPages(templatePdfDocument, [0]);
  return pages[0];
}

async function _initializeNewPDFDocument(pdfWriter, fontkit) {
  const pdfDocument = await pdfWriter.create();
  pdfDocument.registerFontkit(fontkit);
  return pdfDocument;
}

async function _getTemplatePDFDocument(certificate, dirname, fileSystem, pdfWriter) {
  const templateFileName = certificate.hasAcquiredAnyComplementaryCertifications()
    ? 'attestation-template-with-complementary-certifications.pdf'
    : 'attestation-template.pdf';
  const path = `${dirname}/files/${templateFileName}`;
  const basePdfBytes = await fileSystem.readFile(path);
  return await pdfWriter.load(basePdfBytes);
}

async function _embedFonts(pdfDocument, fileSystem, dirname) {
  const embeddedFonts = {};
  for (const font in fonts) {
    const embeddedFont = await embedFontInPDFDocument(pdfDocument, fonts[font], fileSystem, dirname);
    embeddedFonts[font] = embeddedFont;
  }
  return embeddedFonts;
}

async function embedFontInPDFDocument(pdfDoc, fontFileName, fileSystem, dirname) {
  const fontFile = await fileSystem.readFile(`${dirname}/files/${fontFileName}`);
  return pdfDoc.embedFont(fontFile);
}

async function _embedImages(pdfDocument, certificate, imageUtils) {
  const embeddedImages = {};
  if (certificate.hasAcquiredCleaCertification()) {
    const image = await _embedCleaCertificationImage(pdfDocument, certificate, imageUtils);
    embeddedImages[images.clea] = image;
  }
  if (certificate.hasAcquiredPixPlusDroitCertification()) {
    const image = await _embedPixPlusDroitCertificationImage(pdfDocument, certificate, imageUtils);
    embeddedImages[images.pixPlusDroit] = image;
  }
  return embeddedImages;
}

async function _embedCleaCertificationImage(pdfDocument, certificate, imageUtils) {
  const pngBuffer = await imageUtils(certificate.cleaCertificationImagePath)
    .resize(80, 100, {
      fit: 'inside',
    })
    .sharpen()
    .toBuffer();
  const pngImage = await pdfDocument.embedPng(pngBuffer);
  return pngImage;
}

async function _embedPixPlusDroitCertificationImage(pdfDocument, certificate, imageUtils) {
  const pngBuffer = await imageUtils(certificate.pixPlusDroitCertificationImagePath)
    .resize(100, 120, {
      fit: 'inside',
    })
    .sharpen()
    .toBuffer();
  const pngImage = await pdfDocument.embedPng(pngBuffer);
  return pngImage;
}

module.exports = {
  getCertificationAttestationPdfBuffer,
};
