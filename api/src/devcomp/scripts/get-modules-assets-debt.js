// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */

import moduleDatasource from '../infrastructure/datasources/learning-content/module-datasource.js';
import { getElements } from './get-elements-csv.js';

async function main() {
  const modules = await moduleDatasource.list();
  const allElements = getElements(modules);
  const knownExternalVideoDomains = ['tube-numerique-educatif.apps.education.fr', 'www.youtube.com'];
  const iframeUrls = _getIframeUrls(allElements);

  _countAndDisplayVideosData({ allElements, iframeUrls, videoDomains: knownExternalVideoDomains });
  console.log();
  _countAndDisplayImagesData(allElements);
  console.log();
  _countIAndDisplayIframesData({ iframeUrls, videoDomains: knownExternalVideoDomains });
}

await main();

function _countAndDisplayVideosData({ allElements, iframeUrls, videoDomains }) {
  const videos = allElements.filter((element) => element.type === 'video');
  const nbOfVideoElements = videos.length;
  const nbOfAssetsPixOrgVideos = videos.filter((video) => video.url.includes('assets.pix.org')).length;
  const otherVideoUrls = videos
    .filter((video) => !video.url.includes('assets.pix.org'))
    .map((video) => new URL(video.url));
  const otherVideoDomains = otherVideoUrls.map((url) => url.hostname);

  const iframeVideos = iframeUrls.filter((iframeUrl) =>
    videoDomains.some((videoDomain) => iframeUrl.hostname.includes(videoDomain)),
  );
  const nbOfIframeVideos = iframeVideos.length;

  otherVideoDomains.push(...iframeVideos.map((url) => url.hostname));
  const otherVideoDomainsCount = otherVideoDomains.reduce((acc, domain) => {
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {});

  console.log(`Number of videos: ${nbOfVideoElements + nbOfIframeVideos}`);
  console.log(`Number of videos on assets.pix.org: ${nbOfAssetsPixOrgVideos}`);
  console.log(
    `Other videos domains: ${Object.keys(otherVideoDomainsCount)
      .map((domain) => `${domain} (${otherVideoDomainsCount[domain]})`)
      .join(', ')}`,
  );
}

function _countAndDisplayImagesData(allElements) {
  let nbOfImageElements = 0;
  let nbOfAssetsPixOrgImages = 0;
  const otherImageDomains = [];

  for (const element of allElements) {
    if (element.type === 'image') {
      countImages(element.url);
    }

    if (element.type === 'video') {
      if (element.poster?.length > 0) {
        countImages(element.poster);
      }
    }

    if (element.type === 'qab') {
      for (const card of element.cards) {
        if (card.image?.url.length > 0) {
          countImages(card.image.url);
        }
      }
    }

    if (element.type === 'flashcards') {
      if (element.introImage.url.length > 0) {
        countImages(element.introImage.url);
      }

      for (const card of element.cards) {
        if (card.recto.image?.url.length > 0) {
          countImages(card.recto.image.url);
        }
        if (card.verso.image?.url.length > 0) {
          countImages(card.verso.image.url);
        }
      }
    }
  }

  const imgTagDomains = getImgDomains(allElements);
  for (const domain of imgTagDomains) {
    countImages(domain);
  }

  const otherImageDomainsCount = otherImageDomains.reduce((acc, domain) => {
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {});

  console.log(`Number of images: ${nbOfImageElements}`);
  console.log(`Number of images on assets.pix.org: ${nbOfAssetsPixOrgImages}`);
  console.log(
    `Other images domains: ${Object.keys(otherImageDomainsCount)
      .map((domain) => `${domain} (${otherImageDomainsCount[domain]})`)
      .join(', ')}`,
  );

  function countImages(imageUrl) {
    nbOfImageElements++;
    if (imageUrl.includes('assets.pix.org')) {
      nbOfAssetsPixOrgImages++;
    } else {
      const url = new URL(imageUrl);
      otherImageDomains.push(url.hostname);
    }
  }

  function getImgDomains(elements) {
    const elementsWithImg = elements
      .filter((element) => element.type === 'expand')
      .filter((element) => element.content.includes('<img'));
    const allImgs = elementsWithImg.flatMap((element) => {
      const imgs = element.content.match(/<img[^>]+src="([^"]+)"/g);
      if (!imgs) return false;

      return imgs.map((img) => {
        const src = img.match(/src="([^"]+)"/)[1];
        return src;
      });
    });

    return allImgs;
  }
}

function _countIAndDisplayIframesData({ iframeUrls, videoDomains }) {
  const iframePages = iframeUrls.filter(
    (iframeUrl) => !videoDomains.some((videoDomain) => iframeUrl.hostname.includes(videoDomain)),
  );
  const internalIframePages = iframePages.filter((iframeUrl) => iframeUrl.hostname.includes('epreuves.pix.fr'));
  const externalIframePages = iframePages.filter((iframeUrl) => !iframeUrl.hostname.includes('epreuves.pix.fr'));
  const atelierContenusIframePages = externalIframePages.filter((iframeUrl) =>
    iframeUrl.href.includes('1024pix.github.io/atelier-contenus'),
  );
  const otherExternalIframeDomains = externalIframePages
    .filter((iframeUrl) => !iframeUrl.href.includes('1024pix.github.io/atelier-contenus'))
    .map((iframeUrl) => iframeUrl.hostname);
  const otherExternalIframeDomainsCount = otherExternalIframeDomains.reduce((acc, domain) => {
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {});
  console.log(`Number of internal iframes on epreuves.pix.fr: ${internalIframePages.length}`);
  console.log(`Number of external iframes: ${externalIframePages.length}`);
  console.log(`Number of external iframes on 1024pix.github.io/atelier-contenus: ${atelierContenusIframePages.length}`);
  console.log(
    `Number of external iframes on other domains: ${Object.keys(otherExternalIframeDomainsCount)
      .map((domain) => `${domain} (${otherExternalIframeDomainsCount[domain]})`)
      .join(', ')}`,
  );
}

function _getIframeUrls(elements) {
  const elementsWithIframe = elements
    .filter((element) => element.type === 'text')
    .filter((element) => element.content.includes('<iframe'));
  const allIframes = elementsWithIframe.flatMap((element) => {
    const iframes = element.content.match(/<iframe[^>]+src="([^"]+)"/g);
    if (!iframes) return false;

    return iframes.map((iframe) => {
      const src = iframe.match(/src="([^"]+)"/)[1];
      return new URL(src);
    });
  });

  return allIframes;
}
