import express, { Request, Response } from 'express';
import path from 'path';
import { requestIssueToken, registerCommand, saveLecture , tutorial, verification } from './util';


require("dotenv").config();

const app = express();

const WAM_NAME = 'wam_name';

async function startServer() {
    const [accessToken, refreshToken, expiresAt]: [string, string, number] = await requestIssueToken(); //토큰 불러오고 검증하기
    await registerCommand(accessToken);
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
                body.params.input.courseName,
                body.params.input.courseNumber,
                body.params.input.classNumber
            );
            return ({result: {}});
    }
}

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
