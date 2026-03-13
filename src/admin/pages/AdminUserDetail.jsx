import React from 'react';
import { useParams } from 'react-router-dom';

export default function AdminUserDetail() {
  const { uid } = useParams();

  return (
    <div>
      <h2 className="text-[22px] font-syne font-bold text-white">User Detail</h2>
      <p className="text-[#777] mt-2">Details for user ID: {uid}</p>
    </div>
  );
}
