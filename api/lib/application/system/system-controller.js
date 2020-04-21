const os = require('os');
const util = require('util');
const heapdump = require('heapdump');
const heapProfile = require('heap-profile');
const { system } = require('../../config');

module.exports = {

  async generateAndDownloadHeapDump(request, h) {
    if (!os.hostname().endsWith(request.params.hostname)) {
      return h.redirect(request.path);
    }

    const writeHeapDump = util.promisify(heapdump.writeSnapshot);
    const filename = await writeHeapDump();
    return h.file(filename, { mode: 'attachment' });
  },

  async generateAndDownloadHeapProfile(request, h) {
    if (!system.samplingHeapProfilerEnabled) {
      return h.response('Heap profile sampling is not enabled').code(404);
    }

    if (!os.hostname().endsWith(request.params.hostname)) {
      return h.redirect(request.path);
    }

    const filename = await heapProfile.write();
    return h.file(filename, { mode: 'attachment' });
  },
};
