"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  CircularProgress,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";

import { authClient } from "@/features/auth/client";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/features/auth/contracts";
import {
  EmailField,
  PasswordField,
} from "@/features/auth/components/form-fields";

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { email: "", password: "", passwordConfirmation: "" },
  });
  const password = useWatch({ control, name: "password" });

  const submit = handleSubmit(async (values) => {
    const response = await authClient.signUp.email({
      name: "User",
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });

    if (response.error) {
      setError("root", {
        message:
          "Não foi possível criar a conta. Verifique se o e-mail já está em uso.",
      });
      return;
    }

    router.replace("/");
    router.refresh();
  });

  return (
    <Stack component="form" onSubmit={submit} spacing={2.5} noValidate>
      {errors.root?.message ? (
        <Alert severity="error" role="alert">
          {errors.root.message}
        </Alert>
      ) : null}
      <EmailField
        autoFocus
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        disabled={isSubmitting}
        {...register("email")}
      />
      <PasswordField
        label="Senha"
        autoComplete="new-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        disabled={isSubmitting}
        {...register("password")}
      />
      <Typography
        variant="caption"
        color={password.length >= 8 ? "success.main" : "text.secondary"}
        sx={{ mt: "-12px !important" }}
      >
        A senha deve ter entre 8 e 128 caracteres.
      </Typography>
      <PasswordField
        label="Confirmar senha"
        autoComplete="new-password"
        error={Boolean(errors.passwordConfirmation)}
        helperText={errors.passwordConfirmation?.message}
        disabled={isSubmitting}
        {...register("passwordConfirmation")}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={18} /> : null}
      >
        Criar conta
      </Button>
      <Typography sx={{ textAlign: "center" }} color="text.secondary">
        Já tem uma conta?{" "}
        <MuiLink component={Link} href="/login" sx={{ fontWeight: 700 }}>
          Entrar
        </MuiLink>
      </Typography>
    </Stack>
  );
}
