/**
 * @typedef {import ('../../../domain/models/v3/Certificate.js').Certificate} Certificate
 */
import url from 'node:url';

import PDFDocument from 'pdfkit';

import { hasCoreScope } from '../../../../shared/domain/models/Frameworks.js';
import generateV3CertificateTemplate from './templates/v3-certificate.js';
import generateV3PixPlusCertificateTemplate from './templates/v3-pix-plus-certificate.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * @param {object} params
 * @param {Array<Certificate>} params.certificates
 */
export async function generate({ certificates, i18n }) {
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
export function testpdfkit() {
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
  const init_y = doc.y;
  let index = 0;
  for (const area_data of Object.values(areas_text)) {
    const heightForBlockToCome = heightOfBlock(
      doc,
      area_data.label,
      area_data.competences_text['1'].label,
      columnWidth,
    );
    const isOverflow = doc.y + heightForBlockToCome > doc.page.contentHeight - MARGIN;
    if (isOverflow) {
      changeColumn(doc, columnWidth, COLUMN_GAP, init_y);
    }
    let docWithStyle = docWithStyleForAreaTitle(doc, COLORS[index]);
    docWithStyle.text(area_data.label, { width: columnWidth });
    addGap(doc, init_y);

    for (const { label, content } of Object.values(area_data.competences_text)) {
      const heightForBlockToCome = heightOfBlock(doc, null, label, columnWidth);
      const isOverflow = doc.y + heightForBlockToCome > doc.page.contentHeight - MARGIN;
      if (isOverflow) {
        changeColumn(doc, columnWidth, COLUMN_GAP, init_y);
      }
      docWithStyle = docWithStyleForCompetenceTitle(doc);
      createTagLevelWithCompetenceName(docWithStyle, 'Niveau 1', label, columnWidth, COLORS[index])
      addGap(doc, init_y);

      docWithStyle = docWithStyleForParagraphText(doc);
      writeParagraph(docWithStyle, content, columnWidth, COLUMN_GAP, init_y);
      addGap(doc, init_y);
      addGap(doc, init_y);
    }
    addGap(doc, init_y);
    index++;
  }
  doc.end();
  return doc;
}

function changeColumn(pdfDoc, columnWidth, columnGap, initY) {
  pdfDoc.switchToPage(0);
  pdfDoc.x = pdfDoc.x + columnWidth + columnGap;
  pdfDoc.y = initY;
  pdfDoc.switchToPage(0);
}

function docWithStyleForAreaTitle(pdfDoc, color) {
  return pdfDoc.font('Nunito-Bold').fillColor(color).fontSize(AREA_FONT_SIZE);
}

function docWithStyleForCompetenceTitle(pdfDoc) {
  return pdfDoc.font('OpenSans-SemiBold').fillColor('#52D987').fontSize(9);
}

function docWithStyleForParagraphText(pdfDoc) {
  return pdfDoc.font('Roboto-Regular').fillColor('#000000').fontSize(8);
}

// (area) + competence + paragraph (soit la font size du paragraphe pour une fois)
function heightOfBlock(pdfDoc, areaTitle, competenceTitle, columnWidth) {
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

function addGap(pdfDoc, initY) {
  if (pdfDoc.y === initY) {
    return;
  }
  if (pdfDoc.contentHeight - pdfDoc.y > GAP + 1) {
    return;
  }
  pdfDoc.y += GAP;
}

function writeParagraph(pdfDoc, text, columnWidth, columnGap, initY) {
  let textQuiRentre = '';
  let textQuiReste = structuredClone(text);
  while (textQuiReste.length > 0) {
    const index = textQuiReste.search(/[\s\n]/);
    let token;
    if (index === -1) {
      token = textQuiReste;
    } else {
      token = textQuiReste.substring(0, index + 1);
    }
    const height_total = pdfDoc.y + pdfDoc.heightOfString(textQuiRentre + token, { width: columnWidth });
    const isOverflow = height_total > pdfDoc.page.contentHeight - MARGIN;
    if (isOverflow) {
      break;
    }
    if (index === -1) {
      textQuiReste = '';
    } else {
      textQuiReste = textQuiReste.slice(index + 1);
    }
    textQuiRentre = textQuiRentre + token;
  }
  pdfDoc.text(textQuiRentre, { width: columnWidth , align: 'justify'});
  if (textQuiReste.length > 0) {
    changeColumn(pdfDoc, columnWidth, columnGap, initY);
    pdfDoc.text(textQuiReste, { width: columnWidth , align: 'justify' });
  }
}

const AREA_FONT_SIZE = 11;
const GAP = 4;
const MARGIN = 25;
const PADDING_TAG = 1;
const COLORS = ['#F24645', '#1A8C89', '#3D68FF', '#AC008D', '#5E2563']

function createTagLevelWithCompetenceName(pdf, level, labelCompetences , columnWidth, color) {
  const previousX = pdf.x;
  const previousY = pdf.y;
  const levelLabelwidth = pdf.widthOfString(level);
  const levelLabelHeight = pdf.heightOfString(level);

  pdf.roundedRect(pdf.x - PADDING_TAG * 4, pdf.y - PADDING_TAG, levelLabelwidth, levelLabelHeight, 50).fill(color)

  pdf.font('OpenSans-SemiBold').fillColor('#fff').fontSize(7);
  pdf.text(level);


  const shiftXOfTag = GAP + levelLabelwidth + PADDING_TAG * 2 ;
  const shifYOfTag = pdf.y - levelLabelHeight + PADDING_TAG * 2;
  pdf.x += shiftXOfTag;
  pdf.y = shifYOfTag;

  pdf.font('OpenSans-SemiBold').fillColor(color).fontSize(9);
  pdf.text(labelCompetences, { width: columnWidth - shiftXOfTag });
  pdf.x = previousX

  pdf.y = previousY + pdf.heightOfString(labelCompetences, { width: columnWidth - shiftXOfTag });
}


// label 1.1 truc pdfDoc.y 181.004
// after shift y 180.2803671875
// after shift x 68.96875
// { columnWidth: 253.29666666666665, shifXOfTag: 68.96875 }
// after competence Name y 189.81308203125
// after competence Name x 25
// label 1.1 truc pdfDoc.y 189.81308203125

// label 3.1. Développer des documents textuels pdfDoc.y 181.004
// after shift y 180.2803671875
// after shift x 338.2654166666666
// { columnWidth: 253.29666666666665, shifXOfTag: 338.2654166666666 }
// after competence Name y 180.2803671875
// after competence Name x 294.2966666666666
// label 3.1. Développer des documents textuels pdfDoc.y 180.2803671875
