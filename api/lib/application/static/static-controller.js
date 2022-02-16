const path = require('path');

module.exports = {
  get(request, h) {
    const appName = request.headers['pix-application'];
    let requestedPath = request.params.path;
    if (requestedPath === '') {
      requestedPath = 'index.html';
    }

    return h.file(path.join(__dirname, '..', '..', '..', 'dist', appName, requestedPath));
  },
};
