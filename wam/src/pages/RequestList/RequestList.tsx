import { useEffect, useState } from 'react'
import {
  Button,
  HStack,
  ListItem,
  Stack,
  VStack,
} from '@channel.io/bezier-react'
import { CancelIcon, } from '@channel.io/bezier-icons'


import {
    close,
    setSize,
} from '../../utils/wam'
import './RequestList.styled'


function RequestList() {
  useEffect(() => { //화면사이즈 설정
    setSize(500, 300) 
  }, [])

  const [lectureList, setLectureList] = useState([
    { callerName:'신혜연', courseName: '컴퓨터구조', id:'1234',password:'1234'},
   
  ]);

  const removeLecture = (id: string) => {
    setLectureList((prevList) => {
      const updatedList = prevList.filter((lecture) => lecture.id !== id);
      return updatedList;
    });
  };

  

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
                onClick={()=>removeLecture(lecture.id)}
                />
              <Button text="완료" colorVariant="blue" size="m" 
                onClick={()=>removeLecture(lecture.id)}
                />
            </Stack>
          </Stack>
        ))}
      </VStack>
    </div>
  );
}


export default RequestList
