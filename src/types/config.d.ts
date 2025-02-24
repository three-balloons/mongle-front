type PenConfig = {
    color: Color;
    thickness: number;
};

type TextConfig = {
    fontSize: number;
    fontWeight: 'normal' | 'bold' | number;
    font: Font;
};

type EraseConfig = {
    radius: number;
    mode: EraseMode;
};

type EraseMode = 'area' | 'stroke' | 'bubble';

type Font = 'serif' | 'Arial' | 'Courier New' | 'Georgia' | 'Times New Roman' | 'Trebuchet MS' | 'Verdana';

type Color =
    | 'white'
    | 'black'
    | '#1A1A1A'
    | '#252525'
    | '#333333'
    | '#404040'
    | '#4D4D4D'
    | '#5E5E5E'
    | 'FCFCFC'
    | '#E6E6E6'
    | '#CCCCCC'
    | '#B3B3B3'
    | '#999999'
    | '#808080'
    | '#757575'
    | 'red'
    | '#FFE3E3'
    | '#FFA2A1'
    | '#FF5959'
    | '#E81010'
    | '#990B0B'
    | '#400404'
    | 'orange'
    | '#FFECDE'
    | '#FFCBA3'
    | '#FFA45E'
    | '#EB7317'
    | '#994200'
    | '#522300'
    | 'yellow'
    | '#FFFDD8'
    | '#FFFA99'
    | '#FFF64D'
    | '#EBDF00'
    | '#999100'
    | '#524E00'
    | 'green'
    | '#E3FCED'
    | '#B1FACE'
    | '#7DF5AD'
    | '#37DE7A'
    | '#249150'
    | '#124727'
    | 'blue'
    | '#DBECFF'
    | '#99CAFF'
    | '#4DA3FF'
    | '#0071EB'
    | '#004A99'
    | '#002752'
    | 'navy'
    | '#DBE2FF'
    | '#99AFFF'
    | '#4D73FF'
    | '#0738EB'
    | '#002199'
    | '#001052'
    | 'purple'
    | '#EEDBFF'
    | '#D5A6FF'
    | '#B56BFF'
    | '#8B17FF'
    | '#5200A3'
    | '#300061';

/**
 * move: 화면(camera view)을 움직이기 사용, 주로 데스크톱 환경
 * draw: curve를 그리는 모드
 * erase: 지우개 모드
 * bubble: 버블을 그리는 모드
 * edit: curve, 버블을 수정하고 옮기는 모드
 * picture: 그림을 추가하는 모드
 * pdf: pdf를 추가하는 모드
 * animate: 이동 관련 애니메이션이 실행할 때의 모드(none이랑 동일)
 * none: 아무것도 안하는 모드
 */
type ControlMode = 'move' | 'draw' | 'erase' | 'bubble' | 'edit' | 'picture' | 'pdf' | 'animate' | 'none';
type TouchState = 'none' | 'command' | 'pan' | 'zoom';

type Theme = '하늘' | '분홍' | '연두' | '노랑' | '하양' | '검정';
