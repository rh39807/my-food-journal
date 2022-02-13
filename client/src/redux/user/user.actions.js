import UAT from "./user.types";
import { doFetch, getFromStore } from "../utils/utils";

export const setCurrentUser = (uid) => ({ type: UAT.SET_CURRENT_USER, payload: uid });

export const fetchUserListStartAsync = () => {
    const { currentUser } = getFromStore({ user:['currentUser'] });
    return doFetch({
        start:fetchUserListStart,
        success:fetchUserListSuccess,
        failure:fetchUserListFailure,
        method: 'GET',
        url: `/userList`,
        user: currentUser
    });
}

export const fetchUserListStart = () => ({ type: UAT.FETCH_USER_LIST_START });

export const fetchUserListSuccess = response => ({ type: UAT.FETCH_USER_LIST_SUCCESS, payload: response });

export const fetchUserListFailure = errorMessage => ({ type: UAT.FETCH_USER_LIST_FAILURE, payload: errorMessage });

export const clearUserListFetchFailure = () => ({ type: UAT.CLEAR_USER_LIST_FETCH_FAILURE });