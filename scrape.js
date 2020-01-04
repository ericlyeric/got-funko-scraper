let axios = require('axios');
let cheerio = require('cheerio');
let fs = require('fs');

let url =
  'http://popvinyls.com/funko-pop-vinyls-series/game-thrones-series/';

async function getSiteData() {
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
}

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

// so far just grabbing one photo, want to grab all photo links
const grabCharacterPhotos = $ => {
  return $('.attachment-thumbnail.size-thumbnail').attr('src');
};

async function run() {
  const $ = await getSiteData();
  const characterNames = grabCharacterNames($);
  console.log(characterNames);
  // console.log(parseCharacterNames(characterNames));

  const characterPhotos = grabCharacterPhotos($);
  console.log(characterPhotos);
}

run();
