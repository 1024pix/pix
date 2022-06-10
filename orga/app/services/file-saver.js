import Service from '@ember/service';
import fetch from 'fetch';

export default class FileSaverService extends Service {
  async save({
    url,
    token,
    fetcher = _fetchData,
    downloadFileForIEBrowser = _downloadFileForIEBrowser,
    downloadFileForModernBrowsers = _downloadFileForModernBrowsers,
  }) {
    const response = await fetcher({ url, token });

    if (response.status !== 200) {
      const jsonResponse = await response.json();
      throw jsonResponse.errors;
    }

    const fileName = _getFileNameFromHeader(response.headers);
    const fileContent = await response.blob();

    const browserIsInternetExplorer = window.document.documentMode;

    browserIsInternetExplorer
      ? downloadFileForIEBrowser({ fileContent, fileName })
      : downloadFileForModernBrowsers({ fileContent, fileName });
  }
}

function _fetchData({ url, token }) {
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

function _getFileNameFromHeader(headers) {
  if (headers && headers.get('Content-Disposition')) {
    const contentDispositionHeader = headers.get('Content-Disposition');
    const [, fileName] = /filename\*?=['"]?([^;\r\n"']*)['"]?/.exec(contentDispositionHeader);
    return fileName;
  }
}

function _downloadFileForIEBrowser({ fileContent, fileName }) {
  window.navigator.msSaveOrOpenBlob(fileContent, fileName);
}

function _downloadFileForModernBrowsers({ fileContent, fileName }) {
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = URL.createObjectURL(fileContent);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
