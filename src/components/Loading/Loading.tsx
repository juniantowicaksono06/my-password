import BounceLouder from 'react-spinners/BounceLoader'
import React from 'react'

interface LoadingProps {
    isLoading: boolean;
}

const Loading: React.FC<LoadingProps> = ({isLoading}) => {
    if(!isLoading) return

    return <>
        <div className="bg-black opacity-75 fixed w-full h-full flex justify-center items-center z-999999 top-0 left-0">
            <BounceLouder color="#355E3B" loading={isLoading} size={150} />
        </div>
    </>
}

export default Loading