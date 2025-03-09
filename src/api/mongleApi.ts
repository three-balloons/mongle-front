import { APIException } from '@/api/exceptions';
import { useAuthStore } from '@/store/authStore';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

type OkRes<TData> = {
    code: 'OK';
    message: string;
    data: TData;
};

type ErrRes<TErrCode> = {
    code: TErrCode;
    message: string;
};

type APIResponse<TData, TErrCode> = OkRes<TData> | ErrRes<TErrCode>;

const onRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
};

const onResponse = (res: AxiosResponse): AxiosResponse => {
    return res;
};

const onError = (error: AxiosError | Error): Promise<AxiosError> => {
    if (axios.isAxiosError(error) && error.response) {
        console.error('Server Error:', error.response.data.message);
    } else {
        console.error('Error', error.message);
    }
    return Promise.reject(error);
};

export const createAPI = () => {
    const axiosInstance = axios.create({
        baseURL: API_URL,
        timeout: 10000,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    axiosInstance.interceptors.request.use(onRequest, onError);
    axiosInstance.interceptors.response.use(onResponse, onError);

    const isOkResponse = <TData, TErrCode>(
        response: APIResponse<TData, TErrCode>,
    ): response is { code: 'OK'; data: TData; message: string } => {
        return response.code === 'OK';
    };

    const _get = async <TRes, ErrCode extends APIExceptionCode>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<TRes> => {
        try {
            const { data: res } = await axiosInstance.get<APIResponse<TRes, ErrCode>>(url, config);
            if (isOkResponse(res)) return res.data;
            else throw new APIException<ErrCode>(res.code, res.message);
        } catch (error: unknown) {
            if (error instanceof AxiosError) throw new Error(error.message);
            throw error;
        }
    };

    const _post = async <TData, TRes, ErrCode extends APIExceptionCode>(
        url: string,
        data?: TData,
        config?: AxiosRequestConfig,
    ): Promise<TRes> => {
        try {
            const { data: res } = await axiosInstance.post<APIResponse<TRes, ErrCode>>(url, data, config);
            if (isOkResponse(res)) return res.data;
            else throw new APIException<ErrCode>(res.code, res.message);
        } catch (error: unknown) {
            if (error instanceof AxiosError) throw new Error(error.message);
            throw error;
        }
    };

    const _put = async <TData, TRes, ErrCode extends APIExceptionCode>(
        url: string,
        data?: TData,
        config?: AxiosRequestConfig,
    ): Promise<TRes> => {
        try {
            const { data: res } = await axiosInstance.put<APIResponse<TRes, ErrCode>>(url, data, config);
            if (isOkResponse(res)) return res.data;
            else throw new APIException<ErrCode>(res.code, res.message);
        } catch (error: unknown) {
            if (error instanceof AxiosError) throw new Error(error.message);
            throw error;
        }
    };

    const _delete = async <TRes, ErrCode extends APIExceptionCode>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<TRes> => {
        try {
            const { data: res } = await axiosInstance.delete<APIResponse<TRes, ErrCode>>(url, config);
            if (isOkResponse(res)) return res.data;
            else throw new APIException<ErrCode>(res.code, res.message);
        } catch (error: unknown) {
            if (error instanceof AxiosError) throw new Error(error.message);
            throw error;
        }
    };

    const _patch = async <TData, TRes, ErrCode extends APIExceptionCode>(
        url: string,
        data?: TData,
        config?: AxiosRequestConfig,
    ): Promise<TRes> => {
        try {
            const { data: res } = await axiosInstance.patch<APIResponse<TRes, ErrCode>>(url, data, config);
            if (isOkResponse(res)) return res.data;
            else throw new APIException<ErrCode>(res.code, res.message);
        } catch (error: unknown) {
            if (error instanceof AxiosError) throw new Error(error.message);
            throw error;
        }
    };

    return { get: _get, post: _post, put: _put, delete: _delete, patch: _patch };
};
export const mongleApi = createAPI();
