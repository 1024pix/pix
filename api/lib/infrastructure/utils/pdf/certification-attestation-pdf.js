const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const pdfLibFontkit = require('@pdf-lib/fontkit');
const moment = require('moment');
const startCase = require('lodash/startCase');
const sortBy = require('lodash/sortBy');
const sharp = require('sharp');

function formatDate(date) {
  return moment(date).locale('fr').format('LL');
}

async function embedFontInDoc(pdfDoc, fontFileName, fileSystem, dirname) {
  const fontFile = await fileSystem.readFile(`${dirname}/files/${fontFileName}`);
  return pdfDoc.embedFont(fontFile);
}

function _drawScore(data, page, font, fontSize) {
  const score = data.pixScore.toString();
  const scoreWidth = font.widthOfTextAtSize(score, fontSize);

  page.drawText(score, {
    x: 105 - scoreWidth / 2,
    y: 675,
    font: font,
    size: fontSize,
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

async function _drawComplementaryCertifications(pdfDoc, data, page, _rgb, imageUtils) {
  let yCoordinate = data.hasAcquiredCleaCertification() ? 400 : 385;
  const stepY = -110;

  if (data.hasAcquiredCleaCertification()) {
    const pngBuffer = await imageUtils(data.cleaCertificationImagePath)
      .resize(80, 100, {
        fit: 'inside',
      })
      .sharpen()
      .toBuffer();
    const pngImage = await pdfDoc.embedPng(pngBuffer);
    page.drawImage(pngImage, {
      x: 400,
      y: yCoordinate,
    });
    yCoordinate += stepY;
  }

  if (data.hasAcquiredPixPlusDroitCertification()) {
    const pngBuffer = await imageUtils(data.pixPlusDroitCertificationImagePath)
      .resize(100, 120, {
        fit: 'inside',
      })
      .sharpen()
      .toBuffer();
    const pngImage = await pdfDoc.embedPng(pngBuffer);
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

async function _dynamicInformationsForAttestation({ pdfDoc, page, data, rgb, imageUtils, fileSystem, dirname }) {
  // Fonts
  const [openSansBoldFont, openSansSemiBoldFont, robotoMediumFont, robotoMonoFont] = await Promise.all(
    [
      embedFontInDoc(pdfDoc, 'OpenSans-Bold.ttf', fileSystem, dirname),
      embedFontInDoc(pdfDoc, 'OpenSans-SemiBold.ttf', fileSystem, dirname),
      embedFontInDoc(pdfDoc, 'Roboto-Medium.ttf', fileSystem, dirname),
      embedFontInDoc(pdfDoc, 'RobotoMono-Regular.ttf', fileSystem, dirname),
    ],
  );

  const scoreFont = openSansBoldFont;
  const headerFont = openSansBoldFont;
  const levelFont = robotoMediumFont;
  const maxScoreFont = openSansSemiBoldFont;
  const maxLevelFont = openSansSemiBoldFont;
  const footerFont = openSansBoldFont;
  const codeFont = robotoMonoFont;

  const headerFontSize = 9;
  const footerFontSize = 7;
  const scoreFontSize = 24;
  const levelFontSize = 9;
  const codeFontSize = 11;
  const maxScoreFontSize = 9;
  const maxLevelFontSize = 7;

  _drawScore(data, page, scoreFont, scoreFontSize);
  _drawHeaderUserInfo(data, page, headerFont, headerFontSize, rgb);
  _drawCompetencesDetails(data, page, levelFont, levelFontSize, rgb);
  _drawFooter(data, page, footerFont, footerFontSize, rgb);
  _drawMaxScore(data, page, maxScoreFont, maxScoreFontSize, rgb);
  _drawMaxLevel(data, page, maxLevelFont, maxLevelFontSize, rgb);
  _drawVerificationCode(data, page, codeFont, codeFontSize, rgb);

  if (data.hasAcquiredAnyComplementaryCertifications) {
    await _drawComplementaryCertifications(pdfDoc, data, page, rgb, imageUtils);
  }
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
  const templateFileName = certificate.hasAcquiredAnyComplementaryCertifications()
    ? 'attestation-template-with-complementary-certifications.pdf'
    : 'attestation-template.pdf';
  const formateDeliveryDate = moment(certificate.deliveredAt).format('YYYYMMDD');
  const fileName = `attestation-pix-${formateDeliveryDate}.pdf`;
  const templatePath = `${dirname}/files`;
  const data = certificate;
  const path = `${templatePath}/${templateFileName}`;
  const basePdfBytes = await fileSystem.readFile(path);
  const templatePdfDoc = await pdfWriter.load(basePdfBytes);
  const generatedPdfDoc = await pdfWriter.create();
  generatedPdfDoc.registerFontkit(fontkit);
  const [page] = await generatedPdfDoc.copyPages(templatePdfDoc, [0]);
  await _dynamicInformationsForAttestation({ pdfDoc: generatedPdfDoc, page, data, rgb, imageUtils, fileSystem, dirname });
  generatedPdfDoc.addPage(page);
  const pdfBytes = await generatedPdfDoc.save();
  const file = bufferFromBytes(pdfBytes);

  return {
    file,
    fileName,
  };
}

module.exports = {
  getCertificationAttestationPdfBuffer,
};
