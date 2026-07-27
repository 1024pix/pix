import JSZip from 'jszip';

/**
 * @param {Object} params
 * @param {Array<{ filename: string, content: string | Buffer }>} params.files
 * @returns {Promise<Buffer>}
 */
export async function getMultipleFilesAsZip({ files }) {
  if (files.length === 0) {
    throw new Error('No file to zip');
  }

  const zip = JSZip();
  for (const { filename, content } of files) {
    zip.file(filename, content);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
