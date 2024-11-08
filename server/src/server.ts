import express, { Request, Response } from 'express';
import path from 'path';

import { getChannelToken, requestIssueToken, registerCommand, saveLecture, saveProfile, getNameByNativeFunction, viewLectureList, saveProfilePage,tutorial, verification, sendAsBot } from './util';

require("dotenv").config();

const app = express();

const WAM_NAME = 'wam_name';

let ac : string;

let accessToken = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkiLCJzdWIiOiJhdXRoX3Rva2VuIiwiZXhwIjoxNzMxMDk0OTMyLCJpYXQiOjE3MzEwOTMxMzIwMjksInJvbGVJZCI6IjI2ODciLCJzY29wZSI6WyJhcHAtNjcyNDVhNTFlZGE1NzQ4MDdiNDEiXSwiaWRlbnRpdHkiOiJhcHAtNjcyNDVhNTFlZGE1NzQ4MDdiNDEiLCJzeW50YXhWZXJzaW9uIjoidjEiLCJuYW1lIjoicm9sZS0yNjg3In0.BS8hw0YIdvRfgsPeKrPPXYg0ieXfdBhBgxKQf8_2DkA";

async function startServer() {
    //const [accessToken, refreshToken, expiresAt]: [string, string, number] = await requestIssueToken(); //토큰 불러오고 검증하기
    await registerCommand(accessToken);
    ac = accessToken;
    console.log("accessToken = ", ac);
}

async function functionHandler(body: any) {
    const method = body.method;
    const callerId = body.context.caller.id;
    const channelId = body.context.channel.id;

    switch (method) {
        case 'tutorial':
            return tutorial(WAM_NAME, callerId, body.params);
        case 'saveLecture':
            await saveLecture(
                callerId,
                body.params.input.courseName,
                body.params.input.courseNumber,
                body.params.input.classNumber
            );
            return ({result: {}});

        // WAM으로 보내는거
        case 'saveProfilePage':
                return saveProfilePage(WAM_NAME, callerId, body.params);
        // WAM에서 호출하는거
        case 'saveProfile' :
            
            // const name = "채우기"
            const returnValues = await getChannelToken(channelId);
            const channelToken = returnValues[0];
            const name = await getNameByNativeFunction(channelToken, channelId, callerId);
            console.log("getnamebynativefunction : ", name);

            await saveProfile(
                callerId,
                name,
                body.params.input.studentName,
                body.params.input.studentId,
                body.params.input.studentPw
            );
            return ({result: {}});
        case 'sendAsBot':
            await sendAsBot(
                channelId,
                body.params.input.groupId,
                body.params.input.broadcast,
                body.params.input.name,
                body.params.input.courseName,
                body.params.input.rootMessageId
            );
            return ({result: {}});
        case 'viewLectureList':
            return viewLectureList(WAM_NAME, callerId, body.params);
    }
}

// z
async function server() {
    try {
        await startServer(); //1. server 초기 설정

        app.use(express.json());
        app.use(`/resource/wam/${WAM_NAME}`, express.static(path.join(__dirname, '../../wam/dist')));

        app.put('/functions', (req: Request, res: Response) => {
            if (typeof req.headers['x-signature'] !== 'string' || verification(req.headers['x-signature'], JSON.stringify(req.body)) === false) {
                res.status(401).send('Unauthorized');
            }
            functionHandler(req.body).then(result => {
                res.send(result);
            });
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is running at http://localhost:${process.env.PORT}`);
        });
    } catch (error: any) {
        console.error('Error caught:', error);
    }
}

export { server };
