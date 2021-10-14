import Service from '@ember/service';
import fetch from 'fetch';

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

  _fetchData({ url, token }) {
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async save({
    url,
    fileName,
    token,
    fetcher = this._fetchData,
    downloadFileForIEBrowser = this._downloadFileForIEBrowser,
    downloadFileForModernBrowsers = this._downloadFileForModernBrowsers,
  }) {
    const response = await fetcher({ url, token });

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
