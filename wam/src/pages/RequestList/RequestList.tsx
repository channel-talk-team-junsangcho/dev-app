import { useEffect, useState, useMemo,useCallback } from 'react'
import {
  Button,
  HStack,
  ListItem,
  Stack,
  VStack,
} from '@channel.io/bezier-react'
import { CancelIcon, } from '@channel.io/bezier-icons'


import {
  callFunction,
    close,
    setSize,
    getWamData
} from '../../utils/wam'
import './RequestList.styled'


function RequestList() {
  useEffect(() => { //화면사이즈 설정
    setSize(500, 300) 
  }, [])

  // const chatTitle = useMemo(() => getWamData('chatTitle') ?? '', [])

const appId = useMemo(() => getWamData('appId') ?? '', [])
const channelId = useMemo(() => getWamData('channelId') ?? '', [])
const managerId = useMemo(() => getWamData('managerId') ?? '', [])
const message = useMemo(() => getWamData('message') ?? '', [])
const chatId = useMemo(() => getWamData('chatId') ?? '', [])
const chatType = useMemo(() => getWamData('chatType') ?? '', [])
const broadcast = useMemo(() => Boolean(getWamData('broadcast') ?? false), [])
const rootMessageId = useMemo(() => getWamData('rootMessageId'), [])


  const [lectureList, setLectureList] = useState([
    { callerName:'조상준', courseName: '컴퓨터구조', id:'20011609',password:'password'},
   
  ]);

  const removeLecture = (id: string) => {
    setLectureList((prevList) => {
      const updatedList = prevList.filter((lecture) => lecture.id !== id);
      return updatedList;
    });
  };

  const handleSend = useCallback(
    async (sender: string): Promise<void> => {
      
      
            await callFunction(appId, 'sendAsBotTwo', {
              input: {
                groupId: chatId,
                broadcast,
                rootMessageId,
                message: sender
              },
            })
            
    },
    [
      appId,
      broadcast,
      channelId,
      chatId,
      chatType,
      managerId,
      message,
      rootMessageId,
    ]
  )
  

  return (
    <div style={{ overflowY: 'auto', maxHeight: '100vh' }}>
      <HStack justify='end'>
        <Button
          colorVariant="monochrome-dark"
          styleVariant="tertiary"
          rightContent={CancelIcon}
          onClick={() => close()}
        />
      </HStack>
      <VStack spacing={16} padding={5}>
        {lectureList.map((lecture, index) => (
          <Stack 
            key = {lecture.callerName}
            direction="horizontal" 
            justify="between" 
            spacing={10} 
            padding={5} 
            borderRadius="12" 
            backgroundColor="bg-lounge">
            <ListItem
              key={index}
              content={`${lecture.callerName} - ${lecture.courseName}`}
              description={"id: "+`${lecture.id}` +  "\n"+ "password: "+`${lecture.password}`}
              descriptionMaxLines={2}
              size="m"
            />
            <Stack direction="horizontal" justify="end" spacing={10} align="center">
              <Button text="반사" colorVariant="red" size="m" 
                onClick={()=> {removeLecture(lecture.id); handleSend('반사');}}
                />
              <Button text="완료" colorVariant="blue" size="m" 
                onClick={()=>{removeLecture(lecture.id); handleSend('완료');}}
                />
            </Stack>
          </Stack>
        ))}
      </VStack>
    </div>
  );
}


export default RequestList
