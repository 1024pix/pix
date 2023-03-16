import { readFile } from 'fs/promises';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const embeddedTemplatePages = {};

const templatesPages = {
  jaffa: 'jaffa.pdf',
  emerald: 'emerald.pdf',
  cerulean: 'cerulean.pdf',
  'wild-strawberry': 'wild-strawberry.pdf',
  'butterfly-bush': 'butterfly-bush.pdf',
  'cover-page': 'cover-page.pdf',
};

const findTemplatePage = function (areaColor) {
  if (!embeddedTemplatePages[areaColor]) {
    return embeddedTemplatePages['jaffa'];
  }
  return embeddedTemplatePages[areaColor];
};

const getCoverPage = function () {
  return embeddedTemplatePages['cover-page'];
};

const initializeTemplatesPages = async function (pdfDocument) {
  for (const templateKey in templatesPages) {
    const templateFilename = templatesPages[templateKey];
    const templateBuffer = await readFile(`${__dirname}/templates/${templateFilename}`);
    const [templatePage] = await pdfDocument.embedPdf(templateBuffer);
    embeddedTemplatePages[templateKey] = templatePage;
  }
};

export { findTemplatePage, getCoverPage, initializeTemplatesPages };
