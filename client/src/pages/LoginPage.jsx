import React, { useState, useContext } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const LoginPage = () => {

    const [currState, setCurrState] = useState("Sign up")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [bio, setBio] = useState("")
    const [isDataSubmitted, setIsDataSubmitted] = useState(false)

    const { login } = useContext(AuthContext);

    const onSubmitHandler = (event) => {
        event.preventDefault();

        if (currState == 'Sign up' && !isDataSubmitted) {
            setIsDataSubmitted(true);
            return;
        }

        login(currState === "Sign up" ? 'signup' : 'login', { fullName, email, password, bio });
    }

    return (
        <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
            <div className='flex flex-col items-center gap-2'>
                <img src={assets.logo} alt="" className='w-[min(20vw,250px)] hover:scale-105 transition-transform duration-300' />
                <h1 className='text-4xl font-bold text-white tracking-wider'>Buzztalk</h1>
                <p className='text-gray-400 text-lg italic'>Be the buzz</p>
            </div>
            <form onSubmit={onSubmitHandler} className='border-2 bg-black/40 backdrop-blur-md text-white border-gray-700/50 p-8 flex flex-col gap-6 rounded-2xl shadow-2xl w-[min(90vw,500px)] hover:border-gray-600/50 transition-all duration-300'>
                <h2 className='font-medium text-2xl flex justify-between items-center text-gray-100'
                >{currState}
                    {isDataSubmitted && <img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon1} alt="" className='cursor-pointer w-5 hover:rotate-180 transition-transform duration-300' />}
                </h2>
                {currState === "Sign up" && !isDataSubmitted && (
                    <input onChange={(e) => setFullName(e.target.value)} value={fullName}
                        type="text"
                        className='p-3 bg-black/30 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 placeholder-gray-500'
                        placeholder='Full Name'
                        required
                    />
                )}

                {!isDataSubmitted && (
                    <>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            placeholder='Enter your email'
                            required
                            className='p-3 bg-black/30 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 placeholder-gray-500'
                        />
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            placeholder='Enter your password'
                            required
                            className='p-3 bg-black/30 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 placeholder-gray-500'
                        />
                    </>
                )}

                {
                    currState === "Sign up" && isDataSubmitted && (
                        <textarea
                            onChange={(e) => setBio(e.target.value)}
                            value={bio}
                            rows={4}
                            className='p-3 bg-black/30 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 placeholder-gray-500 resize-none'
                            placeholder='Enter your bio'
                            required
                        ></textarea>
                    )
                }

                <button
                    type='submit'
                    className='py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-300 font-medium shadow-lg'
                >
                    {currState === "Sign up" ? "Create Account" : "Login"}
                </button>

                <div className='flex items-center gap-2 text-sm text-gray-400'>
                    <input
                        type="checkbox"
                        className='w-4 h-4 rounded border-gray-700/50 bg-black/30 focus:ring-blue-500/50' required
                    />
                    <p>Agree to the terms of use & privacy policy.</p>
                </div>

                <div className='flex flex-col gap-2'>
                    {currState === "Sign up" ? (
                        <p className='text-sm text-gray-400'>
                            Already have an account ? <span onClick={() => { setCurrState("Login"); setIsDataSubmitted(false) }} className='font-medium text-gray-300 cursor-pointer hover:text-white transition-colors duration-300'> Login here</span>
                        </p>
                    ) : (
                        <p className='text-sm text-gray-400'>Create new account <span onClick={() => setCurrState("Sign up")} className='font-medium text-gray-300 cursor-pointer hover:text-white transition-colors duration-300'>Click here</span></p>
                    )}
                </div>

            </form>
        </div>
    )
}

export default LoginPage
