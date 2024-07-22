"use client"
import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import swal, {SweetAlertIcon, SweetAlertPosition} from 'sweetalert2';
import Loading from '@/src/components/Loading/Loading';
import crypto from 'crypto';
const LoginOTP = () => {
    
    const initialValues = {
        otp: ""
    };
    const loginOTPSchema = Yup.object().shape({
        otp: Yup.number()
        .required('Input is required')
    });
    useEffect(() => {
        const flash_success = sessionStorage.getItem('flash_success');
        if(flash_success) {
            sessionStorage.removeItem('flash_success')
            swal.fire({
                title: "Success",
                text: flash_success,
                icon: "success",
            });
        }
    }, []);

    const [isLoading, setIsLoading] = useState(false)

    return (<>
        <Loading isLoading={isLoading} />
        <div className="rounded-sm xsm:px-20 sm:px-30 lg:px-100 box-border mt-10">
            <div className="">
                <div className="w-full border-stroke dark:border-strokedark">
                    <div className="w-full">
                        <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                            Validate OTP
                        </h2>
                        <Formik 
                            initialValues={initialValues}
                            validationSchema={loginOTPSchema}
                            onSubmit={async(values) => {
                                setIsLoading(true);
                                const response = await fetch(`${window.location.origin}/api/auth/verify-otp`, {
                                    method: "POST",
                                    body: JSON.stringify(values)
                                });
                                setIsLoading(false);
                                if(response.ok) {
                                    const result: {
                                        code: number,
                                        message: string
                                    } = await response.json();
                                    let icon: SweetAlertIcon | undefined = "success";
                                    let didCloseFn: undefined | (() => void) = () => {
                                        window.location.href = '/';
                                    }
                                    let toast = true;
                                    let showConfirmButton = false;
                                    let position: SweetAlertPosition = 'top';
                                    if(result.code != 200) {
                                        icon = "warning";
                                        showConfirmButton = true;
                                        toast = false;
                                        position = 'center';
                                        didCloseFn = undefined;
                                    }
                                    swal.fire({
                                        title: "Success",
                                        text: result.message,
                                        icon: icon,
                                        timer: 3000,
                                        toast: toast,
                                        showConfirmButton: showConfirmButton,
                                        position: position,
                                        didClose: didCloseFn
                                    });
                                }
                                else {
                                    const result: {
                                        code: number,
                                        message: string
                                    } = await response.json();
                                    swal.fire({
                                        title: "Login Failed",
                                        icon: "error",
                                        text: result.message
                                    });
                                }
                            }}
                        >

                            <Form>
                                <div className="mb-6">
                                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                                        OTP Code
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type="text"
                                            name="otp"
                                            placeholder="Enter your OTP code"
                                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />

                                        <span className="absolute right-4 top-4">
                                        <svg
                                            className="fill-current"
                                            width="22"
                                            height="22"
                                            viewBox="0 0 22 22"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g opacity="0.5">
                                                <path
                                                    d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                                                    fill=""
                                                />
                                                <path
                                                    d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                                                    fill=""
                                                />
                                            </g>
                                        </svg>
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-5">
                                <input
                                    type="submit"
                                    value="Verify"
                                    className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
                                />
                                </div>

                                <button className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray p-4 hover:bg-opacity-50 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50" onClick={() => {
                                }}>
                                    Resend OTP
                                </button>
                            </Form>
                        </Formik>
                    </div>
                </div>
            </div>
        </div>
    </>)
}

export default LoginOTP;