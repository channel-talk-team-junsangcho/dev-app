import { useEffect, useMemo, useCallback, useState } from 'react'
import {
  VStack,
  HStack,
  Button,
  Text,
  Icon,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ButtonGroup,
  ModalClose,
  Box,
  // ButtonGroup,
  // Checkbox,
  TextField,
} from '@channel.io/bezier-react'
import { CancelIcon, SendIcon } from '@channel.io/bezier-icons'

import {
  callFunction,
  // callNativeFunction,
  close,
  getWamData,
  setSize,
} from '../../utils/wam'
import * as Styled from './SaveProfile.styled'

function Send() {
  useEffect(() => { //화면사이즈 설정
    setSize(390, 300) 
  }, [])

  const [studentName, setStudentName] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [studentPw, setStudentPW] = useState<string>('');
  
  const handleStudentNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStudentName(event.target.value);
  };

  const handleStudentIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStudentId(event.target.value);
  };

  const handleStudentPwChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStudentPW(event.target.value);
  };

  const chatTitle = useMemo(() => getWamData('chatTitle') ?? '', [])

  const appId = useMemo(() => getWamData('appId') ?? '', [])
  const channelId = useMemo(() => getWamData('channelId') ?? '', [])
  const managerId = useMemo(() => getWamData('managerId') ?? '', [])
  const message = useMemo(() => getWamData('message') ?? '', [])
  const chatId = useMemo(() => getWamData('chatId') ?? '', [])
  const chatType = useMemo(() => getWamData('chatType') ?? '', [])
  const broadcast = useMemo(() => Boolean(getWamData('broadcast') ?? false), [])
  const rootMessageId = useMemo(() => getWamData('rootMessageId'), [])

  const handleSave = useCallback(
      async (): Promise<void> => {
        console.log(studentName, studentId, studentPw);
        
        await callFunction(appId, 'saveLecture', {
          input: {
            groupId: chatId,
            broadcast,
            rootMessageId,
            courseName: studentName,
            courseNumber: studentId,
            classNumber: studentPw
          }
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
        studentName,
        studentId,
        studentPw
      ]
    )

  return (
    <VStack spacing={16}>
      <HStack justify="between">
        <Text
          color="txt-black-darkest"
          typo="24"
          bold
        >
          학생 정보를 입력하세요!
        </Text>
        <Button
          colorVariant="monochrome-dark"
          styleVariant="tertiary"
          leftContent={CancelIcon}
          onClick={() => close()}
        />
      </HStack>
        <HStack justify="start">
      <Box>
        <Text
          color="txt-black-darkest"
          typo="15"
        >
          수강 강의 정보를 등록해주세요!
        </Text>
      </Box>
      </HStack>
      <HStack justify="center">
        <TextField
          placeholder="이름"
          value={studentName}
          onChange={handleStudentNameChange}
        />
        <TextField
          placeholder="학번"
          value={studentId}
          onChange={handleStudentIdChange}
        />
        <TextField
          placeholder="비번"
          value={studentPw}
          onChange={handleStudentPwChange}
        />
      </HStack>
      <HStack justify="center">
        <Modal
          onHide={() => {}}
          onShow={() => {}}
        >
        <ModalTrigger>
          <Button text="저장하기" onClick={()=> setSize(390, 500)}/>
        </ModalTrigger>
        <ModalContent>
            <ModalHeader
              subtitle="학생 정보 등록하기"
              title="저장하시겠습니까?"
              titleSize="l"
            />
            <ModalFooter rightContent={<ButtonGroup><ModalClose><Button colorVariant="monochrome-light" styleVariant="secondary" text="취소"/></ModalClose><ModalClose><Button colorVariant="blue" styleVariant="primary" text="저장" 
                onClick={async () => {
                await handleSave()
                close()
              }}/></ModalClose></ButtonGroup>} />
        </ModalContent>
        </Modal>
      </HStack>
      <HStack justify="center">
        <Styled.CenterTextWrapper>
          <Icon
            source={SendIcon}
            color="txt-black-dark"
            size="xs"
          />
          <Text
            as="span"
            color="txt-black-dark"
          >
            {chatTitle}
          </Text>
        </Styled.CenterTextWrapper>
      </HStack>
    </VStack>
  )
}

export default Send
