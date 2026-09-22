/**
 * @typedef {import ('../../../domain/models/v3/Certificate.js').Certificate} Certificate
 */
import url from 'node:url';
import path from 'node:path';

import PDFDocument from 'pdfkit';

import { hasCoreScope } from '../../../../shared/domain/models/Frameworks.js';
import generateV3CertificateTemplate from './templates/v3-certificate.js';
import generateV3PixPlusCertificateTemplate from './templates/v3-pix-plus-certificate.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * @param {object} params
 * @param {Array<Certificate>} params.certificates
 */
export async function generate({ certificates, i18n, testing }) {
  if (testing) {
    return testpdfkit(certificates[0], { translate: i18n.__ });
  }
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
  });

  doc.info = {
    Title: i18n.__('certification.certificate.file-metadata.title'),
    Author: 'Pix',
    Keywords: 'v3',
    CreationDate: new Date(),
  };

  doc.registerFont('Nunito-Bold', `${__dirname}/../../../../../shared/infrastructure/utils/pdf/fonts/Nunito-Bold.ttf`);
  doc.registerFont(
    'Roboto-Regular',
    `${__dirname}/../../../../../shared/infrastructure/utils/pdf/fonts/Roboto-Regular.ttf`,
  );
  doc.registerFont(
    'Roboto-Medium',
    `${__dirname}/../../../../../shared/infrastructure/utils/pdf/fonts/Roboto-Medium.ttf`,
  );

  const imageCache = new Map();

  for (const [index, certificate] of certificates.entries()) {
    if (index > 0) {
      doc.addPage();
    }

    if (hasCoreScope(certificate.certificationFramework)) {
      generateV3CertificateTemplate({
        pdf: doc,
        data: certificate,
        translate: i18n.__,
      });
    } else {
      await generateV3PixPlusCertificateTemplate({
        pdf: doc,
        data: certificate,
        translate: i18n.__,
        imageCache,
      });
    }
  }

  doc.end();

  return doc;
}

const areas_text = {
  1: {
    label: '1. Information et données',
    competences_text: {
      1: {
        label: '1.1 Mener une recherche et une veille d’information',
        content:
          'Adapter sa stratégie de recherche pour trouver l’information la plus adaptée dans un contexte de surabondance (bruit) et d’ambiguité del’information. Utiliser des outils de veille informationnelle pour construire une veille. Utiliser des outils de détection de fausses informations pour vérifier les informations.',
      },
      2: {
        label: '1.2. Gérer des données ',
        content:
          'Stocker et organiser ses données pour qu’elles soient accessibles dans des environnements numériques locaux et distants. Concevoir une organisation efficace de rangement de dossiers en tenant compte des formats de fichiers.',
      },
      3: {
        label: '1.3. Traiter des données',
        content:
          'Automatiser un traitement de données pour le reproduire. Choisir le format d’une donnée (texte/nombre) pour l’adapter à un besoin. Réaliser des représentations graphiques adaptées à un besoin. Nettoyer un jeu de données pour améliorer sa qualité.',
      },
    },
  },
  2: {
    label: '2. Communication et collaboration',
    competences_text: {
      1: {
        label: '2.1. Interagir',
        content:
          'Paramètrer ses outils ou services de communication numérique pour les adapter au contexte et à la situation de communication. Modérer les interactions en ligne pour garantir le respect des règles de civilité et le droit des personnes.',
      },
      2: {
        label: '2.2. Partager et publier ',
        content:
          'Choisir un outil approprié pour partager des contenus avec un publiclarge. Partager du contenu en direct avec un public large. Paramétrer la visibilité d’un contenu partagé. Savoir créer des identités numériques multiples, adaptées aux différents contextes et usages.',
      },
      3: {
        label: '2.3. Collaborer',
        content:
          'Utiliser un dispositif d’écriture collaborative pour  coproduire des contenus dans le cadre d’un projet. Partager des documents dans un espace de travail partagé. Organiser des événements collaboratifs à l’aide d’un agenda partagé.',
      },
      4: {
        label: '2.4 S’insérer dans le monde numérique',
        content:
          'Repérer les traces personnelles laissées lors des utilisations de services en ligne. Connaître ses droits d’information, d’accès, de rectification, d’opposition, de suppression et de déréférencement. Connaître les principes et enjeux de l’anonymisation des données. Connaître des utilisations courantes de l’intelligence artificielle.',
      },
    },
  },
  3: {
    label: '3. Création de contenu',
    competences_text: {
      1: {
        label: '3.1. Développer des documents textuels',
        content:
          'Créer des supports numériques adaptés en conformité avec les règles d’une organisation (charte graphique, etc). Concevoir un modèle et garantir la robustesse et l’adaptabilité du contenu saisi.',
      },
      2: {
        label: '3.2. Développer des documents multimédia ',
        content:
          'Exploiter les caractéristiques techniques avancées des images, des vidéos et des sons. Utiliser les outils de montage et de retouche pour réaliser des créations multimédia de qualité.',
      },
      3: {
        label: '3.3. Adapter les documents à leur finalité',
        content:
          'Connaître et appliquer les principales règles régissant le droit d’auteur. Réutiliser un document disponible sur le web en identifiant sa licence et en s’y conformant. Connaître et appliquer les principales techniques pour rendre un document accessible (personnes en situation de handicap).',
      },
      4: {
        label: '3.4 Programmer ',
        content:
          'Créer un programme optimisé pour résoudre un problème. Repérer et corriger des épreuves courantes dans un programme. Installer et interroger une base de données relationnelle. Évaluer l’efficacité d’une méthode de compression.',
      },
    },
  },
  4: {
    label: '4. Protection et sécurité',
    competences_text: {
      1: {
        label: '4.1. Sécuriser l’environnement numérique',
        content:
          'Identifier différents risques numériques et mettre en œuvre des stratégies de protection des ressources matérielles et logicielles. Vérifier l’absence de menace dans un contenu avant action (ouverture, activation, installation). Sécuriser ses accès aux environnements numériques.',
      },
      2: {
        label: '4.2. Protéger les données personnelles et la vie privée',
        content:
          'Mettre en œuvre des stratégies de protection de sa vie privée et de ses données personnelles et respecter celles des autres. Sécuriser sa navigation en ligne et analyser les pages et fichiers consultés et utilisés. Trouver et interpréter les conditions générales d’utilisation d’un service en ligne.',
      },
      3: {
        label: '4.3. Protéger la santé, le bien-être et l’environnement',
        content:
          'Choisir et promouvoir des stratégies de protection de sa santé et de celle des autres dans un environnement numérique (ergonomie du poste de travail, déconnexion, ...). Expliquer l’impact environnemental du numérique, en recourant à des indicateurs et des modèles étayés (sac à dos écologique, analyse de cycle de vie, PUE, etc).',
      },
    },
  },
  5: {
    label: '5. Environnement numérique',
    competences_text: {
      1: {
        label: '5.1 Résoudre des problèmes techniques',
        content:
          'Entretenir le système d’exploitation, les données, les connexions, les équipements de son environnement personnel et professionnel.  Diagnostiquer des pannes simples sur les appareils numériques.',
      },
      2: {
        label: '5.2 Construire un environnement numérique',
        content:
          'Construire son environnement numérique et optimiser sa configuration en s’appuyant sur une compréhension poussée du fonctionnement des appareils numériques et des réseaux et sur une connaissance fine des modèles de composants logiciels et matériels.',
      },
    },
  },
};

const GAP = 4;
const MARGIN = 25;
const PADDING_TAG = 1;

export function testpdfkit(certificate, { translate }) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 0,
    bufferPages: true,
  });

  doc.registerFont('Nunito-Bold', `${__dirname}/../../../../../shared/infrastructure/utils/pdf/fonts/Nunito-Bold.ttf`);
  doc.registerFont(
    'OpenSans-SemiBold',
    `${__dirname}/../../../../../shared/infrastructure/utils/pdf/fonts/OpenSans-SemiBold.ttf`,
  );
  doc.registerFont(
    'Roboto-Regular',
    `${__dirname}/../../../../../shared/infrastructure/utils/pdf/fonts/Roboto-Regular.ttf`,
  );
  doc.x = MARGIN;
  doc.y = 162;

  const NB_COLUMNS = 3;
  const COLUMN_GAP = 16;
  const columnWidth = (doc.page.contentWidth - MARGIN - MARGIN - (NB_COLUMNS - 1) * COLUMN_GAP) / NB_COLUMNS;
  const initY = doc.y;

  for (const area of certificate.resultCompetenceTree.areas) {
    const areaTitle = translate(`certification.certificate.areas.${area.code}.label`);
    const areaBlockHeight = measureHeightOfHeaderBlock(doc, areaTitle, area.resultCompetences[0].name, columnWidth);
    changeColumnIfNeeded(doc, areaBlockHeight, columnWidth, COLUMN_GAP, initY);

    writeAreaTitle(doc, areaTitle, area.color, area.code, columnWidth, initY);

    for (const { index, level } of area.resultCompetences) {
      const strLevel = String(level);
      const competenceIndex = index.split('.')[1];
      const tradBaseKey = `certification.certificate.areas.${area.code}.competences.${competenceIndex}`;
      const competenceTitle = translate(tradBaseKey + '.index') + '. ' + translate(tradBaseKey + '.title');

      const competenceBlockHeight = measureHeightOfHeaderBlock(doc, null, competenceTitle, columnWidth);
      changeColumnIfNeeded(doc, competenceBlockHeight, columnWidth, COLUMN_GAP, initY);

      writeCompetenceHeader(doc, strLevel, competenceTitle, columnWidth, area.color, initY);

      const content = translate(tradBaseKey + `.levels.${strLevel}`);
      writeParagraph(doc, content, columnWidth, COLUMN_GAP, initY);
    }
    addGap(doc, initY);
  }
  doc.end();
  return doc;
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
  const tokens = [];
  let rest = text;
  while (rest.length > 0) {
    const index = rest.search(/[\s\n]/);
    if (index === -1) {
      tokens.push(rest);
      break;
    }
    tokens.push(rest.substring(0, index + 1));
    rest = rest.slice(index + 1);
  }
  return tokens;
}

function wouldOverflowColumn(pdfDoc, text, columnWidth) {
  const pageBottom = pdfDoc.page.contentHeight - MARGIN;
  return pdfDoc.y + pdfDoc.heightOfString(text, { width: columnWidth }) > pageBottom;
}

function writeCompetenceHeader(doc, level, labelCompetences, columnWidth, color, initY) {
  const startX = doc.x;
  const startY = doc.y;

  const { tagHeight, shiftX, titleWidth, titleHeight } = measureCompetenceHeader(
    doc,
    level,
    labelCompetences,
    columnWidth,
    color,
  );

  doc.x = startX;
  doc.y = startY + Math.max(0, (titleHeight - tagHeight) / 2);
  writeLevelTag(doc, level, color);

  doc.x = startX + shiftX;
  doc.y = startY;
  docWithStyleForCompetenceTitle(doc, color).text(labelCompetences, { width: titleWidth });

  doc.x = startX;
  addGap(doc, initY);
}

function measureCompetenceHeader(doc, level, labelCompetences, columnWidth, color) {
  const levelLabel = 'Niveau ' + level;
  const tagMeasureDoc = docWithStyleForTag(doc);
  const tagWidth = tagMeasureDoc.widthOfString(levelLabel);
  const tagHeight = tagMeasureDoc.heightOfString(levelLabel);
  const shiftX = GAP + tagWidth + PADDING_TAG * 2;
  const titleWidth = columnWidth - shiftX;
  const titleHeight = docWithStyleForCompetenceTitle(doc, color).heightOfString(labelCompetences, {
    width: titleWidth,
  });
  return { tagHeight, shiftX, titleWidth, titleHeight };
}

function writeLevelTag(doc, level, color) {
  const levelLabel = 'Niveau ' + level;
  const styledDoc = docWithStyleForTag(doc);
  const tagWidth = styledDoc.widthOfString(levelLabel);
  const tagHeight = styledDoc.heightOfString(levelLabel);
  doc.roundedRect(doc.x - PADDING_TAG * 4, doc.y - PADDING_TAG, tagWidth, tagHeight, 50).fill(color);
  docWithStyleForLevel(doc).text(levelLabel);

  return { tagWidth, tagHeight };
}

function writeAreaTitle(pdfDoc, label, color, areaCode, columnWidth, initY) {
  const startX = pdfDoc.x;
  const startY = pdfDoc.y;

  pdfDoc.image(path.resolve(__dirname, `templates/assets/area-icon/area-${areaCode}.png`), { fit: [25, 16] })

  pdfDoc.x = startX + 25 + GAP;
  pdfDoc.y = startY + 2;

  docWithStyleForAreaTitle(pdfDoc, color).text(areaCode + '. ' +  label, { width: columnWidth });

  pdfDoc.x = startX;
  pdfDoc.y += 2;

  addGap(pdfDoc, initY);
}

function changeColumnIfNeeded(pdfDoc, blockHeight, columnWidth, columnGap, initY) {
  if (pdfDoc.y + blockHeight > pdfDoc.page.contentHeight - MARGIN) {
    changeColumn(pdfDoc, columnWidth, columnGap, initY);
  }
}

function measureHeightOfHeaderBlock(pdfDoc, areaTitle, competenceTitle, columnWidth) {
  let height = 0;
  if (areaTitle) {
    const docForArea = docWithStyleForAreaTitle(pdfDoc);
    pdfDoc.switchToPage(0);
    height += docForArea.heightOfString(areaTitle, { width: columnWidth }) + GAP;
  }
  const docForCompetence = docWithStyleForCompetenceTitle(pdfDoc);
  pdfDoc.switchToPage(0);

  const docForParagraph = docWithStyleForParagraphText(pdfDoc);
  const heightOfParagraphLine = docForParagraph.heightOfString('A', { width: columnWidth });
  height += docForCompetence.heightOfString(competenceTitle, { width: columnWidth }) + GAP + heightOfParagraphLine;
  return height;
}

function changeColumn(pdfDoc, columnWidth, columnGap, initY) {
  pdfDoc.switchToPage(0);
  pdfDoc.x = pdfDoc.x + columnWidth + columnGap;
  pdfDoc.y = initY;
  pdfDoc.switchToPage(0);
}

function addGap(pdfDoc, initY) {
  if (pdfDoc.y === initY) return;
  if (pdfDoc.y + GAP > pdfDoc.page.contentHeight - MARGIN) return;
  pdfDoc.y += GAP;
}

function docWithStyleForAreaTitle(pdfDoc, color) {
  const AREA_FONT_SIZE = 11;
  return pdfDoc.font('Nunito-Bold').fillColor(color).fontSize(AREA_FONT_SIZE);
}

function docWithStyleForTag(pdfDoc) {
  return pdfDoc.font('OpenSans-SemiBold').fontSize(9);
}

function docWithStyleForLevel(pdfDoc) {
  return pdfDoc.font('OpenSans-SemiBold').fillColor('#fff').fontSize(7);
}

function docWithStyleForCompetenceTitle(pdfDoc, color) {
  return pdfDoc.font('OpenSans-SemiBold').fillColor(color).fontSize(9);
}

function docWithStyleForParagraphText(pdfDoc) {
  return pdfDoc.font('Roboto-Regular').fillColor('#000000').fontSize(8);
}
