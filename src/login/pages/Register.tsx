import type { JSX } from "keycloakify/tools/JSX";
import { useEffect, useRef, useState } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

// MUI Imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid2";

type RegisterProps = PageProps<Extract<KcContext, { pageId: "register.ftl" }>, I18n> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSX.Element>;
    doMakeUserConfirmPassword: boolean;
};

export default function Register(props: RegisterProps) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes, UserProfileFormFields, doMakeUserConfirmPassword } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { messageHeader, url, messagesPerField, recaptchaRequired, recaptchaVisible, recaptchaSiteKey, recaptchaAction, termsAcceptanceRequired } =
        kcContext;

    const { msg, msgStr, advancedMsg } = i18n;

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);
    const [areTermsAccepted, setAreTermsAccepted] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);
    const recaptchaButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // Only needed for invisible reCAPTCHA
        if (recaptchaRequired && !recaptchaVisible && recaptchaAction !== undefined) {
            // Define a global callback function that Keycloak's reCAPTCHA can call
            window.onRecaptchaSuccess = () => {
                if (formRef.current) {
                    formRef.current.submit();
                }
            };
        }
    }, [recaptchaRequired, recaptchaVisible, recaptchaAction]);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            headerNode={messageHeader !== undefined ? advancedMsg(messageHeader) : msg("registerTitle")}
            displayMessage={messagesPerField.exists("global")}
            displayRequiredFields
        >
            <form ref={formRef} id="kc-register-form" className={kcClsx("kcFormClass")} action={url.registrationAction} method="post">
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <UserProfileFormFields
                            kcContext={kcContext}
                            i18n={i18n}
                            kcClsx={kcClsx}
                            onIsFormSubmittableValueChange={setIsFormSubmittable}
                            doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                        />
                    </Grid>
                    {termsAcceptanceRequired && (
                        <Grid size={12}>
                            <TermsAcceptance
                                i18n={i18n}
                                kcClsx={kcClsx}
                                messagesPerField={messagesPerField}
                                areTermsAccepted={areTermsAccepted}
                                onAreTermsAcceptedValueChange={setAreTermsAccepted}
                            />
                        </Grid>
                    )}
                    {recaptchaRequired && (recaptchaVisible || recaptchaAction === undefined) && (
                        <Grid size={12}>
                            <Box sx={{ my: 2 }}>
                                <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey} data-action={recaptchaAction}></div>
                            </Box>
                        </Grid>
                    )}

                    <Grid size={12}>
                        {recaptchaRequired && !recaptchaVisible && recaptchaAction !== undefined ? (
                            <Button
                                ref={recaptchaButtonRef}
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                className="g-recaptcha"
                                data-sitekey={recaptchaSiteKey}
                                data-callback="onRecaptchaSuccess"
                                data-action={recaptchaAction}
                                type="submit"
                                aria-label={msgStr("doRegister")}
                                sx={{
                                    backgroundColor: "primary.light"
                                }}
                            >
                                {msg("doRegister")}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                type="submit"
                                disabled={!isFormSubmittable || (termsAcceptanceRequired && !areTermsAccepted)}
                                aria-label={msgStr("doRegister")}
                                sx={{
                                    backgroundColor: "primary.light"
                                }}
                            >
                                {msgStr("doRegister")}
                            </Button>
                        )}
                    </Grid>

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

declare global {
    interface Window {
        onRecaptchaSuccess: () => void;
    }
}

function TermsAcceptance(props: {
    i18n: I18n;
    kcClsx: KcClsx;
    messagesPerField: Pick<KcContext["messagesPerField"], "existsError" | "get">;
    areTermsAccepted: boolean;
    onAreTermsAcceptedValueChange: (areTermsAccepted: boolean) => void;
}) {
    const { i18n, messagesPerField, areTermsAccepted, onAreTermsAcceptedValueChange } = props;

    const { msg } = i18n;
    const hasError = messagesPerField.existsError("termsAccepted");

    return (
        <>
            <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                {msg("termsTitle")}
            </Typography>

            {msg("termsText") && (
                <Typography variant="body2" id="kc-registration-terms-text">
                    {msg("termsText")}
                </Typography>
            )}

            <FormControlLabel
                control={
                    <Checkbox
                        id="termsAccepted"
                        name="termsAccepted"
                        checked={areTermsAccepted}
                        onChange={e => onAreTermsAcceptedValueChange(e.target.checked)}
                        aria-invalid={hasError}
                    />
                }
                label={msg("acceptTerms")}
            />

            {hasError && (
                <FormHelperText error id="input-error-terms-accepted" sx={{ mt: 0 }}>
                    <span
                        dangerouslySetInnerHTML={{
                            __html: kcSanitize(messagesPerField.get("termsAccepted"))
                        }}
                    />
                </FormHelperText>
            )}
        </>
    );
}
