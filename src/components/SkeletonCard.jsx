import React from 'react';

export const SkeletonCard = () => {
    return (
        <div className="w-[180px] shrink-0 flex flex-col gap-[10px]">
            <div
                className="w-full aspect-[3/4] rounded-[8px] shimmer-bg"
                style={{
                    background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
                    backgroundSize: '800px 100%',
                    animation: 'shimmer 1.4s infinite linear'
                }}
            />
            <div className="flex flex-col gap-2">
                <div
                    className="w-3/4 h-[16px] rounded-[4px] shimmer-bg"
                    style={{
                        background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
                        backgroundSize: '800px 100%',
                        animation: 'shimmer 1.4s infinite linear'
                    }}
                />
                <div
                    className="w-1/2 h-[12px] rounded-[4px] shimmer-bg"
                    style={{
                        background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
                        backgroundSize: '800px 100%',
                        animation: 'shimmer 1.4s infinite linear'
                    }}
                />
            </div>
        </div>
    );
};
