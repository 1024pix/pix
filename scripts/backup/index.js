const Airtable = require('airtable');
const fs = require('fs');
let base = new Airtable({apiKey: 'PixKey'}).base('appHAIFk9u1qqglhX');

createBackupFolder()
  .then(folderName => createBackupFiles(folderName))
  .then(filePaths => populateData(filePaths))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

function createBackupFolder() {
  return new Promise((resolve) => {
    const folderName = new Date().toISOString().split('T')[0];
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
    resolve(folderName);
  });
}

function createBackupFiles(folderName) {
  return new Promise((resolve) => {
    const tables = ['Epreuves', 'Tests', 'Images Propositions', 'Acquis'];
    const tableData = [];
    tables.forEach(tableName => {
      const filePath = folderName + '/' + 'Pix_Production_' + tableName.replace(' ', '') + '.json';
      const file = fs.openSync(filePath, 'w+');
      fs.closeSync(file);
      tableData.push({tableName, filePath});
    });
    resolve(tableData);
  });
}

function populateData(tableData) {
  return new Promise((resolve, reject) => {
    tableData.forEach((dataRow) => {
      let {tableName, filePath} = dataRow;
      let bufferData = [];

      base(tableName)
        .select()
        .eachPage((records, fetchNextPage) => {
          records.forEach((record) => {
            bufferData.push(JSON.stringify(record));
          });
          fetchNextPage();
        }, (err) => {
          if (err) reject(err);
          fs.writeFileSync(filePath, bufferData);
          resolve(true);
        });
    });
  });

}
