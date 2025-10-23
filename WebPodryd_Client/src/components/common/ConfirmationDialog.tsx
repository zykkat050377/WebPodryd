// src/components/common/ConfirmationDialog.tsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';

export const ConfirmationDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <LogoutIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{title}</Typography>
          <IconButton
            aria-label="close"
            onClick={onCancel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" alignItems="center" p={2}>
          <Typography>{message}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          variant="outlined"
          startIcon={<CloseIcon />}
        >
          Отмена
        </Button>
        <Button
          onClick={onConfirm}
          color="primary"
          variant="contained"
          startIcon={<LogoutIcon />}
          sx={{ ml: 2 }}
        >
          Выйти
        </Button>
      </DialogActions>
    </Dialog>
  );
};