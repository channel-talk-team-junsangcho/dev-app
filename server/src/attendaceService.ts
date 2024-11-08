import { getSameCourseUser, getSamePeriodCourseUser } from './selectService'

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