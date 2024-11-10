import axios from 'axios';
import * as crypto from 'crypto';

import { createLecture, getUsersInSameCourse, getCallerName, createProfile} from './db';
import {getSameCourseUser} from './attendanceService'

require("dotenv").config();

let channelTokenMap = new Map<string, [string, string, number]>();

const tutorialMsg = "This is a test message sent by a manager.";
const sendAsBotMsg = "%s %s 강의 대리 출석해 주세요~!";
const botName = "대리 출석 Bot";

const defaultWamArgs = ["rootMessageId", "broadcast", "isPrivate"];

async function getChannelToken(channelId: string): Promise<[string, string]> {
    const channelToken = channelTokenMap.get(channelId);
    if (channelToken === undefined || channelToken[2] < new Date().getTime() / 1000) {
        const [accessToken, refreshToken, expiresAt]: [string, string, number] = await requestIssueToken(channelId);
        channelTokenMap.set(channelId, [accessToken, refreshToken, expiresAt]);
        return [accessToken, refreshToken]
    }
    else {
        return [channelToken[0], channelToken[1]]
    }
}

async function requestIssueToken(channelId?: string) : Promise<[string, string, number]> {
    let body = {
        method: 'issueToken',
        params: {
            secret: process.env.APP_SECRET,
            channelId: channelId
        }
    };

    const headers = {
        'Content-Type': 'application/json'
    };
    
    const response = await axios.put(process.env.APPSTORE_URL ?? '', body, { headers });

    const accessToken = response.data.result.accessToken;
    const refreshToken = response.data.result.refreshToken;    
    const expiresAt = new Date().getTime() / 1000 + response.data.result.expiresIn - 5;    

    return [accessToken, refreshToken, expiresAt];
}

async function registerCommand(accessToken: string) {
    const body = {
        method: "registerCommands",
        params: {
            appId: process.env.APP_ID,
            commands: [
                {
                    name: "save",
                    scope: "desk",
                    description: "This is a desk command of App-tutorial",
                    actionFunctionName: "tutorial",
                    alfMode: "disable",
                    enabledByDefault: true,
                },
                {
                    name: "list",
                    scope: "desk",
                    description: "This is a desk command of view user's Lecture list",
                    actionFunctionName: "viewLectureList",
                    alfMode: "disable",
                    enabledByDefault: true,
                },
                {
                    name: "request",
                    scope: "desk",
                    description: "This is a desk command of view user's request Lecture list",
                    actionFunctionName: "viewRequestLectureList",
                    alfMode: "disable",
                    enabledByDefault: true,
                },
                {
                    name: "saveProfile",
                    scope: "desk",
                    description: "This is a desk command of view user's Lecture list",
                    actionFunctionName: "saveProfilePage",
                    alfMode: "disable",
                    enabledByDefault: true,
                }
            ]
        }
    };

    const headers = {
        'x-access-token': accessToken,
        'Content-Type': 'application/json'
    };

    const response = await axios.put(process.env.APPSTORE_URL ?? '', body, { headers });

    if (response.data.error != null) {
        throw new Error("register command error");
    }
}

async function getNameByNativeFunction(accessToken: string, channelId:string, callerId:string) {
    const body = {
        method: "getManager",
        params : {
            "channelId": channelId,
            "managerId": callerId
        }
    }

    const headers = {
        'x-access-token': accessToken,
        'Content-Type': 'application/json'
    };

    const response = await axios.put(process.env.APPSTORE_URL ?? '', body, { headers });

    if (response.data.error != null) {
        console.log(response)
        console.log(response.data.error);
        throw new Error("getManagerNameByNativeFunction Error");
    }

    const name = response.data.result.manager.name;
    return name;
}

function viewRequestLectureList(wamName: string, callerId: string, params: any) {
    const wamArgs = {
        message: tutorialMsg,
        managerId: callerId,
        pageName: "requestList"
    } as { [key: string]: any }

    if (params.trigger.attributes) {
        defaultWamArgs.forEach(k => {
            if (k in params.trigger.attributes) {
                wamArgs[k] = params.trigger.attributes[k]
            }
        })
    }

    return ({
        result: {
            type: "wam",
            attributes: {
                appId: process.env.APP_ID,
                name: wamName,
                wamArgs: wamArgs,
            }
        }
    });
}

async function saveLecture(callerId: string, courseName: string, courseNumber: string, classNumber: string) {
    createLecture(callerId, courseName,courseNumber,classNumber);

}

async function findRandomMember(callerId: string, channelId: string, groupId:string, broadcast:boolean, courseName:string, rootMessageId: string) {
    let userIdRq='';
    const userId = await getSameCourseUser(callerId, courseName)
    if(userId === null) userIdRq = 'null'
    else userIdRq = userId;   
    
    const userName = await getCallerName(userId)

    await sendAsBot(channelId,groupId,broadcast,userName,courseName,rootMessageId);
}

async function sendAsBot(channelId: string, groupId: string, broadcast: boolean, userName: string, courseName: string, rootMessageId?: string) {
    const plainText = formatMessage(sendAsBotMsg, userName, courseName);

    const body = {
        method: "writeGroupMessage",
        params: {
            channelId: channelId,
            groupId: groupId,
            rootMessageId: rootMessageId,
            broadcast: broadcast,
            dto: {
                plainText: plainText,
                botName: botName
            }
        }
    }

    const channelToken = await getChannelToken(channelId);

    const headers = {
        'x-access-token': channelToken[0],
        'Content-Type': 'application/json'
    };

    const response = await axios.put(process.env.APPSTORE_URL ?? '', body, { headers });

    if (response.data.error != null) {
        throw new Error("send as bot error");
    }
}

async function sendAsBotTwo(channelId: string, groupId: string, broadcast: boolean, message: string,callerId: string, rootMessageId?: string) {
    const reviewer = await getCallerName(callerId);
    const plainText = "조상준님! 컴퓨터구조 대리출석이 " + message + "되었습니다. (by " + reviewer + ")"

    const body = {
        method: "writeGroupMessage",
        params: {
            channelId: channelId,
            groupId: groupId,
            rootMessageId: rootMessageId,
            broadcast: broadcast,
            dto: {
                plainText: plainText,
                botName: botName
            }
        }
    }

    const channelToken = await getChannelToken(channelId);

    const headers = {
        'x-access-token': channelToken[0],
        'Content-Type': 'application/json'
    };

    const response = await axios.put(process.env.APPSTORE_URL ?? '', body, { headers });

    if (response.data.error != null) {
        throw new Error("send as bot error");
    }
}


function verification(x_signature: string, body: string): boolean {
    const key: crypto.KeyObject = crypto.createSecretKey(Buffer.from(process.env.SIGNING_KEY ?? '', 'hex'));
    const mac = crypto.createHmac('sha256', key);
    mac.update(body, 'utf8');

    const signature: string = mac.digest('base64');
    return signature === x_signature;
}

function tutorial(wamName: string, callerId: string, params: any) {
    const wamArgs = {
        message: tutorialMsg,
        managerId: callerId,
        pageName: "save"
    } as { [key: string]: any }

    if (params.trigger.attributes) {
        defaultWamArgs.forEach(k => {
            if (k in params.trigger.attributes) {
                wamArgs[k] = params.trigger.attributes[k]
            }
        })
    }

    return ({
        result: {
            type: "wam",
            attributes: {
                appId: process.env.APP_ID,
                name: wamName,
                wamArgs: wamArgs,
            }
        }
    });
}

function viewLectureList(wamName: string, callerId: string, params: any) {
    const wamArgs = {
        message: tutorialMsg,
        managerId: callerId,
        pageName: "list"
    } as { [key: string]: any }

    if (params.trigger.attributes) {
        defaultWamArgs.forEach(k => {
            if (k in params.trigger.attributes) {
                wamArgs[k] = params.trigger.attributes[k]
            }
        })
    }

    return ({
        result: {
            type: "wam",
            attributes: {
                appId: process.env.APP_ID,
                name: wamName,
                wamArgs: wamArgs,
            }
        }
    });
}


const formatMessage = (
    template: string, 
    name: string,
    course: string
) => {
    return template
        .replace('%s', name) // 첫 번째 %s를 name으로 대체
        .replace('%s', course); // 두 번째 %s를 course로 대체
};

// wam 객체로 넘겨주는 함수
function saveProfilePage(wamName: string, callerId: string, params: any) {
    const wamArgs = {
        message: tutorialMsg,
        managerId: callerId,
        pageName: "saveProfile"
    } as { [key: string]: any }

    if (params.trigger.attributes) {
        defaultWamArgs.forEach(k => {
            if (k in params.trigger.attributes) {
                wamArgs[k] = params.trigger.attributes[k]
            }
        })
    }

    return ({
        result: {
            type: "wam",
            attributes: {
                appId: process.env.APP_ID,
                name: wamName,
                wamArgs: wamArgs,
            }
        }
    });
}

// saveProfile.tsx 프론트 -> server FunctionHandler -> 갔다 여기 오는거임
async function saveProfile(callerId: string, studentName: string, studentId: string, studentPw: string) {
    createProfile(callerId, studentName, studentId, studentPw)
}

export { requestIssueToken, sendAsBotTwo, registerCommand, getChannelToken, viewRequestLectureList,saveLecture,saveProfilePage,saveProfile, getNameByNativeFunction,viewLectureList, tutorial,findRandomMember, verification, sendAsBot };
