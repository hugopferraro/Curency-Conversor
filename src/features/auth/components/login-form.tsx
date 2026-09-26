"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, CircularProgress, Link as MuiLink, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { authClient } from "@/features/auth/client";
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/features/auth/contracts";
import {
  EmailField,
  PasswordField,
} from "@/features/auth/components/form-fields";

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async (values) => {
    const response = await authClient.signIn.email({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });

    if (response.error) {
      setError("root", {
        message: "E-mail ou senha inválidos. Verifique os dados e tente novamente.",
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
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        disabled={isSubmitting}
        {...register("password")}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={18} /> : null}
      >
        Entrar
      </Button>
      <Typography sx={{ textAlign: "center" }} color="text.secondary">
        Ainda não tem conta?{" "}
        <MuiLink component={Link} href="/register" sx={{ fontWeight: 700 }}>
          Criar conta
        </MuiLink>
      </Typography>
    </Stack>
  );
}
