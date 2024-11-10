import { getUsersInSameCourse, getUsersInSameTime } from './db'; 

export async function getSameCourseUser(
    callerId: string, 
    courseName: string
  ): Promise<string> {
    const userIds = await getUsersInSameCourse(callerId, courseName);
    console.log(userIds);
    return getRandomUser(userIds);
  }

  export async function getSamePeriodCourseUser(
    period: string,
    day: string
  ): Promise<string | null> {
    const userIds = await getUsersInSameTime(period, day);
    
    return getRandomUser(userIds);
  }

function getRandomUser(
    userIds: string[],
): string  {
    if(userIds.length == 0) return 'null'
    if(userIds.length == 1) return userIds[0];

    const randomIndex = Math.floor(Math.random() * userIds.length);

    return userIds[randomIndex];
  }