import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../https/index';
import { enqueueSnackbar } from 'notistack'   // for message 
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/userSlice';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const[formData, setFormData] = useState({
        email : "", password :"",
    }) 

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        //console.log(formData);
        loginMutation.mutate(formData);
    }

    // backend connection
     const loginMutation = useMutation({
        mutationFn : (reqData) => login(reqData),
        
        onSuccess: (res) => {
            const { data } = res;
            console.log(data)
            
            // slices
            const {_id, name, email, phone, role } = data.data;
            dispatch(setUser({_id, name, email, phone, role }));

            navigate('/')

        },
        onError: (error) => {
            //console.log(error);
            const { response } = error;
            enqueueSnackbar(response.data.message, { variant: "error"})
        }
    })


    return (

        <div className ='bg-white shadow-lg rounded-lg p-1'>

            <form onSubmit={handleSubmit}>
                 
                <div>
                    <label className ='text-[#1f1f1f] block mb-2 mt-3 text-sm font-medium'>Email :</label>
                
                    <div className ='flex items-center rounded-lg p-3  shadow-xl'>
                        <input 
                            type ='email'
                            name ='email'
                            value ={formData.email}
                            onChange ={handleChange}
                            placeholder = 'Enter employee email'
                            className ='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none border-b border-emerald-600'
                            required
                            autoComplete='none'
                        />
                    </div>
                </div>


                <div>
                    <label className ='text-[#1f1f1f] block mb-2 mt-3 text-sm font-medium'>Password :</label>
                
                    <div className ='flex items-center rounded-lg p-3  shadow-xl'>
                        <input 
                            type ='password'
                            name ='password'
                            value ={formData.password}
                            onChange ={handleChange}
                            placeholder = 'Enter password'
                            className ='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none border-b border-emerald-600'
                            required
                            autoComplete='none'
                        />
                    </div>
                </div>

                <button type ='submit' className ='cursor-pointer w-full rounded-lg mt-6 py-3 text-lg text-white bg-emerald-600 shadow-lg font-semibold'>Sign in</button>

            </form>

        </div>
    );
};


export default Login;