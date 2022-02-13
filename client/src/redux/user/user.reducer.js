import users from './users.json';
import UAT from './user.types';
const INITIAL_STATE = {
    currentUser: users["2"]
}

const userReducer = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case UAT.SET_CURRENT_USER:
            return {
                ...state,
                currentUser: users[action.payload]
            }
        case UAT.CLEAR_USER_LIST_FETCH_FAILURE:
            return {
                ...state,
                fetchErrorMessage: undefined
            }
        case UAT.FETCH_USER_LIST_START:
            return {
                ...state,
                isFetching: true
            }
        case UAT.FETCH_USER_LIST_SUCCESS:
            return {
                ...state,
                isFetching: false,
                userList: action.payload
            }
        case UAT.FETCH_USER_LIST_FAILURE:
            return {
                ...state,
                isFetching: false,
                fetchErrorMessage: action.payload
            }
        default:
            return state;
    }
}

export default userReducer;