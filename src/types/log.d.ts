// TODO Log 관련 타입 다시 정의하기
// 실수하기 좋은 타입정의임

type LogBubble = {
    object: Bubble;
    childrenIds: number[]; // create, delete일때 사용
};
type LogCurve = {
    object: Curve;
    bubbleId: number;
};

type LogCamera = {
    object: ViewCoord;
};

type LogType = 'update' | 'create' | 'delete';

type LogElement<T extends U | LogCamera = U | LogCamera, U extends LogBubble | LogCurve = LogBubble | LogCurve> =
    | {
          type: 'update';
          origin: T;
          modified: T;
      }
    | {
          type: 'create';
          modified: U;
      }
    | {
          type: 'delete';
          modified: U;
      };

type LogGroup = LogElement[];
