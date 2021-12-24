const { PDFDocument, rgb } = require('pdf-lib');
const { readFile } = require('fs/promises');
const pdfLibFontkit = require('@pdf-lib/fontkit');
const moment = require('moment');
const sharp = require('sharp');
const _ = require('lodash');

const AttestationViewModel = require('./AttestationViewModel');

const fonts = {
  openSansBold: 'OpenSans-Bold.ttf',
  openSansSemiBold: 'OpenSans-SemiBold.ttf',
  robotoMedium: 'Roboto-Medium.ttf',
  robotoMonoRegular: 'RobotoMono-Regular.ttf',
};

const templates = {
  withoutComplementaryCertifications: 'withoutComplementaryCertifications',
  withComplementaryCertifications: 'withComplementaryCertifications',
};

async function getCertificationAttestationsPdfBuffer({
  certificates,
  dirname = __dirname,
  fontkit = pdfLibFontkit,
  creationDate = new Date(),
} = {}) {
  const viewModels = certificates.map(AttestationViewModel.from);
  const generatedPdfDoc = await _initializeNewPDFDocument(fontkit);
  generatedPdfDoc.setCreationDate(creationDate);
  generatedPdfDoc.setModificationDate(creationDate);
  const embeddedFonts = await _embedFonts(generatedPdfDoc, dirname);
  const embeddedImages = await _embedImages(generatedPdfDoc, viewModels);

  const templatePdfPages = await _embedTemplatePagesIntoDocument(viewModels, dirname, generatedPdfDoc);

  await _render({ templatePdfPages, pdfDocument: generatedPdfDoc, viewModels, rgb, embeddedFonts, embeddedImages });

  const buffer = await _finalizeDocument(generatedPdfDoc);

  const fileName = `attestation-pix-${moment(certificates[0].deliveredAt).format('YYYYMMDD')}.pdf`;

  return {
    buffer,
    fileName,
  };
}

async function _initializeNewPDFDocument(fontkit) {
  const pdfDocument = await PDFDocument.create();
  pdfDocument.registerFontkit(fontkit);
  return pdfDocument;
}

async function _embedFonts(pdfDocument, dirname) {
  const embeddedFonts = {};
  for (const fontKey in fonts) {
    const embeddedFont = await _embedFontInPDFDocument(pdfDocument, fonts[fontKey], dirname);
    embeddedFonts[fontKey] = embeddedFont;
  }
  return embeddedFonts;
}

async function _embedFontInPDFDocument(pdfDoc, fontFileName, dirname) {
  const fontFile = await readFile(`${dirname}/files/${fontFileName}`);
  return pdfDoc.embedFont(fontFile, { subset: true, customName: fontFileName });
}

async function _embedImages(pdfDocument, viewModels) {
  const embeddedImages = {};
  const viewModelsWithCleaCertification = _.filter(viewModels, (viewModel) =>
    viewModel.shouldDisplayCleaCertification()
  );

  if (viewModelsWithCleaCertification.length > 0) {
    const cleaCertificationImagePath = viewModelsWithCleaCertification[0].cleaCertificationImagePath;
    const image = await _embedCleaCertificationImage(pdfDocument, cleaCertificationImagePath);
    embeddedImages[cleaCertificationImagePath] = image;
  }

  const viewModelsWithPixPlusDroitCertification = _.filter(viewModels, (viewModel) =>
    viewModel.shouldDisplayPixPlusDroitCertification()
  );

  if (viewModelsWithPixPlusDroitCertification.length > 0) {
    const singleImagePaths = _(viewModelsWithPixPlusDroitCertification)
      .map('pixPlusDroitCertificationImagePath')
      .uniq()
      .value();
    for (const path of singleImagePaths) {
      const image = await _embedPixPlusDroitCertificationImage(pdfDocument, path);
      embeddedImages[path] = image;
    }
  }

  const viewModelsWithPixPlusEduCertification = _.filter(viewModels, (viewModel) =>
    viewModel.shouldDisplayPixPlusEduCertification()
  );

  if (viewModelsWithPixPlusEduCertification.length > 0) {
    const singleImagePaths = _(viewModelsWithPixPlusEduCertification)
      .map('pixPlusEduCertificationImagePath')
      .uniq()
      .value();
    for (const path of singleImagePaths) {
      embeddedImages[path] = await _embedPixPlusEduCertificationImage(pdfDocument, path);
    }
  }
  return embeddedImages;
}

async function _embedCleaCertificationImage(pdfDocument, cleaCertificationImagePath) {
  const pngBuffer = await sharp(cleaCertificationImagePath)
    .resize(80, 100, {
      fit: 'inside',
    })
    .sharpen()
    .toBuffer();
  const pngImage = await pdfDocument.embedPng(pngBuffer);
  return pngImage;
}

async function _embedPixPlusDroitCertificationImage(pdfDocument, pixPlusDroitCertificationImagePath) {
  const pngBuffer = await sharp(pixPlusDroitCertificationImagePath)
    .resize(100, 120, {
      fit: 'inside',
    })
    .sharpen()
    .toBuffer();
  const pngImage = await pdfDocument.embedPng(pngBuffer);
  return pngImage;
}

async function _embedPixPlusEduCertificationImage(pdfDocument, pixPlusEduCertificationImagePath) {
  const pngBuffer = await sharp(pixPlusEduCertificationImagePath)
    .resize(80, 90, {
      fit: 'inside',
    })
    .sharpen()
    .toBuffer();
  return await pdfDocument.embedPng(pngBuffer);
}

async function _embedTemplatePagesIntoDocument(viewModels, dirname, pdfDocument) {
  const templatePages = {};

  if (_atLeastOneWithComplementaryCertifications(viewModels)) {
    const embededPage = await _embedFirstPageFromTemplateByFilename(
      'attestation-template-with-complementary-certifications.pdf',
      pdfDocument,
      dirname
    );
    templatePages[templates.withComplementaryCertifications] = embededPage;
  }

  if (_atLeastOneWithoutComplementaryCertifications(viewModels)) {
    const embededPage = await _embedFirstPageFromTemplateByFilename('attestation-template.pdf', pdfDocument, dirname);
    templatePages[templates.withoutComplementaryCertifications] = embededPage;
  }
  return templatePages;
}

async function _embedFirstPageFromTemplateByFilename(templatePdfDocumentFileName, destinationDocument, dirname) {
  const templateBuffer = await _loadTemplateByFilename(templatePdfDocumentFileName, dirname);
  const [templatePage] = await destinationDocument.embedPdf(templateBuffer);
  return templatePage;
}

function _atLeastOneWithComplementaryCertifications(viewModels) {
  return _.some(viewModels, (viewModel) => viewModel.shouldDisplayComplementaryCertifications());
}

function _atLeastOneWithoutComplementaryCertifications(viewModels) {
  return _.some(viewModels, (viewModel) => !viewModel.shouldDisplayComplementaryCertifications());
}

async function _loadTemplateByFilename(templateFileName, dirname) {
  const path = `${dirname}/files/${templateFileName}`;
  return readFile(path);
}

async function _render({ templatePdfPages, pdfDocument, viewModels, rgb, embeddedFonts, embeddedImages }) {
  for (const viewModel of viewModels) {
    const newPage = pdfDocument.addPage();

    const templatePage = await _getTemplatePage(viewModel, templatePdfPages);
    newPage.drawPage(templatePage);

    // Note: calls to setFont() are mutualized outside of the _render* methods
    // to save space. Calling setFont() n times with the same fonts creates
    // unnecessary links and big documents.
    //
    // For the same reason, don't use the `font` option of `drawText()`.
    // Size gains for 140 certifs: 5 MB -> 700 kB
    newPage.setFont(embeddedFonts.openSansBold);
    _renderScore(viewModel, newPage, embeddedFonts.openSansBold);
    _renderHeaderCandidateInformations(viewModel, newPage, rgb);
    _renderFooter(viewModel, newPage, rgb);

    newPage.setFont(embeddedFonts.robotoMedium);
    _renderCompetencesDetails(viewModel, newPage, rgb);

    newPage.setFont(embeddedFonts.openSansSemiBold);
    _renderMaxScore(viewModel, newPage, rgb, embeddedFonts.openSansSemiBold);
    _renderMaxLevel(viewModel, newPage, rgb);

    newPage.setFont(embeddedFonts.robotoMonoRegular);
    _renderVerificationCode(viewModel, newPage, rgb);

    _renderCleaCertification(viewModel, newPage, embeddedImages);
    _renderPixPlusCertificationCertification(viewModel, newPage, embeddedImages);
  }
}

async function _getTemplatePage(viewModel, templatePdfPages) {
  if (viewModel.shouldDisplayComplementaryCertifications()) {
    return templatePdfPages.withComplementaryCertifications;
  } else {
    return templatePdfPages.withoutComplementaryCertifications;
  }
}

function _renderScore(viewModel, page, font) {
  const pixScore = viewModel.pixScore;
  const scoreFontSize = 24;
  const scoreWidth = font.widthOfTextAtSize(pixScore, scoreFontSize);

  page.drawText(pixScore, {
    x: 105 - scoreWidth / 2,
    y: 675,
    size: scoreFontSize,
  });
}

function _renderMaxScore(viewModel, page, rgb, font) {
  const maxScoreFontSize = 9;

  const maxReachableScore = viewModel.maxReachableScore;
  const maxScoreWidth = font.widthOfTextAtSize(maxReachableScore, maxScoreFontSize);

  page.drawText(maxReachableScore, {
    x: 105 - maxScoreWidth / 2,
    y: 659,
    size: maxScoreFontSize,
    color: rgb(0 / 255, 45 / 255, 80 / 255),
  });
}

function _renderMaxLevel(viewModel, page, rgb) {
  page.drawText(viewModel.maxLevel, {
    x: 159,
    y: 608,
    size: 7,
    color: rgb(80 / 255, 95 / 255, 121 / 255),
  });
}

function _renderFooter(viewModel, page, rgb) {
  page.drawText(viewModel.maxReachableLevelIndication, {
    x: 55,
    y: 46,
    size: 7,
    color: rgb(42 / 255, 64 / 255, 99 / 255),
  });

  if (viewModel.shouldDisplayAbsoluteMaxLevelIndication()) {
    page.drawText(viewModel.absoluteMaxLevelIndication, {
      x: 55,
      y: 35,
      size: 7,
      color: rgb(42 / 255, 64 / 255, 99 / 255),
    });
  }
}

function _renderHeaderCandidateInformations(viewModel, page, rgb) {
  [
    [230, 712, viewModel.fullName],
    [269, 695.5, viewModel.birth],
    [257, 680, viewModel.certificationCenter],
    [208, 663.5, viewModel.certificationDate],
  ].forEach(([x, y, text]) => {
    page.drawText(text, {
      x,
      y,
      size: 9,
      color: rgb(26 / 255, 64 / 255, 109 / 255),
    });
  });
}

function _renderVerificationCode(viewModel, page, rgb) {
  page.drawText(viewModel.verificationCode, {
    x: 410,
    y: 560,
    size: 11,
    color: rgb(1, 1, 1),
  });
}

function _renderPixPlusCertificationCertification(viewModel, page, embeddedImages) {
  let yCoordinate = 385;

  if (viewModel.shouldDisplayCleaCertification()) {
    yCoordinate = 290;
  }

  if (viewModel.shouldDisplayPixPlusDroitCertification()) {
    const pngImage = embeddedImages[viewModel.pixPlusDroitCertificationImagePath];
    page.drawImage(pngImage, {
      x: 390,
      y: yCoordinate,
    });
    yCoordinate -= 100;
  }

  if (viewModel.shouldDisplayPixPlusEduCertification()) {
    const pngImage = embeddedImages[viewModel.pixPlusEduCertificationImagePath];
    page.drawImage(pngImage, {
      x: 400,
      y: yCoordinate,
    });
    yCoordinate -= 15;

    viewModel.pixPlusEduTemporaryBadgeMessage.forEach((text, index) => {
      page.drawText(text, {
        x: 350,
        y: yCoordinate - index * 10,
        size: 7,
        color: rgb(37 / 255, 56 / 255, 88 / 255),
      });
    });
  }
}

function _renderCleaCertification(viewModel, page, embeddedImages) {
  if (viewModel.shouldDisplayCleaCertification()) {
    const pngImage = embeddedImages[viewModel.cleaCertificationImagePath];
    page.drawImage(pngImage, {
      x: 400,
      y: 400,
    });
  }
}

function _renderCompetencesDetails(viewModel, page, rgb) {
  const competencesLevelCoordinates = [556, 532, 508, 452, 428, 404, 380, 324, 300, 276, 252, 196, 172, 148, 92, 68];

  viewModel.competenceDetailViewModels.forEach((competenceDetailViewModel) => {
    const y = competencesLevelCoordinates.shift();
    if (competenceDetailViewModel.shouldBeDisplayed()) {
      page.drawText(competenceDetailViewModel.level, {
        x: 291,
        y: y + 5,
        size: 9,
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
}

async function _finalizeDocument(pdfDocument) {
  const pdfBytes = await pdfDocument.save();
  const buffer = Buffer.from(pdfBytes);
  return buffer;
}

module.exports = {
  getCertificationAttestationsPdfBuffer,
};
