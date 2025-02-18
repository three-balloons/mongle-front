import {
    mockedCreateBubble,
    mockedDeleteBubble,
    mockedGetAllBubbles,
    mockedGetBubbles,
    mockedUpdateBubble,
} from '@/mocks/data/bubble';
import { checkIsValidAccessToken } from '@/mocks/util';
import { http, HttpResponse } from 'msw';

const API_URL = import.meta.env.VITE_API_URL;

export const bubbleHandlers = [
    // getAllBubblesAPI
    http.get(`${API_URL}/bubbles`, ({ request }) => {
        const authorizationHeader = request.headers.get('Authorization');
        const accessToken = checkIsValidAccessToken(authorizationHeader);
        if (typeof accessToken !== 'string') return accessToken;

        if (!request.headers.get('workspaceId'))
            return HttpResponse.json({
                code: 'WORKSPACE_NOT_FOUND',
                message: '작업공간이 존재하지 않습니다',
                data: null,
            });
        const data = mockedGetAllBubbles;

        return HttpResponse.json({
            code: 'OK',
            message: 'OK',
            data: data,
        });
    }),
    // getBubblesAPI
    http.get(`${API_URL}/bubbles/:bubbleId`, ({ request }) => {
        const authorizationHeader = request.headers.get('Authorization');
        const accessToken = checkIsValidAccessToken(authorizationHeader);
        if (typeof accessToken !== 'string') return accessToken;
        // const url = new URL(request.url.toString());
        // const workspaceId = url.searchParams.get('workspaceId');
        const data = mockedGetBubbles;

        return HttpResponse.json({
            code: 'OK',
            message: 'OK',
            data: data,
        });
    }),
    // deleteBubbleAPI
    http.delete(`${API_URL}/bubbles/:bubbleId`, ({ request }) => {
        const authorizationHeader = request.headers.get('Authorization');
        const accessToken = checkIsValidAccessToken(authorizationHeader);
        if (typeof accessToken !== 'string') return accessToken;
        // const url = new URL(request.url.toString());
        // const workspaceId = url.searchParams.get('workspaceId');
        const data = mockedDeleteBubble;

        return HttpResponse.json({
            code: 'OK',
            message: 'OK',
            data: data,
        });
    }),
    http.post(`${API_URL}/bubbles`, async ({ request }) => {
        const authorizationHeader = request.headers.get('Authorization');
        const accessToken = checkIsValidAccessToken(authorizationHeader);

        if (typeof accessToken !== 'string') return accessToken;
        const data = mockedCreateBubble;

        return HttpResponse.json({
            code: 'OK',
            message: 'OK',
            data: data,
        });
    }),
    http.put(`${API_URL}/bubbles/:bubbleId`, async ({ request }) => {
        const authorizationHeader = request.headers.get('Authorization');
        const accessToken = checkIsValidAccessToken(authorizationHeader);

        if (typeof accessToken !== 'string') return accessToken;

        const data = mockedUpdateBubble;

        return HttpResponse.json({
            code: 'OK',
            message: 'OK',
            data: data,
        });
    }),
    http.patch(`${API_URL}/bubbles/:bubbleId/restore`, async ({ request }) => {
        const authorizationHeader = request.headers.get('Authorization');
        const accessToken = checkIsValidAccessToken(authorizationHeader);

        if (typeof accessToken !== 'string') return accessToken;

        // const url = new URL(request.url.toString());
        // const workspaceId = url.searchParams.get('workspaceId');
        const data = { id: 'dfjhsgkd-sdjfwlkfjgdlfjlg-ejhwkjh' };

        return HttpResponse.json({
            code: 'OK',
            message: 'OK',
            data: data,
        });
    }),
];
