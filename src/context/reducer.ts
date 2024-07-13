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