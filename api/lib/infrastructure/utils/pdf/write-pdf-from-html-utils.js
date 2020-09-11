const puppeteer = require('puppeteer');
const _ = require('lodash');
const { promises: fs } = require('fs');

const INTERPOLATE_REGEX = /{{([\s\S]+?)}}/g;

async function getHtmlContentFromTemplate(templatePath, templateFileName, templateData) {
  const template = await fs.readFile(`${templatePath}/${templateFileName}`, 'utf8');

  _.templateSettings.interpolate = INTERPOLATE_REGEX;
  const compiled = _.template(template);
  const compiledWithData = compiled(templateData);
  return compiledWithData;
}

async function getPdfBufferFromHtml({
  templatePath,
  templateFileName,
  templateData,
  pdfOptions = {
    format: 'A4',
    printBackground: true,
  },
  getHtmlContent = getHtmlContentFromTemplate,
}) {
  let browser;
  let buffer;

  try {
    browser = await puppeteer.launch({ headless: true, args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ] });
    const page = await browser.newPage();

    const htmlContent = await getHtmlContent(templatePath, templateFileName, templateData);
    await page.setContent(htmlContent);
    buffer = await page.pdf(pdfOptions);
  } catch (e) {
    console.error({ e });
    throw (e);
  } finally {
    // eslint-disable-next-line require-await
    if (browser) browser.close();
  }

  return buffer;
}

module.exports = {
  getPdfBufferFromHtml,
  getHtmlContentFromTemplate,
};
