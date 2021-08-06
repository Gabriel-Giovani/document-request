import axios from 'axios';
import { message } from 'antd';

axios.interceptors.request.use(
    async (request: any) => {
        return {
            ...request,
            baseURL: 'http://localhost:8000/',
            headers: {
                ...request.headers
            },
            data: request.data ? {
                ...request.data
            } : {}
        };
    }
);

const responseError = (err: any) => {
    if(err.response && err.response.status ===  404)
        message.error('O servidor não retornou nenhuma resposta.');
    else if(!err.response || err.response.status >= 500)
        message.error('Não foi possível se conectar com o servidor.');
};

export const getAddress = async (cep: string) => {
    const fetchedData = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default'
    })
    .then(response => response.json())
    .then(data => {
        return data
    })
    .catch(e => { console.log(e.message); return e.message});

    return fetchedData;
};

export const get = async (url: string, params?: object) => {
    try{
        const res = await axios.get(url, params ? params : {});
        return handleResponse(res);
    } catch(err) {
        return responseError(err);
    }
};

export const post = async (url: string, data: object, params?: object) => {
    try{
        const res = await axios.post(url, data, params ? params : {});
        return handleResponse(res);
    } catch(err) {
        return responseError(err);
    }
};

export const put = async (url: string, data: object, params?: object) => {
    try{
        const res = await axios.put(url, data, params ? params : {});
        return handleResponse(res);
    } catch(err) {
        return responseError(err);
    }
};

export const del = async (url: string, params?: object) => {
    try{
        const res = await axios.delete(url, params ? params : {});
        return handleResponse(res);
    } catch(err) {
        return responseError(err);
    }
};

export const handleResponse = async (res: any) => {
    if(res && res.data) {
        return res.data;
    }
};