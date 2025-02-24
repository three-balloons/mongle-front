import React, { createContext, useReducer, useRef } from 'react';

type TutorialContextType = {
    addBubbleIconRef: React.RefObject<HTMLDivElement>;
    penIconRef: React.RefObject<HTMLDivElement>;
    eraserIconRef: React.RefObject<HTMLDivElement>;
    handIconRef: React.RefObject<HTMLDivElement>;
    explorerRef: React.RefObject<HTMLDivElement>;
    logControllRef: React.RefObject<HTMLDivElement>;
    isTuturialEnd: boolean;
    isTuturialStart: boolean;
    showCurrentTutorial: () => string;
    showNextTutorial: () => string;
    showPriviousTutorial: () => string;
};

export const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

interface TutorialProviderProps {
    children: React.ReactNode;
}

// 액션 타입 정의
type ActionType = { type: 'SHOW_NEXT' } | { type: 'SHOW_PREVIOUS' };

// 상태 타입 정의
type StateType = {
    currentPage: number;
    isEnd: boolean;
    isStart: boolean;
};

const initialState: StateType = {
    currentPage: 0,
    isEnd: false,
    isStart: true,
};

// reducer 함수
const tutorialReducer = (state: StateType, action: ActionType): StateType => {
    switch (action.type) {
        case 'SHOW_NEXT': {
            const nextPage = Math.min(state.currentPage + 1, 5);
            return {
                ...state,
                currentPage: nextPage,
                isEnd: nextPage === 5,
                isStart: false,
            };
        }

        case 'SHOW_PREVIOUS': {
            const prevPage = Math.max(state.currentPage - 1, 0);
            return {
                ...state,
                currentPage: prevPage,
                isEnd: false,
                isStart: prevPage === 0,
            };
        }

        default:
            return state;
    }
};

// TODO reducer로 바꿔서 상태관리하기
const TutorialProvider = ({ children }: TutorialProviderProps) => {
    const addBubbleIconRef = useRef<HTMLDivElement>(null);
    const penIconRef = useRef<HTMLDivElement>(null);
    const eraserIconRef = useRef<HTMLDivElement>(null);
    const handIconRef = useRef<HTMLDivElement>(null);
    const explorerRef = useRef<HTMLDivElement>(null);
    const logControllRef = useRef<HTMLDivElement>(null);

    const [state, dispatch] = useReducer(tutorialReducer, initialState);

    const tutorialContexts: readonly string[] = [
        `튜토리얼 시작하기!`,
        `버블을 생성하세요. 버블 안에서 새로운 버블을 생성하거나 펜으로 작성할 수 있습니다.`,
        `원하는 내용을 작성하세요. 두께와 색상을 조절할 수 있습니다.`,
        `원하는 내용을 삭제하세요. 영역 지우개, 획 지우개, 버블 지우개를 선택할 수 있습니다.`,
        `범위를 설정하여 원하는 내용을 한번에 이동시킬 수 있습니다.`,
        `버블의 목록을 보고 선택하여 해당 버블로 이동할 수 있습니다.`,
        // `클릭함으로써 되돌리거나 되돌린 내용을 복구할 수 있습니다.`,
    ];

    const showCurrentTutorial = () => {
        changeZIndex(state.currentPage);
        return tutorialContexts[state.currentPage];
    };

    const showNextTutorial = () => {
        dispatch({ type: 'SHOW_NEXT' });
        changeZIndex(state.currentPage + 1);
        return tutorialContexts[state.currentPage + 1];
    };

    const showPriviousTutorial = () => {
        dispatch({ type: 'SHOW_PREVIOUS' });
        changeZIndex(state.currentPage - 1);
        return tutorialContexts[state.currentPage - 1];
    };

    const changeZIndex = (currentPage: number) => {
        if (addBubbleIconRef.current) addBubbleIconRef.current.style.zIndex = '0';
        if (penIconRef.current) penIconRef.current.style.zIndex = '0';
        if (eraserIconRef.current) eraserIconRef.current.style.zIndex = '0';
        if (handIconRef.current) handIconRef.current.style.zIndex = '0';
        if (explorerRef.current) explorerRef.current.style.zIndex = '0';
        // if (logControllRef.current) logControllRef.current.style.zIndex = '0';

        switch (currentPage) {
            case 1:
                if (addBubbleIconRef.current) addBubbleIconRef.current.style.zIndex = '20';
                break;
            case 2:
                if (penIconRef.current) penIconRef.current.style.zIndex = '20';
                break;
            case 3:
                if (eraserIconRef.current) eraserIconRef.current.style.zIndex = '20';
                break;
            case 4:
                if (handIconRef.current) handIconRef.current.style.zIndex = '20';
                break;
            case 5:
                if (explorerRef.current) explorerRef.current.style.zIndex = '20';
                break;
            // case 6:
            // if (logControllRef.current) logControllRef.current.style.zIndex = '20';
            // break;
        }
    };

    return (
        <TutorialContext.Provider
            value={{
                addBubbleIconRef,
                penIconRef,
                eraserIconRef,
                handIconRef,
                explorerRef,
                logControllRef,
                isTuturialEnd: state.isEnd,
                isTuturialStart: state.isStart,
                showCurrentTutorial,
                showNextTutorial,
                showPriviousTutorial,
            }}
        >
            {children}
        </TutorialContext.Provider>
    );
};

export { TutorialProvider };
