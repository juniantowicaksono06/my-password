"use client"
import Breadcrumb from "@/src/components/Breadcrumbs/Breadcrumb";
import React, { useEffect, useState } from "react";
import Loading from "@/src/components/Loading/Loading";
import * as FaSolid from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "@/src/components/Modal/Modal";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { generateReadablePassword } from "@/src/shared/function";

const Page = () => {
    const [passwordData, setPasswordData] = useState<Forms.IPasswordExtends[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsOpenModal] = useState(false);
    const [editId, setEditId] = useState<string>('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const passwordSchema = Yup.object().shape({
        title: Yup.string()
        .min(2)
        .required('Input is required'),
        user: Yup.string()
        .min(2)
        .required('Input is required'),
        password: Yup.string()
        .min(4)
        .max(64)
        .required('Input is required'),
        itemTypeGroup: Yup.string()
        .required('Input is required'),
        url: Yup.string()
        .nullable()
        .when('itemTypeGroup', (itemType: string[], customSchema: Yup.StringSchema<string | null | undefined, Yup.AnyObject, undefined, "">) => {
                return itemType[0] === 'website'  ? customSchema.required('Input is required').matches(
                    /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                    'Enter correct url!'
                ) : customSchema;
            }
        )
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showEditPassword, setEditShowPassword] = useState(false);
    const [initialValues, setInitialValues] = useState({
        title: "",
        user: "",
        password: "",
        itemTypeGroup: "website",
        url: ""
    });
    const [editInitialValues, setEditInitialValues] = useState({
        title: "",
        user: "",
        password: "",
        itemTypeGroup: "website",
        url: ""
    });
    async function getData() {
        setIsLoading(true);
        let response = await fetch(`${window.location.origin}/api/passwords`, {
            method: "GET"            
        });
        setIsLoading(false);
        if(response.ok) {
            const result = await response.json() as {
                code: number,
                data: Forms.IPasswordExtends[]
            };
            if(result.code == 200) {
                setPasswordData(result.data);
            }
        }
    }
    function openModal() {
        setIsOpenModal(true);
    }
    function closeModal() {
        setIsOpenModal(false);
    }
    function openEditModal() {
        setIsEditModalOpen(true);
    }
    function closeEditModal() {
        setIsEditModalOpen(false);
        setEditInitialValues({
            title: "",
            user: "",
            password: "",
            itemTypeGroup: "website",
            url: ""
        })
    }
    useEffect(() => {
        getData();
    }, [])
    return (
        <>
            <Loading isLoading={isLoading} />
            <Modal isOpen={isModalOpen} onClose={closeModal} title="Add Password" withSubmitBtn={false} submitBtnFunction={() => {}} size="large">
                <div className="w-full">
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={passwordSchema}
                        onSubmit={async (values) => {
                            setIsLoading(true);
                            const data: {
                                title: string,
                                user: string,
                                password: string,
                                itemType: string,
                                itemTypeGroup?: string | null | undefined,
                                url?: string | null | undefined,
                            } = {
                                ...values,
                                itemType: values.itemTypeGroup
                            };
                            delete data['itemTypeGroup'];
                            if(data['itemType'] != 'website') {
                                delete data['url'];
                            }
                            let response = await fetch(`${window.location.origin}/api/passwords`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(data)
                            });
                            setIsLoading(false);
                            if(response.ok) {
                                const result = await response.json() as {
                                    code: number,
                                    message: string
                                };
                                if(result.code === 200) {
                                    Swal.fire({
                                        title: "Succesfully saving password",
                                        icon: "success",
                                        timer: 5000,
                                        toast: true,
                                        showConfirmButton: false,
                                        position: "top"
                                    });
                                    closeModal();
                                    setInitialValues({
                                        title: "",
                                        user: "",
                                        password: "",
                                        itemTypeGroup: "website",
                                        url: ""
                                    })
                                    getData();
                                }
                                else {
                                    Swal.fire({
                                        title: result.message,
                                        icon: "error",
                                        toast: false,
                                        showConfirmButton: true,
                                    });
                                }
                            }
                            else {
                                Swal.fire({
                                    title: "Internal Server Error",
                                    icon: "error",
                                    toast: false,
                                    showConfirmButton: true,
                                });
                            }
                        }}
                    >
                        {({values, errors, touched}) => (
                            <Form>
                                <div className="mb-4">
                                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                                        Title
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type="text"
                                            name="title"
                                            placeholder="Title"
                                            className="w-full rounded-lg border border-stroke bg-white py-3.5 px-5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                        />
                                    </div>
                                    {errors.title && touched.title ? (
                                        <div className="text-red-600">{errors.title}</div>
                                    ) : null}
                                </div>
                                <div className="mb-4">
                                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                                        User
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type="text"
                                            name="user"
                                            placeholder="User"
                                            className="w-full rounded-lg border border-stroke bg-white py-3.5 px-5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                        />
                                    </div>
                                    {errors.user && touched.user ? (
                                        <div className="text-red-600">{errors.user}</div>
                                    ) : null}
                                </div>
                                <div className="mb-4">
                                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Password"
                                            className="w-full rounded-lg border border-stroke bg-white py-3.5 px-5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                        />
                                    </div>
                                    {errors.password && touched.password ? (
                                        <div className="text-red-600">{errors.password}</div>
                                    ) : null}
                                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <button type="button" className="bg-purple-500 hover:bg-purple-700 text-white px-3 py-2 rounded min-h-12" onClick={() => {
                                            const genPass = generateReadablePassword();
                                            const data = {
                                                ...values,
                                                password: genPass
                                            };
                                            setInitialValues(data);
                                        }}>
                                            <FontAwesomeIcon icon={FaSolid.faRefresh} className="mr-2" /> Generate
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
                                {
                                    values.itemTypeGroup == 'website' ? 
                                    <div className="mb-4">
                                        <label className="mb-2.5 block font-medium text-black dark:text-white">
                                            URL
                                        </label>
                                        <div className="relative">
                                            <Field
                                                type="text"
                                                name="url"
                                                placeholder="URL"
                                                className="w-full rounded-lg border border-stroke bg-white py-3.5 px-5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                            />
                                        </div>
                                        {errors.url && touched.url ? (
                                            <div className="text-red-600">{errors.url}</div>
                                        ) : null}
                                    </div> : <></>
                                }
                                <div className="mb-4">
                                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                                        Item Type
                                    </label>
                                    <div className="relative">
                                        <Field
                                            as="select"
                                            name="itemTypeGroup"
                                            className="w-full rounded-lg border border-stroke bg-white py-3.5 px-5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                        >
                                            <option value="website">Website</option>
                                            <option value="app">App</option>
                                        </Field>
                                    </div>
                                    {errors.itemTypeGroup && touched.itemTypeGroup ? (
                                        <div className="text-red-600">{errors.itemTypeGroup}</div>
                                    ) : null}
                                </div>
                                <div className="mb-5">
                                    <button className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90" type="submit">Create Password</button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Modal>
            
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Password" withSubmitBtn={false} submitBtnFunction={() => {}} size="large">
                <div className="w-full">
                    <Formik
                        enableReinitialize
                        initialValues={editInitialValues}
                        validationSchema={passwordSchema}
                        onSubmit={async(values) => {
                            setIsLoading(true);
                            const data: {
                                title: string,
                                user: string,
                                password: string,
                                itemType: string,
                                itemTypeGroup?: string | null | undefined,
                                url?: string | null | undefined,
                            } = {
                                ...values,
                                itemType: values.itemTypeGroup
                            };
                            delete data['itemTypeGroup'];
                            if(data['itemType'] != 'website') {
                                delete data['url'];
                            }
                            let response = await fetch(`${window.location.origin}/api/passwords/${editId}`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(data)
                            });
                            setIsLoading(false);
                            if(response.ok) {
                                const result = await response.json() as {
                                    code: number,
                                    message: string
                                };
                                if(result.code === 200) {
                                    Swal.fire({
                                        title: "Succesfully edit password",
                                        icon: "success",
                                        timer: 5000,
                                        toast: true,
                                        showConfirmButton: false,
                                        position: "top"
                                    });
                                    closeEditModal();
                                    getData();
                                    setEditId("");
                                }
                                else {
                                    Swal.fire({
                                        title: result.message,
                                        icon: "error",
                                        toast: false,
                                        showConfirmButton: true,
                                    });
                                }
                            }
                            else {
                                Swal.fire({
                                    title: "Internal Server Error",
                                    icon: "error",
                                    toast: false,
                                    showConfirmButton: true,
                                });
                            }
                        }}
                    >
                        {({values, errors, touched}) => (
                            <Form>
                                <div className="mb-4">
                                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                                        Title
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type="text"
                                            name="title"
                                            placeholder="Title"
                                            className="w-full rounded-lg border border-stroke bg-white py-3.5 px-5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                        />
                                    </div>
                                    {errors.title && touched.title ? (
                                        <div className="text-red-600">{errors.title}</div>
                                    ) : null}
                                </div>
                                <div className="mb-4">
                                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                                        User
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type="text"
                                            name="user"
                                            placeholder="User"
                                            className="w-full rounded-lg border border-stroke bg-white py-3.5 px-5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                        />
                                    </div>
                                    {errors.user && touched.user ? (
                                        <div className="text-red-600">{errors.user}</div>
                                    ) : null}
                                </div>
                                <div className="mb-4">
                                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type={showEditPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Password"
                                            className="w-full rounded-lg border border-stroke bg-white py-3.5 px-5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                        />
                                    </div>
                                    {errors.password && touched.password ? (
                                        <div className="text-red-600">{errors.password}</div>
                                    ) : null}
                                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <button type="button" className="bg-purple-500 hover:bg-purple-700 text-white px-3 py-2 rounded min-h-12" onClick={() => {
                                            const genPass = generateReadablePassword();
                                            const data = {
                                                ...values,
                                                password: genPass
                                            };
                                            setEditInitialValues(data);
                                        }}>
                                            <FontAwesomeIcon icon={FaSolid.faRefresh} className="mr-2" /> Generate
                                        </button>
                                        <button type="button" className={!showEditPassword ? "bg-green-500 hover:bg-green-700 text-white px-3 py-2 rounded min-h-12" : "bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded min-h-12"} onClick={() => {
                                            setEditShowPassword(!showEditPassword);
                                        }}>
                                            {
                                                !showEditPassword ? <><FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faEye} /> <span>See</span></> : <><FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faEyeSlash} /> <span>Hide</span></>
                                            }
                                        </button>
                                    </div>
                                </div>
                                {
                                    values.itemTypeGroup == 'website' ? 
                                    <div className="mb-4">
                                        <label className="mb-2.5 block font-medium text-black dark:text-white">
                                            URL
                                        </label>
                                        <div className="relative">
                                            <Field
                                                type="text"
                                                name="url"
                                                placeholder="URL"
                                                className="w-full rounded-lg border border-stroke bg-white py-3.5 px-5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                            />
                                        </div>
                                        {errors.url && touched.url ? (
                                            <div className="text-red-600">{errors.url}</div>
                                        ) : null}
                                    </div> : <></>
                                }
                                <div className="mb-4">
                                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                                        Item Type
                                    </label>
                                    <div className="relative">
                                        <Field
                                            as="select"
                                            name="itemTypeGroup"
                                            className="w-full rounded-lg border border-stroke bg-white py-3.5 px-5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                        >
                                            <option value="website">Website</option>
                                            <option value="app">App</option>
                                        </Field>
                                    </div>
                                    {errors.itemTypeGroup && touched.itemTypeGroup ? (
                                        <div className="text-red-600">{errors.itemTypeGroup}</div>
                                    ) : null}
                                </div>
                                <div className="mb-5">
                                    <button className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90" type="submit">Edit Password</button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Modal>
            <Breadcrumb pageName="Passwords" />
            {
                passwordData.length === 0 ? <div className="w-full max-w-full h-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark flex justify-center px-2 py-5">
                    <div className="w-full mt-20 mb-20 text-center">
                        <div className="mb-6">
                            <FontAwesomeIcon icon={FaSolid.faWarning} className="text-8xl" />
                        </div>
                        <h1 className="text-5xl">NO DATA FOUND</h1>
                        <div className="mt-5">
                            <button className="cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90" onClick={openModal}><FontAwesomeIcon icon={FaSolid.faPlus} className="mr-2" /> Add Password</button>
                        </div>
                    </div>
                </div> :
                <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark px-3 py-5">
                    <div className="mb-5">
                        <div className="lg:flex lg:justify-between">
                            <div>
                                <button className="cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90" onClick={openModal}><FontAwesomeIcon icon={FaSolid.faPlus} className="mr-2" /> Add Password</button>
                            </div>
                            <div className="mt-3 lg:mt-0">
                                <input type="text" className="w-full rounded-lg border border-stroke bg-white py-3.5 px-5 font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white" value={searchValue} placeholder="Search..." onChange={(e) => setSearchValue(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-1">
                        {  
                            passwordData.map((data, index) => {
                                return data.title.toLowerCase().includes(searchValue.toLowerCase()) || searchValue == "" ? 
                                <div className="border border-gray-300 rounded-xl mb-3 px-3 py-2" key={data._id as string}>
                                    <div className="">
                                        <div className="p-3">
                                            <h6 className="font-bold">Title</h6>
                                        </div>
                                        <div className="p-3">
                                            <h6>{data.title}</h6>
                                        </div>
                                    </div>
                                    <div className="">
                                        <div className="p-3">
                                            <h6 className="font-bold">Username</h6>
                                        </div>
                                        <div className="p-3">
                                            <h6 className="inline-block overflow-auto max-w-full">{data.user}</h6>
                                            <div className="mt-2">
                                                <div className="flex gap-2">
                                                    <button className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded min-h-12" onClick={() => {
                                                        const username = data.user;
                                                        navigator.clipboard.writeText(username!).then(function() {
                                                            Swal.fire({
                                                                toast: true,
                                                                title: "Username copied to clipboard",
                                                                icon: "success",
                                                                timer: 3000,
                                                                position: 'top',
                                                                showConfirmButton: false
                                                            })
                                                        })
                                                    }}>
                                                        <FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faCopy} /> Copy
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="">
                                        <div className="p-3">
                                            <h6 className="font-bold">Password</h6>
                                        </div>
                                        <div className="p-3">
                                            <span className="mr-2 overflow-auto max-w-full">{
                                                !data.passwordVisible ? "********" : data.password
                                            }</span>
                                            <div className="mt-2"> 
                                                <div className="flex gap-2">
                                                    <button className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded min-h-12" onClick={() => {
                                                        const password = data.password;
                                                        navigator.clipboard.writeText(password!).then(function() {
                                                            Swal.fire({
                                                                toast: true,
                                                                title: "Password copied to clipboard",
                                                                icon: "success",
                                                                timer: 3000,
                                                                position: 'top',
                                                                showConfirmButton: false
                                                            })
                                                        })
                                                    }}>
                                                        <FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faCopy} /> Copy
                                                    </button>
                                                    <button className={!data.passwordVisible ? "bg-green-500 hover:bg-green-700 text-white px-3 py-2 rounded min-h-12" : "bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded min-h-12"} onClick={() => {
                                                        const currentData = [...passwordData]
                                                        currentData[index].passwordVisible = !currentData[index].passwordVisible;
                                                        setPasswordData([...currentData]);
                                                    }}>
                                                        {
                                                            !data.passwordVisible ? <><FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faEye} /> <span>See</span></> : <><FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faEyeSlash} /> <span>Hide</span></>
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        data.itemType == 'website' ? <div className="">
                                            <div className="p-3">
                                                <h6 className="font-bold mb-0">URL</h6>
                                            </div>
                                            <div className="p-3">
                                                <h6 className="inline-block overflow-auto max-w-full mt-0">{data.url}</h6>
                                                <div className="mt-2">
                                                    <div className="flex gap-2">
                                                        <button className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded" onClick={() => {
                                                            const url = data.url;
                                                            navigator.clipboard.writeText(url!).then(function() {
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
                                                        <button className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded" onClick={() => {
                                                            const url = data.url;
                                                            window.open(url as string, '_blank');
                                                        }}>
                                                            <FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faGlobe} /> Open
                                                        </button>
                                                    </div>
                                                </div>
                                            </div> 
                                        </div> : <></> 
                                    }
                                    <div className="mt-2 p-2">
                                        <div className="flex gap-2">
                                            <button className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded min-h-12" onClick={() => {
                                                setEditInitialValues({
                                                    url: data.url as string,
                                                    title: data.title,
                                                    user: data.user as string,
                                                    password: data.password as string,
                                                    itemTypeGroup: data.itemType as string
                                                });
                                                setEditId(data._id);
                                                openEditModal();
                                            }}>
                                                <FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faPencil} /> Edit
                                            </button>
                                            <button className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded min-h-12" onClick={() => {
                                                const currentData = data;
                                                Swal.fire({
                                                    title: 'Are you sure?',
                                                    text: "You won't be able to revert this!",
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#3085d6',
                                                    cancelButtonColor: '#d33',
                                                    confirmButtonText: 'Yes, delete it!'
                                                }).then(async (result) => {
                                                    if(result.isConfirmed) {
                                                        setIsLoading(true);
                                                        const response = await fetch(`${window.location.origin}/api/passwords/${currentData._id}`, {
                                                            method: "DELETE"
                                                        });
                                                        setIsLoading(false);
                                                        if(response.ok) {
                                                            const result = await response.json() as {
                                                                code: number,
                                                                message: string
                                                            }
                                                            if(result.code == 200) {
                                                                Swal.fire({
                                                                    toast: true,
                                                                    title: result.message,
                                                                    icon: "success",
                                                                    timer: 3000,
                                                                    position: 'top',
                                                                    showConfirmButton: false
                                                                });
                                                                getData();
                                                            }
                                                            else if(result.code == 500) {
                                                                Swal.fire({
                                                                    toast: false,
                                                                    title: "Failed to delete password",
                                                                    icon: "error",
                                                                    showConfirmButton: true
                                                                });
                                                            }
                                                            else {
                                                                Swal.fire({
                                                                    toast: false,
                                                                    title: result.message,
                                                                    icon: "warning",
                                                                    showConfirmButton: true
                                                                });
                                                            }
                                                        }
                                                    }
                                                })
                                            }}>
                                                <FontAwesomeIcon className="relative cursor-pointer text-gray" icon={FaSolid.faTrash} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div> : <React.Fragment key={data._id as string}></React.Fragment>
                            })
                        }
                    </div>
                </div>
            }
        </>
    )
}
export default Page;