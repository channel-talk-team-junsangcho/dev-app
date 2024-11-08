import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

require("dotenv").config();

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
  callerId: string,
  courseName: string,
  courseNumber: string,
  classNumber: string
): Promise<void> => {

  console.log(courseName);
  const conn = await connection;
  try {
    await conn.beginTransaction();

    // Lecture 테이블에 데이터 삽입
    const [lectureResult] = await conn.query<ResultSetHeader>(
      'INSERT INTO Lecture (caller_id, course_name, course_number, class_number) VALUES (?, ?, ?, ?)',
      [callerId, courseName, courseNumber, classNumber]
    );
    await conn.commit();
    console.log('Lecture and UserLecture records created successfully');
  } catch (error) {
    await conn.rollback();
    console.error('Error creating records:', error);
    throw error;
  }
};

// Profile 테이블에 학생 정보를 저장
export const createProfile = async (
  callerId: string,
  studentName: string,
  studentId: string,
  studentPw: string
): Promise<void> => {

  console.log(studentName);
  console.log(studentId);
  console.log(studentPw);
  
  const conn = await connection;
  try {
    await conn.beginTransaction();

    // Lecture 테이블에 데이터 삽입
    const [profileResult] = await conn.query<ResultSetHeader>(
      'INSERT INTO Profile (caller_id, student_name, student_id, student_pw) VALUES (?, ?, ?, ?)',
      [callerId, studentName, studentId, studentId]
    );
    await conn.commit();
    console.log('New Profile created successfully');
  } catch (error) {
    await conn.rollback();
    console.error('Error creating new Profile:', error);
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
      'SELECT caller_id FROM lectures WHERE course_name = ? AND caller_id != ?',
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
      'SELECT * FROM lectures WHERE period = ? AND day LIKE ?',
      [period, `%${day}%`]
    );
    return rows.map((row:any) => row.caller_id);
  } catch(error) {
    console.error(error);
    throw new Error('query error');
  }
}