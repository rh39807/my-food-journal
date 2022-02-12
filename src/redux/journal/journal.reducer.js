import JAT from './journal.types';
const INITIAL_STATE = {
    foodJournal: null,
    isFetching: false,
    fetchErrorMessage: undefined,
    addErrorMessage: undefined,
    updateErrorMessage: undefined,
    deleteErrorMessage: undefined,
    isAdding: false,
    isDeleting: false,
    isUpdating: false,
    filter: undefined
}

const journalReducer = (state = INITIAL_STATE,action) => {
    switch(action.type) {
        case JAT.SET_JOURNAL_FILTER:
            return {
                ...state,
                filter: action.payload
            }
        case JAT.CLEAR_JOURNAL_FILTER:
            return {
                ...state,
                filter: undefined
            }
        case JAT.FETCH_JOURNAL_START:
            return {
                ...state,
                isFetching: true
            }
        case JAT.FETCH_JOURNAL_SUCCESS:
            return {
                ...state,
                isFetching: false,
                ...action.payload
            }
        case JAT.FETCH_JOURNAL_FAILURE:
            return {
                ...state,
                isFetching: false,
                fetchErrorMessage: action.payload
            }
        case JAT.ADD_ENTRY_START:
            return {
                ...state,
                isFetching: true,
                isAdding: true
            }
        case JAT.ADD_ENTRY_SUCCESS:
            return {
                ...state,
                isFetching: false,
                isAdding: false
            }
        case JAT.ADD_ENTRY_FAILURE:
            return {
                ...state,
                isFetching: false,
                isAdding: false,
                addErrorMessage: action.payload
            }
        case JAT.DELETE_ENTRY_START:
            return {
                ...state,
                isFetching: true,
                isDeleting: true
            }
        case JAT.DELETE_ENTRY_SUCCESS:
            return {
                ...state,
                isFetching: false,
                isDeleting: false
            }
        case JAT.DELETE_ENTRY_FAILURE:
            return {
                ...state,
                isFetching: false,
                isDeleting: false,
                deleteErrorMessage: action.payload
            }
        case JAT.UPDATE_ENTRY_START:
            return {
                ...state,
                isFetching: true,
                isUpdating: true
            }
        case JAT.UPDATE_ENTRY_SUCCESS:
            return {
                ...state,
                isFetching: false,
                isUpdating: false
            }
        case JAT.UPDATE_ENTRY_FAILURE:
            return {
                ...state,
                isFetching: false,
                isUpdating: false,
                updateErrorMessage: action.payload
            }
        case JAT.CLEAR_UPDATE_FAILURE:
            return {
                ...state,
                updateErrorMessage: undefined
            }
        case JAT.CLEAR_FETCH_FAILURE:
            return {
                ...state,
                fetchErrorMessage: undefined
            }
        case JAT.CLEAR_ADD_FAILURE:
            return {
                ...state,
                addErrorMessage: undefined
            }
        case JAT.CLEAR_DELETE_FAILURE:
            return {
                ...state,
                deleteErrorMessage: undefined
            }
        default:
            return state;
    }
}

export default journalReducer;