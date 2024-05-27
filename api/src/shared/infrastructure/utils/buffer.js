/**
 * @typedef {function} getDataBuffer
 * @param {ReadStream} readableStream
 * @return {Promise<Buffer|Error>}
 */
export const getDataBuffer = function (readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data);
    });
    readableStream.on('error', (err) => reject(err));
    readableStream.once('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
};
