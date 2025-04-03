import type { JSX } from "keycloakify/tools/JSX";
import { Fragment, useEffect } from "react";
import { assert } from "keycloakify/tools/assert";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import type { KcClsx } from "keycloakify/login/lib/kcClsx";
import {
    type FormAction,
    type FormFieldError,
    getButtonToDisplayForMultivaluedAttributeField,
    useUserProfileForm
} from "keycloakify/login/lib/useUserProfileForm";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { Attribute } from "keycloakify/login/KcContext";
import type { KcContext } from "./KcContext";
import type { I18n } from "./i18n";

// MUI Imports
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import OutlinedInput from "@mui/material/OutlinedInput";
import Chip from "@mui/material/Chip";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Grid from "@mui/material/Grid2";

export default function UserProfileFormFields(props: UserProfileFormFieldsProps<KcContext, I18n>) {
    const { kcContext, i18n, kcClsx, onIsFormSubmittableValueChange, doMakeUserConfirmPassword, BeforeField, AfterField } = props;

    const {
        formState: { formFieldStates, isFormSubmittable },
        dispatchFormAction
    } = useUserProfileForm({
        kcContext,
        i18n,
        doMakeUserConfirmPassword
    });

    useEffect(() => {
        onIsFormSubmittableValueChange(isFormSubmittable);
    }, [isFormSubmittable]);

    const groupNameRef = { current: "" };

    return (
        <Grid container spacing={3}>
            {formFieldStates.map(({ attribute, displayableErrors, valueOrValues }) => {
                return (
                    <Fragment key={attribute.name}>
                        <GroupLabel attribute={attribute} groupNameRef={groupNameRef} i18n={i18n} kcClsx={kcClsx} />
                        <Grid size={12} sx={{ display: attribute.name === "password-confirm" && !doMakeUserConfirmPassword ? "none" : undefined }}>
                            {BeforeField !== undefined && (
                                <BeforeField
                                    attribute={attribute}
                                    dispatchFormAction={dispatchFormAction}
                                    displayableErrors={displayableErrors}
                                    valueOrValues={valueOrValues}
                                    kcClsx={kcClsx}
                                    i18n={i18n}
                                />
                            )}
                            <InputFieldByType
                                attribute={attribute}
                                valueOrValues={valueOrValues}
                                displayableErrors={displayableErrors}
                                dispatchFormAction={dispatchFormAction}
                                kcClsx={kcClsx}
                                i18n={i18n}
                            />
                            {AfterField !== undefined && (
                                <AfterField
                                    attribute={attribute}
                                    dispatchFormAction={dispatchFormAction}
                                    displayableErrors={displayableErrors}
                                    valueOrValues={valueOrValues}
                                    kcClsx={kcClsx}
                                    i18n={i18n}
                                />
                            )}
                        </Grid>
                    </Fragment>
                );
            })}
            {/* See: https://github.com/keycloak/keycloak/issues/38029 */}
            {kcContext.locale !== undefined && formFieldStates.find(x => x.attribute.name === "locale") === undefined && (
                <input type="hidden" name="locale" value={i18n.currentLanguage.languageTag} />
            )}
        </Grid>
    );
}

function GroupLabel(props: {
    attribute: Attribute;
    groupNameRef: {
        current: string;
    };
    i18n: I18n;
    kcClsx: KcClsx;
}) {
    const { attribute, groupNameRef, i18n } = props;

    const { advancedMsg } = i18n;

    if (attribute.group?.name !== groupNameRef.current) {
        groupNameRef.current = attribute.group?.name ?? "";

        if (groupNameRef.current !== "") {
            assert(attribute.group !== undefined);

            return (
                <Grid
                    size={12}
                    sx={{ my: 2 }}
                    {...Object.fromEntries(Object.entries(attribute.group.html5DataAnnotations).map(([key, value]) => [`data-${key}`, value]))}
                >
                    <Box>
                        {(() => {
                            const groupDisplayHeader = attribute.group.displayHeader ?? "";
                            const groupHeaderText = groupDisplayHeader !== "" ? advancedMsg(groupDisplayHeader) : attribute.group.name;

                            return (
                                <Typography variant="h6" id={`header-${attribute.group.name}`} sx={{ mb: 1 }}>
                                    {groupHeaderText}
                                </Typography>
                            );
                        })()}
                        {(() => {
                            const groupDisplayDescription = attribute.group.displayDescription ?? "";

                            if (groupDisplayDescription !== "") {
                                const groupDescriptionText = advancedMsg(groupDisplayDescription);

                                return (
                                    <Typography variant="body2" color="text.secondary" id={`description-${attribute.group.name}`}>
                                        {groupDescriptionText}
                                    </Typography>
                                );
                            }

                            return null;
                        })()}
                        <Divider sx={{ mt: 1 }} />
                    </Box>
                </Grid>
            );
        }
    }

    return null;
}

type InputFieldByTypeProps = {
    attribute: Attribute;
    valueOrValues: string | string[];
    displayableErrors: FormFieldError[];
    dispatchFormAction: React.Dispatch<FormAction>;
    i18n: I18n;
    kcClsx: KcClsx;
};

function InputFieldByType(props: InputFieldByTypeProps) {
    const { attribute, valueOrValues, displayableErrors, i18n } = props;
    const { advancedMsg } = i18n;

    // Extract error messages for this field
    const errorMessages = displayableErrors.filter(error => error.fieldIndex === undefined).map(error => error.errorMessageStr);

    const hasError = errorMessages.length > 0;
    const helperText = (() => {
        if (hasError) {
            return errorMessages.join(", ");
        }
        if (attribute.annotations.inputHelperTextAfter) {
            return advancedMsg(attribute.annotations.inputHelperTextAfter);
        }
        return undefined;
    })();

    const label = advancedMsg(attribute.displayName ?? "");

    // Pass the extracted helper text and label to child components
    const enhancedProps = {
        ...props,
        errorMessages,
        commonHelperText: helperText,
        commonLabel: label
    };

    switch (attribute.annotations.inputType) {
        case "textarea":
            return <TextareaTag {...enhancedProps} />;
        case "select":
        case "multiselect":
            return <SelectTag {...enhancedProps} />;
        case "select-radiobuttons":
        case "multiselect-checkboxes":
            return <InputTagSelects {...enhancedProps} />;
        default: {
            if (valueOrValues instanceof Array) {
                return (
                    <Grid container spacing={2}>
                        {valueOrValues.map((...[, i]) => (
                            <Grid size={12} key={i}>
                                <InputTag {...enhancedProps} fieldIndex={i} />
                            </Grid>
                        ))}
                    </Grid>
                );
            }

            const inputNode = <InputTag {...enhancedProps} fieldIndex={undefined} />;

            if (attribute.name === "password" || attribute.name === "password-confirm") {
                return (
                    <PasswordWrapper {...enhancedProps}>
                        {inputNode}
                    </PasswordWrapper>
                );
            }

            return inputNode;
        }
    }
}

function PasswordWrapper(
    props: InputFieldByTypeProps & {
        errorMessages: string[];
        commonLabel?: string | JSX.Element;
        commonHelperText?: string | JSX.Element;
    } & { children: JSX.Element }
) {
    const { i18n, attribute, errorMessages, commonLabel, commonHelperText, dispatchFormAction, valueOrValues } = props;
    const { msgStr, advancedMsg } = i18n;
    const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId: attribute.name });
    const hasError = errorMessages.length > 0;

    const label = commonLabel || advancedMsg(attribute.displayName ?? "");
    const helperText = hasError ? errorMessages.join(', ') : commonHelperText;

    // Determine the current input value
    const inputValue = (() => {
        if (Array.isArray(valueOrValues)) {
            return valueOrValues[0] || "";
        }
        return valueOrValues;
    })();

    return (
        <FormControl fullWidth variant="outlined" error={hasError} required={attribute.required}>
            <FormLabel htmlFor={attribute.name}>
                {label}
            </FormLabel>
            <OutlinedInput
                id={attribute.name}
                name={attribute.name}
                type={isPasswordRevealed ? "text" : "password"}
                value={inputValue}
                onChange={event => {
                    const newValue = event.target.value;
                    dispatchFormAction({
                        action: "update",
                        name: attribute.name,
                        valueOrValues: newValue
                    });
                }}
                onBlur={() =>
                    dispatchFormAction({
                        action: "focus lost",
                        name: attribute.name,
                        fieldIndex: undefined
                    })
                }
                inputProps={{
                    pattern: attribute.annotations.inputTypePattern,
                    size: attribute.annotations.inputTypeSize === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeSize}`),
                    maxLength:
                        attribute.annotations.inputTypeMaxlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMaxlength}`),
                    minLength:
                        attribute.annotations.inputTypeMinlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMinlength}`),
                    max: attribute.annotations.inputTypeMax,
                    min: attribute.annotations.inputTypeMin,
                    step: attribute.annotations.inputTypeStep,
                    ...Object.fromEntries(Object.entries(attribute.html5DataAnnotations ?? {}).map(([key, value]) => [`data-${key}`, value]))
                }}
                disabled={attribute.readOnly}
                autoComplete={attribute.autocomplete}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
                            onClick={toggleIsPasswordRevealed}
                            edge="end"
                        >
                            {isPasswordRevealed ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
            />
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}

function InputTag(props: InputFieldByTypeProps & {
    fieldIndex: number | undefined; errorMessages: string[]; commonLabel?: string | JSX.Element; commonHelperText?: string | JSX.Element;
}) {

    const { attribute, fieldIndex, dispatchFormAction, valueOrValues, i18n, errorMessages, commonLabel, commonHelperText } = props;
    const { advancedMsg, advancedMsgStr } = i18n;
    const hasError = errorMessages.length > 0;
    const label = commonLabel || advancedMsg(attribute.displayName ?? "");
    const helperText = hasError ? errorMessages.join(', ') : commonHelperText;

    const inputValue = (() => {
        if (fieldIndex !== undefined) {
            assert(valueOrValues instanceof Array);
            return valueOrValues[fieldIndex];
        }
        assert(typeof valueOrValues === "string");
        return valueOrValues;
    })();

    // Determine the input type
    const inputType = (() => {
        const { inputType } = attribute.annotations;
        if (inputType?.startsWith("html5-")) {
            return inputType.slice(6);
        }
        return inputType ?? "text";
    })();

    return (
        <FormControl fullWidth variant="outlined" error={hasError} required={attribute.required}>
            <FormLabel htmlFor={attribute.name}>
                {label}
            </FormLabel>
            <TextField
                id={attribute.name}
                name={attribute.name}
                type={inputType}
                hiddenLabel
                fullWidth
                variant="outlined"
                value={inputValue}
                error={hasError}
                helperText={helperText}
                disabled={attribute.readOnly}
                autoComplete={attribute.autocomplete}
                placeholder={
                    attribute.annotations.inputTypePlaceholder === undefined ? undefined : advancedMsgStr(attribute.annotations.inputTypePlaceholder)
                }
                inputProps={{
                    pattern: attribute.annotations.inputTypePattern,
                    size: attribute.annotations.inputTypeSize === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeSize}`),
                    maxLength: attribute.annotations.inputTypeMaxlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMaxlength}`),
                    minLength: attribute.annotations.inputTypeMinlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMinlength}`),
                    max: attribute.annotations.inputTypeMax,
                    min: attribute.annotations.inputTypeMin,
                    step: attribute.annotations.inputTypeStep,
                    ...Object.fromEntries(Object.entries(attribute.html5DataAnnotations ?? {}).map(([key, value]) => [`data-${key}`, value]))
                }}
                onChange={event =>
                    dispatchFormAction({
                        action: "update",
                        name: attribute.name,
                        valueOrValues: (() => {
                            if (fieldIndex !== undefined) {
                                assert(valueOrValues instanceof Array);
                                return valueOrValues.map((value, i) => {
                                    if (i === fieldIndex) {
                                        return event.target.value;
                                    }
                                    return value;
                                });
                            }
                            return event.target.value;
                        })()
                    })
                }
                onBlur={() =>
                    dispatchFormAction({
                        action: "focus lost",
                        name: attribute.name,
                        fieldIndex: fieldIndex
                    })
                }
            />
            {(() => {
                if (fieldIndex === undefined) {
                    return null;
                }
                assert(valueOrValues instanceof Array);
                return (
                    <AddRemoveButtonsMultiValuedAttribute
                        attribute={attribute}
                        values={valueOrValues}
                        fieldIndex={fieldIndex}
                        dispatchFormAction={dispatchFormAction}
                        i18n={i18n}
                    />
                );
            })()}
        </FormControl>
    );
}

function AddRemoveButtonsMultiValuedAttribute(props: {
    attribute: Attribute;
    values: string[];
    fieldIndex: number;
    dispatchFormAction: React.Dispatch<Extract<FormAction, { action: "update" }>>;
    i18n: I18n;
}) {

    const { attribute, values, fieldIndex, dispatchFormAction, i18n } = props;
    const { msg } = i18n;
    const { hasAdd, hasRemove } = getButtonToDisplayForMultivaluedAttributeField({ attribute, values, fieldIndex });

    return (
        <Grid container justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
            {hasRemove && (
                <Grid>
                    <Button
                        startIcon={<RemoveIcon />}
                        color="error"
                        size="small"
                        onClick={() =>
                            dispatchFormAction({
                                action: "update",
                                name: attribute.name,
                                valueOrValues: values.filter((_, i) => i !== fieldIndex)
                            })
                        }
                    >
                        {msg("remove")}
                    </Button>
                </Grid>
            )}
            {hasAdd && (
                <Grid>
                    <Button
                        startIcon={<AddIcon />}
                        color="primary"
                        size="small"
                        onClick={() =>
                            dispatchFormAction({
                                action: "update",
                                name: attribute.name,
                                valueOrValues: [...values, ""]
                            })
                        }
                    >
                        {msg("addValue")}
                    </Button>
                </Grid>
            )}
        </Grid>
    );
}

function InputTagSelects(props: InputFieldByTypeProps & {
    errorMessages: string[]; commonLabel?: string | JSX.Element; commonHelperText?: string | JSX.Element;
}) {
    const { attribute, dispatchFormAction, i18n, valueOrValues, errorMessages, commonLabel, commonHelperText } = props;
    const { inputType } = attribute.annotations;
    const hasError = errorMessages.length > 0;

    const helperText = hasError ? errorMessages.join(', ') : commonHelperText;
    const label = commonLabel ?? i18n.advancedMsg(attribute.displayName ?? "");

    assert(inputType === "select-radiobuttons" || inputType === "multiselect-checkboxes");

    const isCheckbox = inputType === "multiselect-checkboxes";

    const options = (() => {
        walk: {
            const { inputOptionsFromValidation } = attribute.annotations;
            if (inputOptionsFromValidation === undefined) {
                break walk;
            }
            const validator = (attribute.validators as Record<string, { options?: string[] }>)[inputOptionsFromValidation];
            if (validator === undefined) {
                break walk;
            }
            if (validator.options === undefined) {
                break walk;
            }
            return validator.options;
        }
        return attribute.validators.options?.options ?? [];
    })();

    if (isCheckbox) {
        return (
            <FormControl
                component="fieldset"
                error={hasError}
                required={attribute.required}
                disabled={attribute.readOnly}
                fullWidth
            >
                <FormLabel component="legend">{label}</FormLabel>
                <Grid container sx={{ mt: 1 }}>
                    {options.map(option => (
                        <Grid size={{xs:12, sm:6, md:4}} key={option}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={valueOrValues instanceof Array ? valueOrValues.includes(option) : valueOrValues === option}
                                        onChange={event => {
                                            const isChecked = event.target.checked;
                                            if (valueOrValues instanceof Array) {
                                                const newValues = [...valueOrValues];
                                                if (isChecked) {
                                                    newValues.push(option);
                                                } else {
                                                    newValues.splice(newValues.indexOf(option), 1);
                                                }
                                                dispatchFormAction({
                                                    action: "update",
                                                    name: attribute.name,
                                                    valueOrValues: newValues
                                                });
                                            }
                                        }}
                                        onBlur={() => dispatchFormAction({
                                            action: "focus lost",
                                            name: attribute.name,
                                            fieldIndex: undefined
                                        })}
                                        name={attribute.name}
                                        value={option}
                                    />
                                }
                                label={inputLabel(i18n, attribute, option)}
                            />
                        </Grid>
                    ))}
                </Grid>
                {hasError && <FormHelperText>{helperText}</FormHelperText>}
            </FormControl>
        );
    } else {
        return (
            <FormControl
                component="fieldset"
                error={hasError}
                required={attribute.required}
                disabled={attribute.readOnly}
                fullWidth
            >
                <FormLabel component="legend">{label}</FormLabel>
                <RadioGroup
                    name={attribute.name}
                    value={valueOrValues instanceof Array ? valueOrValues[0] || "" : valueOrValues}
                    onChange={event => {
                        dispatchFormAction({
                            action: "update",
                            name: attribute.name,
                            valueOrValues: event.target.value
                        });
                    }}
                    onBlur={() => dispatchFormAction({
                        action: "focus lost",
                        name: attribute.name,
                        fieldIndex: undefined
                    })}
                >
                    <Grid container>
                        {options.map(option => (
                            <Grid size={{xs:12, sm:6, md:4}} key={option}>
                                <FormControlLabel
                                    value={option}
                                    control={<Radio />}
                                    label={inputLabel(i18n, attribute, option)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </RadioGroup>
                {hasError && <FormHelperText>{helperText}</FormHelperText>}
            </FormControl>
        );
    }
}

function TextareaTag(props: InputFieldByTypeProps & {
    errorMessages: string[]; commonLabel?: string | JSX.Element; commonHelperText?: string | JSX.Element;
}) {
    const { attribute, dispatchFormAction, valueOrValues, errorMessages, i18n, commonLabel, commonHelperText } = props;
    assert(typeof valueOrValues === "string");
    const value = valueOrValues;
    const hasError = errorMessages.length > 0;

    const helperText = hasError ? errorMessages.join(', ') : commonHelperText;
    const label = commonLabel ?? i18n.advancedMsg(attribute.displayName ?? "");

    return (
        <>
            <Typography variant="subtitle2" component={"label"} htmlFor={attribute.name} gutterBottom sx={{ mb: 1 }}>
                {label}
            </Typography>
            <TextField
                id={attribute.name}
                name={attribute.name}
                label={label}
                multiline
                fullWidth
                variant="outlined"
                rows={attribute.annotations.inputTypeRows === undefined ? 4 : parseInt(`${attribute.annotations.inputTypeRows}`)}
                value={value}
                error={hasError}
                helperText={helperText}
                required={attribute.required}
                disabled={attribute.readOnly}
                inputProps={{
                    maxLength:
                        attribute.annotations.inputTypeMaxlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMaxlength}`)
                }}
                onChange={event =>
                    dispatchFormAction({
                        action: "update",
                        name: attribute.name,
                        valueOrValues: event.target.value
                    })
                }
                onBlur={() =>
                    dispatchFormAction({
                        action: "focus lost",
                        name: attribute.name,
                        fieldIndex: undefined
                    })
                }
            />
        </>
    );
}

function SelectTag(props: InputFieldByTypeProps & {
    errorMessages: string[]; commonLabel?: string | JSX.Element; commonHelperText?: string | JSX.Element;
}) {
    const { attribute, dispatchFormAction, valueOrValues, errorMessages, i18n, commonLabel, commonHelperText } = props;
    const isMultiple = attribute.annotations.inputType === "multiselect";
    const hasError = errorMessages.length > 0;

    const helperText = hasError ? errorMessages.join(', ') : commonHelperText;
    const label = commonLabel ?? i18n.advancedMsg(attribute.displayName ?? "");

    const options = (() => {
        walk: {
            const { inputOptionsFromValidation } = attribute.annotations;
            if (inputOptionsFromValidation === undefined) {
                break walk;
            }
            assert(typeof inputOptionsFromValidation === "string");
            const validator = (attribute.validators as Record<string, { options?: string[] }>)[inputOptionsFromValidation];
            if (validator === undefined) {
                break walk;
            }
            if (validator.options === undefined) {
                break walk;
            }
            return validator.options;
        }
        return attribute.validators.options?.options ?? [];
    })();

    return (
        <FormControl
            fullWidth
            variant="outlined"
            error={hasError}
            required={attribute.required}
            disabled={attribute.readOnly}
        >
            <FormLabel htmlFor={`${attribute.name}-label`}>
                {label}
            </FormLabel>
            <Select
                labelId={`${attribute.name}-label`}
                id={attribute.name}
                name={attribute.name}
                multiple={isMultiple}
                value={valueOrValues}
                label={label}
                onChange={event => {
                    dispatchFormAction({
                        action: "update",
                        name: attribute.name,
                        valueOrValues: event.target.value
                    });
                }}
                onBlur={() => {
                    dispatchFormAction({
                        action: "focus lost",
                        name: attribute.name,
                        fieldIndex: undefined
                    });
                }}
                renderValue={isMultiple ? (selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                            <Chip key={value} label={inputLabel(i18n, attribute, value)} size="small" />
                        ))}
                    </Box>
                ) : undefined}
            >
                {!isMultiple && <MenuItem value=""><em>None</em></MenuItem>}
                {options.map(option => (
                    <MenuItem key={option} value={option}>
                        {inputLabel(i18n, attribute, option)}
                    </MenuItem>
                ))}
            </Select>
            {hasError && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}

function inputLabel(i18n: I18n, attribute: Attribute, option: string) {
    const { advancedMsg } = i18n;

    if (attribute.annotations.inputOptionLabels !== undefined) {
        const { inputOptionLabels } = attribute.annotations;

        return advancedMsg(inputOptionLabels[option] ?? option);
    }

    if (attribute.annotations.inputOptionLabelsI18nPrefix !== undefined) {
        return advancedMsg(`${attribute.annotations.inputOptionLabelsI18nPrefix}.${option}`);
    }

    return option;
}
