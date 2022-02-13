import { createSelector } from "reselect";

const selectJournal= state => state.journal;

export const selectJournalFilter = createSelector(
  [selectJournal],
  journal => journal.filter
);

export const selectFoodJournal = createSelector(
    [selectJournal],
    journal => journal.foodJournal
  );

export const selectFetchFailure = createSelector(
  [selectJournal],
  journal => journal.fetchErrorMessage
);

export const selectAddFailure = createSelector(
  [selectJournal],
  journal => journal.addErrorMessage
);

export const selectUpdateFailure = createSelector(
  [selectJournal],
  journal => journal.updateErrorMessage
);

export const selectDeleteFailure = createSelector(
  [selectJournal],
  journal => journal.deleteErrorMessage
);

export const selectIsJournalFetching = createSelector(
  [selectJournal],
  journal => journal.isFetching
)

export const selectIsJournalLoaded = createSelector(
  [selectJournal],
  journal => !!journal.foodJournal
)

export const selectIsJournalAdding = createSelector(
  [selectJournal],
  journal => journal.isAdding
)

export const selectIsJournalDeleting = createSelector(
  [selectJournal],
  journal => journal.isDeleting
)

export const selectIsJournalUpdating = createSelector(
  [selectJournal],
  journal => journal.isUpdating
)

export const selectUserBudgetStatus = createSelector(
  [selectJournal],
  journal => journal.userBudgetStatus
)

export const selectUserDailyTotals = createSelector(
  [selectJournal],
  journal => journal.userDailyTotals
)

export const selectAppEntryVelocity = createSelector(
  [selectJournal],
  journal => journal.appEntryVelocity
)

export const selectUsersSevenDayCalorieAverage = createSelector(
  [selectJournal],
  journal => journal.usersSevenDayCalorieAverage
)

