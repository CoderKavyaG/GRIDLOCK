import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoggedOutHome } from '../components/home/LoggedOutHome';
import SEO from '../components/SEO';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen">
            <SEO />
            {/* Always show the main home experience.
                If the user is signed in, we keep the same magazine-style home page,
                but allow access to profile / shelf via nav. */}
            <LoggedOutHome user={user} />
        </div>
    );
};

export default Home;

