const util = require('util');
const heapdump = require('heapdump');

module.exports = {

  async generateAndDownloadHeapDump(request, h) {
    const writeHeapDump = util.promisify(heapdump.writeSnapshot);
    const filename = await writeHeapDump();
    return h.file(filename, { mode: 'attachment' });
  },
};
