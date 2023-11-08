const uploadCpfFiles = async function ({ filename, readableStream, logger, cpfExportsStorage }) {
  logger.trace('uploadCpfFiles: start upload');
  await cpfExportsStorage.sendFile({ filename, readableStream });
  logger.trace(`uploadCpfFiles: ${filename} upload done`);
};

export { uploadCpfFiles };
