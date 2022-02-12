import JAT from "./journal.types";

import { getFromStore, doFetch } from "../utils/utils";

export const fetchJournalStartAsync = () => {
    const { filter, currentUser } = getFromStore({journal:['filter'],user:['currentUser']});
    let search = ''
    if (currentUser?.roles?.admin) {
        search = '?transforms=prefilter:appEntryVelocity,prefilter:usersSevenDayCalorieAverage,prefilter:userBudgetStatus';
    } else {
        search = '?transforms=prefilter:userBudgetStatus,userDailyTotals';
    }
    if (filter) search = `${search}&filter=${JSON.stringify(filter)}`;
    return doFetch({
        start:fetchJournalStart,
        success:fetchJournalSuccess,
        failure:fetchJournalFailure,
        method: 'GET',
        url: `/foodJournal${search}`,
        user: currentUser
    });
}

export const addJournalEntryStartAsync = (data)=> {
    const { currentUser } = getFromStore({ user:['currentUser'] });
    return doFetch({
        start:addJournalEntryStart,
        success:addJournalEntrySuccess,
        failure:addJournalEntryFailure,
        startReFetch: fetchJournalStartAsync,
        method: 'POST',
        url: '/foodJournal/new',
        user: currentUser,
        data
    });
}

export const updateJournalEntryStartAsync = (data)=> {
    const { currentUser } = getFromStore({ user:['currentUser'] });
    return doFetch({
        start:updateJournalEntryStart,
        success:updateJournalEntrySuccess,
        failure:updateJournalEntryFailure,
        startReFetch: fetchJournalStartAsync,
        method: 'PUT',
        url: `/foodJournal/${data.id}`,
        user: currentUser,
        data
    });
}

export const deleteJournalEntryStartAsync = (data)=> {
    const { currentUser } = getFromStore({ user:['currentUser'] });
    return doFetch({
        start:deleteJournalEntryStart,
        success:deleteJournalEntrySuccess,
        failure:deleteJournalEntryFailure,
        startReFetch: fetchJournalStartAsync,
        method: 'DELETE',
        url: `/foodJournal/${data.id}`,
        user: currentUser,
        data
    });
}


export const fetchJournalStart = () => ({ type: JAT.FETCH_JOURNAL_START })

export const addJournalEntryStart = () => ({ type: JAT.ADD_ENTRY_START })

export const updateJournalEntryStart = () => ({ type: JAT.UPDATE_ENTRY_START })

export const deleteJournalEntryStart = () => ({ type: JAT.DELETE_ENTRY_START })

export const fetchJournalSuccess = response => ({ type: JAT.FETCH_JOURNAL_SUCCESS, payload: response })

export const addJournalEntrySuccess = response => ({type: JAT.ADD_ENTRY_SUCCESS, payload: response })

export const updateJournalEntrySuccess = () => ({ type: JAT.UPDATE_ENTRY_SUCCESS })

export const deleteJournalEntrySuccess = () => ({ type: JAT.DELETE_ENTRY_SUCCESS })

export const clearFetchFailure = () => ({ type: JAT.CLEAR_FETCH_FAILURE })

export const clearAddFailure = () => ({ type: JAT.CLEAR_ADD_FAILURE })

export const clearUpdateFailure = () => ({ type: JAT.CLEAR_UPDATE_FAILURE })

export const clearDeleteFailure = () => ({ type: JAT.CLEAR_DELETE_FAILURE })

export const fetchJournalFailure = errorMessage => ({ type: JAT.FETCH_JOURNAL_FAILURE, payload: errorMessage })

export const addJournalEntryFailure = errorMessage => ({ type: JAT.ADD_ENTRY_FAILURE, payload: errorMessage })

export const updateJournalEntryFailure = errorMessage => ({ type: JAT.UPDATE_ENTRY_FAILURE, payload: errorMessage})

export const deleteJournalEntryFailure = errorMessage => ({ type: JAT.DELETE_ENTRY_FAILURE, payload: errorMessage })

export const setJournalFilter = (filter) => ({ type: JAT.SET_JOURNAL_FILTER, payload: filter})

export const clearJournalFilter = () => ({ type: JAT.CLEAR_JOURNAL_FILTER });

export const clearJournalFilterAsync = () => { 
    return (dispatch) => {
        dispatch(clearJournalFilter());
        setTimeout((dispatch)=>dispatch(fetchJournalStartAsync()),100,dispatch);       
    }
}

export const setJournalFilterAsync = (filter) => { 
    return (dispatch) => {
        dispatch(setJournalFilter(filter));
        setTimeout((dispatch)=>dispatch(fetchJournalStartAsync()),100,dispatch);       
    }
}