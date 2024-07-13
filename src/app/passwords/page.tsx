"use client"
import Breadcrumb from "@/src/components/Breadcrumbs/Breadcrumb";
import { useEffect, useState } from "react";
import Loading from "@/src/components/Loading/Loading";
import * as FaSolid from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Page = () => {
    const [passwordData, setPasswordData] = useState<Forms.IPasswords[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    async function getData() {
        setIsLoading(true);
        let response = await fetch(`${window.location.origin}/api/passwords`, {
            method: "GET"            
        });
        setIsLoading(false);
        if(response.ok) {
            const result = await response.json() as {
                code: number,
                data: Forms.IPasswords[]
            };
            if(result.code == 200) {
                setPasswordData(result.data);
            }
        }
    }
    useEffect(() => {
        getData();
    }, [])
    return (
        <>
            <Loading isLoading={isLoading} />
            <Breadcrumb pageName="Passwords" />
            {
                passwordData.length === 0 ? <div className="w-full max-w-full h-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark flex justify-center px-2 py-5">
                    <div className="w-full mt-20 mb-20 text-center">
                        <div className="mb-6">
                            <FontAwesomeIcon icon={FaSolid.faWarning} className="text-8xl" />
                        </div>
                        <h1 className="text-5xl">NO DATA FOUND</h1>
                        <div className="mt-5">
                            <button className="cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"><FontAwesomeIcon icon={FaSolid.faPlus} className="mr-2" /> Tambah Data</button>
                        </div>
                    </div>
                </div> :
                <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">

                </div>
            }
        </>
    )
}
export default Page;