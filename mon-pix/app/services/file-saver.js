import Service from '@ember/service';

export default class FileSaver extends Service {
  _downloadFileForIEBrowser({ fileContent, fileName }) {
    window.navigator.msSaveOrOpenBlob(fileContent, fileName);
  }

  _downloadFileForModernBrowsers({ fileContent, fileName }) {
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = URL.createObjectURL(fileContent);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  _fetchData({ url, token, options = {} }) {
    const requestOptions = {
      method: options.method ?? 'GET',
      headers: {},
    };

    if (token) requestOptions.headers['Authorization'] = `Bearer ${token}`;

    if (options.body) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(options.body);
    }

    return fetch(url, requestOptions);
  }

  async save({
    url,
    fileName,
    token,
    options,
    fetcher = this._fetchData,
    downloadFileForIEBrowser = this._downloadFileForIEBrowser,
    downloadFileForModernBrowsers = this._downloadFileForModernBrowsers,
  }) {
    const response = await fetcher({ url, token, options });

    if (!response.ok) {
      const payload = await response.json();
      throw payload?.errors[0];
    }

    if (response.headers && response.headers.get('Content-Disposition')) {
      const contentDispositionHeader = response.headers.get('Content-Disposition');
      [, fileName] = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDispositionHeader);
    }
    const fileContent = await response.blob();

    const browserIsInternetExplorer = window.document.documentMode;
    browserIsInternetExplorer
      ? downloadFileForIEBrowser({ fileContent, fileName })
      : downloadFileForModernBrowsers({ fileContent, fileName });
  }
}
