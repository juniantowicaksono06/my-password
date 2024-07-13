"use client"
import { createContext, useReducer, useContext } from "react";
import { handleLoading, State, Action } from "@/src/context/reducer";
interface LoadingContextType {
    state: State,
    dispatch: React.Dispatch<Action>
}
const initialState: State = {
    loading: true
}
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(handleLoading, initialState);
    return (
        <LoadingContext.Provider value={{ state, dispatch }}>
            {children}
        </LoadingContext.Provider>
    )
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if(!context) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}