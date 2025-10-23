// src/components/Contract/ContractGeneralData/utils.ts
export const numberToWordsWithCents = (num: number): string => {
  const rubles = Math.floor(num);
  const cents = Math.round((num - rubles) * 100);

  const units = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
  const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
  const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

  let rublesResult = '';
  let centsResult = '';

  // Обрабатываем рубли
  if (rubles === 0) {
    rublesResult = 'ноль рублей';
  } else {
    let tempRubles = rubles;

    // Обрабатываем тысячи
    if (tempRubles >= 1000) {
      const thousands = Math.floor(tempRubles / 1000);
      if (thousands === 1) {
        rublesResult += 'одна тысяча ';
      } else if (thousands >= 2 && thousands <= 4) {
        rublesResult += numberToWordsWithCents(thousands).replace('рублей', 'тысячи ').replace('рубль', 'тысячи ').replace('рубля', 'тысячи ');
      } else {
        rublesResult += numberToWordsWithCents(thousands).replace('рублей', 'тысяч ').replace('рубль', 'тысяч ').replace('рубля', 'тысяч ');
      }
      tempRubles %= 1000;
    }

    // Обрабатываем сотни
    if (tempRubles >= 100) {
      rublesResult += hundreds[Math.floor(tempRubles / 100)] + ' ';
      tempRubles %= 100;
    }

    // Обрабатываем десятки и единицы
    if (tempRubles >= 20) {
      rublesResult += tens[Math.floor(tempRubles / 10)] + ' ';
      tempRubles %= 10;
    } else if (tempRubles >= 10) {
      rublesResult += teens[tempRubles - 10] + ' ';
      tempRubles = 0;
    }

    // Обрабатываем единицы
    if (tempRubles > 0) {
      rublesResult += units[tempRubles] + ' ';
    }

    // Добавляем валюту для рублей
    const lastDigit = rubles % 10;
    const lastTwoDigits = rubles % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      rublesResult += 'рублей';
    } else if (lastDigit === 1) {
      rublesResult += 'рубль';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      rublesResult += 'рубля';
    } else {
      rublesResult += 'рублей';
    }
  }

  // Обрабатываем копейки
  if (cents > 0) {
    if (rubles > 0) {
      centsResult = ' ';
    }

    if (cents >= 20) {
      centsResult += tens[Math.floor(cents / 10)] + ' ';
      const centsUnits = cents % 10;
      if (centsUnits > 0) {
        centsResult += units[centsUnits] + ' ';
      }
    } else if (cents >= 10) {
      centsResult += teens[cents - 10] + ' ';
    } else if (cents > 0) {
      centsResult += units[cents] + ' ';
    }

    // Добавляем валюту для копеек
    const lastCentsDigit = cents % 10;
    const lastTwoCentsDigits = cents % 100;

    if (lastTwoCentsDigits >= 11 && lastTwoCentsDigits <= 19) {
      centsResult += 'копеек';
    } else if (lastCentsDigit === 1) {
      centsResult += 'копейка';
    } else if (lastCentsDigit >= 2 && lastCentsDigit <= 4) {
      centsResult += 'копейки';
    } else {
      centsResult += 'копеек';
    }
  } else {
    centsResult = ' 00 копеек';
  }

  return (rublesResult + centsResult).trim();
};
