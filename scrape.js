const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const csv = require('fast-csv');

const url =
  'http://popvinyls.com/funko-pop-vinyls-series/game-thrones-series/';

const dir = './images';

const getSiteData = async () => {
  const data = await axios
    .get(url)
    .then(response => {
      if (response.status === 200) {
        return cheerio.load(response.data);
      }
    })
    .catch(error => {
      console.log(error);
    });
  return await data;
};

const grabCharacterNames = $ => {
  return $('figcaption')
    .map((index, element) => {
      return {
        id: index,
        name: $(element)
          .text()
          .trim(),
      };
    })
    .toArray();
};

const grabCharacterPhotos = $ => {
  const singleCharacters = $('.attachment-thumbnail.size-thumbnail')
    .map((index, element) => {
      return {
        id: index,
        link: $(element).attr('src'),
      };
    })
    .toArray();

  const comboCharacters = $('.attachment-medium.size-medium')
    .map((index, element) => {
      return {
        id: index,
        link: $(element).attr('src'),
      };
    })
    .toArray();
  return singleCharacters.concat(comboCharacters);
};

const combineNamesAndPhotos = (namesArray, photosArray) => {
  return namesArray.map(element => {
    return {
      id: element.id,
      name: element.name,
      link: photosArray[element.id].link,
    };
  });
};

const grabCharacterData = $ => {
  let characterNames = grabCharacterNames($);
  let characterPhotos = grabCharacterPhotos($);
  return combineNamesAndPhotos(characterNames, characterPhotos);
};

const createFolder = path => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  process.chdir(path);
};

const savePhotosToDisk = async characterArray => {
  createFolder(dir);
  const data = await characterArray.map(element => {
    axios
      .get(element.link, { responseType: 'stream' })
      .then(response => {
        response.data.pipe(fs.createWriteStream(`${element.id}.png`));
      })
      .catch(error => console.log(error));
  });
  return await data;
};

const saveCharacterDataToCsv = characterData => {
  csv
    .write(characterData, { headers: true })
    .pipe(fs.createWriteStream('characters.csv'));
};

async function run() {
  const $ = await getSiteData();
  const characterData = grabCharacterData($);

  saveCharacterDataToCsv(characterData);
  savePhotosToDisk(characterData);
}

run();
