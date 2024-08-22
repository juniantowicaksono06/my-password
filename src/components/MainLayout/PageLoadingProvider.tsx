"use client"
import { createContext, useReducer, useContext } from "react";
import { handlePageLoading, PageLoadingState, Action } from "@/src/context/reducer";
interface PageLoadingContextType {
    pageLoadingState: PageLoadingState,
    pageLoadingDispatch: React.Dispatch<Action>
}
const initialState: PageLoadingState = {
    loading: false
}
const PageLoadingContext = createContext<PageLoadingContextType | undefined>(undefined);

export default function PageLoadingProvider({ children }: { children: React.ReactNode }) {
    const [pageLoadingState, pageLoadingDispatch] = useReducer(handlePageLoading, initialState);
    return (
        <PageLoadingContext.Provider value={{ pageLoadingState, pageLoadingDispatch }}>
            {children}
        </PageLoadingContext.Provider>
    )
}

export function usePageLoading() {
    const context = useContext(PageLoadingContext);
    if(!context) {
        throw new Error("usePageLoading must be used within a PageLoadingProvider");
    }
    return context;
}