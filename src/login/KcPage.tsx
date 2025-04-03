import { Suspense, lazy } from "react";
import type { ClassKey } from "keycloakify/login";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import { tss } from "tss-react/mui";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import "./main.css";
import { GlobalStateProvider } from "./context/GlobalState.tsx";

const UserProfileFormFields = lazy(() => import("./UserProfileFormFields"));
const Login = lazy(() => import("./pages/Login"));
const Template = lazy(() => import("./Template"));
const LoginResetPassword = lazy(() => import("./pages/LoginResetPassword"));
const Register = lazy(() => import("./pages/Register"));

const doMakeUserConfirmPassword = true;

const theme = createTheme({
    typography: {
        fontFamily: "Source Sans 3",
        htmlFontSize: 16,
        body1: {
            lineHeight: 1.5,
            fontSize: "1rem"
        },
        h1: {
            fontSize: "3rem",
            fontWeight: 600
        },
        h2: {
            fontSize: "2rem",
            fontWeight: 600
        },
        h4: {
            fontSize: "1.5rem",
            fontWeight: 600
        }
    },
    shape: {
        borderRadius: 8
    },
    palette: {
        mode: "light",
        primary: {
            main: "#003C38", // Dark green color from the header
            dark: "#002B27", // Darker green color for hover states
            light: "#007E43" // Lighter green color for active states
        },
        info: {
            main: "#1A59CE",
            light: "#E8F0FE",
            dark: "#0E3A8A"
        },
        background: {
            default: "#F5F6F8" // Light gray background
        }
    },
    components: {
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderLeftWidth: 4,
                    "& .MuiAlert-message": {
                        width: "100%",
                        padding: "0"
                    },
                    "& .MuiAlert-icon": {
                        alignItems: "flex-start",
                        padding: "0"
                    },
                    "&.MuiAlert-colorInfo": {
                        backgroundColor: "#1A59CE10",
                        borderColor: "#1A59CE",
                        "& .MuiAlert-icon": {
                            color: "#1A59CE"
                        }
                    }
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    textTransform: "none",
                    fontSize: "1rem",
                    lineHeight: "1.5rem",
                    padding: 12
                },
                outlined: {
                    padding: 11 // 12px - 1px border
                }
            }
        },
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    fontSize: "1rem",
                    lineHeight: "1.5rem",
                    fontWeight: 600,
                    color: 'inherit',
                    marginBottom: "0.5rem"
                }
            }
        }
    }
});

export default function kcPage(props: { kcContext: KcContext }) {
    return (
        <GlobalStateProvider kcContext={props.kcContext}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <KcPageContextual {...props} />
            </ThemeProvider>
        </GlobalStateProvider>
    );
}

function KcPageContextual(props: { kcContext: KcContext }) {
    const { kcContext } = props;
    const { classes } = useStyles();

    const { i18n } = useI18n({ kcContext });

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return (
                            <Login
                                {...{ kcContext, i18n, classes }}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "login-reset-password.ftl":
                        return (
                            <LoginResetPassword
                                {...{ kcContext, i18n, classes }}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "register.ftl":
                        return (
                            <Register
                                {...{ kcContext, i18n, classes }}
                                Template={Template}
                                doUseDefaultCss={false}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                    default:
                        return (
                            <DefaultPage
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={classes}
                                Template={Template}
                                doUseDefaultCss={true}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                }
            })()}
        </Suspense>
    );
}

const useStyles = tss.create({
    kcHtmlClass: {},
    kcBodyClass: {},
    kcLoginClass: {},
    kcFormCardClass: {}
} satisfies { [key in ClassKey]?: unknown });
