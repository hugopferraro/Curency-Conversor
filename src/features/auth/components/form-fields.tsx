"use client";

import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { useState } from "react";

export function EmailField(props: TextFieldProps) {
  return (
    <TextField
      label="E-mail"
      type="email"
      autoComplete="email"
      fullWidth
      {...props}
    />
  );
}

export function PasswordField({
  label = "Senha",
  autoComplete = "current-password",
  ...props
}: TextFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      label={label}
      type={isVisible ? "text" : "password"}
      autoComplete={autoComplete}
      fullWidth
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                edge="end"
                aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setIsVisible((visible) => !visible)}
              >
                {isVisible ? (
                  <VisibilityOffOutlinedIcon />
                ) : (
                  <VisibilityOutlinedIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
}
