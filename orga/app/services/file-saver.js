import Service from '@ember/service';
import { service } from '@ember/service';

export default class FileSaverService extends Service {
  @service pixToast;
  @service intl;
  @service locale;

  async save({
    url,
    token,
    fileName,
    fetcher = _fetchData,
    downloadFileForIEBrowser = _downloadFileForIEBrowser,
    downloadFileForModernBrowsers = _downloadFileForModernBrowsers,
    noContentMessageNotification = this.intl.t('common.no-content'),
  }) {
    const acceptLanguage = this.locale.acceptLanguageHeader;
    const response = await fetcher({ url, token, acceptLanguage });

    if (response.status === 204) {
      this.pixToast.sendWarningNotifications({ message: noContentMessageNotification });
      return;
    }

    if (response.status !== 200) {
      const jsonResponse = await response.json();
      throw jsonResponse.errors;
    }

    const newFileName = fileName ?? _getFileNameFromHeader(response.headers);
    const fileContent = await response.blob();

    const browserIsInternetExplorer = window.document.documentMode;

    browserIsInternetExplorer
      ? downloadFileForIEBrowser({ fileContent, fileName: newFileName })
      : downloadFileForModernBrowsers({ fileContent, fileName: newFileName });
  }
}

function _fetchData({ url, token, acceptLanguage }) {
  const reqHeaders = new Headers();
  reqHeaders.set('Authorization', `Bearer ${token}`);
  reqHeaders.set('Accept-Language', acceptLanguage);

  return fetch(url, { headers: reqHeaders });
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
