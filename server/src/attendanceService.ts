import { getUsersInSameCourse } from './db'; 

interface Course {
    course_name: string;
    course_number: string;
    class_number: string;
    period: string;
    day: string;
    caller_id: string;
}

export function getRandomUser(
    userIds: string[]
): string | null {
    if (userIds.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * userIds.length);
    return userIds[randomIndex];
}
