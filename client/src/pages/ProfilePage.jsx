import React, { useContext } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const ProfilePage = () => {

    const { authUser, updateProfile } = useContext(AuthContext);

    const [selectedImg, setSelectedImg] = useState(null)
    const navigate = useNavigate()
    const [name, setName] = useState(authUser.fullName)
    const [bio, setBio] = useState(authUser.bio)

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedImg) {
            await updateProfile({ fullName: name, bio });
            navigate('/');
            return;
        }

        const render = new FileReader();
        render.readAsDataURL(selectedImg);
        render.onloadend = async () => {
            const base64Image = render.result;
            await updateProfile({ fullName: name, bio, profilePic: base64Image });
            navigate('/');
        }

    }

    return (
        <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center backdrop-blur-2xl'>
            <div className='w-5/6 max-w-2xl bg-black/40 backdrop-blur-md text-white border-2 border-gray-700/50 flex items-center justify-between max-sm:flex-col-reverse rounded-2xl shadow-2xl hover:border-gray-600/50 transition-all duration-300'>
                <form onSubmit={handleSubmit} className='flex flex-col gap-6 p-10 flex-1'>
                    <h3 className='text-2xl font-medium text-gray-100'>Profile details</h3>
                    <label htmlFor="avatar" className='flex items-center gap-4 cursor-pointer group'>
                        <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id='avatar' accept='.png,.jpg,.jpeg' hidden />
                        <div className='relative'>
                            <img
                                src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon}
                                alt=""
                                className={`w-16 h-16 ${selectedImg ? 'rounded-full' : ''} transition-all duration-300 group-hover:opacity-80`}
                            />
                            <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                                <span className='text-xs bg-black/70 px-2 py-1 rounded-full'>Change</span>
                            </div>
                        </div>
                        <span className='text-gray-400 group-hover:text-white transition-colors duration-300'>Upload profile image</span>
                    </label>
                    <input
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        type="text"
                        required
                        placeholder='Your name'
                        className='p-3 bg-black/30 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 placeholder-gray-500'
                    />
                    <textarea
                        onChange={(e) => setBio(e.target.value)}
                        value={bio}
                        placeholder='Write a bio'
                        rows={4}
                        required
                        className='p-3 bg-black/30 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 placeholder-gray-500 resize-none'
                    ></textarea>
                    <button
                        type="submit"
                        className='py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-300 font-medium shadow-lg'
                    >
                        Save Changes
                    </button>
                </form>
                <div className='p-10 flex flex-col items-center gap-4 max-sm:mt-10'>
                    <img src={authUser?.profilePic || assets.logo} alt="" className='max-w-44 aspect-square rounded-full hover:scale-105 transition-transform duration-300' />
                    <h1 className='text-4xl font-bold text-white tracking-wider'>Buzztalk</h1>
                    <p className='text-gray-400 text-lg italic'>Be the buzz</p>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
