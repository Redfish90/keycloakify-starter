import { ReactNode } from "react";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CloseIcon from "@mui/icons-material/Close";
import { useGlobalState } from "./context/GlobalState.tsx";

interface CustomWrapperProps {
    i18n: I18n;
    kcContext: KcContext;
    children: ReactNode;
}

export default function CustomWrapper({ kcContext, i18n, children }: CustomWrapperProps) {
    const {isModalOpen, setIsModalOpen} = useGlobalState()
    const { msg, msgStr } = i18n;

    const { pageId } = kcContext;

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    return pageId === "login.ftl" ? (
        /** Render Dialog if page is login */
        <Dialog open={isModalOpen} onClose={handleModalClose} maxWidth="xs" aria-labelledby="dialog-title">
            <DialogTitle variant={"h4"} id="dialog-title" >
                {msg("loginAccountTitle")}
            </DialogTitle>
            <IconButton
                aria-label={msgStr("closeDialog")}
                role="button"
                onClick={handleModalClose}
                sx={{
                    position: "absolute",
                    right: 8,
                    top: 8
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>{children}</DialogContent>
        </Dialog>
    ) : (
        /** Render Card for other pages */
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
                    {children}
                </CardContent>
            </Card>
        </Grid>
    );
}