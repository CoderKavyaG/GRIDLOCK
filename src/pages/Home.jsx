import React from 'react';
import Navbar from '../components/Navbar';
import { Hero } from '../components/Hero';

const Home = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Hero />
            {/* Home page components will go here */}
        </div>
    );
};

export default Home;
