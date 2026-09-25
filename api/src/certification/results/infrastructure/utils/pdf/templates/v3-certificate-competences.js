import path from 'node:path';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const GAP = 4;
const MARGIN = 25;
const PADDING_TAG = 1;
const NB_COLUMNS = 3;
const COLUMN_GAP = 16;
const xShiftCompetenceTitle = 50;
const AREA_ICON_WIDTH = 25;
const NOT_OBTAINED_COLOR = '#4F6384';
const NOT_OBTAINED_TAG_COLOR = '#EDEFF3';
const GLOBAL_LEVEL_TAG_COLOR = '#613FDD';

export default function generateV3CompetencesTemplate({ pdf, data, translate }) {
  pdf.addPage({ margin: 0, size: 'A4', layout: 'landscape' });
  pdf.image(path.resolve(__dirname, 'assets/v3_core_background_verso.png'), 0, 0, {
    width: pdf.page.width,
    height: pdf.page.height,
  });

  writeHeader(pdf, data, translate);

  pdf.x = MARGIN;
  pdf.y = 162;

  const columnWidth = (pdf.page.contentWidth - MARGIN - MARGIN - (NB_COLUMNS - 1) * COLUMN_GAP) / NB_COLUMNS;
  const initY = pdf.y;

  for (const area of data.resultCompetenceTree.areas) {
    const areaTitle = translate(`certification.certificate.v3.competence-results.areas.${area.code}.label`);
    const areaBlockHeight = measureAreaHeaderHeight(pdf, areaTitle, columnWidth);
    changeColumnIfNeeded(pdf, areaBlockHeight, columnWidth, COLUMN_GAP, initY);

    const hasNoObtainedCompetence = area.resultCompetences.every((competence) => competence.level === 0);
    writeAreaTitle(pdf, areaTitle, area.color, area.code, columnWidth, initY, hasNoObtainedCompetence);

    for (const { index, level } of area.resultCompetences) {
      const competenceIndex = index.split('.')[1];
      const tradBaseKey = `certification.certificate.v3.competence-results.areas.${area.code}.competences.${competenceIndex}`;
      const competenceTitle = translate(tradBaseKey + '.index') + '. ' + translate(tradBaseKey + '.title');
      const isObtained = level > 0;
      const levelLabel = isObtained
        ? translate('certification.certificate.v3.competence-results.level-tag') + String(level)
        : translate('certification.certificate.v3.competence-results.level-not-obtained');

      const competenceBlockHeight = measureCompetenceBlockHeight(
        pdf,
        levelLabel,
        competenceTitle,
        columnWidth,
        isObtained,
      );
      changeColumnIfNeeded(pdf, competenceBlockHeight, columnWidth, COLUMN_GAP, initY);

      writeCompetenceHeader(pdf, levelLabel, isObtained, competenceTitle, columnWidth, area.color, initY);

      if (isObtained) {
        const content = translate(tradBaseKey + `.levels.${String(level)}`);
        writeParagraph(pdf, content, columnWidth, COLUMN_GAP, initY);
      } else {
        addGap(pdf, initY);
      }
    }
    addGap(pdf, initY);
  }
}

function writeHeader(pdf, certificate, translate) {
  const MAX_SCORE = '895';
  const styledScore = docWithStyleForPixScore(pdf);
  pdf.x = 102.5 - styledScore.widthOfString(String(certificate.pixScore)) / 2;
  pdf.y = 65;
  styledScore.text(certificate.pixScore);

  pdf.x = 91;
  pdf.y = 103;
  docWithStyleForMaxPixScore(pdf).text(MAX_SCORE);

  const candidateName = certificate.firstName + ' ' + certificate.lastName;
  const styledName = docWithStyleForCandidateName(pdf);
  const twoLineHeight = styledName.heightOfString('A\nB', { lineGap: -4 });
  const nameHeight = styledName.heightOfString(candidateName, { width: 300, lineGap: -4 });
  const nameYOffset = Math.round(Math.max(0, twoLineHeight - nameHeight) / 2);
  pdf.x = 170;
  pdf.y = 45 + nameYOffset;
  styledName.text(candidateName, { width: 300, lineGap: -4 });

  pdf.x = 170;
  pdf.y = 104;
  docWithStyleForGlobalLevelTitle(pdf).text(translate('certification.certificate.v3.score-content.global-level'));

  const styledGlobalLevelTag = docWithStyleForGlobalLevelTag(pdf);
  const globalLevelTag = translate(`certification.meshlevel.CORE.${certificate.globalLevel.meshLevel}.label`);
  pdf.x = 273;
  pdf.y = 104;
  const tagWidth = styledGlobalLevelTag.widthOfString(globalLevelTag) + PADDING_TAG * 24;
  const tagHeight = styledGlobalLevelTag.heightOfString(globalLevelTag) + PADDING_TAG * 8;
  pdf
    .roundedRect(pdf.x - PADDING_TAG * 12, pdf.y - PADDING_TAG * 4, tagWidth, tagHeight, 50)
    .fill(GLOBAL_LEVEL_TAG_COLOR);
  docWithStyleForGlobalLevelTag(pdf).text(globalLevelTag);

  pdf.x = 503;
  pdf.y = 30;
  const infoText = translate('certification.certificate.v3.competence-results.competences-info').replace(/\. /g, '.\n');
  docWithStyleForParagraphInfo(pdf).text(infoText, { width: 274, align: 'left', lineGap: 5 });

  pdf.x = 503;
  pdf.y = 104;
  docWithStyleForCompetencesTitle(pdf).text(
    translate('certification.certificate.v3.competence-results.competences-title'),
  );
}

function writeParagraph(pdfDoc, text, columnWidth, columnGap, initY) {
  const styledDoc = docWithStyleForParagraphText(pdfDoc);
  const tokens = splitIntoTokens(text);

  let confirmedFitCount = 0;
  let upperBound = tokens.length;
  while (confirmedFitCount < upperBound) {
    const mid = Math.floor((confirmedFitCount + upperBound + 1) / 2);
    if (wouldOverflowColumn(styledDoc, tokens.slice(0, mid).join(''), columnWidth)) {
      upperBound = mid - 1;
    } else {
      confirmedFitCount = mid;
    }
  }

  const textThatFits = tokens.slice(0, confirmedFitCount).join('');
  const textThatOverflows = tokens.slice(confirmedFitCount).join('');

  styledDoc.text(textThatFits, { width: columnWidth, align: 'justify' });
  if (textThatOverflows.length > 0) {
    changeColumn(styledDoc, columnWidth, columnGap, initY);
    styledDoc.text(textThatOverflows, { width: columnWidth, align: 'justify' });
  }
  addGap(styledDoc, initY);
  addGap(styledDoc, initY);
}

function splitIntoTokens(text) {
  return text.split(/(?<=\s)/);
}

function wouldOverflowColumn(pdfDoc, text, columnWidth) {
  const pageBottom = pdfDoc.page.contentHeight - MARGIN;
  return pdfDoc.y + pdfDoc.heightOfString(text, { width: columnWidth }) > pageBottom;
}

function writeCompetenceHeader(doc, levelLabel, isObtained, labelCompetences, columnWidth, areaColor, initY) {
  const startX = doc.x;
  const startY = doc.y;
  const tagColor = isObtained ? areaColor : NOT_OBTAINED_TAG_COLOR;

  const { tagWidth, tagHeight, titleWidth, titleHeight } = measureCompetenceHeader(
    doc,
    levelLabel,
    labelCompetences,
    columnWidth,
    isObtained,
  );

  doc.x = startX;
  doc.y = startY + Math.max(0, (titleHeight - tagHeight) / 2);
  writeLevelTag(doc, levelLabel, tagColor, tagWidth, tagHeight, isObtained);

  doc.x = startX + xShiftCompetenceTitle;
  doc.y = startY;
  docWithStyleForCompetenceTitle(doc, areaColor, isObtained).text(labelCompetences, { width: titleWidth });

  doc.x = startX;
  addGap(doc, initY);
}

function measureCompetenceHeader(doc, levelLabel, labelCompetences, columnWidth, isObtained) {
  const tagMeasureDoc = docWithStyleForTag(doc, isObtained);
  const tagWidth = tagMeasureDoc.widthOfString(levelLabel);
  const tagHeight = tagMeasureDoc.heightOfString(levelLabel);
  const titleWidth = columnWidth - xShiftCompetenceTitle;
  const titleHeight = docWithStyleForCompetenceTitle(doc).heightOfString(labelCompetences, { width: titleWidth });
  const totalHeight = Math.max(tagHeight, titleHeight);
  return { tagWidth, tagHeight, titleWidth, titleHeight, totalHeight };
}

function writeLevelTag(doc, levelLabel, tagColor, tagWidth, tagHeight, isObtained) {
  doc.x += PADDING_TAG * 4;
  doc.roundedRect(doc.x - PADDING_TAG * 4, doc.y - PADDING_TAG, tagWidth, tagHeight, 50).fill(tagColor);
  docWithStyleForLevel(doc, isObtained).text(levelLabel);
}

function writeAreaTitle(pdfDoc, label, areaColor, areaCode, columnWidth, initY, hasNoObtainedCompetence) {
  const startX = pdfDoc.x;
  const startY = pdfDoc.y;
  const color = hasNoObtainedCompetence ? NOT_OBTAINED_COLOR : areaColor;
  const iconFileName = hasNoObtainedCompetence ? `${areaCode}-disable` : areaCode;

  pdfDoc.image(path.resolve(__dirname, `assets/area-icon/area-${iconFileName}.png`), { fit: [16, 16] });

  pdfDoc.x = startX + AREA_ICON_WIDTH + GAP;
  pdfDoc.y = startY + 2;
  docWithStyleForAreaTitle(pdfDoc, color).text(areaCode + '. ' + label, { width: columnWidth });

  pdfDoc.x = startX;
  pdfDoc.y += 2;
  addGap(pdfDoc, initY);
}

function changeColumnIfNeeded(pdfDoc, blockHeight, columnWidth, columnGap, initY) {
  if (pdfDoc.y + blockHeight > pdfDoc.page.contentHeight - MARGIN) {
    changeColumn(pdfDoc, columnWidth, columnGap, initY);
  }
}

function measureAreaHeaderHeight(pdfDoc, areaTitle, columnWidth) {
  return docWithStyleForAreaTitle(pdfDoc).heightOfString(areaTitle, { width: columnWidth }) + GAP;
}

function measureCompetenceBlockHeight(pdfDoc, levelLabel, competenceTitle, columnWidth, isObtained) {
  const paragraphLineHeight = isObtained
    ? docWithStyleForParagraphText(pdfDoc).heightOfString('A', { width: columnWidth })
    : 0;
  return (
    measureCompetenceHeader(pdfDoc, levelLabel, competenceTitle, columnWidth).totalHeight + GAP + paragraphLineHeight
  );
}

function changeColumn(pdfDoc, columnWidth, columnGap, initY) {
  pdfDoc.x = pdfDoc.x + columnWidth + columnGap;
  pdfDoc.y = initY;
}

function addGap(pdfDoc, initY) {
  if (pdfDoc.y === initY) return;
  if (pdfDoc.y + GAP > pdfDoc.page.contentHeight - MARGIN) return;
  pdfDoc.y += GAP;
}

function docWithStyleForPixScore(pdfDoc) {
  return pdfDoc.font('Nunito-Bold').fillColor('#000').fontSize(20);
}

function docWithStyleForMaxPixScore(pdfDoc) {
  return pdfDoc.font('Roboto-Regular').fillColor('#212A37').fontSize(12);
}

function docWithStyleForCandidateName(pdfDoc) {
  return pdfDoc.font('Nunito-Bold').fillColor('#000').fontSize(18);
}

function docWithStyleForGlobalLevelTitle(pdfDoc) {
  return pdfDoc.font('OpenSans-SemiBold').fillColor('#6B778C').fontSize(12);
}

function docWithStyleForGlobalLevelTag(pdfDoc) {
  return pdfDoc.font('OpenSans-SemiBold').fillColor('#FFF').fontSize(12);
}

function docWithStyleForParagraphInfo(pdfDoc) {
  return pdfDoc.font('Roboto-Regular').fillColor('#000').fontSize(10);
}

function docWithStyleForCompetencesTitle(pdfDoc) {
  return pdfDoc.font('OpenSans-SemiBold').fillColor('#000').fontSize(12);
}

function docWithStyleForAreaTitle(pdfDoc, areaColor) {
  return pdfDoc.font('Nunito-Bold').fillColor(areaColor).fontSize(11);
}

function docWithStyleForTag(pdfDoc, isObtained) {
  const fontSize = isObtained ? 9 : 7;
  return pdfDoc.font('OpenSans-SemiBold').fontSize(fontSize);
}

function docWithStyleForLevel(pdfDoc, isObtained) {
  const color = isObtained ? '#fff' : NOT_OBTAINED_COLOR;
  const fontSize = isObtained ? 7 : 5.5;
  return pdfDoc.font('OpenSans-SemiBold').fillColor(color).fontSize(fontSize);
}

function docWithStyleForCompetenceTitle(pdfDoc, areaColor = '#000000', isObtained) {
  const color = isObtained ? areaColor : NOT_OBTAINED_COLOR;
  return pdfDoc.font('OpenSans-SemiBold').fillColor(color).fontSize(9);
}

function docWithStyleForParagraphText(pdfDoc) {
  return pdfDoc.font('Roboto-Regular').fillColor('#253858').fontSize(8);
}
