import { readdir } from 'node:fs/promises';

async function countFilesInPath(path) {
  let fileNumber = 0;
  const files = await readdir(path, { recursive: true, withFileTypes: true });

  for await (const file of files) {
    if (file.isDirectory()) {
      const directoryFilesNumber = await countFilesInPath(`${path}/${file.name}`);
      fileNumber += directoryFilesNumber;
    } else if (file.isFile()) {
      fileNumber++;
    }
  }
  return fileNumber;
}

function formatResult({ path, count }) {
  return {
    path,
    count,
  };
}

function _formatMessageForSlack(message) {
  return JSON.stringify({
    text: message,
  });
}

async function main() {
  const pathsToAnalyse = ['./lib', './src'];
  const result = await Promise.all(
    pathsToAnalyse.map(async (path) => {
      const count = await countFilesInPath(path);
      return formatResult({ path, count });
    })
  );

  return console.log(_formatMessageForSlack(JSON.stringify(result)));
}

await main();

export { countFilesInPath };
