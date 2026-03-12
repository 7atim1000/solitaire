import React, { useState } from 'react'
// https://www.freepik.com/search?format=search&last_filter=query&last_value=retaurant&query=restaurant  to download image

import hotel from '../assets/images/solitair.png' 
import { SiHiltonhotelsandresorts } from "react-icons/si";
import Register from '../components/auth/Register';
import Login from '../components/auth/Login';

const Auth = () => {

    const [isRegister, setIsRegister] = useState(false);

    return (
        <div className ='flex min-h-screen w-full overflow-y-scroll scrollbar-hidden'>

            {/*left section */}
            <div className ='w-1/2 relative flex items-center justify-center bg-cover' >
           
                {/**bg Image */}
                <img className ='w-full h-full object-cover' src={hotel} alt='Hotel Image'/>
                {/*Black overlay */}
                <div className ='absolute inset-0  bg-opacity-80'></div>

                {/*Quote at bottom */}
                <blockquote className= 'absolute bottom-5 px-8 mb-5 text-white text-lg italic '>
                Serve customers the best services with prompt and friendly service in a 
                welcoming atmosphere, and they'll keep coming back.
                <br />
                <span className ='block mt-4 text-green-600 text-lg'>- Founder of Hotel</span>

            </blockquote>

            </div>
            
            {/*right section */}
            <div className ='w-1/2 min-h-screen bg-white p-1'>
                <div className ='flex flex-col items-center gap-2'>
                   <SiHiltonhotelsandresorts className ='h-14 w-14 rounded-full p-1 text-emerald-700'/>
                   <h1 className ='text-lg font-semibold text-[#1a1a1a]'>Hotel</h1>
                </div>

                <h2 className ='text-xl text-center mt-5 font-semibold text-emerald-600 mb-2'>{isRegister ? "Employee Registeration" : "Employee Login"}</h2>

                {/*components */}
                {/* <Register /> <Login />*/}

                {isRegister ? <Register setIsRegister={setIsRegister}/> : <Login />}
            
                
                <div className ='flex justify-center mt-6'>
                    <p className ='text-sm text-[#1a1a1a]'>{isRegister ? "Already have an account ?" : "Don't have a account ? "}</p><p className ='text-[#f5f5f5]'>-</p>
                    <a
                    onClick ={() => setIsRegister(!isRegister)} 
                    href='#'
                    className ='text-emerald-600 text-sm font-semibold hover:underline'
                    >{isRegister ? "Sign in" : "Sign up"}
                    </a>
                </div>
            </div>



        </div>
    )
}

export default Auth;