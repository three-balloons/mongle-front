type APIExceptionCode =
    | 'INAPPROPRIATE_PAYLOAD'
    | 'INAPPROPRIATE_DEPTH'
    | 'NO_PARENT'
    | 'ALREADY_EXEIST'
    | 'FAIL_EXEIT'
    | 'NO_EXEIST_BUBBLE'
    | 'NOT_EXIST'
    | 'ALREADY_EXIST'
    | 'NOT_MATCH_PASSWORD'
    | 'SIGN_UP_NEEDED'
    | 'MEMBER_EXISTS';

type Provider = 'KAKAO' | 'GOOGLE' | 'PASS';
