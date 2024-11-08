import { useEffect } from 'react'
import {
  VStack,
  HStack,
  Text
} from '@channel.io/bezier-react'

import {
//   callFunction,
//   getWamData,
  setSize,
} from '../../utils/wam'

// import * as Styled from './Send.styled'

function LectureList() {
  useEffect(() => { //화면사이즈 설정
    setSize(390, 300) 
  }, [])


//   const chatTitle = useMemo(() => getWamData('chatTitle') ?? '', [])

//   const appId = useMemo(() => getWamData('appId') ?? '', [])
//   const channelId = useMemo(() => getWamData('channelId') ?? '', [])
//   const managerId = useMemo(() => getWamData('managerId') ?? '', [])
//   const message = useMemo(() => getWamData('message') ?? '', [])
//   const chatId = useMemo(() => getWamData('chatId') ?? '', [])
//   const chatType = useMemo(() => getWamData('chatType') ?? '', [])
//   const broadcast = useMemo(() => Boolean(getWamData('broadcast') ?? false), [])
//   const rootMessageId = useMemo(() => getWamData('rootMessageId'), [])

//   const handleSave = useCallback(
//       async (): Promise<void> => {

        
//         await callFunction(appId, 'saveLecture', {
//           input: {
//             groupId: chatId,
//             broadcast,
//             rootMessageId,
//           }
//         })
//       },
//       [
//         appId,
//         broadcast,
//         channelId,
//         chatId,
//         chatType,
//         managerId,
//         message,
//         rootMessageId
//       ]
//     )

  return (
    <VStack spacing={16}>
      <HStack justify="between">
        <Text
          color="txt-black-darkest"
          typo="24"
          bold
        >
          강의를 등록하세요!
        </Text>
      </HStack>
    </VStack>
  )
}

export default LectureList
