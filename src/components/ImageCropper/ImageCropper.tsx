
import Modal from '@/src/components/Modal/Modal';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, PixelCrop } from 'react-image-crop'

import React, { useRef, useState } from 'react';
import { canvasPreview } from '@/src/components/CanvasPreview/CanvasPreview';

interface ImageCropperProps {
    isOpen: boolean;
    imageUrl: string;
    closeCropper: () => void;
    uploadImage: (file: Blob | null) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({isOpen, imageUrl, closeCropper, uploadImage}) => {   
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [finalCrop, setFinalCrop] = useState<PixelCrop>()
    const [crop, setCrop] = useState<Crop>()
    const profilePicRef = useRef<HTMLImageElement | null>(null)
    const ppCanvasRef = useRef<HTMLCanvasElement | null>(null)
    if(!isOpen) return <></>

    return <>
        <Modal isOpen={isOpen} onClose={closeCropper} title="Upload Profile Picture" size="large" withSubmitBtn={false} submitBtnFunction={() => {
            closeCropper()
        }}>
            <div>
                <ReactCrop className={finalCrop == undefined ? "!inline-block" : "!hidden"} crop={crop} onChange={(c) => setCrop(c)} aspect={1 / 1} onComplete={(e) => {
                    setCompletedCrop(e)
                }}>
                    <img className="w-full h-full max-w-full" ref={profilePicRef} src={imageUrl} onLoad={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        const { naturalWidth: width, naturalHeight: height } = e.currentTarget
                        const newCrop = centerCrop(
                            makeAspectCrop(
                                {
                                    unit: '%',
                                    width: 90,
                                },
                                1 / 1,
                                width,
                                height
                            ),
                            width,
                            height
                        )
                        setCrop(newCrop)
                    }} />
                </ReactCrop>
                <canvas className={finalCrop === undefined ? "w-full h-full max-w-full hidden" : "w-full h-full max-w-full block"} ref={ppCanvasRef} />
            </div>
            <div>
                <div className="flex justify-end mt-3">
                    {
                        finalCrop ? <></> : <>
                            <button className='rounded bg-green-500 hover:bg-green-700 text-white p-3' onClick={() => {
                                if (completedCrop != undefined && profilePicRef != null && ppCanvasRef != null) {
                                    // We use canvasPreview as it's much faster than imgPreview.
                                    canvasPreview(
                                        profilePicRef.current,
                                        ppCanvasRef.current,
                                        completedCrop,
                                        1,
                                        0,
                                    )
                                    setFinalCrop(completedCrop)
                                }
                            }}>Crop</button>
                        </>
                    }
                    {finalCrop ? <>
                        <button className='rounded bg-blue-500 hover:bg-blue-700 text-white p-3 mr-3' onClick={() => {
                            setFinalCrop(undefined)
                            setCompletedCrop(undefined)
                            const { naturalWidth: width, naturalHeight: height } = profilePicRef.current!
                            const newCrop = centerCrop(
                                makeAspectCrop(
                                    {
                                        unit: '%',
                                        width: 90,
                                    },
                                    1 / 1,
                                    width,
                                    height
                                ),
                                width,
                                height
                            )
                            setCrop(newCrop)
                        }}>Crop Again</button>
                        <button className='rounded bg-green-500 hover:bg-green-700 text-white p-3' onClick={() => {
                            ppCanvasRef.current?.toBlob(async (blob: Blob| null) => {
                                await uploadImage(blob)
                                setCompletedCrop(undefined)
                                setFinalCrop(undefined)
                            })
                        }}>Upload</button>
                    </> : <></>}
                </div>
            </div>
        </Modal>
    </>
}

export default ImageCropper