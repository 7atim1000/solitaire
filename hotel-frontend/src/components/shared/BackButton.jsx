import React from 'react'
import { IoPlaySkipBack } from "react-icons/io5";
import { useNavigate } from 'react-router-dom'

const BackButton = () => {

    const navigate = useNavigate();
    return (
        <button onClick ={()=> navigate(-1)} className ='mr-2 text-emerald-600 text-2xl font-bold rounded-full cursor-pointer cursor-pointer'><IoPlaySkipBack /></button>
    )
}


export default BackButton ;