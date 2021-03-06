import { americanOnly } from './american-only.js';
import { britishOnly } from './british-only.js';
import { americanToBritishSpelling } from './american-to-british-spelling.js';

// Handle spelling differences
let americanToBritishDict = { ...americanToBritishSpelling };
let britishToAmericanDict;
britishToAmericanDict = Object.keys(americanToBritishDict).reduce((obj, curr) => {
  obj[americanToBritishDict[curr]] = curr;
  return obj;
}, {});

// Append American only phrases
americanToBritishDict = { ...americanToBritishDict, ...americanOnly }

// Append British only phrases
britishToAmericanDict = { ...britishToAmericanDict, ...britishOnly }

const textArea = document.getElementById('text-input');
const translationDiv = document.getElementById('translated-sentence');
const errorDiv = document.getElementById('error-msg');

const clearAll = () => {
  return textArea.value = '', translationDiv.textContent = '', errorDiv.textContent = '';
}

const translateSentence = (str, targetLocale) => {
  const cleanStrArr = str.toLowerCase().split(/([\s,.;?])/).filter(el => el !== '');
  let preservedCapsArr = str.split(/([\s,.;?])/).filter(el => el !== '');
  const cleanStr = str.toLowerCase().replace(/[,.;?]/g, '');
  const targetDict = targetLocale === 'british' ? americanToBritishDict : britishToAmericanDict;

  let newStrArr = [...cleanStrArr];
  const translatedWordsOrTerms = [];

  Object.keys(targetDict).forEach(currWordOrTerm => {
    // Check whole string to handle longer terms
    if (cleanStr.includes(currWordOrTerm)) {
      const newWordOrTerm = targetDict[currWordOrTerm];
      const currWordOrTermArr = currWordOrTerm.split(/(\s)/);
      const isPresent = (str) => cleanStrArr.indexOf(str) >= 0;

      /* 
        Check that the whole word or term from the dictionary is
        in the original string array, and not a shorter
        version like favor --> favorite.
        Store changes to newStrArr
      */
      if (currWordOrTermArr.every(isPresent)) {
        // single word or no spaces
        if (currWordOrTermArr.length === 1) {
          newStrArr[newStrArr.indexOf(currWordOrTerm)] = newWordOrTerm;
          translatedWordsOrTerms.push(newWordOrTerm);
        } else {
          const targetIndex = newStrArr.indexOf(...currWordOrTermArr);
          newStrArr.splice(newStrArr.indexOf(...currWordOrTermArr), currWordOrTermArr.length - 1);
          newStrArr[targetIndex] = newWordOrTerm;
          translatedWordsOrTerms.push(newWordOrTerm);
        }
      }
    }
  });

  // Compare translated newStrArr to preservedCapsArr
  // and replace any exact matches
  newStrArr.forEach((str, i, arr) => {
    // console.log(str, preservedCapsArr[i]);
    if (str === preservedCapsArr[i].toLowerCase()) {
      newStrArr[i] = preservedCapsArr[i];
    } else {
      // Capitalize translated words / terms if the original
      // was capitalized
      if (preservedCapsArr[i][0].toUpperCase() === preservedCapsArr[i][0]) {
        newStrArr[i] = arr[i][0].toUpperCase() + arr[i].slice(1);
      }
    }
  });

  const translatedStr = collapseSentenceArr(newStrArr);
  const translationObj = {
    translatedStr: translatedStr,
    translatedStrArr: newStrArr,
    translatedWordsOrTerms: translatedWordsOrTerms
  }

  // console.log(translationObj);
  displayTranslation(translationObj);
  return translationObj;
}

const collapseSentenceArr = arr => {
  return arr.reduce((acc, curr) => {
    return acc += curr;
  }, '');
}

const displayTranslation = obj => {
  const { translatedStr, translatedStrArr, translatedWordsOrTerms } = obj;

  translatedWordsOrTerms.forEach(wordOrTerm => {
    // Handle cases where the capitalization of a translated word
    // or term might be upper or lowercase
    const upperWordOrTerm = wordOrTerm[0].toUpperCase() + wordOrTerm.slice(1);
    // console.log(upperWordOrTerm, obj);
    if (translatedStrArr.indexOf(upperWordOrTerm) >= 0) {
      translatedStrArr[translatedStrArr.indexOf(upperWordOrTerm)] = `<span class='highlight'>${upperWordOrTerm}</span>`;
    } else {
      translatedStrArr[translatedStrArr.indexOf(wordOrTerm)] = `<span class='highlight'>${wordOrTerm}</span>`;
    }
  });

  const htmlStr = collapseSentenceArr(translatedStrArr);

  if (translatedStr === '' || textArea.value === '') {
    translationDiv.textContent = '';
    errorDiv.textContent =  "Error: No text to translate.";
  } else {
    errorDiv.textContent = '';
    return translatedWordsOrTerms.length === 0 ? translationDiv.innerHTML = 'Everything looks good to me!' : translationDiv.innerHTML = htmlStr;
  }
}

// Handle buttons
const translateBtn = document.getElementById('translate-btn');
translateBtn.addEventListener('click', () => {
  const targetLocale = document.getElementById('locale-select').value === 'american-to-british' ? 'british' : 'american';
  translateSentence(textArea.value, targetLocale);
});

const clearBtn = document.getElementById('clear-btn');
clearBtn.addEventListener('click', () => {
  clearAll();
});

/* 
  Export your functions for testing in Node.
  Note: The `try` block is to prevent errors on
  the client side
*/
try {
  module.exports = {
    clearAll,
    translateSentence,
    displayTranslation
  }
} catch (e) {}
