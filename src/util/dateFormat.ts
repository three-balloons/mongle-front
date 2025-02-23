import dayjs from 'dayjs';

export const differenceInDaysformat = (date: string | undefined) => {
    const today = dayjs();
    const differenceInMilliseconds = today.diff(dayjs(date), 'days');
    return Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
};
