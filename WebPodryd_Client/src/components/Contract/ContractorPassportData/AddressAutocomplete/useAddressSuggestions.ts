//src/components/Contract/ContractorPassportData/AddressAutocomplete/useAddressSuggestions.ts

import { useState, useCallback } from 'react';
import { AddressSuggestion } from '../../../../types/address';

export const useAddressSuggestions = () => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Моковые данные для Беларуси
      const belarusSuggestions: AddressSuggestion[] = [
        { place_id: '1', description: 'Беларусь, Минская область, Минск' },
        { place_id: '2', description: 'Беларусь, Брестская область, Брест' },
        { place_id: '3', description: 'Беларусь, Гродненская область, Гродно' },
        { place_id: '4', description: 'Беларусь, Витебская область, Витебск' },
        { place_id: '5', description: 'Беларусь, Гомельская область, Гомель' },
        { place_id: '6', description: 'Беларусь, Могилевская область, Могилев' },
      ].filter(item =>
        item.description.toLowerCase().includes(query.toLowerCase())
      );

      setSuggestions(belarusSuggestions);
    } catch (err) {
      setError('Ошибка при загрузке подсказок');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions,
    clearSuggestions
  };
};
