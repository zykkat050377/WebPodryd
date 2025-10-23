// src/components/Act/CreateAct/utils.ts

/**
 * Функция преобразования числа в пропись с правильными падежами
 * @param num - число для преобразования
 * @returns строка с суммой прописью
 */
export const numberToWordsWithCents = (num: number): string => {
  const rubles = Math.floor(num);
  const cents = Math.round((num - rubles) * 100);

  // Функция для преобразования чисел от 0 до 999
  const convertHundreds = (n: number, isThousands: boolean = false): string => {
    if (n === 0) return '';

    // Для тысяч используем женский род
    const units = isThousands
      ? ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
      : ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];

    const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
    const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
    const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

    let result = '';

    // Сотни
    const h = Math.floor(n / 100);
    if (h > 0) {
      result += hundreds[h] + ' ';
    }

    // Десятки и единицы
    const remainder = n % 100;
    if (remainder >= 20) {
      const t = Math.floor(remainder / 10);
      result += tens[t] + ' ';
      const u = remainder % 10;
      if (u > 0) {
        result += units[u] + ' ';
      }
    } else if (remainder >= 10) {
      result += teens[remainder - 10] + ' ';
    } else if (remainder > 0) {
      result += units[remainder] + ' ';
    }

    return result.trim();
  };

  // Преобразуем рубли
  let rublesResult = '';

  if (rubles === 0) {
    rublesResult = 'ноль';
  } else {
    // Миллионы
    const millions = Math.floor(rubles / 1000000);
    const remainderAfterMillions = rubles % 1000000;

    if (millions > 0) {
      rublesResult += convertHundreds(millions) + ' ';
      // Склонение миллионов
      const lastMillionsDigit = millions % 10;
      const lastTwoMillionsDigits = millions % 100;

      if (lastTwoMillionsDigits >= 11 && lastTwoMillionsDigits <= 19) {
        rublesResult += 'миллионов ';
      } else if (lastMillionsDigit === 1) {
        rublesResult += 'миллион ';
      } else if (lastMillionsDigit >= 2 && lastMillionsDigit <= 4) {
        rublesResult += 'миллиона ';
      } else {
        rublesResult += 'миллионов ';
      }
    }

    // Тысячи
    const thousands = Math.floor(remainderAfterMillions / 1000);
    const remainder = remainderAfterMillions % 1000;

    if (thousands > 0) {
      rublesResult += convertHundreds(thousands, true) + ' ';
      // Склонение тысяч (женский род)
      const lastThousandsDigit = thousands % 10;
      const lastTwoThousandsDigits = thousands % 100;

      if (lastTwoThousandsDigits >= 11 && lastTwoThousandsDigits <= 19) {
        rublesResult += 'тысяч ';
      } else if (lastThousandsDigit === 1) {
        rublesResult += 'тысяча ';
      } else if (lastThousandsDigit >= 2 && lastThousandsDigit <= 4) {
        rublesResult += 'тысячи ';
      } else {
        rublesResult += 'тысяч ';
      }
    }

    // Остаток (сотни, десятки, единицы)
    if (remainder > 0) {
      rublesResult += convertHundreds(remainder) + ' ';
    }
  }

  // Склонение рублей
  const lastDigit = rubles % 10;
  const lastTwoDigits = rubles % 100;

  let rublesCurrency = 'рублей';
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    rublesCurrency = 'рублей';
  } else if (lastDigit === 1) {
    rublesCurrency = 'рубль';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    rublesCurrency = 'рубля';
  }

  rublesResult = rublesResult.trim() + ' ' + rublesCurrency;

  // Преобразуем копейки
  let centsResult = '';

  if (cents > 0) {
    if (cents >= 20) {
      const t = Math.floor(cents / 10);
      centsResult += tens[t] + ' ';
      const u = cents % 10;
      if (u > 0) {
        centsResult += units[u] + ' ';
      }
    } else if (cents >= 10) {
      centsResult += teens[cents - 10] + ' ';
    } else {
      centsResult += units[cents] + ' ';
    }
  } else {
    centsResult = 'ноль';
  }

  // Склонение копеек
  const lastCentsDigit = cents % 10;
  const lastTwoCentsDigits = cents % 100;

  let centsCurrency = 'копеек';
  if (lastTwoCentsDigits >= 11 && lastTwoCentsDigits <= 19) {
    centsCurrency = 'копеек';
  } else if (lastCentsDigit === 1) {
    centsCurrency = 'копейка';
  } else if (lastCentsDigit >= 2 && lastCentsDigit <= 4) {
    centsCurrency = 'копейки';
  }

  centsResult = centsResult.trim() + ' ' + centsCurrency;

  // Формируем окончательный результат
  let finalResult = rublesResult;
  if (cents > 0 || rubles === 0) {
    finalResult += ' ' + centsResult;
  }

  return finalResult.trim();
};

/**
 * Получение единицы измерения по типу договора
 */
export const getUnitByTemplateType = (type: 'operation' | 'norm-hour' | 'cost'): string => {
  switch (type) {
    case 'operation': return 'опер.';
    case 'norm-hour': return 'час';
    case 'cost': return 'усл.';
    default: return 'ед.';
  }
};

/**
 * Получение цены по умолчанию в зависимости от типа договора
 */
export const getDefaultPrice = (type: 'operation' | 'norm-hour' | 'cost', service: string): number => {
  switch (type) {
    case 'operation': return 5.0;
    case 'norm-hour': return 15.0;
    case 'cost': return 1000.0;
    default: return 0;
  }
};

/**
 * Получение названия типа договора для отображения
 */
export const getContractTypeName = (type: 'operation' | 'norm-hour' | 'cost'): string => {
  switch (type) {
    case 'operation': return 'За операцию';
    case 'norm-hour': return 'Нормо-час';
    case 'cost': return 'Стоимость';
    default: return '';
  }
};
