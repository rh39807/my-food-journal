import { createSelector } from 'reselect';

const selectUser = state => state.user;

export const selectCurrentUser = createSelector(
    [selectUser],
    (user) => user.currentUser
)

export const selectUserList = createSelector(
    [selectUser],
    (user) => user.userList
)

export const selectUserListIsFetching = createSelector(
    [selectUser],
    (user) => user.isFetching
)
