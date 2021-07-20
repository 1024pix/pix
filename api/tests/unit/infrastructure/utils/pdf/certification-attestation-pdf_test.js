const { expect, domainBuilder } = require('../../../../test-helper');
const { getCertificationAttestationPdfBuffer } = require('../../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf');

describe('Unit | Infrastructure | Utils | Pdf | Certification Attestation Pdf', () => {
  it('should generate full attestation (non-regression test)', async () => {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificate = domainBuilder.buildCertificationAttestation({
      resultCompetenceTree,
      cleaCertificationImagePath: 'clea/image/path',
      pixPlusDroitCertificationImagePath: 'pix/plus/image/path',
    });

    // when
    const { file, fileName } = await getCertificationAttestationPdfBuffer({
      certificate,
      fileSystem: new FileSystemForTest(),
      pdfWriter: new PDFWriterForTest(),
      imageUtils: (path) => new ImageUtilsForTest(path),
      bufferFromBytes: bufferFromBytesForTest,
      dirname: '.',
      fontkit: 'fontkit for test',
    });

    expect(file).to.deep.equal(expectedBuffer);
    expect(fileName).to.equal('attestation-pix-20181003.pdf');
  });
});

class FileSystemForTest {
  constructor() {
    this.files = {
      './files/attestation-template-with-complementary-certifications.pdf': templateFile,
      './files/OpenSans-Bold.ttf': openSandBoldFontFile,
      './files/OpenSans-SemiBold.ttf': openSansSemiBoldFontFile,
      './files/Roboto-Medium.ttf': robotoMediumFontFile,
      './files/RobotoMono-Regular.ttf': robotoMonoRegularFontFile,
    };
  }
  async readFile(path) {
    const file = this.files[path];
    if (file) {
      return file;
    }
    throw new Error('no stub for ' + path);
  }
}

class PDFWriterForTest {

  async load(file) {
    if (file.id === templateFile.id) {
      return templateDocument;
    }
    throw new Error('no stub for ' + file.id);
  }

  async create() {
    return new PDFDocumentForTest();
  }
}

function bufferFromBytesForTest(bytes) {
  return new BufferForTest(bytes);
}

class ImageUtilsForTest {
  constructor(path) {
    this.imageBuffer = new ImageBufferForTest(path);
  }
  resize(x, y, options) {
    this.imageBuffer.resize(x, y, options);
    return this;
  }
  sharpen() {
    this.imageBuffer.sharpen();
    return this;
  }
  async toBuffer() {
    return this.imageBuffer;
  }
}

class ImageBufferForTest {
  constructor(path) {
    this.path = path;
    this.isSharp = false;
    this.resizedWith;
  }
  resize(x, y, options) {
    this.resizedWith = {
      x,
      y,
      options,
    };
  }
  sharpen() {
    this.isSharp = true;
  }
}

class ImageForTest {
  constructor(buffer) {
    this.fromBuffer = buffer;
  }
}

class PageForTest {
  constructor(content = []) {
    this.content = content;
  }
  drawText(text, { x, y, font, size, color }) {
    this.content.push({
      type: 'Text',
      text,
      x,
      y,
      font,
      size,
      color: color ?? 'default',
    });
  }

  drawRectangle({ x, y, width, height, color, opacity }) {
    this.content.push({
      type: 'Rectangle',
      x,
      y,
      width,
      height,
      color,
      opacity,
    });
  }

  drawImage(pngImage, { x, y }) {
    this.content.push({
      type: 'Image',
      pngImage,
      x,
      y,
    });
  }
}

class PDFDocumentForTest {
  constructor(pages = []) {
    this.pages = pages;
    this.fontkit;
    this.fonts = [];
    this.pngs = [];
    this.saved = false;
  }

  registerFontkit(fontkit) {
    this.fontkit = fontkit;
  }

  async copyPages(document, indexesArray) {
    return indexesArray.map((index) => {
      return new PageForTest(document.pages[index].content);
    });
  }

  addPage(page) {
    this.pages.push(page);
  }

  async save() {
    return new BytesForTest(this);
  }

  async embedFont(fontFile) {
    this.fonts.push(fontFile);
    const fontFontFileAssociations = {
      [openSandBoldFontFile.id]: openSandBold,
      [openSansSemiBoldFontFile.id]: openSansSemiBold,
      [robotoMediumFontFile.id]: robotoMedium,
      [robotoMonoRegularFontFile.id]: robotoMonoRegular,
    };
    const font = fontFontFileAssociations[fontFile.id];
    if (font) {
      return font;
    }
    throw new Error('no font for ' + fontFile.id);
  }

  async embedPng(pngBuffer) {
    this.pngs.push(pngBuffer);
    return new ImageForTest(pngBuffer);
  }
}

class FontForTest {
  constructor(widthOfOneChar) {
    this.widthOfOneChar = widthOfOneChar;
  }
  widthOfTextAtSize(text, fontSize) {
    return text.length * fontSize * this.widthOfOneChar;
  }
}

class FileForTest {
  constructor(id) {
    this.id = id;
  }
}

class BytesForTest {
  constructor(document) {
    this.fromDocument = document;
  }
}

class BufferForTest {
  constructor(bytes) {
    this.fromBytes = bytes;
  }
}

const openSandBold = new FontForTest(1);
const openSansSemiBold = new FontForTest(2);
const robotoMedium = new FontForTest(3);
const robotoMonoRegular = new FontForTest(4);

const openSandBoldFontFile = new FileForTest('OpenSans-Bold.ttf');
const openSansSemiBoldFontFile = new FileForTest('OpenSans-SemiBold.ttf');
const robotoMediumFontFile = new FileForTest('Roboto-Medium.ttf');
const robotoMonoRegularFontFile = new FileForTest('RobotoMono-Regular.ttf');

const templateFile = new FileForTest('template file');

const templatePage = new PageForTest([{ type: 'Background' }]);
const templateDocument = new PDFDocumentForTest([ templatePage ]);

const expectedBuffer = {
  fromBytes: {
    fromDocument: {
      fontkit: 'fontkit for test',
      fonts: [
        { id: 'OpenSans-Bold.ttf' },
        { id: 'OpenSans-SemiBold.ttf' },
        { id: 'Roboto-Medium.ttf' },
        { id: 'RobotoMono-Regular.ttf' },
      ],
      pages: [
        {
          content: [
            { type: 'Background' },
            {
              type: 'Text',
              color: 'default',
              font: {
                widthOfOneChar: 1,
              },
              size: 24,
              text: '123',
              x: 69,
              y: 675,
            },
            {
              type: 'Text',
              color: {
                blue: 0.42745098039215684,
                green: 0.25098039215686274,
                red: 0.10196078431372549,
                type: 'RGB',
              },
              font: {
                widthOfOneChar: 1,
              },
              size: 9,
              text: 'Jean Bon',
              x: 230,
              y: 712,
            },
            {
              color: {
                blue: 0.42745098039215684,
                green: 0.25098039215686274,
                red: 0.10196078431372549,
                type: 'RGB',
              },
              font: {
                widthOfOneChar: 1,
              },
              size: 9,
              text: '12 juin 1992 à Paris',
              type: 'Text',
              x: 269,
              y: 695.5,
            },
            {
              color: {
                blue: 0.42745098039215684,
                green: 0.25098039215686274,
                red: 0.10196078431372549,
                type: 'RGB',
              },
              font: {
                widthOfOneChar: 1,
              },
              size: 9,
              text: 'L’univeristé du Pix',
              type: 'Text',
              x: 257,
              y: 680,
            },
            {
              color: {
                blue: 0.42745098039215684,
                green: 0.25098039215686274,
                red: 0.10196078431372549,
                type: 'RGB',
              },
              font: {
                widthOfOneChar: 1,
              },
              size: 9,
              text: '3 octobre 2018',
              type: 'Text',
              x: 208,
              y: 663.5,
            },
            {
              color: {
                blue: 0.34509803921568627,
                green: 0.2196078431372549,
                red: 0.1450980392156863,
                type: 'RGB',
              },
              font: {
                widthOfOneChar: 3,
              },
              size: 9,
              text: '2',
              type: 'Text',
              x: 291,
              y: 561,
            },
            {
              color: {
                blue: 1,
                green: 1,
                red: 1,
                type: 'RGB',
              },
              height: 18,
              opacity: 0.5,
              type: 'Rectangle',
              width: 210,
              x: 65,
              y: 532,
            },
            {
              color: {
                blue: 1,
                green: 1,
                red: 1,
                type: 'RGB',
              },
              height: 18,
              opacity: 0.5,
              type: 'Rectangle',
              width: 210,
              x: 65,
              y: 508,
            },
            {
              color: {
                blue: 0.38823529411764707,
                green: 0.25098039215686274,
                red: 0.16470588235294117,
                type: 'RGB',
              },
              font: {
                widthOfOneChar: 1,
              },
              size: 7,
              text: '* À la date d’obtention de cette certification, le nombre maximum de pix atteignable était de 640, correspondant au niveau 5.',
              type: 'Text',
              x: 55,
              y: 46,
            },
            {
              color: {
                blue: 0.38823529411764707,
                green: 0.25098039215686274,
                red: 0.16470588235294117,
                type: 'RGB',
              },
              font: {
                widthOfOneChar: 1,
              },
              size: 7,
              text: 'Lorsque les 8 niveaux du référentiel Pix seront disponibles, ce nombre maximum sera de 1024 pix.',
              type: 'Text',
              x: 55,
              y: 35,
            },
            {
              color: {
                blue: 0.3137254901960784,
                green: 0.17647058823529413,
                red: 0,
                type: 'RGB',
              },
              font: {
                widthOfOneChar: 2,
              },
              size: 9,
              text: '640*',
              type: 'Text',
              x: 69,
              y: 659,
            },
            {
              color: {
                blue: 0.4745098039215686,
                green: 0.37254901960784315,
                red: 0.3137254901960784,
                type: 'RGB',
              },
              font: {
                widthOfOneChar: 2,
              },
              size: 7,
              text: '(niveaux sur 5)',
              type: 'Text',
              x: 159,
              y: 608,
            },
            {
              color: {
                blue: 1,
                green: 1,
                red: 1,
                type: 'RGB',
              },
              font: {
                widthOfOneChar: 4,
              },
              size: 11,
              text: 'P-SOMECODE',
              type: 'Text',
              x: 410,
              y: 560,
            },
            {
              pngImage: {
                fromBuffer: {
                  isSharp: true,
                  path: 'clea/image/path',
                  resizedWith: {
                    options: {
                      fit: 'inside',
                    },
                    x: 80,
                    y: 100,
                  },
                },
              },
              type: 'Image',
              x: 400,
              y: 400,
            },
            {
              pngImage: {
                fromBuffer: {
                  isSharp: true,
                  path: 'pix/plus/image/path',
                  resizedWith: {
                    options: {
                      fit: 'inside',
                    },
                    x: 100,
                    y: 120,
                  },
                },
              },
              type: 'Image',
              x: 390,
              y: 290,
            },
          ],
        },
      ],
      pngs: [
        {
          isSharp: true,
          path: 'clea/image/path',
          resizedWith: {
            options: {
              fit: 'inside',
            },
            x: 80,
            y: 100,
          },
        },
        {
          isSharp: true,
          path: 'pix/plus/image/path',
          resizedWith: {
            options: {
              fit: 'inside',
            },
            x: 100,
            y: 120,
          },
        },
      ],
      saved: false,
    },
  },
};

