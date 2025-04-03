import { lazy, Suspense, useEffect } from "react";
import MainContentWrapper from "./MainContentWrapper";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Select from "@mui/material/Select";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import Language from "@mui/icons-material/Language";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid2";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import VMILogoUrl from "./assets/images/vmi-logo.svg";
import type { TemplateProps } from "./Template.types.ts";
import CircularProgress from "@mui/material/CircularProgress";

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

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        headerNode,
        userDefinedProvidersNode = null,
        socialProvidersNode = null,
        documentTitle,
        bodyClassName,
        kcContext,
        i18n,
        doUseDefaultCss,
        classes,
        children
    } = props;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

    const { msg, msgStr, currentLanguage, enabledLanguages } = i18n;

    const { realm, auth, url, message, isAppInitiatedAction, registrationDisabled } = kcContext;

    useEffect(() => {
        document.title = documentTitle ?? msgStr("loginTitle", kcContext.realm.displayName);
    }, []);

    useSetClassName({
        qualifiedName: "html",
        className: kcClsx("kcHtmlClass")
    });

    useSetClassName({
        qualifiedName: "body",
        className: bodyClassName ?? kcClsx("kcBodyClass")
    });

    const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

    if (!isReadyToRender) {
        return null;
    }

    return (
        <Box display="flex" flexDirection="column" minHeight="100dvh" width={"100%"} sx={{ backgroundColor: "background.default" }}>
            <AppBar position="static">
                <Toolbar>
                    <Link href={url.loginUrl} sx={{ textDecoration: "none", display: "inline-block" }}>
                        <Box component="img" src={VMILogoUrl} alt={realm.displayName} sx={{ height: 40 }} />
                    </Link>
                </Toolbar>
            </AppBar>
            <Container component="main" sx={{ flexGrow: 1, my: 8, display: "flex", justifyContent: "center", flexDirection: "column" }}>
                <Grid container spacing={3} justifyContent="center">
                    <Grid size={12} sx={{ display: "flex", justifyContent: "center" }}>
                        <Typography variant="h2" align="center" gutterBottom>
                            {headerNode}
                        </Typography>
                    </Grid>

                    {displayMessage && message && (message.type !== "warning" || !isAppInitiatedAction) && (
                        <Grid size={12} sx={{ display: "flex", justifyContent: "center" }}>
                            <Alert
                                severity={message.type}
                                variant="outlined"
                                sx={{ mt: 2, maxWidth: 500 }}
                                icon={getAlertIcon(message.type)}
                                role={"alert"}
                            >
                                <Typography variant="body2" dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }} />
                            </Alert>
                        </Grid>
                    )}

                    {userDefinedProvidersNode && (userDefinedProvidersNode as any)?.props?.children && (
                        <Grid size={12} sx={{ display: "flex", justifyContent: "center" }}>
                            <Card sx={{ width: "100%", maxWidth: 500 }}>
                                <CardContent
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        p: 3
                                    }}
                                >
                                    {/* User Defined Providers Node */}
                                    {userDefinedProvidersNode}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {socialProvidersNode && (socialProvidersNode as any)?.props?.children && (
                        <Grid size={12} sx={{ display: "flex", justifyContent: "center" }}>
                            <Card sx={{ width: "100%", maxWidth: 500 }}>
                                <CardContent
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        p: 3
                                    }}
                                >
                                    {/* Social Providers Node */}
                                    {socialProvidersNode}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

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

                        // If "required fields" needs to be shown
                        if (displayRequiredFields) {
                            return (
                                <Box textAlign="center">
                                    <Typography variant="subtitle2" color="error">
                                        <span className="required">*</span> {msg("requiredFields")}
                                    </Typography>
                                    <Box mt={2}>{node}</Box>
                                </Box>
                            );
                        }

                        return node;
                    })()}

                    <MainContentWrapper kcContext={kcContext} i18n={i18n}>
                        {children}
                    </MainContentWrapper>

                    {/* Registration Link */}
                    {realm.registrationAllowed && !registrationDisabled && displayInfo && (
                        <Grid size={12} sx={{ display: "flex", justifyContent: "center" }}>
                            <Box sx={{ mt: 2, textAlign: "center" }}>
                                <Typography variant="body1" fontWeight={"600"} sx={{ mb: 1 }}>
                                    {msg("noAccount")}
                                </Typography>
                                <Link href={url.registrationUrl} underline="hover" color="info" role={"link"}>
                                    {msg("fillLoginApplication")}
                                </Link>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Container>
            <Box component="footer" bgcolor="primary.main" color="white" sx={{ px: 3, minHeight: 64 }}>
                {enabledLanguages.length > 1 && (
                    <FormControl size={"small"} sx={{ my: 2, minWidth: 320 }}>
                        <Select
                            displayEmpty
                            value={currentLanguage.languageTag}
                            sx={{
                                bgcolor: theme => theme.palette.common.white
                            }}
                            onChange={e => {
                                // Find the language with the selected tag
                                const selectedLang = enabledLanguages.find(lang => lang.languageTag === e.target.value);
                                if (selectedLang && selectedLang.href) {
                                    window.location.href = selectedLang.href;
                                }
                            }}
                            input={
                                <OutlinedInput
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <Language />
                                        </InputAdornment>
                                    }
                                />
                            }
                        >
                            {enabledLanguages.map(({ languageTag, label }) => (
                                <MenuItem key={languageTag} value={languageTag}>
                                    {label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Box>
        </Box>
    );
}
