import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import { createWhitelistFilter } from 'redux-persist-transform-filter';
import storage from 'redux-persist/lib/storage';
import userReducer from "./user/user.reducer";
import journalReducer from './journal/journal.reducer';

const persistConfig = {
    key: 'root',
    storage,
    transforms: [
        createWhitelistFilter('journal', [ 'filter' ]),
        createWhitelistFilter('user', [ 'currentUser' ]),
    ]
}

const rootReducer = combineReducers({
    user:userReducer,
    journal:journalReducer
})

export default persistReducer(persistConfig, rootReducer);