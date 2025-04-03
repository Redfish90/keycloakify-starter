import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        keycloakify({
            accountThemeImplementation: "none",
            themeName: "VMI-Theme",
            themeVersion: "0.0.0-alpha.1",
            keycloakVersionTargets: {
                "22-to-25": true,
                "all-other-versions": true
            }
        })
    ]
});
