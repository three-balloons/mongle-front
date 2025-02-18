import { CreateBubbleRes, GetAllBubbleRes, GetBubbleRes, UpdateBubbleRes } from '@/api/bubbles/type';
import { curveEncoding } from '@/api/curves/mapper';

const mockedPos = [
    {
        x: 123,
        y: 123,
        isVisible: true,
    },
    {
        x: 133,
        y: 133,
        isVisible: true,
    },
    {
        x: 143,
        y: 143,
        isVisible: true,
    },
    {
        x: 143,
        y: 103,
        isVisible: true,
    },

    {
        x: 133,
        y: 93,
        isVisible: true,
    },
    {
        x: 143,
        y: 53,
        isVisible: true,
    },
    {
        x: 143,
        y: 23,
        isVisible: true,
    },
    {
        x: 140,
        y: 3,
        isVisible: true,
    },
    {
        x: 140,
        y: 3,
        isVisible: true,
    },
    {
        x: 130,
        y: -23,
        isVisible: true,
    },
];
export const mockedPosition = curveEncoding(mockedPos);
export const mockedGetAllBubbles: GetAllBubbleRes = [
    {
        path: '/몽글',
        id: 234,
        name: '몽글',
        top: -100,
        left: -100,
        width: 200,
        height: 200,
        shapes: [
            {
                type: 'curve',
                position: mockedPosition,
                id: 1,
                config: {
                    color: '#004A99',
                    thickness: 5,
                },
            },
        ],
    },
    {
        path: '/몽글/이름',
        name: '이름',
        top: -50,
        left: -50,
        width: 50,
        height: 50,
        id: 2,
        shapes: [
            {
                type: 'curve',
                position: mockedPosition,
                id: 2,
                config: {
                    color: 'red',
                    thickness: 5,
                },
            },
        ],
    },
];
export const mockedGetBubbles: GetBubbleRes = [
    {
        path: '/몽글',
        id: 234,
        name: '몽글',
        top: -100,
        left: -100,
        width: 200,
        height: 200,
        shapes: [
            {
                type: 'curve',
                position: mockedPosition,
                id: 1,
                config: {
                    color: '#004A99',
                    thickness: 5,
                },
            },
        ],
    },
    {
        path: '/몽글/이름',
        name: '이름',
        top: -50,
        left: -50,
        width: 50,
        height: 50,
        id: 2,
        shapes: [
            {
                type: 'curve',
                position: mockedPosition,
                id: 2,
                config: {
                    color: 'red',
                    thickness: 5,
                },
            },
        ],
    },
];

export const mockedDeleteBubble = {};

export const mockedUpdateBubble: UpdateBubbleRes = {
    id: 34,
    path: '/update',
    name: 'updee',
    top: -10,
    left: -10,
    width: 10,
    height: 10,
    shapes: [],
};
export const mockedCreateBubble: CreateBubbleRes = {
    id: 234,
    path: '/운영체제',
    name: '운영체제',
    top: -50,
    left: -30,
    width: 100,
    height: 100,
    shapes: [],
};
