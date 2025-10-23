//src/components/Contract/ContractorPassportData/AddressAutocomplete/AddressAutocomplete.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import { useAddressSuggestions } from './useAddressSuggestions';

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const { suggestions, loading, error, fetchSuggestions, clearSuggestions } = useAddressSuggestions();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.length >= 2) {
      fetchSuggestions(newValue);
      setIsOpen(true);
    } else {
      clearSuggestions();
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
    clearSuggestions();
  };

  const handleFocus = () => {
    if (inputValue.length >= 2) {
      setIsOpen(true);
    }
  };

  return (
    <Box ref={wrapperRef} position="relative">
      <TextField
        fullWidth
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        InputProps={{
          endAdornment: loading ? <CircularProgress size={20} /> : null
        }}
      />

      {isOpen && (suggestions.length > 0 || error) && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 200,
            overflow: 'auto',
            mt: 0.5
          }}
        >
          {error ? (
            <Box p={2}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Box>
          ) : (
            <List dense>
              {suggestions.map((suggestion) => (
                <ListItem
                  key={suggestion.place_id}
                  button="true"
                  onClick={() => handleSuggestionClick(suggestion.description)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <ListItemText primary={suggestion.description} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default AddressAutocomplete;
