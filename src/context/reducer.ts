export interface State {
    loading: boolean;
}

export type Action = {
    type: 'startLoading';
} | {
    type: 'stopLoading'
}

export function handleLoading(state: State, action: Action): State {
    if(action.type == 'stopLoading') {
        return {
            ...state,
            loading: false
        }
    }
    else if(action.type == 'startLoading') {
        return {
            ...state,
            loading: true
        };
    }
    return state;
}

export interface PageLoadingState {
    loading: boolean;
}

export type PageLoadingAction = {
    type: 'startLoading';
} | {
    type: 'stopLoading'
}

export function handlePageLoading(state: PageLoadingState, action: PageLoadingAction): PageLoadingState {
    if(action.type == 'stopLoading') {
        return {
            loading: false
        }
    }
    else if(action.type == 'startLoading') {
        return {
            loading: true
        };
    }
    return state;
}