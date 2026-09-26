import { z } from "zod";

const emailSchema = z
  .string()
  .min(1, "Informe seu e-mail.")
  .refine((value) => z.email().safeParse(value.trim()).success, {
    message: "Informe um e-mail válido.",
  });

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(128, "A senha deve ter no máximo 128 caracteres.");

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, "Confirme sua senha."),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "As senhas não coincidem.",
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export type CurrentUser = {
  id: string;
  email: string;
};
