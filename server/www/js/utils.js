// Borrowed from MDN Math.Random()
export function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Creates a rnadom seed using upper case, lowercase
// and numbers
export function randomSeed(seedLength = 7) {
  let seed = '';
  const numberAsciiOffset = 48;
  const lowercaseAsciiOffset = 97;
  const uppercaseAsciiOffset = 65;
  for (let i = 0; i < seedLength; i++) {
    let rand_num = Math.random();
    if (rand_num <= 0.33) {
      seed += String.fromCharCode(numberAsciiOffset + getRandomInt(10));
    } else if (rand_num > 0.33 && rand_num <= 0.66) {
      seed += String.fromCharCode(lowercaseAsciiOffset + getRandomInt(25));
    } else {
      seed += String.fromCharCode(uppercaseAsciiOffset + getRandomInt(25));
    }
  }
  return seed;
}
