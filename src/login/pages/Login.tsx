import { lazy, Suspense, useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link/Link";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import Person from "@mui/icons-material/Person";
import { darken } from "@mui/system";
import EGovLogoUrl from "../assets/images/e-gov-logo.svg";
import type { JSX } from "keycloakify/tools/JSX";
import { type TemplateProps, type ClassKey } from "../Template.types.ts";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import CircularProgress from "@mui/material/CircularProgress";
import { useGlobalState } from "../context/GlobalState.tsx";
import Alert from "@mui/material/Alert";
import FormLabel from "@mui/material/FormLabel";

const InfoIcon = lazy(() => import("@mui/icons-material/Info"));
const WarningIcon = lazy(() => import("@mui/icons-material/Warning"));
const ErrorIcon = lazy(() => import("@mui/icons-material/Error"));
const CheckCircleIcon = lazy(() => import("@mui/icons-material/CheckCircle"));

const getAlertIcon = (type: "success" | "warning" | "error" | "info") => {
    const IconComponent = (() => {
        switch (type) {
            case "warning":
                return WarningIcon;
            case "error":
                return ErrorIcon;
            case "success":
                return CheckCircleIcon;
            default:
                return InfoIcon;
        }
    })();

    return (
        <Suspense fallback={<CircularProgress size={16} />}>
            <IconComponent fontSize="small" />
        </Suspense>
    );
};

// Lazy load the icons
const iconComponents: Record<string, any> = {
    facebook: lazy(() => import("@mui/icons-material/Facebook")),
    github: lazy(() => import("@mui/icons-material/GitHub")),
    gitlab: lazy(() => import("@mui/icons-material/Code")),
    bitbucket: lazy(() => import("@mui/icons-material/Code")),
    'openshift-v3': lazy(() => import("@mui/icons-material/Code")),
    'openshift-v4': lazy(() => import("@mui/icons-material/Code")),
    google: lazy(() => import("@mui/icons-material/Google")),
    'linkedin-openid-connect': lazy(() => import("@mui/icons-material/LinkedIn")),
    microsoft: lazy(() => import("@mui/icons-material/Microsoft")),
    twitter: lazy(() => import("@mui/icons-material/Twitter")),
    instagram: lazy(() => import("@mui/icons-material/Instagram")),
    stackoverflow: lazy(() => import("@mui/icons-material/Code")),
    paypal: lazy(() => import("@mui/icons-material/Payment"))
};

// Function to get the correct icon
const getProviderIcon = (providerId: string) => {
    const IconComponent = iconComponents[providerId];

    return IconComponent ? (
        <Suspense fallback={<CircularProgress size={20} />}>
            <IconComponent />
        </Suspense>
    ) : null;
};

export type PageProps<NarrowedKcContext, I18n> = {
    Template: LazyOrNot<(props: TemplateProps<any, any>) => JSX.Element | null>;
    kcContext: NarrowedKcContext;
    i18n: I18n;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
};

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { setIsModalOpen } = useGlobalState();

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField } = kcContext;

    // Define the lists of social and user-defined providers
    const socialProvidersList = [
        "facebook",
        "github",
        "gitlab",
        "google",
        "instagram",
        "linkedin-openid-connect",
        "microsoft",
        "openshift-v3",
        "openswift-v4",
        "paypal",
        "stackoverflow",
        "twitter",
        "bitbucket",
        "stackoverflow"
    ];

    const userDefinedProvidersList = ["keycloak-oidc", "openid-connect", "saml"];

    // Separate social and user-defined providers based on providerId
    console.log({social})
    const socialProviders = social?.providers?.filter(selection => selection.providerId && socialProvidersList.includes(selection.providerId));

    const userDefinedProviders = social?.providers?.filter(
        selection => selection.providerId && userDefinedProvidersList.includes(selection.providerId)
    );

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword(show => !show);

    // Function to handle login button click for each provider
    const handleProviderClick = (loginUrl?: string) => {
        if (loginUrl) {
            // Redirect to the correct login URL
            window.location.href = loginUrl;
        }
    };

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username", "password")}
            headerNode={msg("chooseLoginMethod")}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
            infoNode={
                <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Typography variant="body1" fontWeight={"600"} sx={{ mb: 1 }}>
                        {msg("noAccount")}&nbsp;
                    </Typography>
                    <Link href={url.registrationUrl} underline="hover" color="primary.main" role={"link"}>
                        {msg("doRegister")}
                    </Link>
                </Box>
            }
            socialProvidersNode={
                <Grid container spacing={3} sx={{ width: "100%" }}>
                    <Grid size={12}>
                        <Button
                            variant="outlined"
                            aria-label={msgStr("loginNameAndPassword")}
                            startIcon={<Person />}
                            role={"button"}
                            fullWidth
                            onClick={() => setIsModalOpen(true)}
                        >
                            {msg("loginNameAndPassword")}
                        </Button>
                    </Grid>
                    {realm.password && socialProviders !== undefined && socialProviders.length !== 0 && (
                        <>
                            {socialProviders.map(provider => (
                                <Grid key={provider.providerId} size={12} sx={{ display: "flex", justifyContent: "center" }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={getProviderIcon(provider.providerId)}
                                        aria-label={provider.displayName}
                                        role={"button"}
                                        fullWidth
                                        onClick={() => handleProviderClick(provider.loginUrl)}
                                    >
                                        {provider.displayName}
                                    </Button>
                                </Grid>
                            ))}
                        </>
                    )}
                    {/*{realm.password && socialProviders !== undefined && socialProviders.length !== 0 && (*/}
                    {/*    <div id="kc-social-providers" className={kcClsx("kcFormSocialAccountSectionClass")}>*/}
                    {/*        <hr />*/}
                    {/*        <h2>{msg("identity-provider-login-label")}</h2>*/}
                    {/*        <ul className={kcClsx("kcFormSocialAccountListClass", socialProviders.length > 3 && "kcFormSocialAccountListGridClass")}>*/}
                    {/*            {socialProviders.map(provider => (*/}
                    {/*                <li key={provider.alias}>*/}
                    {/*                    <a*/}
                    {/*                        id={`social-${provider.alias}`}*/}
                    {/*                        className={kcClsx("kcFormSocialAccountListButtonClass")}*/}
                    {/*                        type="button"*/}
                    {/*                        href={provider.loginUrl}*/}
                    {/*                    >*/}
                    {/*                        {provider.iconClasses && (*/}
                    {/*                            <i className={clsx(kcClsx("kcCommonLogoIdP"), provider.iconClasses)} aria-hidden="true"></i>*/}
                    {/*                        )}*/}
                    {/*                        <span*/}
                    {/*                            className={clsx(*/}
                    {/*                                kcClsx("kcFormSocialAccountNameClass"),*/}
                    {/*                                provider.iconClasses && "kc-social-icon-text"*/}
                    {/*                            )}*/}
                    {/*                            dangerouslySetInnerHTML={{ __html: kcSanitize(provider.displayName) }}*/}
                    {/*                        ></span>*/}
                    {/*                    </a>*/}
                    {/*                </li>*/}
                    {/*            ))}*/}
                    {/*        </ul>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </Grid>
            }
            userDefinedProvidersNode={
                <>
                    {userDefinedProviders !== undefined && userDefinedProviders.length !== 0 && (
                        <>
                            {userDefinedProviders.map(provider => (
                                <>
                                    <Box component="img" src={EGovLogoUrl} alt="E-Government" sx={{ height: 60, mb: 2 }} />
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {msg("userDefinedProviderTitle")}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
                                        {msg("userDefinedProviderSubtitle")}
                                    </Typography>
                                    <Button
                                        variant={"contained"}
                                        fullWidth
                                        aria-label={msgStr("login")}
                                        role={"button"}
                                        onClick={() => handleProviderClick(provider.loginUrl)}
                                        sx={{
                                            backgroundColor: "primary.light",
                                            "&:hover": {
                                                backgroundColor: theme => darken(theme.palette.primary.light, 0.15)
                                            }
                                        }}
                                    >
                                        {msg("login")}
                                    </Button>
                                </>
                            ))}
                        </>
                    )}
                </>
            }
        >
            <>
                {/* Displaying the Alert message */}
                <Alert severity="info" variant="outlined" icon={getAlertIcon("info")} role={"alert"}>
                    <Typography variant="body2">
                        {msg("loginHelpText1")}
                        <Link href={url.registrationUrl} underline="hover" color="info" role={"link"}>
                            {msg("loginHelpText2")}
                        </Link>
                    </Typography>
                </Alert>

                {(() => {
                    // Check if the username should be shown or not
                    const node = !(auth !== undefined && auth.showUsername && !auth.showResetCredentials) ? null : (
                        <Box textAlign="center">
                            <Typography variant="body1">{auth.attemptedUsername}</Typography>
                            <Link href={url.loginRestartFlowUrl} aria-label={msgStr("restartLoginTooltip")} underline="hover" role={"link"}>
                                <Typography variant="body2" color="primary">
                                    {msg("restartLoginTooltip")}
                                </Typography>
                            </Link>
                        </Box>
                    );

                    return node;
                })()}

                {/* Children */}
                <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", py: 2 }}>
                    {realm.password && (
                        <form
                            id="kc-form-login"
                            onSubmit={() => {
                                setIsLoginButtonDisabled(true);
                                return true;
                            }}
                            action={url.loginAction}
                            method="post"
                        >
                            <Grid container spacing={3}>
                                {!usernameHidden && (
                                    <Grid size={12}>
                                        <FormControl fullWidth>
                                            <FormLabel htmlFor={"username"}>
                                                {!realm.loginWithEmailAllowed
                                                    ? msg("username")
                                                    : !realm.registrationEmailAsUsername
                                                        ? msg("usernameOrEmail")
                                                        : msg("email")}
                                            </FormLabel>
                                            <TextField
                                                id="username"
                                                name="username"
                                                hiddenLabel
                                                defaultValue={login.username ?? ""}
                                                autoFocus
                                                autoComplete="username"
                                                aria-invalid={messagesPerField.existsError("username", "password")}
                                                error={messagesPerField.existsError("username", "password")}
                                                helperText={
                                                    messagesPerField.existsError("username", "password") &&
                                                    kcSanitize(messagesPerField.getFirstError("username", "password"))
                                                }
                                            />
                                        </FormControl>
                                    </Grid>
                                )}

                                <Grid size={12}>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor={"password"}>
                                            {msg("password")}
                                        </FormLabel>
                                        <TextField
                                            id="password"
                                            hiddenLabel
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            aria-invalid={messagesPerField.existsError("username", "password")}
                                            error={messagesPerField.existsError("username", "password")}
                                            helperText={
                                                messagesPerField.existsError("username", "password") &&
                                                kcSanitize(messagesPerField.getFirstError("username", "password"))
                                            }
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label={msgStr(showPassword ? "hidePassword" : "showPassword")}
                                                                role={"button"}
                                                                onClick={handleClickShowPassword}
                                                                edge="end"
                                                            >
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </Grid>

                                {realm.rememberMe && !usernameHidden && (
                                    <Grid size={12}>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={<Checkbox id="rememberMe" name="rememberMe" defaultChecked={!!login.rememberMe} />}
                                                label={msg("rememberMe")}
                                                aria-label={msgStr("rememberMe")}
                                            />
                                        </FormGroup>
                                    </Grid>
                                )}

                                {/* Submit Button */}
                                <Grid size={12}>
                                    <input type="hidden" name="credentialId" value={auth.selectedCredential} />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        aria-label={msgStr("doLogIn")}
                                        disabled={isLoginButtonDisabled}
                                        fullWidth
                                        sx={{
                                            backgroundColor: "primary.light"
                                        }}
                                    >
                                        {msg("doLogIn")}
                                    </Button>
                                </Grid>

                                {realm.resetPasswordAllowed && (
                                    <Grid size={12} sx={{ display: "flex", justifyContent: "center" }}>
                                        <Box sx={{ mt: 2, textAlign: "center" }}>
                                            <Typography variant="body1" fontWeight={"600"} sx={{ mb: 1 }}>
                                                {msg("forgotPassword")}
                                            </Typography>
                                            <Link href={url.loginResetCredentialsUrl} underline="hover" color="info" role={"link"}>
                                                {msg("restorePassword")}
                                            </Link>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </form>
                    )}
                </Box>

                {/* "Try Another Way" link form */}
                {auth && auth.showTryAnotherWayLink && (
                    <form id="kc-select-try-another-way-form" action={url.loginAction} method="post">
                        <Box textAlign="center" mt={2}>
                            <input type="hidden" name="tryAnotherWay" value="on" />
                            <Link
                                href="#"
                                aria-label={msgStr("doTryAnotherWay")}
                                role={"link"}
                                onClick={() => {
                                    const form = (document.forms as unknown as Record<string, HTMLFormElement>)["kc-select-try-another-way-form"];
                                    form.submit();
                                    return false;
                                }}
                                variant="body2"
                            >
                                {msg("doTryAnotherWay")}
                            </Link>
                        </Box>
                    </form>
                )}
            </>
        </Template>
    );
}
