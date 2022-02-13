import AppConstants from "../../common/constants";
import store from '../store';

export const doFetch = (props)=> {
    return (dispatch) => {
        const { start, success, failure, startReFetch, url, method, data, user } = props; 
        dispatch(start());
        const { token } = user;
        const options = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            method: method,
            body: data ? JSON.stringify(data) : null
        }
        fetch(url, options)
        .then((response) => {
            checkError(response);
            return response.json();
        })
        .then((response) => {
            dispatch(success(response));
            if (startReFetch) dispatch(startReFetch());
        })
        .catch(error => {
            dispatch(failure(error));
            if (startReFetch) dispatch(startReFetch());
        });
    }
}

const checkError = (response) => {
    const { ok, status, statusText } = response;
    if (!ok || status < 200 || status > 299) {
        throw new Error(`${status.toString()} - ${statusText}`)
    }
}

export const getFromStore = (props) => {
    let values = {};
    if (store?.store?.getState) {
        try {
            const state = store.store.getState();
            if (state) {
                for (let key in props) {
                    for (var i in props[key]) {
                        let subKey = props[key][i];
                        values[subKey] = state[key] && state[key][subKey];
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
    return values;
}