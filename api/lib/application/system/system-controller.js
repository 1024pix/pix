const os = require('os');
const util = require('util');
const heapdump = require('heapdump');
const heapProfile = require('heap-profile');
const { system } = require('../../config');

module.exports = {

  async generateAndDownloadHeapDump(request, h) {

    if (!os.hostname().endsWith(request.params.hostname)) {
      return h.redirect(request.url.path);
    }

    const writeHeapDump = util.promisify(heapdump.writeSnapshot);
    const filename = await writeHeapDump();
    return h.file(filename, { mode: 'attachment' });
  },

  async generateAndDownloadHeapProfile(request, h) {

    if (!system.samplingHeapProfilerEnabled) {
      return h.response(`Heap profile sampling is disabled for the server ${request.params.hostname}`).code(404);
    }

    if (!os.hostname().endsWith(request.params.hostname)) {
      return h.redirect(request.url.path);
    }

    const writeHeapProfile = util.promisify(heapProfile.write);
    const filename = await writeHeapProfile();
    return h.file(filename, { mode: 'attachment' });
  },
};
