import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

// MUI Imports
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";

export default function LoginResetPassword(
    props: PageProps<
        Extract<
            KcContext,
            {
                pageId: "login-reset-password.ftl";
            }
        >,
        I18n
    >
) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { url, realm, auth, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;

    // Determine the appropriate label and icon for the input field
    const inputLabel = !realm.loginWithEmailAllowed ? msg("username") : !realm.registrationEmailAsUsername ? msg("usernameOrEmail") : msg("email");

    const hasError = messagesPerField.existsError("username");
    const errorMessage = hasError ? messagesPerField.get("username") : "";

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayInfo
            displayMessage={!messagesPerField.existsError("username")}
            infoNode={realm.duplicateEmailsAllowed ? msg("emailInstructionUsername") : msg("emailInstruction")}
            headerNode={msg("emailForgotTitle")}
        >
            <form id="kc-reset-password-form" className={kcClsx("kcFormClass")} action={url.loginAction} method="post">
                <Grid container spacing={3}>
                    {/* Username/Email field */}
                    <Grid size={12}>
                        <FormControl fullWidth>
                            <FormLabel htmlFor={"username"}>{inputLabel}</FormLabel>
                            <TextField
                                id="username"
                                name="username"
                                hiddenLabel
                                variant="outlined"
                                fullWidth
                                autoFocus
                                defaultValue={auth.attemptedUsername ?? ""}
                                error={hasError}
                                aria-invalid={messagesPerField.existsError("username")}
                                helperText={
                                    hasError ? (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: kcSanitize(errorMessage)
                                            }}
                                        />
                                    ) : undefined
                                }
                            />
                        </FormControl>
                    </Grid>

                    {/* Instructions */}
                    <Grid size={12}>
                        <Typography variant="body2" color="textSecondary">
                            {realm.duplicateEmailsAllowed ? msg("emailInstructionUsername") : msg("emailInstruction")}
                        </Typography>
                    </Grid>

                    {/* Submit button */}
                    <Grid size={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            type="submit"
                            aria-label={msgStr("doSubmit")}
                            sx={{
                                backgroundColor: "primary.light"
                            }}
                        >
                            {msgStr("doSubmit")}
                        </Button>
                    </Grid>

                    {/* Back to login link */}
                    <Grid size={12} sx={{ display: "flex", justifyContent: "center" }}>
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                            <Typography variant="body1" fontWeight={"600"} sx={{ mb: 1 }}>
                                {msg("backToLoginTitle")}
                            </Typography>
                            <Link href={url.loginUrl} underline="hover" color="info" role={"link"}>
                                {msg("backToLoginText")}
                            </Link>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Template>
    );
}
