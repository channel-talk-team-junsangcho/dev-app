import axios from 'axios';
import * as crypto from 'crypto';

import { createLecture } from './db';
import { getAppropriateUser } from './attendaceService';

require("dotenv").config();

let channelTokenMap = new Map<string, [string, string, number]>();

const tutorialMsg = "This is a test message sent by a manager.";
const botName = "대리 출석 Bot";

const defaultWamArgs = ["rootMessageId", "broadcast", "isPrivate"];

interface requestParams {
    callerId: string, 
    courseName: string,
    period: string,
    day: string
}

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
                    description: "This is a desk command of view lecture list",
                    actionFunctionName: "viewLectureList",
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

async function saveLecture(courseName: string, courseNumber: string, classNumber: string) {
    createLecture(courseName,courseNumber,classNumber)
}

async function sendAttendanceMsg(
    obj: requestParams,
    name: string,
    channelId: string, groupId: string, broadcast: boolean,
    rootMessageId?: string 
) {
    const sendAsBotProxyAttendanceMsg = "%s %s 강의 대리 출석해 주세요~!";
    const sendAsBotFailAttendaceMsg = "대리 출석 해 줄 사용자가 없어요...";

    const userId = getAppropriateUser(obj);
    var plainText;

    if(userId == null) {
        plainText = formatMessage(sendAsBotFailAttendaceMsg, name, obj.courseName);
    } else {
        plainText = formatMessage(sendAsBotProxyAttendanceMsg,
            name, obj.courseName);
    }

    sendAsBot(channelId, groupId, broadcast, plainText, rootMessageId);
}

async function sendAsBot(channelId: string, groupId: string, broadcast: boolean, plainText: string, rootMessageId?: string, ) {
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

function viewLectureList(wamName: string, callerId: string, params: any) {
    const wamArgs = {
        message: tutorialMsg,
        managerId: callerId,
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

function tutorial(wamName: string, callerId: string, params: any) {
    const wamArgs = {
        message: tutorialMsg,
        managerId: callerId,
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

export { requestIssueToken, registerCommand, saveLecture, tutorial, verification, sendAsBot };
