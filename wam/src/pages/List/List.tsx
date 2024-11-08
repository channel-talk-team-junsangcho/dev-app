import { useEffect, useMemo, useCallback, useState } from 'react'

import { CancelIcon } from '@channel.io/bezier-icons'
import {
    VStack,
    HStack,
    Button,
    Text,
    Modal,
    ModalTrigger,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ButtonGroup,
    ModalClose
  } from '@channel.io/bezier-react'
import styled from 'styled-components';

import {
    close,
    getWamData,
    setSize,
    callFunction
  } from '../../utils/wam'

const StyledListItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
  margin: 8px 0;
  justify-content: center; 
  border-radius: 8px;
  background-color: #6486F7;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #5D56E7;
  }

  .content {
    font-weight: bold;
    text-align: center;
    font-size: 2rem;
    color: #FFFFFF;
  }

  .description {
    font-size: 0.9rem;
    color: #555;
    line-height: 1.4;
  }
`;

function List() {
  useEffect(() => { //화면사이즈 설정
    setSize(450, 300) 
  }, [])

  const lectureList = [
    { courseName: '컴퓨터구조', courseCode: '001201' },
    { courseName: '알고리즘및프로그래밍', courseCode: '001202' },
    { courseName: '운영체제', courseCode: '001203' },
  ];

  const [indexInfo, setIndexInfo] = useState<string>('001201');
  const [courseName, setCourseName] = useState<string>('컴퓨터구조');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const appId = useMemo(() => getWamData('appId') ?? '', [])
  const channelId = useMemo(() => getWamData('channelId') ?? '', [])
  const managerId = useMemo(() => getWamData('managerId') ?? '', [])
  const message = useMemo(() => getWamData('message') ?? '', [])
  const chatId = useMemo(() => getWamData('chatId') ?? '', [])
  const chatType = useMemo(() => getWamData('chatType') ?? '', [])
  const broadcast = useMemo(() => Boolean(getWamData('broadcast') ?? false), [])
  const rootMessageId = useMemo(() => getWamData('rootMessageId'), [])

  const handleRequest = useCallback(
      async (): Promise<void> => {
        await callFunction(appId, 'findRandomMember', {
          input: {
            groupId: chatId,
            broadcast,
            rootMessageId,
            courseName: courseName,
            courseNumber: indexInfo,
            channelId:channelId,
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
        rootMessageId
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
          대리출석 요청할 과목을 선택해주세요!
        </Text>
        <Button
          colorVariant="monochrome-dark"
          styleVariant="tertiary"
          leftContent={CancelIcon}
          onClick={() => close()}
        />
      </HStack>
      
      <HStack justify="center">
        {lectureList.map((lecture, index) => (
          <StyledListItem key={index}>
            <div 
              className="content"
              onClick={() => {
                setIndexInfo(lecture.courseCode); 
                setCourseName(lecture.courseName); 
                setIsModalOpen(true); // 버튼 클릭 시 모달 열기
              }}
              style={{ cursor: 'pointer' }}
            >
              {`${lecture.courseName} - ${lecture.courseCode}`}
            </div>
          </StyledListItem>
        ))}
      </HStack>

      {isModalOpen && (
        <Modal
          onHide={() => setIsModalOpen(false)}
          onShow={() => {}}
        >
          <ModalTrigger>
            <Button text="모달 열기" onClick={() => setIsModalOpen(true)} />
          </ModalTrigger>
          <ModalContent>
            <ModalHeader
              subtitle="대리출석"
              title="신청하시겠습니까?"
              titleSize="l"
            />
            <ModalFooter rightContent={
              <ButtonGroup>
                <ModalClose>
                  <Button colorVariant="monochrome-light" styleVariant="secondary" text="취소" onClick={() => setIsModalOpen(false)} />
                </ModalClose>
                <ModalClose>
                  <Button colorVariant="blue" styleVariant="primary" text="저장" 
                    onClick={async () => {
                      await handleRequest();
                      setIsModalOpen(false); // 모달 닫기
                      close();
                    }}
                  />
                </ModalClose>
              </ButtonGroup>
            } />
          </ModalContent>
        </Modal>
      )}
    </VStack>
  )
}

export default List