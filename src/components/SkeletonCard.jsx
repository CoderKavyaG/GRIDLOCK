import React from 'react';

const shimmer = {
    background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
    backgroundSize: '800px 100%',
    animation: 'shimmer 1.4s infinite linear'
};

export const SkeletonCard = () => {
    return (
        <div className="flex flex-col gap-[10px]">
            <div className="w-full aspect-[3/4] rounded-[10px]" style={shimmer} />
            <div className="flex flex-col gap-2">
                <div className="w-3/4 h-[14px] rounded-[4px]" style={shimmer} />
                <div className="w-1/2 h-[11px] rounded-[4px]" style={shimmer} />
            </div>
        </div>
    );
};

export default SkeletonCard;

