const util = require('util');
const heapdump = require('heapdump');
const heapProfile = require('heap-profile');

module.exports = {

  async generateAndDownloadHeapDump(request, h) {
    const writeHeapDump = util.promisify(heapdump.writeSnapshot);
    const filename = await writeHeapDump();
    return h.file(filename, { mode: 'attachment' });
  },

  async generateAndDownloadHeapProfile(request, h) {
    const writeHeapProfile = util.promisify(heapProfile.write);
    const filename = await writeHeapProfile();
    return h.file(filename, { mode: 'attachment' });
  },
};
