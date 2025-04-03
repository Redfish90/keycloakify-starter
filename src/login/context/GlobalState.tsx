import { createContext, useContext, useState, ReactNode } from "react";
import type { KcContext } from "../KcContext.ts";

// Define the type of our global state
type GlobalStateType = {
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
};

// Create the context
const GlobalStateContext = createContext<GlobalStateType | undefined>(undefined);

// Create the provider component
export const GlobalStateProvider = ({ children, kcContext }: { children: ReactNode, kcContext: KcContext }) => {
    const isModalInitiallyOpen = kcContext.messagesPerField.existsError("username", "password")

    const [isModalOpen, setIsModalOpen] = useState(isModalInitiallyOpen); // Modal state

    return (
        <GlobalStateContext.Provider value={{ isModalOpen, setIsModalOpen }}>
            {children}
        </GlobalStateContext.Provider>
    );
};

// Custom hook to use the global state
export const useGlobalState = () => {
    const context = useContext(GlobalStateContext);
    if (!context) {
        throw new Error("useGlobalState must be used within a GlobalStateProvider");
    }
    return context;
};
