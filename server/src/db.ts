import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { saveLecture } from './util';

require("dotenv").config();

interface lectureResult {
  courseName: string, 
  courseNumber: string
}

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: process.env.DBHOST,    // MySQL 서버가 로컬에서 실행 중인 경우
  port: 3306,           // MySQL 기본 포트
  user: process.env.DBUSER,         // MySQL 사용자 이름
  password: process.env.DBPASSWORD,  // MySQL 비밀번호
  database: process.env.DBNAME, // 데이터베이스 이름
});

// Lecture와 UserLecture 테이블에 데이터를 저장하는 함수
export const createLecture = async (
  courseName: string,
  courseNumber: string,
  classNumber: string
  // userId: number
): Promise<void> => {

  console.log(courseName);
  const conn = await connection;
  try {
    await conn.beginTransaction();

    // Lecture 테이블에 데이터 삽입
    const [lectureResult] = await conn.query<ResultSetHeader>(
      'INSERT INTO Lecture (course_name, course_number, class_number) VALUES (?, ?, ?)',
      [courseName, courseNumber, classNumber]
    );

    // const lectureId = lectureResult.insertId;

    // // UserLecture 테이블에 데이터 삽입
    // await conn.query(
    //   'INSERT INTO UserLecture (user_id, lecture_id) VALUES (?, ?)',
    //   [userId, lectureId]
    // );

    await conn.commit();
    console.log('Lecture and UserLecture records created successfully');
  } catch (error) {
    await conn.rollback();
    console.error('Error creating records:', error);
    throw error;
  }
};

export const getUsersInSameCourse = async (
  callerId: string, 
  courseName: string
): Promise<string[]> => {
  const conn = await connection;

  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT caller_id FROM Lectures WHERE course_name = ? AND caller_id != ?',
      [courseName, callerId]
    );
    return rows.map((row: any) => row.caller_id);
  } catch (error) {
    console.error(error);
    throw new Error('query error');
  }
};

export const getUsersInSameTime = async (
  period: string, 
  day: string
): Promise<string[]> => {
  const conn = await connection;

  try{
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM Lecture WHERE period = ? AND day LIKE ?',
      [period, `%${day}%`]
    );
    return rows.map((row:any) => row.caller_id);
  } catch(error) {
    console.error(error);
    throw new Error('query error');
  }
}

export const getMyLectureList = async (
  callerId: string
) : Promise<lectureResult[]> => {
  const conn = await connection;

  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM Lecture WHERE caller_id = ?',
      [callerId]
    );
    
    const lectures: lectureResult[] = [];
    rows.forEach((element) => {
      const lecture: lectureResult = {
        courseName: element.course_name,   
        courseNumber: element.course_number
      };
      
      lectures.push(lecture);
    });

    return lectures;
  }
}