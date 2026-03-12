import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react'
import { register } from '../../https';
import { enqueueSnackbar } from 'notistack'   // for message 


const Register = ({setIsRegister}) => {

    const[formData , setFormData] = useState({
    name : "", email : "", phone : "", password : "", role : ""   
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})
    }

    const handleRoleSelection = (selectedRole) => {
        setFormData({...formData, role: selectedRole});
    }

    const handleSubmit =(e) => {
        e.preventDefault();
        //console.log(formData);
        registerMutation.mutate(formData);
       
    }


    // backend connection
     const registerMutation = useMutation({
        mutationFn : (reqData) => register(reqData),
        
        onSuccess: (res) => {
            const { data } = res;
            //console.log(data)
            enqueueSnackbar(data.message, { variant: "success"});
            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                role: "",
            });

            setTimeout(() => {
                setIsRegister(false);
            }, 1500)
     

        },
        onError: (error) => {
            //console.log(error);
            const { response } = error;
            enqueueSnackbar(response.data.message, { variant: "error"});
        }
    })


    return (
   
        <div className ='rounded-lg shadow-lg p-2 mt-0 '>
            <form onSubmit ={handleSubmit}>
                
                <div className ='flex items-center justify-between'>
                    <label className ='w-[15%] text-[#1f1f1f] block mb-2 text-sm font-medium'>Name :</label>
                
                    <div className ='flex w-[85%] items-center rounded-lg p-3 shadow-xl'>
                        <input 
                            type ='text'
                            name ='name'
                            value ={formData.name}
                            onChange ={handleChange}
                            placeholder = 'Enter employee name'
                            className ='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none border-b border-emerald-600'
                            required
                            autoComplete='none'
                        />
                    </div>
                </div>

                <div className ='mt-5 flex items-center justify-between'>
                    <label className =' w-[15%] text-[#1f1f1f] block mb-2 mt-3 text-sm font-medium'>Email :</label>
                
                    <div className ='flex w-[85%] items-center rounded-lg p-3 shadow-xl'>
                        <input 
                            type ='email'
                            name ='email'
                            value ={formData.email}
                            onChange ={handleChange}
                            placeholder = 'email@email.com'
                            className ='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none border-b border-emerald-600'
                            required
                            autoComplete='none'
                        />
                    </div>
                </div>

                
                <div className ='mt-5 flex items-center justify-between'>
                    <label className ='w-[15%] text-[#1f1f1f] block mb-2 mt-3 text-sm font-medium'>Phone :</label>
                
                    <div className ='flex w-[85%] items-center rounded-lg p-3 shadow-lg/30'>
                        <input 
                            type ='number'
                            name ='phone'
                            value ={formData.phone}
                            onChange ={handleChange}
                            placeholder = '+971 999999999'
                            className ='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none border-b border-emerald-600'
                            required
                            autoComplete='none'
                        />
                    </div>
                </div>

                
                <div className ='flex items-center justify-between mt-5'>
                    <label className =' w-[15%] text-[#1f1f1f] block mb-2 mt-3 text-sm font-medium'>Password :</label>
                
                    <div className ='flex w-[85%] items-center rounded-lg p-3 shadow-xl'>
                        <input 
                            type ='password'
                            name ='password'
                            value ={formData.password}
                            onChange ={handleChange}
                            placeholder = '********'
                            className ='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none border-b border-emerald-600'
                            required
                            autoComplete='none'
                        />
                    </div>
                </div>

              
                {/*important  */}
                <div>
                    <label className ='block text-[#1a1a1a] mb-2 mt-3 text-sm font-medium'>Choose your role</label>
                  
                    <div className ='flex items-center gap-3 mt-4'>
                         {['Admin', 'Cashier', 'Services'].map((role) => {
                            return (
                                <button key={role}
                                type ='button'
                                onClick ={() => handleRoleSelection(role)}
                                className ={`px-3 py-3 px-4 w-full cursor-pointer  rounded-lg shadow-lg/30 text-xs font-semibold  
                                ${formData.role === role ? "bg-emerald-600 text-white" : "bg-white text-emerald-700"}  
                                `}
                                >
                                    {role}
                                </button>
                            )
                         })}
                    </div>
                    
                </div>

                <button type ='submit' className ='cursor-pointer w-full rounded-lg mt-6 py-3 text-lg text-white bg-emerald-600 shadow-lg/30 font-semibold'>Sign up</button>

            </form>

        </div>
    );
};


export default Register;