import React, {MouseEventHandler, useEffect, useRef} from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  withSubmitBtn: boolean;
  size: "large" | "medium" | "small",
  submitBtnFunction: MouseEventHandler<HTMLButtonElement> | undefined;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, size, children, withSubmitBtn, submitBtnFunction }) => {
    const modalDivRef = useRef<HTMLDivElement>(null);
    let modalSizeClass = "bg-black rounded-lg py-5 px-6 w-96 absolute top-1/2 left-1/2 transform modal";
    if(size == "large") {
        modalSizeClass += " md:w-4/6 w-5/6";
    }
    else if(size == "medium") {
        modalSizeClass += " md:w-3/6 w-5/6";
    }
    else if(size == "small") {
        modalSizeClass += " md:w-2/6 w-5/6";
    }

    useEffect(() => {
        if(isOpen) {
            setTimeout(() => {
                modalDivRef.current?.classList.add("show");
            }, 50)
        }
    }, [isOpen])

    return (
        <>
            <div className={!isOpen? "fixed h-full top-0 left-0 w-full bg-black bg-opacity-50 z-99999 hidden" : "fixed h-full top-0 left-0 w-full bg-black bg-opacity-50 z-99999 overflow-auto"}>
                <div className='inset-0 relative'>
                    <div className={isOpen ? `${modalSizeClass} zoom-in` : modalSizeClass} ref={modalDivRef}>
                        {/* HEAD */}
                        <div className='pb-3 mb-1'>
                            <button className="text-gray-500 hover:text-gray-700 float-right" onClick={onClose}>
                                <p className='text-4xl hover:text-red-500'>
                                    &times;
                                </p>
                            </button>
                            <div>
                                <h1 className='text-2xl font-bold'>{ title }</h1>
                            </div>
                        </div>
                        <hr className='border-graydark' />
                        {/* CONTENT */}
                        <div className="mt-5">
                            { children }
                        </div>
                        {/* FOOTER */}
                        <div className="mt-5">
                            { !withSubmitBtn ? <></> :  <div className="flex justify-end">
                                <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded" onClick={submitBtnFunction}>
                                    Close
                                </button>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="h-10"></div>
                </div>
            </div>
        </>
    );
};

export default Modal;