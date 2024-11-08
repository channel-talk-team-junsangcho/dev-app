import { getSameCourseUser, getSamePeriodCourseUser } from './selectService'
import handleSendMessageAsBot from '../../wam/src/pages/Send'

const sendAsBotProxyAttendanceMsg = "%s %s 강의 대리 출석해 주세요~!";
const sendAsBotFailAttendaceMsg = "대리 출석 해 줄 사용자가 없어요...";

interface requestParams {
    callerId: string, 
    courseName: string,
    period: string,
    day: string
}

export async function getAppropriateUser(
    obj: requestParams
) {
    var userId = getSameCourseUser(obj.callerId, obj.courseName);
    if(userId == null) {
        userId = getSamePeriodCourseUser(obj.period, obj.day);
    }

    return userId;
}