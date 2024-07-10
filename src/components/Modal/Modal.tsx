import React, {MouseEventHandler, useEffect} from 'react';

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
    let modalSizeClass = "bg-black rounded-lg py-5 px-6 w-96"
    if(size == "large") {
        modalSizeClass = "bg-black rounded-lg py-5 px-6 xl:w-150 lg:w-100 md:w-100 sm:w-96"
    }
    else if(size == "medium") {
        modalSizeClass = "bg-black rounded-lg py-5 px-6 w-100 sm:w-96"
    }
    else if(size == "small") {
        modalSizeClass = "bg-black rounded-lg py-5 px-6 w-96"
    }
    // useEffect(() => {
    //     if (isOpen) {
    //         document.body.classList.add('overflow-hidden');
    //         document.querySelector('body > div')?.classList.add("overflow-hidden")
    //     } else {
    //         document.body.classList.remove('overflow-hidden');
    //         document.querySelector('body > div')?.classList.remove("overflow-hidden")
    //     }
    // }, [isOpen]);

    return (
        <>
            <div className={!isOpen? "fixed h-full top-0 left-0 w-full bg-black bg-opacity-50 z-99999 hidden" : "fixed h-full flex justify-center px-5 top-0 w-full bg-black bg-opacity-50 z-99999 overflow-auto py-10"}>
                <div className='inset-0'>
                    <div className={modalSizeClass}>
                        {/* HEAD */}
                        <div className='border-b-2 border-gray pb-3'>
                            <button className="text-gray-500 hover:text-gray-700 float-right" onClick={onClose}>
                                <p className='text-xl'>
                                    &times;
                                </p>
                            </button>
                            <div>
                                <h1>{ title }</h1>
                            </div>
                        </div>
                        {/* CONTENT */}
                        <div className="mt-5">
                            { children }
                        </div>
                        {/* FOOTER */}
                        <div className="mt-5">
                            { !withSubmitBtn ? <></> :  <div className="flex justify-end">
                                <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded" onClick={submitBtnFunction}>
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