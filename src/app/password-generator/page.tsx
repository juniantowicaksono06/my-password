"use client"
import { generateReadablePassword } from "@/src/shared/function";
import Breadcrumb from "@/src/components/Breadcrumbs/Breadcrumb";
import { useEffect, useState } from "react";
import * as FaSolid from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const Page = () => {
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    useEffect(() => {
        setGeneratedPassword(generateReadablePassword());
    }, [])
    return (
        <>
            <Breadcrumb pageName="Password Generator" />
            <div className="w-full max-w-full h-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark px-2 py-5">
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-1">
                    <div className="border-gray-300 mb-3">
                        <div className="p-3">
                            <h6 className="font-bold">Password</h6>
                        </div>
                        <div className="p-3">
                            <h6>
                                {showPassword ? generatedPassword : '***********'}
                            </h6>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    <button className="bg-purple-700 hover:bg-purple-900 text-white px-3 py-2 rounded" onClick={() => {
                        const genPass = generateReadablePassword();
                        setGeneratedPassword(genPass);
                    }}>
                        <FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faRefresh} /> Generate
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded" onClick={() => {
                        navigator.clipboard.writeText(generatedPassword!).then(function() {
                            Swal.fire({
                                toast: true,
                                title: "URL copied to clipboard",
                                icon: "success",
                                timer: 3000,
                                position: 'top',
                                showConfirmButton: false
                            })
                        })
                    }}>
                        <FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faCopy} /> Copy
                    </button>
                    <button type="button" className={!showPassword ? "bg-green-500 hover:bg-green-700 text-white px-3 py-2 rounded min-h-12" : "bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded min-h-12"} onClick={() => {
                        setShowPassword(!showPassword);
                    }}>
                        {
                            !showPassword ? <><FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faEye} /> <span>See</span></> : <><FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faEyeSlash} /> <span>Hide</span></>
                        }
                    </button>
                </div>
            </div>
        </>
    );
}

export default Page;