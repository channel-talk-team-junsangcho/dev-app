import { getMyLectureList } from './db';

interface responseParam {
    courseName: string, 
    courseCode: string
}

interface lectureResult {
    courseName: string, 
    courseNumber: string
  }

export async function selectMyLecture(
    callerId: string
) : Promise<responseParam[]> {
    const lectureList: lectureResult[] = await getMyLectureList(callerId);
    const res: responseParam[] = [];

    lectureList.forEach((e) => {
        const lecture: responseParam = {
            courseName: e.courseName,
            courseCode: e.courseNumber
        };

        res.push(lecture);
    });

    return res;
}