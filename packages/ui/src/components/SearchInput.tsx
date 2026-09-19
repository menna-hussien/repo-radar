import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { CircularProgress, IconButton, InputAdornment, TextField } from '@mui/material';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  label?: string;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  isLoading = false,
  label = 'Search GitHub repositories',
  placeholder = 'Search by repository name…',
}: SearchInputProps) {
  return (
    <TextField
      value={value}
      onChange={(event) => onChange(event.target.value)}
      label={label}
      placeholder={placeholder}
      type="search"
      fullWidth
      size="small"
      sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isLoading && <CircularProgress size={16} aria-label="Searching" />}
              {!isLoading && value && (
                <IconButton
                  aria-label="Clear search"
                  size="small"
                  onClick={() => onChange('')}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
