/* eslint-disable @typescript-eslint/no-unused-vars */
import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({
        en: {
            loginNameAndPassword: "Login Name and Password",
            login: "Login",
            userDefinedProviderTitle: "E Government",
            userDefinedProviderSubtitle: "(Through the bank, with the email, signature, eid)",
            chooseLoginMethod: "Choose a login method",
            noAccount: "Don't have a login name and password?",
            doRegister: "Fill in the login application",
            loginAccountTitle: "Login to Your Account",
            doLogIn: "To join",
            forgotPassword: "Forgot your password?",
            restorePassword: "To restore the password",
            loginHelpText1: "<strong>Do not have a login name and password?</strong> First log in over email, Government Gate, and Activate in your account this login method or ",
            loginHelpText2: "Complete the login application",
            fillLoginApplication: "Fill in the login application",
            hidePassword: "Hide the password",
            showPassword: "Display the password",
            close: "Close",
            closeDialog: "Close Dialog",
            backToLoginTitle: "Already have an account?",
            backToLoginText: "Sign in to your existing account"
        },
        lt: {
            login: "Prisijungti",
            loginNameAndPassword: "Prisijungimo vardas ir slaptažodis",
            userDefinedProviderTitle: "E Vyriausybė",
            userDefinedProviderSubtitle: "(Per banką, su el. paštu, parašu, eid)",
            chooseLoginMethod: "Pasirinkite prisijungimo metodą",
            noAccount: "Neturite prisijungimo vardo ir slaptažodžio?",
            doRegister: "Užpildykite prisijungimo paraišką",
            loginAccountTitle: "Prisijunkite prie savo paskyros",
            doLogIn: "Prisijungti",
            forgotPassword: "Pamiršote slaptažodį?",
            restorePassword: "Atkurti slaptažodį",
            loginHelpText1: "<strong>Neturite prisijungimo vardo ir slaptažodžio?</strong> Pirmiausia prisijunkite per el. paštą, Vyriausybes vartai ir aktyvuokite savo paskyroje šį prisijungimo metodą arba ",
            loginHelpText2: "Užpildykite prisijungimo paraišką",
            fillLoginApplication: "Užpildykite prisijungimo paraišką",
            hidePassword: "Slėpti slaptažodį",
            showPassword: "Rodyti slaptažodį",
            close: "Užsidaryti",
            closeDialog: "Uždaryti dialogą",
            backToLoginTitle: "Jau turite paskyrą?",
            backToLoginText: "Prisijunkite prie esamos paskyros",
        }
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
